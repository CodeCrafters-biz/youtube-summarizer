import prisma from '$lib/config/prisma.js';
import { emailSchema, referenceSchema, summarizeSchema } from '$lib/config/zod-schemas.js';
import { setError, superValidate } from 'sveltekit-superforms';
import { redirect } from '@sveltejs/kit';
import { zod } from 'sveltekit-superforms/adapters';
import axios from 'axios';
import ytdlp from 'yt-dlp-exec';
import fs from 'fs';
import { listMessages, createMessage, createRun, createThread, pollRunWithTimeout } from '$lib/server/openai.js';



export const load = async (event) => {
  const form = await superValidate(zod(summarizeSchema));
  // const { company } = await event.parent();
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
    const form = await superValidate(event.request, zod(summarizeSchema));
    console.log(form.data)
		if (!form.valid) {
			return setError(form, 'Form is invalid, please check all fields and make sure there are no red marks')
		}
    const {
      url
    } = form.data;

    let output

    try {
      output = await ytdlp(url, {
        writeAutoSub: true, // Download automatic subtitles
        subLang: 'en',      // Specify the subtitle language, e.g., 'en' for English
        skipDownload: true,
        printJson: true,
        output: '123'
      }) 
      
      // if (output.subtitles && output.subtitles.en) {
      //   const vttFileUrl = jsonData.subtitles.en[0].url; // Get the URL of the first subtitle file
      //   console.log('VTT file path:', vttFileUrl);
      // } else {
      //   console.log('No subtitles found for the specified language.');
      // }
      // const plainText = output
      // .replace(/\d+\n/g, '')                          // Remove subtitle sequence numbers
      // .replace(/\d{2}:\d{2}:\d{2},\d{3} --> .*\n/g, '') // Remove timestamps
      // .replace(/\n{2,}/g, '\n')                       // Remove multiple newlines
      // .trim();                 
    } catch (error) {
      console.error(error)
      return setError(form, 'Something went wrong')
    }

    const subs = fs.readFileSync('./123.en.vtt', 'utf8')
    const textOnly = subs
      .replace(/WEBVTT[\s\S]*?\n\n/, '')               // Remove the WEBVTT header
      .replace(/(\d{2}:\d{2}:\d{2}\.\d{3} --> \d{2}:\d{2}:\d{2}\.\d{3})/g, '') // Remove timestamps
      .replace(/\d+\n/g, '')                           // Remove cue numbers (if present)
      .replace(/(line:\d{2}%|size:\d{2}%|position:\d{2}%|align:\w+).*\n/g, '') // Remove annotations
      .replace(/\n{2,}/g, '\n')                        // Remove excessive new lines
      .trim();   

    const createThreadRes = await createThread()
    const createMessageRes = await createMessage(createThreadRes.id, textOnly)
    const createRunRes = await createRun('asst_U09gKYXqS5BfoQhHizMa5DwY', createThreadRes.id)
    const completedRun = await pollRunWithTimeout(createThreadRes.id, createRunRes.id)
    const listMessagesRes = await listMessages(createThreadRes.id);
    console.log(listMessagesRes.data[0]?.content[0]?.text?.value)
    return {form, response: listMessagesRes.data[0]?.content[0]?.text?.value}
  }
}