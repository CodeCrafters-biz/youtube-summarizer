import prisma from "$lib/config/prisma";
import { checkRole } from "$lib/utils";

export const load = async (event: { locals: { user: any } }) => {
    const company = await prisma.company.findFirst({
        where: { name: event.params.company }
    });
    // console.log('email', event.locals, company)
    // checkRole(event?.locals?.user, ['ADMIN', 'MANAGER'])
    // event.locals.user
	return { company };
};
