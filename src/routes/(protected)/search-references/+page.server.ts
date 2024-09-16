import prisma from '$lib/config/prisma.js';
import {
	exportReferenceSchems,
	referenceSchema,
	searchReferenceSchema
} from '$lib/config/zod-schemas';
import { setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { redirect } from '@sveltejs/kit';
import qs from 'qs';
import _ from 'lodash';
import fs from 'fs';
import path from 'path';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, Media, ImageRun } from 'docx';
import { isValidDate } from '$lib/utils';

export const load = async (event) => {
	const session = await event.locals.auth.validate();

	const pageIndex = Number(event.url.searchParams.get('pageIndex')) || 0;
	const pageSize = Number(event.url.searchParams.get('pageSize')) || 7;

	const parsed = qs.parse(event.url.searchParams.toString(), { arrayFormat: 'brackets' });
	const {
		minStartDate,
		maxEndDate,
		minProjectValue,
		maxProjectValue,
		projectTypes,
		businessLines,
		clients,
		persons,
		projectManagers,
		language,
		countries,
		pageCount,
		search
	} = parsed;

	const query = {
		where: {
			AND: [
				...(search
					? [
							{
								OR: [
									{
										people: {
											some: {
												OR: [
													{
														firstName: {
															contains: search,
															mode: 'insensitive' // Case-insensitive search
														}
													},
													{
														lastName: {
															contains: search,
															mode: 'insensitive'
														}
													}
												]
											}
										}
									},
									{
										projectManagers: {
											some: {
												OR: [
													{
														firstName: {
															contains: search,
															mode: 'insensitive'
														}
													},
													{
														lastName: {
															contains: search,
															mode: 'insensitive'
														}
													}
												]
											}
										}
									},
									{
										description_en: {
											contains: search,
											mode: 'insensitive' // Optional: makes the search case-insensitive
										}
									},
									{
										description_fi: {
											contains: search,
											mode: 'insensitive'
										}
									},
									{
										clientContact: {
											contains: search,
											mode: 'insensitive'
										}
									},
									{
										country: {
											some: {
												OR: [
													{
														name_fi: {
															contains: search,
															mode: 'insensitive'
														}
													},
													{
														name_en: {
															contains: search,
															mode: 'insensitive'
														}
													}
												]
											}
										}
									}
								]
							}
					  ]
					: []),
				...(language && language !== 'both'
					? [
							{
								language
							}
					  ]
					: []),
				...(minStartDate && isValidDate(minStartDate)
					? [
							{
								start_date: {
									gte: new Date(minStartDate)
								}
							}
					  ]
					: []),
				...(maxEndDate && isValidDate(maxEndDate)
					? [
							{
								end_date: {
									gte: new Date(maxEndDate)
								}
							}
					  ]
					: []),

				...(minProjectValue
					? [
							{
								projectValue: {
									gte: Number(minProjectValue)
								}
							}
					  ]
					: []),
				...(maxProjectValue
					? [
							{
								projectValue: {
									lte: Number(maxProjectValue)
								}
							}
					  ]
					: []),
				...(projectTypes?.length
					? [
							{
								projectType: {
									some: {
										id: {
											in: projectTypes
										}
									}
								}
							}
					  ]
					: []),
				...(businessLines?.length
					? [
							{
								businessLine: {
									some: {
										id: {
											in: businessLines
										}
									}
								}
							}
					  ]
					: []),
				...(countries?.length
					? [
							{
								country: {
									some: {
										id: {
											in: countries
										}
									}
								}
							}
					  ]
					: []),
				...(clients?.length
					? [
							{
								clients: {
									some: {
										id: {
											in: clients
										}
									}
								}
							}
					  ]
					: []),
				...(persons?.length
					? [
							{
								people: {
									some: {
										id: {
											in: persons
										}
									}
								}
							}
					  ]
					: []),
				...(projectManagers?.length
					? [
							{
								projectManagers: {
									some: {
										id: {
											in: projectManagers
										}
									}
								}
							}
					  ]
					: [])
			]
		}
	};
	let references, totalCount;
	try {
		references = await prisma.reference.findMany({
			...query,
			skip: pageIndex * pageSize,
			take: pageSize,
			include: {
				// Include all relation fields you want to return
				country: true,
				businessLine: true,
				projectType: true,
				clients: true,
				people: true,
				projectManagers: true
			}
		});
		totalCount = await prisma.reference.count(query);
	} catch (error) {
		console.error(error);
		throw redirect(302, '?');
	}
	const projectTypesArray = await prisma.projectType.findMany();
	const personsArray = await prisma.person.findMany();
	const businessLinesArray = await prisma.businessLine.findMany();
	const clientsArray = await prisma.client.findMany();
	const projectManagersArray = await prisma.person.findMany({});
	const countriesArray = await prisma.country.findMany();
	return {
		references,
		pageIndex,
		pageCount,
		pageSize,
		totalCount,
		projectTypes: projectTypesArray,
		persons: personsArray,
		businessLines: businessLinesArray,
		clients: clientsArray,
		projectManagers: projectManagersArray,
		countries: countriesArray,
		search
	};
};

export const actions = {
	load: async (event) => {
		const session = await event.locals.auth.validate();
		const form = await superValidate(event.request, zod(searchReferenceSchema));
		if (!form.valid) {
			return setError(
				form,
				'Form is invalid, please check all fields and make sure there are no red marks'
			);
		}
		const queryStringData = _.pickBy(form.data, (value) => {
			return !_.isNil(value) && (!_.isArray(value) || !_.isEmpty(value));
		});
		const queryString = qs.stringify(queryStringData, { arrayFormat: 'brackets', indices: false });
		throw redirect(302, `?${queryString}`);
	}
};
