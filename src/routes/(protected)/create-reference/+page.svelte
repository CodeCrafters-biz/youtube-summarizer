<script>
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { NumberInput } from '$lib/components/ui/number-input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import { superForm } from 'sveltekit-superforms/client';
	import MultiselectListSearch from '$lib/components/multiselect-list-search.svelte';
	import { handleFormError, localStorageWritable } from '$lib/utils';
	import { referenceSchema } from '$lib/config/zod-schemas';
	import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte';
	import DatePicker from '$lib/components/date-picker.svelte';
	import FormFieldError from '$lib/components/form-field-error.svelte';
	import { dbi } from '$lib/utils';
	import { zod } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';

	export let data;

	const { form: initialForm } = data;

	const localStorageForm = localStorageWritable('create-reference-form', initialForm);

	const { form, errors, enhance, delayed } = superForm($localStorageForm, {
		taintedMessage: null,
		validators: zod(referenceSchema.omit({ id: true })),
		delayMs: 0
	});

	form.subscribe((value) => {
		localStorageForm.set(value);
	});
	errors.subscribe(handleFormError);
</script>

<div class="container">
	<h1 class="text-3xl font-semibold mb-2">Create reference</h1>
	<Card.Root class="w-full mb-4">
		<Card.Header>
			<Card.Title>Create new project reference</Card.Title>
			<Card.Description>Description</Card.Description>
		</Card.Header>
		<Card.Content>
			<!-- <SuperDebug data={$form} /> -->
			<!-- {JSON.stringify($errors)} -->
			<form method="POST" use:enhance>
				<div class="grid sm:grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<Label for="radio-">Language</Label>
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
					</div>
					<div>
						<Label>Description [fi]</Label>
						<Textarea
							name="description_fi"
							placeholder="Description"
							bind:value={$form.description_fi}
						/>
						<FormFieldError {errors} field="description_fi" />
					</div>
					<div>
						<Label>Description [en]</Label>
						<Textarea
							name="description_en"
							placeholder="Description"
							bind:value={$form.description_en}
						/>
						<FormFieldError {errors} field="description_en" />
					</div>
					<div>
						<Label>Project number</Label>
						<Input
							type='number'
							name="projectNumber"
							placeholder="Project number"
							bind:value={$form.projectNumber}
						/>
						<FormFieldError {errors} field="projectNumber" />
					</div>
					<div>
						<Label>Project value</Label>
						<NumberInput
							name="projectValue"
							placeholder="Project value"
							bind:value={$form.projectValue}
						/>
						<FormFieldError {errors} field="projectValue" />
					</div>
					<div>
						<Label>Start date</Label>
						<DatePicker name="startDate" bind:value={$form.startDate} />
						<FormFieldError {errors} field="startDate" />
					</div>
					<div>
						<Label>End date</Label>
						<DatePicker name="endDate" bind:value={$form.endDate} />
						<FormFieldError {errors} field="endDate" />
					</div>
					<div>
						<Label>Client contact</Label>
						<Input
							name="clientContact"
							bind:value={$form.clientContact}
							placeholder="Client contact"
						/>
						<FormFieldError {errors} field="clientContact" />
					</div>
					<div>
						<Label>Comments</Label>
						<Textarea name="comments" bind:value={$form.comments} placeholder="Comments" />
						<FormFieldError {errors} field="comments" />
					</div>
					<div>
						<Label>Project type</Label>
						<MultiselectListSearch
							name="projectTypes"
							list={data.projectTypes}
							bind:group={$form.projectTypes}
						/>
						<FormFieldError {errors} field="projectTypes" />
					</div>
					<div>
						<Label>Business lines</Label>
						<MultiselectListSearch
							name="businessLines"
							list={data.businessLines}
							bind:group={$form.businessLines}
						/>
						<FormFieldError {errors} field="businessLines" />
					</div>
					<div>
						<Label>Clients</Label>
						<MultiselectListSearch name="clients" list={data.clients} bind:group={$form.clients} />
						<FormFieldError {errors} field="clients" />
					</div>
					<div>
						<Label>Project Managers</Label>
						<MultiselectListSearch
							name="projectManagers"
							list={data.projectManagers}
							bind:group={$form.projectManagers}
							displayField={(entity) => `${dbi(entity, 'firstName')} ${dbi(entity, 'lastName')}`}
						/>
						<FormFieldError {errors} field="projectManagers" />
					</div>
					<div>
						<Label>People</Label>
						<MultiselectListSearch
							name="persons"
							list={data.persons}
							bind:group={$form.persons}
							displayField={(entity) => `${dbi(entity, 'firstName')} ${dbi(entity, 'lastName')}`}
						/>
						<FormFieldError {errors} field="persons" />
					</div>
					<div>
						<Label>Countries</Label>
						<MultiselectListSearch
							name="countries"
							list={data.countries}
							bind:group={$form.countries}
						/>
						<FormFieldError {errors} field="countries" />
					</div>
				</div>
				<div class="grid sm:grid-cols-1 md:grid-cols-2 gap-4">
					<Button variant="outline">Cancel</Button>
					<Button type="submit">Submit</Button>
				</div>
			</form>
		</Card.Content>
	</Card.Root>
</div>
