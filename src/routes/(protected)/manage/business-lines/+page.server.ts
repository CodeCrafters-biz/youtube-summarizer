    import prisma from '$lib/config/prisma.js';
    import { bulkDeleteSchema, businessLineSchema } from '$lib/config/zod-schemas.js';
    import { zod } from 'sveltekit-superforms/adapters';
    import { setError, superValidate, setMessage, message } from 'sveltekit-superforms/server';
    import csv from 'csv-parser';
    import fs from 'fs';
    import path from 'path';
    import moment from 'moment'

    export const load = async (event) => {
        const session = await event.locals.auth.validate();

        const pageIndex = Number(event.url.searchParams.get('pageIndex')) || 0;
        const pageSize = Number(event.url.searchParams.get('pageSize')) || 7;
        const search = event.url.searchParams.get('search') || null;
        const skip = pageIndex * pageSize;
        // Query total count of project types
        const totalCount = await prisma.businessLine.count();

        const businessLines = await prisma.businessLine.findMany({
            ...(search && {
                where: {
                    OR: [
                        {
                            name_en: {
                                contains: search,
                                mode: 'insensitive' // Optional: makes the search case-insensitive
                            }
                        },
                        {
                            name_fi: {
                                contains: search,
                                mode: 'insensitive'
                            }
                        }
                    ]
                }
            }),
            skip: skip,
            take: pageSize
        });

        const pageCount = Math.ceil(totalCount / pageSize);

        return {
            businessLines,
            pageIndex,
            pageCount,
            pageSize,
            totalCount,
            search
        };
    };

    async function getOrCreateProjectType(name_fi) {
        let projectType = await prisma.projectType.findFirst({
        where: { name_fi }
        });
    
        if (!projectType) {
        projectType = await prisma.projectType.create({
            data: { name_fi, name_en: '' }
        });
        }
    
        return projectType.id;
    }
    
    async function getOrCreateClient(name_fi) {
        let client = await prisma.client.findFirst({
        where: { name_fi }
        });
    
        if (!client) {
        client = await prisma.client.create({
            data: { name_fi, name_en: '' }
        });
        }
    
        return client.id;
    }

    async function getOrCreatePersons(personList) {
        if (!personList.length) {
            return []
        }
        const ids = []
        for (let index = 0; index < personList.length; index++) {
            await prisma.$transaction(async (prisma) => {
                let person = await prisma.person.findFirst({
                    where: {
                        AND: [
                            {
                                firstName: personList[0].firstName
                            },
                            {
                                lastName: personList[0].lastName
                            }
                        ]
                    }
                });
                
                if (!person) {
                    person = await prisma.person.create({
                        data: { firstName: personList[0].firstName, lastName: personList[0].lastName }
                    });
                }
                ids.push(person.id);
            }).catch(error => {
                console.error('Transaction error:', error);
            });
        }
        return ids
    }
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    
    async function getOrCreateBusinessLine(name_fi) {
        let businessLine = await prisma.businessLine.findFirst({
        where: { name_fi }
        });
    
        if (!businessLine) {
        businessLine = await prisma.businessLine.create({
            data: { name_fi, name_en: '' }
        });
        }
    
        return businessLine.id;
    }
    
    async function getOrCreateCountry(name_fi) {
        let country = await prisma.country.findFirst({
        where: { name_fi }
        });
    
        if (!country) {
        country = await prisma.country.create({
            data: { name_fi, name_en: '', numeric: '', alpha2: '', alpha3: '' }
        });
        }
    
        return country.id;
    }

    function parseNames(input) {
        // Remove text inside parentheses and trim the result
        const sanitizedInput = input.replace(/\(.*?\)/g, '').trim();

        // Split the input by colon, if present
        const colonSegments = sanitizedInput.split(':').map(segment => segment.trim());

        // Handle multiple segments separated by colons
        let namesSegment;
        if (colonSegments.length > 1) {
            namesSegment = colonSegments.slice(1).join(' ').trim();
        } else {
            namesSegment = colonSegments[0];
        }

        // Split the names segment by commas, slashes
        const initialSplit = namesSegment.split(/,|\//).map(name => name.trim()).filter(name => name);

        // Create the output array
        const names = [];

        initialSplit.forEach(segment => {
            // Further split the segment by spaces
            const parts = segment.split(' ').filter(part => part);

            for (let i = 0; i < parts.length; i += 2) {
                if (i + 1 < parts.length) {
                    // If there are pairs of words, treat them as first and last names
                    names.push({ firstName: parts[i], lastName: parts[i + 1] });
                } else {
                    // If there's an odd number of words, the last word is just a first name
                    names.push({ firstName: parts[i], lastName: '' });
                }
            }
        });

        return names;
    }

    export const actions = {
        upload: async (event) => {
            const session = await event.locals.auth.validate();
            const filePath = path.resolve('data', 'test.csv');

            // Check if file exists
            if (!fs.existsSync(filePath)) {
                return {
                    status: 404,
                    body: { error: 'File not found' }
                };
            }

            // Parse the CSV file
            const results = [];

            return new Promise((resolve, reject) => {
                fs.createReadStream(filePath)
                    .pipe(csv())
                    .on('data', (data) => results.push(data))
                    .on('end', async () => {
                        try {
                            // Process each row in the CSV
                            for (let index = 2890; index < results.length; index++) {
                                console.log(index)
                                const row = results[index];
                                // Assume the CSV has columns: 'type', 'name_fi', 'name_en', etc.
                                    const people = parseNames(row.people)
                                    // console.log(`input: ${row.people}, output: ${JSON.stringify(people)}`)
                                    const peopleIds = await getOrCreatePersons(people)

                                    const projectManagers = parseNames(row.project_manager)
                                    // console.log(`input: ${row.project_manager}, output: ${JSON.stringify(projectManagers)}`)
                                    const projectManagerIds = await getOrCreatePersons(projectManagers)
                                    const clientIds = []
                                    const clients = row.client.split(',').map((client) => client.trim())
                                    for (let index = 0; index < clients.length; index++) {
                                        const element = clients[index];
                                        const clientId = await getOrCreateClient(element);
                                        clientIds.push(clientId)
                                    }

                                    const countryIds = []
                                    const coutries = row.countries.split(',').map((client) => client.trim())
                                    for (let index = 0; index < coutries.length; index++) {
                                        const element = coutries[index];
                                        const countryId = await getOrCreateCountry(element);
                                        countryIds.push(countryId)
                                    }
                                    
                                    const businessLineIds = []
                                    const businessLines = row.business_lines?.split(',').map((item) => item.trim())
                                    for (let index = 0; index < businessLines.length; index++) {
                                        const element = businessLines[index];
                                        const businessLineId = await getOrCreateBusinessLine(element)
                                        businessLineIds.push(businessLineId)
                                    }

                                    const projectTypeIds = []
                                    const projectTypes = row.project_types?.split(',').map((item) => item.trim())
                                    for (let index = 0; index < projectTypes.length; index++) {
                                        const element = projectTypes[index];
                                        const projectTypeId = await getOrCreateProjectType(element)
                                        projectTypeIds.push(projectTypeId)
                                    }
                                    // const countryId = await getOrCreateCountry(
                                    // 	row.country_fi,
                                    // );
                                    let startDate, endDate 
                                    
                                    try {
                                        if (row.start_date.length > 10) {
                                            startDate = new Date(row.start_date) || null
                                        }
                                        console.log(row.start_date, startDate)
                                    } catch (error) {
                                        
                                    }
                                    try {
                                        if (row.end_date.length > 10) {
                                            endDate = new Date(row.end_date) || null
                                        }
                                    } catch (error) {
                                        
                                    }
                                    // Create the reference
                                    await prisma.reference.create({
                                    	data: {
                                            user: {
                                                connect: { id: session?.user?.userId },
                                              },
                                    		description_fi: row.description,
                                    		description_en: '',
                                    		projectNumber: row.project_number,
                                    		projectValue: parseFloat(row.project_value) || 0,
                                    		language: row.language === 'fi' ? 'finnish' : 'english',
                                    		clientContact: row.client_contact,
                                    		comments: row.comments,
                                    		start_date: startDate,
                                    		// start_date: row.start_date ? new Date(row.start_date) : null,
                                    		end_date: endDate,
                                    		// end_date: row.end_date ? new Date(row.end_date) : null,
                                    		createdBy: row.createdBy,
                                            projectManagers: {
                                                connect: projectManagerIds.map((id) => ({id}))
                                            },
                                            people: {
                                                connect: peopleIds.map((id) => ({id}))
                                            },
                                    		projectType: { connect: projectTypeIds.map((id) => ({id})) },
                                    		clients: { connect: clientIds.map((id) => ({id})) },
                                    		businessLine: { connect: businessLineIds.map((id) => ({id})) },
                                    		country: { connect: countryIds.map((id) => ({id})) }
                                    	}
                                    });
                            }
                            resolve({
                                status: 200,
                                body: { message: 'Data parsed and stored successfully' }
                            });
                        } catch (error) {
                            console.error(error);
                            reject({
                                status: 500,
                                body: { error: 'An error occurred while processing the data' }
                            });
                        }
                    })
                    .on('error', (error) => {
                        console.error(error);
                        reject({
                            status: 500,
                            body: { error: 'An error occurred while reading the file' }
                        });
                    });
            });
        },
        add: async (event) => {
            const form = await superValidate(
                event.request,
                zod(
                    businessLineSchema.pick({
                        name_en: true,
                        name_fi: true
                    })
                )
            );
            console.log('form', form);
            if (!form.valid) {
                return setError(form, 'Form is invalid');
            }
            const { name_en, name_fi } = form.data;

            try {
                await prisma.businessLine.create({
                    data: {
                        name_en,
                        name_fi
                    }
                });
            } catch (error) {
                console.error(error);
                return setError(
                    form,
                    'The was a problem with creating businessLine. Please contact support if you need further help.'
                );
            }
            return message(form, 'Successfuly added');
        },

        bulkdelete: async (event) => {
            const form = await superValidate(event.request, zod(bulkDeleteSchema));
            if (!form.valid) {
                return setError(form, 'Form is invalid');
            }
            try {
                await prisma.businessLine.deleteMany({
                    where: {
                        id: {
                            in: form.data.ids
                        }
                    }
                });
            } catch (error) {
                console.error(error);
                return setError(
                    form,
                    'The was a problem with detetion. Please contact support if you need further help.'
                );
            }
        },
        edit: async (event) => {
            const form = await superValidate(event.request, zod(businessLineSchema));
            console.log({ form });
            if (!form.valid) {
                return setError(form, 'Form is invalid');
            }
            const { id, name_en, name_fi } = form.data;

            try {
                await prisma.businessLine.update({
                    where: {
                        id
                    },
                    data: {
                        name_en,
                        name_fi
                    }
                });
            } catch (error) {
                console.error(error);
                return setError(
                    form,
                    'The was a problem with edit business line. Please contact support if you need further help.'
                );
            }

            return { form, reload: true };
        },
        delete: async (event) => {
            const form = await superValidate(event.request, zod(businessLineSchema.pick({ id: true })));
            if (!form.valid) {
                return setError(form, 'Form is invalid');
            }
            try {
                await prisma.businessLine.delete({
                    where: {
                        id: form.data.id
                    }
                });
            } catch (error) {
                console.error(error);
                return setError(
                    form,
                    'The was a problem with deletion. Please contact support if you need further help.'
                );
            }
        }
    };
