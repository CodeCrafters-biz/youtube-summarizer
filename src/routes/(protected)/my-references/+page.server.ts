import prisma from '$lib/config/prisma.js';
import { bulkDeleteSchema, referenceSchema } from '$lib/config/zod-schemas.js';
import { setError, superValidate } from 'sveltekit-superforms';
import { i, language, languages } from '@inlang/sdk-js'
import { fail, redirect, type Handle } from '@sveltejs/kit';
import { zod } from 'sveltekit-superforms/adapters';

export const load = async (event) => {
    const session = await event.locals.auth.validate();
    const pageIndex = Number(event.url.searchParams.get('pageIndex')) || 0
    const pageSize = Number(event.url.searchParams.get('pageSize')) || 7
    const search = event.url.searchParams.get('search') || null
 
    const query = {
        where: {
            createdBy: session?.user?.userId,
            ...(search && {
                OR: [
                    {
                      description_en: {
                        contains: search,
                        mode: 'insensitive', // Optional: makes the search case-insensitive
                      },
                    },
                    {
                        description_fi: {
                        contains: search,
                        mode: 'insensitive',
                      },
                    }
                  ],
            })
        },
    }

    let references = await prisma.reference.findMany({...query,
        skip: pageIndex * pageSize,
        take: pageSize
        , include: {
        // Include all relation fields you want to return
        country: true,
        businessLine: true,
        projectType: true,
        people: true,
        clients: true,
        projectManagers: true
    }});
    const totalCount = await prisma.reference.count(query)
    const pageCount = Math.ceil(totalCount / pageSize);
    return  {
        references,
        pageIndex,
        pageCount,
        pageSize,
        totalCount,
        search
    }
};

export const actions = {
	bulkdelete: async (event) => {
        const form = await superValidate(event.request, zod(bulkDeleteSchema));
        if (!form.valid) {
			return setError(form, 'Form is invalid')
		}
        try {
            await prisma.reference.deleteMany({
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
}

