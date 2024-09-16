import prisma from '$lib/config/prisma.js';
import { bulkDeleteSchema, businessLineSchema, personSchema } from '$lib/config/zod-schemas.js';
import { zod } from 'sveltekit-superforms/adapters';
import { setError, superValidate, setMessage, message } from 'sveltekit-superforms/server';

export const load = async (event) => {
	const session = await event.locals.auth.validate();

    const pageIndex = Number(event.url.searchParams.get('pageIndex')) || 0
    const pageSize = Number(event.url.searchParams.get('pageSize')) || 7
    const search = event.url.searchParams.get('search') || null
    const skip = pageIndex * pageSize;
    // Query total count of project types
    const totalCount = await prisma.person.count();
 
    const persons = await prisma.person.findMany({
        ...(search && {where: {
            OR: [
              {
                firstName: {
                  contains: search,
                  mode: 'insensitive', // Optional: makes the search case-insensitive
                },
              },
              {
                lastName: {
                  contains: search,
                  mode: 'insensitive',
                },
              }
            ],
          }
        }),
        skip: skip,
        take: pageSize,
    })

    const pageCount = Math.ceil(totalCount / pageSize);

    return  {
        persons,
        pageIndex,
        pageCount,
        pageSize,
        totalCount,
        search
    }
}

export const actions = {
    add: async (event) => {
        const form = await superValidate(event.request, zod(personSchema.pick({
            firstName: true,
            lastName: true,
        })));
		console.log('form', form);
		if (!form.valid) {
			return setError(form, 'Form is invalid')
		}
        const {
            firstName,
            lastName,
        } = form.data

        try {
            await prisma.person.create({
                data: {
                    firstName,
                    lastName,
                }
            })
        } catch (error) {
            console.error(error);
			return setError(
				form,
				'The was a problem with creating person. Please contact support if you need further help.'
			);
        }
        return message(form, 'Successfuly added')
    },

    bulkdelete: async (event) => {
        const form = await superValidate(event.request, zod(bulkDeleteSchema));
        if (!form.valid) {
			return setError(form, 'Form is invalid')
		}
        try {
            await prisma.person.deleteMany({
                where: {
                    id: {
                        in: form.data.ids,
                    },
                },
            })   
        } catch (error) {
            console.error(error)
            return setError(form, 'The was a problem with detetion. Please contact support if you need further help.')
        }
    },
    edit: async (event) => {
        const form = await superValidate(event.request, zod(personSchema));
        console.log({form})
        if (!form.valid) {
			return setError(form, 'Form is invalid')
		}
        const {
            id,
            firstName,
            lastName,
        } = form.data

        try {
            await prisma.person.update({
                where: {
                    id
                },
                data: {
                    firstName,
                    lastName,
                }
            })
        } catch (error) {
            console.error(error)
            return setError(form, 'The was a problem with edit person. Please contact support if you need further help.')
        }

        return { form, reload: true }
    },
    delete: async (event) => {
        const form = await superValidate(event.request, zod(personSchema.pick({id: true})));
        if (!form.valid) {
			return setError(form, 'Form is invalid')
		}
        try {
            await prisma.person.delete({
                where: {
                    id: form.data.id
                }
            })   
        } catch (error) {
            console.error(error)
            return setError(form, 'The was a problem with deletion. Please contact support if you need further help.')
        }
    }
}