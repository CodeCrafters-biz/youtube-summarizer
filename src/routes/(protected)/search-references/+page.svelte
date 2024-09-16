<script>
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Badge } from '$lib/components/ui/badge';
	import { dbi, handleFormError, localStorageWritable, formatCurrency, downloadFile } from '$lib/utils';
	import AppliedFilter from '$lib/components/applied-filter.svelte';
	import { toast } from 'svelte-sonner';
	import { superForm } from 'sveltekit-superforms/client';
	import { searchReferenceSchema } from '$lib/config/zod-schemas';
	import { zod } from 'sveltekit-superforms/adapters';
	import MultiselectListSearch from '$lib/components/multiselect-list-search.svelte';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import FormFieldError from '$lib/components/form-field-error.svelte';
	import DatePicker from '$lib/components/date-picker.svelte';
	import { Search, Download } from 'lucide-svelte';
	import { i, language } from '@inlang/sdk-js';
	import moment from 'moment-with-locales-es6';
	import ButtonLoader from '$lib/components/button-loader.svelte';
	import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte';
	import DataTable from '$lib/components/data-table.svelte';
	import { createRender } from 'svelte-headless-table';
	import Actions from '$lib/components/data-table/data-table-actions.svelte';
	import { goto } from '$app/navigation';
	import { onSearch, onPageChange } from '$lib/utils';
	import { NumberInput } from '$lib/components/ui/number-input';
	import ExportSelectedForm from './components/exportSelectedForm.svelte';
	import { Checkbox } from '$lib/components/ui/checkbox';

	moment.locale(language);

	export let data;


	let search = '';
	let exportSelectedModalOpen = false;
	let exportResultsModalOpen = false;
	let selectedIds = [];
	let selectedColumns = [];

	const exportColumns = [
		{ id: 'id', name: 'id' },
		{ id: 'description_fi', name: 'description_fi' },
		{ id: 'description_en', name: 'description_en' },
		{ id: 'country', name: 'country' },
		{ id: 'businessLine', name: 'businessLine' },
		{ id: 'projectType', name: 'projectType' },
		{ id: 'projectManagers', name: 'projectManagers' },
		{ id: 'people', name: 'people' },
		{ id: 'clients', name: 'clients' },
		{ id: 'projectNumber', name: 'projectNumber' },
		{ id: 'projectValue', name: 'projectValue' },
		{ id: 'language', name: 'language' },
		{ id: 'clientContact', name: 'clientContact' },
		{ id: 'comments', name: 'comments' },
		{ id: 'start_date', name: 'start_date' },
		{ id: 'end_date', name: 'end_date' },
	];

	const handle = (selectAll) => {
		selectedColumns = selectAll
			? exportColumns.map((column) => column.id)
			: [];
	};

	const columns = [
		{
			id: 'id',
			title: 'ID',
			accessor: ({ id }) => id
		},
		{
			id: 'description_en',
			title: 'description_en',
			accessor: 'description_en'
		},
		{
			id: 'projectNumber',
			title: 'projectNumber',
			accessor: 'projectNumber'
		},
		{
			id: 'projectValue',
			title: 'projectValue',
			accessor: 'projectValue'
		},
		{
			id: 'language',
			title: 'language',
			accessor: 'language'
		},
		{
			id: 'clientContact',
			title: 'clientContact',
			accessor: 'clientContact'
		},
		{
			id: 'comments',
			title: 'comments',
			accessor: 'comments'
		},
		{
			id: 'projectTypes',
			title: 'projectTypes',
			accessor: ({ projectType }) => projectType?.map((type) => dbi(type, 'name')).join(', ')
		},
		{
			id: 'businessLines',
			title: 'businessLines',
			accessor: ({ businessLine }) => businessLine?.map((line) => dbi(line, 'name')).join(', ')
		},
		{
			id: 'clients',
			title: 'clients',
			accessor: ({ clients }) => clients?.map((client) => dbi(client, 'name')).join(', ')
		},
		{
			id: 'country',
			title: 'country',
			accessor: ({ country }) => country?.map((item) => dbi(item, 'name')).join(', ')
		},
		{
			id: 'projectManagers',
			title: 'projectManagers',
			accessor: ({ projectManagers }) => projectManagers?.map((projectManager) => `${dbi(projectManager, 'firstName')} ${dbi(projectManager, 'lastName')}`).join(', ')
		},
		{
			id: 'people',
			title: 'people',
			accessor: ({ people }) => people?.map((person) => `${dbi(person, 'firstName')} ${dbi(person, 'lastName')}`).join(', ')
		},
		{
			id: 'start_date',
			title: 'start_date',
			accessor: ({ start_date }) => moment(start_date).format('LL')
		},
		{
			id: 'end_date',
			title: 'end_date',
			accessor: ({ end_date }) => moment(end_date).format('LL')
		},
		{
			id: 'description_fi',
			title: 'description_fi',
			accessor: 'description_fi'
		},
		{
			id: 'Actions',
			title: 'Actions',
			accessor: ({ id }) => id,
			cell: (item) => {
				return createRender(Actions, {
					id: item.value,
					onEdit: () => goto(`/edit-reference/${item.value}`),
					onDelete: () => {
						// deleteObj = { id: item.value };
						// deleteOpen = !deleteOpen;
					}
				});
			}
		}
	];

	const localStorageForm = localStorageWritable('search-reference-form', {});

	const { form, errors, enhance, submitting } = superForm($localStorageForm, {
		taintedMessage: null,
		validators: zod(searchReferenceSchema),
		delayMs: 0
	});

	const exportReferences = async () => {
		const formData = new FormData()

		for (const [key, value] of Object.entries($form)) {
			formData.append(key, value);
		}
		formData.append('columns', selectedColumns)
		const response = await fetch('/api/export-search-results', {
			method: 'POST',
			body: formData
		});

		downloadFile(response)
	}

	form.subscribe((value) => {
		// console.log('FORM UPDATE', value)
		localStorageForm.set(value);
	});

	errors.subscribe(handleFormError);
