import prisma from '$lib/config/prisma.js';
import { bulkDeleteSchema, countrySchema } from '$lib/config/zod-schemas.js';
import { zod } from 'sveltekit-superforms/adapters';
import { setError, superValidate, setMessage, message } from 'sveltekit-superforms/server';

export const load = async (event) => {
	const session = await event.locals.auth.validate();

    const pageIndex = Number(event.url.searchParams.get('pageIndex')) || 0
    const pageSize = Number(event.url.searchParams.get('pageSize')) || 7
    const search = event.url.searchParams.get('search') || null
    const skip = pageIndex * pageSize;
    // Query total count of project types
    const totalCount = await prisma.country.count();
 
    const countries = await prisma.country.findMany({
        ...(search && {where: {
            OR: [
              {
                name_en: {
                  contains: search,
                  mode: 'insensitive', // Optional: makes the search case-insensitive
                },
              },
              {
                name_fi: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                numeric: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                alpha2: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                alpha3: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            ],
          }
        }),
        skip: skip,
        take: pageSize,
    })

    const pageCount = Math.ceil(totalCount / pageSize);

    return  {
        countries,
        pageIndex,
        pageCount,
        pageSize,
        totalCount,
        search
    }
}

export const actions = {
    add: async (event) => {
        const form = await superValidate(event.request, zod(countrySchema.pick({
            name_en: true,
            name_fi: true,
            numeric: true,
            alpha2: true,
            alpha3: true
        })));
		console.log('form', form);
		if (!form.valid) {
			return setError(form, 'Form is invalid')
		}
        const {
            name_en,
            name_fi,
            numeric,
            alpha2,
            alpha3
        } = form.data

        try {
            await prisma.country.create({
                data: {
                    name_en,
                    name_fi,
                    numeric,
                    alpha2,
                    alpha3
                }
            })
        } catch (error) {
            console.error(error);
			return setError(
				form,
				'The was a problem with creating country. Please contact support if you need further help.'
			);
        }
        return message(form, 'successfuly added')
    },

    bulkdelete: async (event) => {
        const form = await superValidate(event.request, zod(bulkDeleteSchema));
        if (!form.valid) {
			return setError(form, 'Form is invalid')
		}
        try {
            await prisma.country.deleteMany({
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
        const form = await superValidate(event.request, zod(countrySchema));
        console.log({form})
        if (!form.valid) {
			return setError(form, 'Form is invalid')
		}
        const {
            id,
            name_en,
            name_fi,
            numeric,
            alpha2,
            alpha3
        } = form.data

        await prisma.country.update({
            where: {
                id
            },
            data: {
                name_en,
                name_fi,
                numeric,
                alpha2,
                alpha3
            }
        })
        return { form, reload: true }
    },
    delete: async (event) => {
        const form = await superValidate(event.request, zod(countrySchema.pick({id: true})));
        if (!form.valid) {
			return setError(form, 'Form is invalid')
		}
        try {
            await prisma.country.delete({
                where: {
                    id: form.data.id
                }
            })   
        } catch (error) {
            console.error(error)
            return setError(form, 'The was a problem with creating country. Please contact support if you need further help.')
        }
    }
}