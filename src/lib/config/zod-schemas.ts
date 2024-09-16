import { z } from 'zod';

const zodArray = () => {
	return z.array(z.string()).transform((arr) => {
		arr = arr.reduce((acc, item) => {
			if (item.split(',').length > 1) {
				acc = [...acc, ...item.split(',')];
				return acc;
			}
			acc.push(item);
			return acc;
		}, []);
		return arr.filter((item) => !!item);
	});
};

export const addUserAdmin = z.object({
	id: z
		.string({ required_error: 'createReference.descriptionRequired' })
		.min(1, { message: 'createReference.descriptionRequired' }),
	firstName: z
		.string({ required_error: 'First Name is required' })
		.min(1, { message: 'First Name is required' })
		.trim(),
	lastName: z
		.string({ required_error: 'Last Name is required' })
		.min(1, { message: 'Last Name is required' })
		.trim(),
	email: z
		.string({ required_error: 'Email is required' })
		.email({ message: 'Please enter a valid email address' }),
	password: z
		.string({ required_error: 'Password is required' })
		.min(6, { message: 'Password must be at least 6 characters' })
		.trim(),
	role: z.enum(['USER', 'PREMIUM', 'ADMIN'], { required_error: 'You must have a role' }),
	verified: z.boolean().default(false)
});

export const projectTypeSchema = z.object({
	id: z
		.string({ required_error: 'createReference.descriptionRequired' })
		.min(1, { message: 'createReference.descriptionRequired' }),
	name_en: z
		.string({ required_error: 'createReference.descriptionRequired' })
		.min(1, { message: 'createReference.descriptionRequired' }),
	name_fi: z
		.string({ required_error: 'createReference.descriptionRequired' })
		.min(1, { message: 'createReference.descriptionRequired' })
});

export const businessLineSchema = z.object({
	id: z
		.string({ required_error: 'createReference.descriptionRequired' })
		.min(1, { message: 'createReference.descriptionRequired' }),
	name_en: z
		.string({ required_error: 'createReference.descriptionRequired' })
		.min(1, { message: 'createReference.descriptionRequired' }),
	name_fi: z
		.string({ required_error: 'createReference.descriptionRequired' })
		.min(1, { message: 'createReference.descriptionRequired' })
});

export const clientSchema = z.object({
	id: z
		.string({ required_error: 'createReference.descriptionRequired' })
		.min(1, { message: 'createReference.descriptionRequired' }),
	name_en: z
		.string({ required_error: 'createReference.descriptionRequired' })
		.min(1, { message: 'createReference.descriptionRequired' }),
	name_fi: z
		.string({ required_error: 'createReference.descriptionRequired' })
		.min(1, { message: 'createReference.descriptionRequired' })
});

export const personSchema = z.object({
	id: z
		.string({ required_error: 'createReference.descriptionRequired' })
		.min(1, { message: 'createReference.descriptionRequired' }),
	firstName: z
		.string({ required_error: 'createReference.descriptionRequired' })
		.min(1, { message: 'createReference.descriptionRequired' }),
	lastName: z
		.string({ required_error: 'createReference.descriptionRequired' })
		.min(1, { message: 'createReference.descriptionRequired' })
});

export const bulkDeleteSchema = z.object({
	ids: zodArray(),
	confirmString: z.literal('delete me')
});

export const countrySchema = z.object({
	id: z
		.string({ required_error: 'createReference.descriptionRequired' })
		.min(1, { message: 'createReference.descriptionRequired' }),
	name_en: z
		.string({ required_error: 'createReference.descriptionRequired' })
		.min(1, { message: 'createReference.descriptionRequired' }),
	name_fi: z
		.string({ required_error: 'createReference.descriptionRequired' })
		.min(1, { message: 'createReference.descriptionRequired' }),
	numeric: z
		.string({ required_error: 'createReference.descriptionRequired' })
		.min(1, { message: 'createReference.descriptionRequired' }),
	alpha2: z
		.string({ required_error: 'createReference.descriptionRequired' })
		.min(1, { message: 'createReference.descriptionRequired' }),
	alpha3: z
		.string({ required_error: 'createReference.descriptionRequired' })
		.min(1, { message: 'createReference.descriptionRequired' })
});

export const emailSchema = z.object({
	description: z
		.string({ required_error: 'createReference.descriptionRequired' })
		.min(1, { message: 'createReference.descriptionRequired' }),
})

export const summarizeSchema = z.object({
	url: z
		.string({ required_error: 'createReference.descriptionRequired' })
		.min(1, { message: 'createReference.descriptionRequired' }),
})

