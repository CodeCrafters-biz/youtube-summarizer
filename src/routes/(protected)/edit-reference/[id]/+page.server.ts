import prisma from '$lib/config/prisma.js';
import { referenceSchema } from '$lib/config/zod-schemas.js';
import { setError, superValidate } from 'sveltekit-superforms';
import { i, language, languages } from '@inlang/sdk-js'
import { fail, redirect, type Handle } from '@sveltejs/kit';
import { zod } from 'sveltekit-superforms/adapters';

export const load = async (event) => {
  console.log('form', event.params.id)
    const session = await event.locals.auth.validate();
    const reference = await prisma.reference.findFirst({
        where: {
          id: event.params.id
        },
        include: {
            // Include all relation fields you want to return
            country: true,
            clients: true,
            businessLine: true,
            projectType: true,
            people: true,
            projectManagers: true
        }
    })
    console.log({reference})
    const form = await superValidate({
      id: reference?.id,
      description_fi: reference?.description_fi,
      description_en: reference?.description_en,
      projectNumber: reference?.projectNumber,
      projectValue: reference?.projectValue,
      startDate: reference?.start_date?.toISOString(),
      endDate: reference?.end_date?.toISOString(),
      language: reference?.language,
      clientContact: reference?.clientContact,
      comments: reference?.comments,
      projectTypes: reference?.projectType.map((projectType) => projectType.id),
      businessLines: reference?.businessLine.map((businessLine) => businessLine.id),
      clients: reference?.clients.map((client) => client.id),
      persons: reference?.people.map((person) => person.id),
      projectManagers: reference?.projectManagers.map((projectManager) => projectManager.id),
      countries: reference?.country.map((country) => country.id)

    }, zod(referenceSchema));
    console.log('edit form' ,form.data)
    const projectTypes = await prisma.projectType.findMany()
    const persons = await prisma.person.findMany()
    const businessLines = await prisma.businessLine.findMany()
    const clients = await prisma.client.findMany()
    const projectManagers = await prisma.person.findMany();
    const countries = await prisma.country.findMany()
    return  { projectTypes, reference, countries, persons, businessLines, clients, projectManagers, form }
};

export const actions = {
	default: async (event) => {
    const session = await event.locals.auth.validate();
		const form = await superValidate(event.request, zod(referenceSchema));
    console.log(session)
		console.log('form', form);
		if (!form.valid) {
			return setError(form, 'Form is invalid, please check all fields and make sure there are no red marks')
		}
    const {
      id,
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
		//add user to db
		try {
			await prisma.reference.update({
        where: {
          id
        },
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
		// throw redirect(302, `/auth/password/update-${token}/success`);
		//		return { form };
	}
}

