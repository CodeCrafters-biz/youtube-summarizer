import prisma from '$lib/config/prisma.js';
import { emailSchema, meetingMinutes, referenceSchema } from '$lib/config/zod-schemas.js';
import { setError, superValidate } from 'sveltekit-superforms';
import { redirect } from '@sveltejs/kit';
import { zod } from 'sveltekit-superforms/adapters';
import axios from 'axios';
import { listMessages, createMessage, createRun, createThread, pollRunWithTimeout } from '$lib/server/openai.js';
import { AssemblyAI } from 'assemblyai'
import fs from 'fs';
import path from 'path'



const saveFile = async (file) => {
  if (!file || !(file instanceof Blob)) {
    console.error('File is missing or invalid');
    return { status: 400, message: 'File is required and must be valid.' };
  }

  // Convert the Blob to ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Define the file path to save the uploaded file
  const savePath = path.resolve('uploads', file.name);

  // Ensure the 'uploads' directory exists
  if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
  }

  // Save the file to the specified path
  await fs.promises.writeFile(savePath, buffer);
  return savePath;
}
export const load = async (event) => {
  const form = await superValidate(zod(meetingMinutes));
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
    const form = await superValidate(event.request, zod(meetingMinutes));
    if (!form.valid) {
      console.log(form)
			return setError(form, 'Form is invalid, please check all fields and make sure there are no red marks')
		}
    console.log(form.data)
    const {
      file,
      additionalDescription
    } = form.data;

		// Log file to check if it's received properly
		console.log("File received:", file);

		// Handle case where file is undefined
		if (!file || !(file instanceof Blob)) {
			console.error("File is missing from formData");
			return { status: 400, message: "File is required." };
		}
    const filepath = await saveFile(file)
    console.log(filepath)

    const client = new AssemblyAI({
      apiKey: "716693296c5f44c6a756dd1f6c658bd6"
    })

    const transcript = await client.transcripts.transcribe({ audio: filepath })

    console.log(transcript.text);

    const createThreadRes = await createThread()
    const createMessageRes = await createMessage(createThreadRes.id, transcript.text)
    const createRunRes = await createRun('asst_FIvPyNb60i74WhzLLTmi59O9', createThreadRes.id)
    const completedRun = await pollRunWithTimeout(createThreadRes.id, createRunRes.id)
    const listMessagesRes = await listMessages(createThreadRes.id);
    console.log(listMessagesRes.data[0]?.content[0]?.text?.value)

    try {
			await fs.promises.unlink(filepath);
			console.log(`File removed: ${filepath}`);
		} catch (error) {
			console.error('Error removing file:', error);
		}
    form.data.file = null;
    return {form, response: listMessagesRes.data[0]?.content[0]?.text?.value}
  }
}