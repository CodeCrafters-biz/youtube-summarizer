<script lang="ts">
	import { superForm } from 'sveltekit-superforms/client';
	import { Input } from "$lib/components/ui/input";
	import { Button } from "$lib/components/ui/button";

	// import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte';
	import { userSchema } from '$lib/config/zod-schemas';
	import { AlertTriangle } from 'lucide-svelte';
	import { i } from "@inlang/sdk-js";
	import { toast } from "svelte-sonner";
	import { zod } from 'sveltekit-superforms/adapters';
	export let data;
	const signInSchema = userSchema.pick({ email: true, password: true });
	const { form, errors, enhance, delayed } = superForm(data.form, {
		taintedMessage: null,
		validators: zod(signInSchema),
		delayMs: 0
	});
</script>
<form method="POST" action="/auth/sign-in" use:enhance>
	<!--<SuperDebug data={$form} />-->
	{#if $errors._errors}
		<aside class="alert variant-filled-error mt-6">
			<!-- Icon -->
			<div><AlertTriangle size="42" /></div>
			<!-- Message -->
			<div class="alert-message">
				<h3 class="h3">{i("signinProblem")}</h3>
				<p>{$errors._errors}</p>
			</div>
		</aside>
	{/if}
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
		<Button type="submit" class="btn variant-filled-primary w-full"
			>{#if $delayed} 
				loading... {:else}
				{i("signin")}
			{/if}
		</Button>
	</div>
	<div class="flex flex-row justify-center items-center mt-10">
		<a href="/auth/password/reset" class="font-semibold">{i("forgotPassword")}</a>
	</div>
</form>
