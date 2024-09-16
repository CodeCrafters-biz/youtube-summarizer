<script lang="ts">
	import { superForm } from 'sveltekit-superforms/client';
	import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte';
	import { userSchema } from '$lib/config/zod-schemas';
	import { ConicGradient } from '@skeletonlabs/skeleton';
	import type { ConicStop } from '@skeletonlabs/skeleton';
	import { Input } from "$lib/components/ui/input";
	import { Button } from "$lib/components/ui/button";
	import { i } from "@inlang/sdk-js";
	import { zod } from 'sveltekit-superforms/adapters';
	export let data;

	const signUpSchema = userSchema.pick({
		firstName: true,
		lastName: true,
		email: true,
		password: true
	});

	const { form, errors, enhance, delayed } = superForm(data.form, {
		taintedMessage: null,
		validators: zod(signUpSchema),
		delayMs: 0
	});

	const conicStops: ConicStop[] = [
		{ color: 'transparent', start: 0, end: 25 },
		{ color: 'rgb(var(--color-primary-900))', start: 75, end: 100 }
	];

	let termsAccept = false;
	// $: termsValue = $form.terms as Writable<boolean>;
</script>

<form method="POST" action='/auth/sign-up' use:enhance>
	<!-- <SuperDebug data={$form} /> -->
	<!-- {JSON.stringify($errors)} -->
	<div class="mt-6">
		<label class="label">
			<span class="sr-only">{i("First Name")}</span>
			<Input
				id="firstName"
				name="firstName"
				type="text"
				placeholder="{i("firstName")}"
				autocomplete="given-name"
				data-invalid={$errors.firstName}
				bind:value={$form.firstName}
			/>
			{#if $errors.firstName}
				<small>{$errors.firstName}</small>
			{/if}
		</label>
	</div>
	<div class="mt-6">
		<label class="label">
			<span class="sr-only">{i("lastName")}</span>
			<Input
				id="lastName"
				name="lastName"
				type="text"
				placeholder="{i("lastName")}"
				autocomplete="family-name"
				data-invalid={$errors.lastName}
				bind:value={$form.lastName}
			/>
			{#if $errors.lastName}
				<small>{$errors.lastName}</small>
			{/if}
		</label>
	</div>
	<div class="mt-6">
		<label class="label">
			<span class="sr-only">{i("email")}</span>
			<Input
				id="email"
				name="email"
				type="email"
				placeholder="{i("email")}"
				autocomplete="email"
				data-invalid={$errors.email}
				bind:value={$form.email}
			/>
			{#if $errors.email}
				<small>{$errors.email}</small>
			{/if}
		</label>
	</div>

	<div class="mt-6">
		<label class="label">
			<span class="sr-only">{i("password")}</span>
			<Input
				id="password"
				name="password"
				type="password"
				placeholder="{i("password")}"
				data-invalid={$errors.password}
				bind:value={$form.password}
			/>
			{#if $errors.password}
				<small>{$errors.password}</small>
			{/if}
		</label>
	</div>
	<div class="mt-6">
		<label for="terms" class="label">
			<input id="terms" name="terms" type="checkbox" class="checkbox" bind:checked={termsAccept} />
			<span class="ml-2">
				I accept the
				<a href="/terms" class="text-primaryHover underline">terms</a>
				and
				<a href="/privacy" class="text-primaryHover underline">privacy policy</a>
				<!--{#if $errors.terms}
					<small>{$errors.terms}</small>
				{/if}-->
			</span>
		</label>
	</div>
	<div class="mt-6">
		<Button type="submit" disabled={!termsAccept} class="btn variant-filled-primary w-full">
			{#if $delayed}
				Loading...
			{:else}
				{i("signup")}
			{/if}
		</Button>
	</div>
</form>
