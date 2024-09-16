import prisma from '$lib/config/prisma.js';
import { bulkDeleteSchema, businessLineSchema, clientSchema } from '$lib/config/zod-schemas.js';
import { zod } from 'sveltekit-superforms/adapters';
import { setError, superValidate, setMessage, message } from 'sveltekit-superforms/server';

export const load = async (event) => {
	const session = await event.locals.auth.validate();

    const pageIndex = Number(event.url.searchParams.get('pageIndex')) || 0
    const pageSize = Number(event.url.searchParams.get('pageSize')) || 7
    const search = event.url.searchParams.get('search') || null
    const skip = pageIndex * pageSize;
    // Query total count of project types
    const totalCount = await prisma.client.count();
 
    const clients = await prisma.client.findMany({
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
              }
            ],
          }
        }),
        skip: skip,
        take: pageSize,
    })

    const pageCount = Math.ceil(totalCount / pageSize);

    return  {
        clients,
        pageIndex,
        pageCount,
        pageSize,
        totalCount,
        search
    }
}

export const actions = {
    add: async (event) => {
        const form = await superValidate(event.request, zod(clientSchema.pick({
            name_en: true,
            name_fi: true,
        })));
		console.log('form', form);
		if (!form.valid) {
			return setError(form, 'Form is invalid')
		}
        const {
            name_en,
            name_fi,
        } = form.data

        try {
            await prisma.client.create({
                data: {
                    name_en,
                    name_fi,
                }
            })
        } catch (error) {
            console.error(error);
			return setError(
				form,
				'The was a problem with creating client. Please contact support if you need further help.'
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
            await prisma.client.deleteMany({
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
        const form = await superValidate(event.request, zod(clientSchema));
        console.log({form})
        if (!form.valid) {
			return setError(form, 'Form is invalid')
		}
        const {
            id,
            name_en,
            name_fi,
        } = form.data

        try {
            await prisma.client.update({
                where: {
                    id
                },
                data: {
                    name_en,
                    name_fi,
                }
            })
        } catch (error) {
            console.error(error)
            return setError(form, 'The was a problem with edit client. Please contact support if you need further help.')
        }

        return { form, reload: true }
    },
    delete: async (event) => {
        const form = await superValidate(event.request, zod(businessLineSchema.pick({id: true})));
        if (!form.valid) {
			return setError(form, 'Form is invalid')
		}
        try {
            await prisma.client.delete({
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