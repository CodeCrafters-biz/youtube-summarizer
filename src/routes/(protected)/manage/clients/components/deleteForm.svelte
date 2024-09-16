<script>
    import * as Dialog from '$lib/components/ui/dialog';
	import ButtonLoader from '$lib/components/button-loader.svelte';
    import { superForm } from 'sveltekit-superforms/client';
    import { toast } from 'svelte-sonner';
	import { businessLineSchema, clientSchema, countrySchema } from '$lib/config/zod-schemas';
	import { zod } from 'sveltekit-superforms/adapters';
	import { handleFormError } from '$lib/utils';

    export let open
    export let initialValues = {}

    const {
		form,
		errors,
		enhance,
		submitting,
	} = superForm(
		{...initialValues},
		{
			onResult({ result }) {
				if (result.type === 'success') {
					open = false;
					toast.success('Successfully deleted');
				}
			},
			validators: zod(
				clientSchema.pick({
					id: true
				})
			)
		}
	);

    errors.subscribe(handleFormError)
</script>

<form method="POST" action="?/delete" use:enhance>
    <input type="hidden" name="id" bind:value={$form.id} />
    <Dialog.Footer>
        <ButtonLoader type="submit" variant='destructive' loading={$submitting}>Delete</ButtonLoader>
    </Dialog.Footer>
</form>