export const meetingMinutes = z.object({
	file: z
		.any(),
		// .refine((file) => file instanceof Blob && file?.size < 1, { message: 'File must be uploaded and cannot be empty.' })
		// .refine((file) => {
		// 	console.log(file)
		// 	return file?.type === 'audio/mpeg'
		// }, { message: 'Only mp3 files are allowed.' }),
	additionalDescription: z
		.string().optional(),
})

export const referenceSchema = z.object({
	id: z
		.string({ required_error: 'createReference.descriptionRequired' })
		.min(1, { message: 'createReference.descriptionRequired' }),
	description_fi: z
		.string({ required_error: 'createReference.descriptionRequired' })
		.min(1, { message: 'createReference.descriptionRequired' }),
	description_en: z
		.string({ required_error: 'createReference.descriptionRequired' })
		.min(1, { message: 'createReference.descriptionRequired' }),
	projectNumber: z
		.string({ required_error: 'createReference.projectNumberRequired' })
		.min(1, { message: 'createReference.projectNumberRequired' }),
	projectValue: z
		.number(),
	startDate: z.string({ required_error: 'createReference.projectValueRequired' })
		.min(1, { message: 'createReference.projectNumberRequired' }),
	// .date({required_error: 'createReference.startDateRequired'}),
	endDate: z.string({ required_error: 'createReference.projectValueRequired' })
		.min(1, { message: 'createReference.projectNumberRequired' }),
	// .date({required_error: 'createReference.startDateRequired'}),
	language: z
		.string({ required_error: 'createReference.languageRequired' })
		.min(1, { message: 'createReference.languageRequired' })
		.default('both'),
	clientContact: z
		.string({ required_error: 'createReference.clientContactRequired' })
		.min(1, { message: 'createReference.clientContactRequired' }),
	comments: z.string().optional(),
	projectTypes: zodArray(),
	businessLines: zodArray(),
	clients: zodArray(),
	projectManagers: zodArray(),
	persons: zodArray(),
	countries: zodArray()
});

export const exportReferenceSchems = z.object({
	ids: zodArray(),
	columns: zodArray(),
})

export const searchReferenceSchema = z.object({
	search: z.string().optional().nullable(),
	projectNumber: z.string().optional(),
	minProjectValue: z.number().optional().nullable(),
	maxProjectValue: z.number().optional().nullable(),
	minStartDate: z.string().optional().nullable(),
	maxEndDate: z.string().optional().nullable(),
	language: z.string().optional().default('both').nullable(),
	clientContact: z.string().optional(),
	comments: z.string().optional(),
	projectTypes: zodArray(),
	businessLines: zodArray(),
	clients: zodArray(),
	projectManagers: zodArray(),
	persons: zodArray(),
	countries: zodArray()
});

export const exportSearcResultsReferenceSchema = searchReferenceSchema.extend({
	columns: zodArray()
})

export const userSchema = z.object({
	firstName: z
		.string({ required_error: 'First Name is required' })
		.min(1, { message: 'First Name is required' })
		.trim(),
	lastName: z
		.string({ required_error: 'Last Name is required' })
		.min(1, { message: 'Last Name is required' })
		.trim(),
	email: z
		.string({ required_error: 'Email is required' })
		.email({ message: 'Please enter a valid email address' }),
	password: z
		.string({ required_error: 'Password is required' })
		.min(6, { message: 'Password must be at least 6 characters' })
		.trim(),
	confirmPassword: z
		.string({ required_error: 'Password is required' })
		.min(6, { message: 'Password must be at least 6 characters' })
		.trim(),
	//terms: z.boolean({ required_error: 'You must accept the terms and privacy policy' }),
	role: z
		.enum(['USER', 'PREMIUM', 'ADMIN'], { required_error: 'You must have a role' })
		.default('USER'),
	verified: z.boolean().default(false),
	token: z.string().optional(),
	receiveEmail: z.boolean().default(true),
	createdAt: z.date().optional(),
	updatedAt: z.date().optional()
});

export const userUpdatePasswordSchema = userSchema
	.pick({ password: true, confirmPassword: true })
	.superRefine(({ confirmPassword, password }, ctx) => {
		if (confirmPassword !== password) {
			ctx.addIssue({
				code: 'custom',
				message: 'Password and Confirm Password must match',
				path: ['password']
			});
			ctx.addIssue({
				code: 'custom',
				message: 'Password and Confirm Password must match',
				path: ['confirmPassword']
			});
		}
	});
