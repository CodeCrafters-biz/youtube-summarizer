<script>
    import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import ButtonLoader from '$lib/components/button-loader.svelte';
	import FormFieldError from '$lib/components/form-field-error.svelte';
    import { superForm } from 'sveltekit-superforms/client';
    import { toast } from 'svelte-sonner';
	import { personSchema } from '$lib/config/zod-schemas';
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
				personSchema.pick({
					firstName: true,
					lastName: true,
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
            <Label>First name</Label>
            <Input name="firstName" placeholder="Type in first name" bind:value={$form.firstName} />
            <FormFieldError errors={errors} field="firstName" />
        </div>
        <div>
            <Label>Last name</Label>
            <Input name="lastName" placeholder="Type in last name" bind:value={$form.lastName} />
            <FormFieldError errors={errors} field="lastName" />
        </div>
    </div>
    <Dialog.Footer>
        <ButtonLoader type="submit" loading={$submitting}>Save</ButtonLoader>
    </Dialog.Footer>
</form>