</script>

<div class="container flex-column">
	<h1 class="text-3xl font-semibold mb-2">Search references</h1>
	<Card.Root class="my-4">
		<Card.Header>
			<Card.Title>Search results</Card.Title>
			<Card.Description>{data.totalCount} references found</Card.Description>
		</Card.Header>
		<Card.Content>
			<DataTable
				data={data.references}
				columnsData={columns}
				pageNumber={data.pageIndex}
				initialPageSize={data.pageSize}
				totalCount={data.totalCount}
				onSearch={() => onSearch(search)}
				{onPageChange}
				bind:search
				bind:selectedIds
			>
				<data slot="action">
					<Button on:click={() => (exportResultsModalOpen = !exportResultsModalOpen)}>
						Export results (PDF) <Download class="ml-2 h-4 w-4" />
					</Button>
				</data>
				<data slot="bulk">
					<Button on:click={() => (exportSelectedModalOpen = !exportSelectedModalOpen)}>
						Export selected (PDF) <Download class="ml-2 h-4 w-4" />
					</Button>
				</data>
			</DataTable>
		</Card.Content>
	</Card.Root>
	<form method="POST" action="?/load" use:enhance>
		
		<Card.Root class="w-full mb-4">
			<Card.Header>
				<Card.Title>Filters applied</Card.Title>
			</Card.Header>
			<Card.Content>
				<AppliedFilter bind:value={$form.countries} criteria={data.countries} name="Countries" />
				<AppliedFilter
					bind:value={$form.projectTypes}
					criteria={data.projectTypes}
					name="Project types"
				/>
				<AppliedFilter
					bind:value={$form.businessLines}
					criteria={data.businessLines}
					name="Business lines"
				/>
				<AppliedFilter bind:value={$form.clients} criteria={data.clients} name="Clients" />
				<AppliedFilter
					bind:value={$form.persons}
					criteria={data.persons}
					name="People"
					displayField={(entity) => `${dbi(entity, 'firstName')} ${dbi(entity, 'lastName')}`}
				/>
				<AppliedFilter
					bind:value={$form.projectManagers}
					criteria={data.projectManagers}
					name="Project managers"
					displayField={(entity) => `${dbi(entity, 'firstName')} ${dbi(entity, 'lastName')}`}
				/>
				{#if $form.minStartDate}
					<div class="flex flex-row">
						Minimal start date:
						<div on:click={() => form.set({ ...$form, minStartDate: null })}>
							<Badge>{moment($form.minStartDate).format('LL')}</Badge>
						</div>
					</div>
				{/if}
				{#if $form.maxEndDate}
					<div class="flex flex-row">
						Maximum end date:
						<div on:click={() => form.set({ ...$form, maxEndDate: null })}>
							<Badge>{moment($form.maxEndDate).format('LL')}</Badge>
						</div>
					</div>
				{/if}
				{#if $form.minProjectValue}
					<div class="flex flex-row">
						Minimum project value:
						<div on:click={() => form.set({ ...$form, minProjectValue: null })}>
							<Badge>{formatCurrency($form.minProjectValue)}</Badge>
						</div>
					</div>
				{/if}
				{#if $form.maxProjectValue}
					<div class="flex flex-row">
						Maximum project value:
						<div on:click={() => form.set({ ...$form, maxProjectValue: null })}>
							<Badge>{formatCurrency($form.maxProjectValue)}</Badge>
						</div>
					</div>
				{/if}
				{#if $form.language}
					<div class="flex flex-row">
						Language:
						<div on:click={() => form.set({ ...$form, language: null })}>
							<Badge>{$form.language}</Badge>
						</div>
					</div>
				{/if}
				<ButtonLoader type="submit" loading={$submitting}>
					Search <Search class="h-[1.2rem] w-[1.2rem] ml-1" />
				</ButtonLoader>
				<!-- <SuperDebug data={$form}/>
				{JSON.stringify($errors)} -->
			</Card.Content>
		</Card.Root>
		<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
			<Card.Root>
				<Card.Header>
					<Card.Title>Date</Card.Title>
				</Card.Header>
				<Card.Content>
					<div class="grid grid-cols-2 gap-2">
						<div>
							<Label>Min start date</Label>
							<DatePicker name="minStartDate" bind:value={$form.minStartDate} />
							<FormFieldError {errors} field="minStartDate" />
						</div>
						<div>
							<Label>Max end date</Label>
							<DatePicker name="maxEndDate" bind:value={$form.maxEndDate} />
							<FormFieldError {errors} field="maxEndDate" />
						</div>
					</div>
				</Card.Content>
			</Card.Root>
			<Card.Root>
				<Card.Header>
					<Card.Title>Project Value</Card.Title>
				</Card.Header>
				<Card.Content>
					<div class="grid grid-cols-2 gap-2">
						<div>
							<Label>Min</Label>
							<NumberInput
								name="minProjectValue"
								placeholder="Min value"
								bind:value={$form.minProjectValue}
							/>
							<FormFieldError {errors} field="minProjectValue" />
						</div>
						<div>
							<Label>Max</Label>
							<NumberInput
								name="maxProjectValue"
								placeholder="Max value"
								bind:value={$form.maxProjectValue}
							/>
							<FormFieldError {errors} field="maxProjectValue" />
						</div>
					</div>
				</Card.Content>
			</Card.Root>
			<Card.Root>
				<Card.Header>
					<Card.Title>Language</Card.Title>
				</Card.Header>
				<Card.Content>
					<RadioGroup.Root bind:value={$form.language} id="radio-1">
						<div class="flex items-center space-x-2">
							<RadioGroup.Item value="both" id="r1" />
							<Label for="r1">Both</Label>
						</div>
						<div class="flex items-center space-x-2">
							<RadioGroup.Item value="finnish" id="r2" />
							<Label for="r2">Finnish</Label>
						</div>
						<div class="flex items-center space-x-2">
							<RadioGroup.Item value="english" id="r3" />
							<Label for="r3">English</Label>
						</div>
						<RadioGroup.Input name="language" />
					</RadioGroup.Root>
					<FormFieldError {errors} field="language" />
				</Card.Content>
			</Card.Root>
			<Card.Root>
				<Card.Header>
					<Card.Title>Country list</Card.Title>
					<!-- <Card.Description>Deploy your new project in one-click.</Card.Description> -->
				</Card.Header>
				<Card.Content>
					<MultiselectListSearch
						name="countries"
						list={data.countries}
						bind:group={$form.countries}
					/>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header>
					<Card.Title>Project types</Card.Title>
					<!-- <Card.Description>Deploy your new project in one-click.</Card.Description> -->
				</Card.Header>
				<Card.Content>
					<MultiselectListSearch
						name="projectTypes"
						list={data.projectTypes}
						bind:group={$form.projectTypes}
					/>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header>
					<Card.Title>People</Card.Title>
					<!-- <Card.Description>Deploy your new project in one-click.</Card.Description> -->
				</Card.Header>
				<Card.Content>
					<MultiselectListSearch
						name="persons"
						list={data.persons}
						bind:group={$form.persons}
						displayField={(entity) => `${dbi(entity, 'firstName')} ${dbi(entity, 'lastName')}`}
					/>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header>
					<Card.Title>Project managers</Card.Title>
					<!-- <Card.Description>Deploy your new project in one-click.</Card.Description> -->
				</Card.Header>
				<Card.Content>
					<MultiselectListSearch
						name="projectManagers"
						list={data.projectManagers}
						bind:group={$form.projectManagers}
						displayField={(entity) => `${dbi(entity, 'firstName')} ${dbi(entity, 'lastName')}`}
					/>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header>
					<Card.Title>Business lines</Card.Title>
					<!-- <Card.Description>Deploy your new project in one-click.</Card.Description> -->
				</Card.Header>
				<Card.Content>
					<MultiselectListSearch
						name="businessLines"
						list={data.businessLines}
						bind:group={$form.businessLines}
					/>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header>
					<Card.Title>Clients</Card.Title>
					<!-- <Card.Description>Deploy your new project in one-click.</Card.Description> -->
				</Card.Header>
				<Card.Content>
					<MultiselectListSearch name="clients" list={data.clients} bind:group={$form.clients} />
				</Card.Content>
			</Card.Root>
		</div>
	</form>
</div>

<Dialog.Root bind:open={exportSelectedModalOpen}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Export selected references</Dialog.Title>
			<Dialog.Description>
				[{selectedIds.length}] references going to be exported:
			</Dialog.Description>
		</Dialog.Header>
		<ExportSelectedForm bind:open={exportSelectedModalOpen} initialValues={{ids: selectedIds}}/>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={exportResultsModalOpen}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Export selected references</Dialog.Title>
			<Dialog.Description>
				search results going to be exported:
			</Dialog.Description>
		</Dialog.Header>
		<hr>
		<Label>Columns to include in export</Label>
		<div>
			<Checkbox onCheckedChange={handle} />
			<Label>select all columns</Label>
		</div>
		<MultiselectListSearch name="columns" list={exportColumns} bind:group={selectedColumns} />
		<Dialog.Footer>
			<Button type="submit" variant="destructive" on:click={() => exportReferences()}>Export</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
