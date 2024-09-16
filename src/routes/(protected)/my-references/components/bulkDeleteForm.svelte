<script>
    import * as Dialog from '$lib/components/ui/dialog';
	import ButtonLoader from '$lib/components/button-loader.svelte';
    import { superForm } from 'sveltekit-superforms/client';
    import { toast } from 'svelte-sonner';
	import { bulkDeleteSchema } from '$lib/config/zod-schemas';
	import { zod } from 'sveltekit-superforms/adapters';
	import { handleFormError } from '$lib/utils';
	import { Badge } from '$lib/components/ui/badge';
	import { Label } from '$lib/components/ui/label';
	import FormFieldError from '$lib/components/form-field-error.svelte';
	import { Input } from '$lib/components/ui/input';

    export let open
    export let initialValues = {}
	export let selectedIds = []

    const {
		form,
		errors,
		enhance,
		submitting,
	} = superForm({...initialValues}, {
		onResult({ result }) {
				if (result.type === 'success') {
					open = false;
					selectedIds = [];
					toast.success('Successfully removed');
				}
			},
		validators: zod(bulkDeleteSchema)
	});

    errors.subscribe(handleFormError)
</script>

<form method="POST" action="?/bulkdelete" use:enhance>
	<div class='my-4'>
		{#each selectedIds as selectedId}
			<Badge variant="secondary">{selectedId}</Badge>
		{/each}
	</div>
	<div class='mb-4'>
		<Label>Confirmation</Label>
		<Input name="confirmString" placeholder="delete me" bind:value={$form.confirmString} />
		<FormFieldError {errors} field="confirmString" />
	</div>

	<input type="hidden" name="ids" bind:value={$form.ids} />
	<Dialog.Footer>
		<ButtonLoader type="submit" variant='destructive' loading={$submitting}>Delete</ButtonLoader>
	</Dialog.Footer>
</form>