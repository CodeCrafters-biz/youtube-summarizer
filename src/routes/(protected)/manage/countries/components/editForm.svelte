<script>
    import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import ButtonLoader from '$lib/components/button-loader.svelte';
	import FormFieldError from '$lib/components/form-field-error.svelte';
    import { superForm } from 'sveltekit-superforms/client';
    import { toast } from 'svelte-sonner';
	import { countrySchema } from '$lib/config/zod-schemas';
	import { zod } from 'sveltekit-superforms/adapters';
	import { handleFormError } from '$lib/utils';

    export let open
    export let initialValues

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
					toast.success('Successfully edited');
				}
			},

            resetForm: true,
			taintedMessage: null,
			validators: zod(
				countrySchema.pick({
					name_en: true,
					name_fi: true,
					numeric: true,
					alpha2: true,
					alpha3: true
				})
			),
			delayMs: 0
		}
	);

    errors.subscribe(handleFormError)
</script>


<form method="POST" action="?/edit" use:enhance>
    <input type="hidden" name="id" bind:value={$form.id} />
    <div class="grid grid-cols-1 gap-4 py-4">
        <div>
            <Label>Name [en]</Label>
            <Input name="name_en" placeholder="Name in english" bind:value={$form.name_en} />
            <FormFieldError {errors} field="name_en" />
        </div>
        <div>
            <Label>Name [fi]</Label>
            <Input name="name_fi" placeholder="Name in finnish" bind:value={$form.name_fi} />
            <FormFieldError {errors} field="name_fi" />
        </div>
        <div>
            <Label>Numeric</Label>
            <Input
                name="numeric"
                placeholder="Country code in numeric format"
                bind:value={$form.numeric}
            />
            <FormFieldError {errors} field="numeric" />
        </div>
        <div>
            <Label>Alpha 2</Label>
            <Input
                name="alpha2"
                placeholder="Country code in Alpha 2 format"
                bind:value={$form.alpha2}
            />
            <FormFieldError {errors} field="alpha2" />
        </div>
        <div>
            <Label>Alpha 3</Label>
            <Input
                name="alpha3"
                placeholder="Country code in Alpha 3 format"
                bind:value={$form.alpha3}
            />
            <FormFieldError {errors} field="alpha3" />
        </div>
    </div>

    <Dialog.Footer>
        <ButtonLoader type="submit" loading={$submitting}>Edit</ButtonLoader>
    </Dialog.Footer>
</form>