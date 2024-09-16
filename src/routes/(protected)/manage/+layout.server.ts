import { checkRole } from "$lib/utils";

export const load = async (event: { locals: { user: any } }) => {
    console.log('here')
    checkRole(event.locals.user, ['ADMIN', 'MANAGER'])
    // event.locals.user
	// return { user: event.locals.user };
};
