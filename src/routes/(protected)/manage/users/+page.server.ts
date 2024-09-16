import prisma from '$lib/config/prisma.js';
import { addUserAdmin, countrySchema } from '$lib/config/zod-schemas.js';
import { zod } from 'sveltekit-superforms/adapters';
import { setError, superValidate } from 'sveltekit-superforms/server';

export const load = async (event) => {
	const session = await event.locals.auth.validate();

    const pageIndex = Number(event.url.searchParams.get('pageIndex')) || 0
    const pageSize = Number(event.url.searchParams.get('pageSize')) || 7
    const search = event.url.searchParams.get('search') || null
    const skip = pageIndex * pageSize;
    // Query total count of project types
    const totalCount = await prisma.authUser.count();
 
    const users = await prisma.authUser.findMany({
        ...(search && {where: {
            OR: [
              {
                email: {
                  contains: search,
                  mode: 'insensitive', // Optional: makes the search case-insensitive
                },
              },
              {
                firstName: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                lastName: {
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
        users,
        pageIndex,
        pageCount,
        pageSize,
        totalCount,
        search
    }
}

export const actions = {
    add: async (event) => {
      console.log('CALLED')
        const form = await superValidate(event.request, zod(addUserAdmin.pick({
          firstName: true,
          lastName: true,
          email: true,
          password: true,
          role: true,
          verified: true,
        })));
		console.log('form', form);
		if (!form.valid) {
			return setError(form, 'Form is invalid')
		}
        const {
          firstName,
          lastName,
          email,
          password,
          role, 
          verified,
        } = form.data

        console.log('form data', form.data)
      //   try {
      //       await prisma.country.create({
      //           data: {
      //               name_en,
      //               name_fi,
      //               numeric,
      //               alpha2,
      //               alpha3
      //           }
      //       })
      //   } catch (error) {
      //       console.error(error);
			// return setError(
			// 	form,
			// 	'The was a problem with creating country. Please contact support if you need further help.'
			// );
      //   }
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