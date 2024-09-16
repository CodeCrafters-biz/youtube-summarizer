import prisma from '$lib/config/prisma.js';
import { referenceSchema } from '$lib/config/zod-schemas.js';
import { setError, superValidate } from 'sveltekit-superforms';
import { redirect } from '@sveltejs/kit';
import { zod } from 'sveltekit-superforms/adapters';

export const load = async (event) => {
	const form = await superValidate(zod(referenceSchema.omit({id: true})));
    const session = await event.locals.auth.validate();
    const projectTypes = await prisma.projectType.findMany()
    const persons = await prisma.person.findMany()
    const businessLines = await prisma.businessLine.findMany()
    const clients = await prisma.client.findMany()
    const projectManagers = await prisma.person.findMany({
        where: {
          managedProjects: {
            some: {}
          }
        }
      });
    const countries = await prisma.country.findMany()
    return  { projectTypes, countries, persons, businessLines, clients, projectManagers, form }
};

export const actions = {
	default: async (event) => {
    const session = await event.locals.auth.validate();
		const form = await superValidate(event.request, zod(referenceSchema.omit({id: true})));
		if (!form.valid) {
			return setError(form, 'Form is invalid, please check all fields and make sure there are no red marks')
		}
    const {
      description_fi,
      description_en,
      projectNumber,
      projectValue,
      startDate,
      endDate,
      language,
      clientContact,
      comments,
      projectTypes,
      businessLines,
      clients,
      projectManagers,
      persons,
      countries
    } = form.data

		try {
			await prisma.reference.create({
        data: {
          description_fi,
          description_en,
          projectNumber,
          projectValue,
          start_date: startDate,
          end_date: endDate,
          language,
          clientContact,
          comments,
          user: {
            connect: { id: session?.user?.userId },
          },
          projectType: {
            connect: projectTypes?.map((itemId) => ({id: itemId}))
          },
          businessLine: {
            connect: businessLines?.map((itemId) => ({id: itemId}))
          },
          clients: {
            connect: clients.map((itemId) => ({id: itemId}))
          },
          projectManagers: {
            connect: projectManagers.map((itemId) => ({id: itemId}))
          },
          people: {
            connect: persons.map((itemId) => ({id: itemId}))
          },
          country: {
            connect: countries.map((itemId) => ({id: itemId}))
          }
        }
      })
		} catch (e) {
			console.error(e);
			return setError(
				form,
				'The was a problem with creating Reference. Please contact support if you need further help.'
			);
		}
    throw redirect(302, `/my-references`);
	}
}

