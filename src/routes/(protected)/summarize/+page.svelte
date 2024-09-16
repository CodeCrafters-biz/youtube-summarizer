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
	import { emailSchema, referenceSchema, summarizeSchema } from '$lib/config/zod-schemas';
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
	export let formData;
	console.log(response)
	let htmlContent = marked(response || '');

	const localStorageForm = localStorageWritable('summarize', initialForm);

	const { form: formEl, errors, enhance, delayed, submitting } = superForm($localStorageForm, {
		taintedMessage: null,
		validators: zod(summarizeSchema),
		delayMs: 0
	});

	formEl.subscribe((value) => {
		localStorageForm.set(value);
	});
	errors.subscribe(handleFormError);
</script>

<div class="container">
	<h1 class="text-3xl font-semibold mb-2">Summarize</h1>
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
			<Card.Title>Summarize youtube video</Card.Title>
			<Card.Description>Paste url of the video you want to summarize</Card.Description>
		</Card.Header>
		<Card.Content>
			<form method="POST" use:enhance>
				<div class="grid sm:grid-cols-1 md:grid-cols-1 gap-4">
					<div>
						<Label>URL</Label>
						<Input
							name="url"
							placeholder="https://www.youtube.com/watch?v=123xyz123"
							bind:value={$formEl.url}
						/>
						<FormFieldError {errors} field="url" />
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
