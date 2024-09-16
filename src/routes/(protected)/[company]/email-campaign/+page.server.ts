import prisma from '$lib/config/prisma.js';
import { emailSchema, referenceSchema } from '$lib/config/zod-schemas.js';
import { setError, superValidate } from 'sveltekit-superforms';
import { redirect } from '@sveltejs/kit';
import { zod } from 'sveltekit-superforms/adapters';
import axios from 'axios';
import { listMessages, createMessage, createRun, createThread, pollRunWithTimeout } from '$lib/server/openai.js';



export const load = async (event) => {
  const form = await superValidate(zod(emailSchema));
  const { company } = await event.parent();
	// const form = await superValidate(zod(referenceSchema.omit({id: true})));
  //   const session = await event.locals.auth.validate();
  //   const projectTypes = await prisma.projectType.findMany()
  //   const persons = await prisma.person.findMany()
  //   const businessLines = await prisma.businessLine.findMany()
  //   const clients = await prisma.client.findMany()
  //   const projectManagers = await prisma.person.findMany({
  //       where: {
  //         managedProjects: {
  //           some: {}
  //         }
  //       }
  //     });
  //   const countries = await prisma.country.findMany()
    return  { form, response: '' }
};

export const actions = {
	default: async (event) => {
    const form = await superValidate(event.request, zod(emailSchema));
		if (!form.valid) {
			return setError(form, 'Form is invalid, please check all fields and make sure there are no red marks')
		}
    const {
      description
    } = form.data;

    const createThreadRes = await createThread()
    const createMessageRes = await createMessage(createThreadRes.id, description)
    const createRunRes = await createRun('asst_msUzNiz4RlNzdj0tFcnIgZLs', createThreadRes.id)
    const completedRun = await pollRunWithTimeout(createThreadRes.id, createRunRes.id)
    const listMessagesRes = await listMessages(createThreadRes.id);
    console.log(listMessagesRes.data[0]?.content[0]?.text?.value)
    return {form, response: listMessagesRes.data[0]?.content[0]?.text?.value}
  }
}