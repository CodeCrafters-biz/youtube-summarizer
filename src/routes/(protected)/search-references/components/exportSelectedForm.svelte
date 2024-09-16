<script>
	import * as Dialog from '$lib/components/ui/dialog';
	import ButtonLoader from '$lib/components/button-loader.svelte';
	import { superForm } from 'sveltekit-superforms/client';
	import { toast } from 'svelte-sonner';
	import { exportReferenceSchems } from '$lib/config/zod-schemas';
	import { zod } from 'sveltekit-superforms/adapters';
	import { downloadFile, handleFormError } from '$lib/utils';
	import MultiselectListSearch from '$lib/components/multiselect-list-search.svelte';
	import { Label } from '$lib/components/ui/label';
	import { Checkbox } from '$lib/components/ui/checkbox';

	export let open;
	export let initialValues = {};

	const handle = (selectAll) => {
		selectAll
			? form.set({ ...$form, columns: columns.map((column) => column.id) })
			: form.set({ ...$form, columns: [] });
	};

	const columns = [
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
		{ id: 'end_date', name: 'end_date' }
	];

	const { form, errors, enhance, submitting } = superForm(
		{ ...initialValues },
		{
			validators: zod(exportReferenceSchems)
		}
	);

	async function handleSubmit(event) {
		const response = await fetch('/api/export', {
			method: 'POST',
			body: new FormData(event.target)
		});

		downloadFile(response);
	}

	errors.subscribe(handleFormError);
</script>

<form method="POST" on:submit|preventDefault={handleSubmit}>
	<input type="hidden" name="ids" bind:value={$form.ids} />
	<hr>
	<div class="text-xl-5 mb-4">Columns to include in export</div>
	<div>
		<Checkbox onCheckedChange={handle} />
		<Label>select all columns</Label>
		<MultiselectListSearch name="columns" list={columns} bind:group={$form.columns} />
	</div>
	<Dialog.Footer>
		<ButtonLoader type="submit" variant="destructive" loading={$submitting}>Export</ButtonLoader>
	</Dialog.Footer>
</form>
