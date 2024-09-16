<script>
    import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import ButtonLoader from '$lib/components/button-loader.svelte';
	import FormFieldError from '$lib/components/form-field-error.svelte';
    import { superForm } from 'sveltekit-superforms/client';
    import { toast } from 'svelte-sonner';
	import { businessLineSchema, countrySchema } from '$lib/config/zod-schemas';
	import { zod } from 'sveltekit-superforms/adapters';
	import { handleFormError } from '$lib/utils';

    export let open

    const {
		form,
		errors,
		enhance,
		submitting,
	} = superForm(
		{},
		{
			onResult({ result }) {
				if (result.type === 'success') {
					open = false;
					toast.success('Successfully added');
				}
			},
            resetForm: true,
			taintedMessage: null,
			validators: zod(
				businessLineSchema.pick({
					name_en: true,
					name_fi: true,
				})
			),
			delayMs: 0
		}
	);

    errors.subscribe(handleFormError)
</script>


<form method="POST" action="?/add" use:enhance>
    <div class="grid grid-cols-1 gap-4 py-4">
        <div>
            <Label>Name [en]</Label>
            <Input name="name_en" placeholder="Name in english" bind:value={$form.name_en} />
            <FormFieldError errors={errors} field="name_en" />
        </div>
        <div>
            <Label>Name [fi]</Label>
            <Input name="name_fi" placeholder="Name in finnish" bind:value={$form.name_fi} />
            <FormFieldError errors={errors} field="name_fi" />
        </div>
    </div>
    <Dialog.Footer>
        <ButtonLoader type="submit" loading={$submitting}>Save</ButtonLoader>
    </Dialog.Footer>
</form>