import { fail, redirect } from '@sveltejs/kit';
import { setError, superValidate } from 'sveltekit-superforms/server';
import { auth } from '$lib/server/lucia';
import { userSchema } from '$lib/config/zod-schemas';
import { zod } from 'sveltekit-superforms/adapters';

const signInSchema = userSchema.pick({
	email: true,
	password: true
});

export const load = async (event) => {
	const session = await event.locals.auth.validate();
	console.log({session})
	if (session) throw redirect(302, '/summarize');
	const form = await superValidate(zod(signInSchema));
	return {
		form
	};
};

export const actions = {
	default: async (event) => {
		const form = await superValidate(event.request, zod(signInSchema));
		//console.log(form);

		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		//add user to db
		try {
			console.log('sign in user');
			const key = await auth.useKey('email', form.data.email.toLowerCase(), form.data.password);
			const session = await auth.createSession({
				userId: key.userId,
				attributes: {}
			});
			console.log({session})
			event.locals.auth.setSession(session);
		} catch (e) {
			//TODO: need to return error message to client
			console.error(e);
			// email already in use
			//const { fieldErrors: errors } = e.flatten();
			return setError(form, null, 'The email or password is incorrect.');
		}

		return { form };
	}
};
