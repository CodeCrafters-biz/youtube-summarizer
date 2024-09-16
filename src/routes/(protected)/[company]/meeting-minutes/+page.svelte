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
	import { emailSchema, meetingMinutes, referenceSchema } from '$lib/config/zod-schemas';
	import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte';
	import DatePicker from '$lib/components/date-picker.svelte';
	import FormFieldError from '$lib/components/form-field-error.svelte';
	import { dbi } from '$lib/utils';
	import { zod } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';
	import { marked } from 'marked';
	import ButtonLoader from '$lib/components/button-loader.svelte';

	export let data;
	export let form;

	const { form: initialForm, response } = data;

	// const localStorageForm = localStorageWritable('meeting-minutes', initialForm);

	const { form: formEl, errors, enhance, delayed, submitting } = superForm(initialForm, {
		taintedMessage: null,
		validators: zod(meetingMinutes),
		delayMs: 0
	});

	errors.subscribe(handleFormError);
</script>

<div class="container">
	<h1 class="text-3xl font-semibold mb-2">Meeting minutes</h1>
	{#if form?.response} 
		<Card.Root class="w-full mb-4">
			<Card.Header>
				<Card.Title>Result</Card.Title>
				<!-- <Card.Description>Threadid</Card.Description> -->
			</Card.Header>
			<Card.Content>
				{@html marked(form?.response || '')}
			</Card.Content>
		</Card.Root>
	{/if}
	<Card.Root class="w-full mb-4">
		<Card.Header>
			<Card.Title>Create meeting minutes from recording</Card.Title>
			<Card.Description>Description</Card.Description>
		</Card.Header>
		<Card.Content>
			<form method="POST" use:enhance enctype="multipart/form-data">
				<div class="grid sm:grid-cols-1 md:grid-cols-1 gap-4">
					<div>
						<Label>Recording file attachment</Label>
						<Input
							name="file"
							type="file"
							placeholder="Recording"
							bind:value={$formEl.file}
						/>
						<FormFieldError {errors} field="file" />
					</div>
					<div>
						<Label>Additional description or instructions</Label>
						<Textarea
							name="additionalDescription"
							placeholder="Additional Description"
							bind:value={$formEl.additionalDescription}
						/>
						<FormFieldError {errors} field="additionalDescription" />
					</div>
				</div>
				<div class="grid sm:grid-cols-1 md:grid-cols-2 gap-4 mt-4">
					<Button variant="outline">Cancel</Button>
					<ButtonLoader type="submit" loading={$submitting}>Process</ButtonLoader>
				</div>
			</form>
		</Card.Content>
	</Card.Root>
</div>
