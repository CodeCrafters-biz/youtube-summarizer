<script lang="ts">
	import { superForm } from 'sveltekit-superforms/client';
	//import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte';
	import { userSchema } from '$lib/config/zod-schemas';
	import { ConicGradient } from '@skeletonlabs/skeleton';
	import type { ConicStop } from '@skeletonlabs/skeleton';
	import { AlertTriangle } from 'lucide-svelte';
	import * as Card from '$lib/components/ui/card';
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
	import { zod } from 'sveltekit-superforms/adapters';
	export let data;

	const signUpSchema = userSchema.pick({
		firstName: true,
		lastName: true,
		email: true
	});

	const { form, errors, enhance, delayed, message } = superForm(data.form, {
		taintedMessage: null,
		validators: zod(signUpSchema),
		delayMs: 0
	});

	const conicStops: ConicStop[] = [
		{ color: 'transparent', start: 0, end: 25 },
		{ color: 'rgb(var(--color-primary-900))', start: 75, end: 100 }
	];
</script>


<div class='container'>
	<h1 class="text-3xl font-semibold mb-2">Settings</h1>
	<Card.Root>
		<form method="POST" use:enhance>
		<Card.Header>
		  <Card.Title>Password Change</Card.Title>
		  <Card.Description>Update your password to keep your account secure.</Card.Description>
		</Card.Header>
		<Card.Content>
				<!--<SuperDebug data={$form} />-->
				<h3>Profile</h3>
				<hr class="!border-t-2 mt-2 mb-6" />
				{#if $message}
					<aside class="alert variant-filled-success mt-6">
						<!-- Message -->
						<div class="alert-message">
							<p>{$message}</p>
						</div>
					</aside>
				{/if}
				{#if $errors._errors}
					<aside class="alert variant-filled-error mt-6">
						<!-- Icon -->
						<div><AlertTriangle size="42" /></div>
						<!-- Message -->
						<div class="alert-message">
							<h3 class="h3">Sign In Problem</h3>
							<p>{$errors._errors}</p>
						</div>
					</aside>
				{/if}
				<div class="mt-6">
					<label class="label">
						<span class="">First Name</span>
						<Input
							id="firstName"
							name="firstName"
							type="text"
							placeholder="First Name"
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
						<span class="">Last Name</span>
						<Input
							id="lastName"
							name="lastName"
							type="text"
							placeholder="Last Name"
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
						<span class="">Email address</span>
						<Input
							id="email"
							name="email"
							type="email"
							placeholder="Email address"
							autocomplete="email"
							data-invalid={$errors.email}
							bind:value={$form.email}
							class="input"
						/>
						{#if $errors.email}
							<small>{$errors.email}</small>
						{/if}
					</label>
				</div>
				<div class="mt-6">
					<a href="/auth/password/reset">Change Password</a>
				</div>
		</Card.Content>
		<Card.Footer>
			<Button type="submit" class="btn variant-filled-primary"
			>{#if $delayed}<ConicGradient stops={conicStops} spin width="w-6" />{:else}Update Profile{/if}</Button
		>
		</Card.Footer>
	</form>
	  </Card.Root>
</div>
