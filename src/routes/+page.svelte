<script lang="ts">
	import Logo from '$lib/components/logo.svelte';
	import { Button } from '$lib/components/ui/button';
	import { redirect } from '@sveltejs/kit';
	import { Youtube } from 'lucide-svelte'
	import { goto } from '$app/navigation';
</script>

<svelte:head>
	<title>Golfgenius</title>
	<meta
		name="description"
		content="Golfgenius"
	/>
</svelte:head>
<div class="flex flex-col justify-center px-6 py-12 lg:px-8 mx-auto max-w-2xl">
	<div class="card p-6 pb-8 pt-8">
		<div>
			<div class="flex flex-row justify-center items-center mb-4">
				<div>
					<Youtube size="62" color='red' />
				</div>
			</div>
			<div class="flex flex-row justify-center items-center mb-4">
				<h1 class='text-2xl'>Summarize youtube videos</h1>
			</div>

			<hr class="!border-t-2 mt-2 mb-6" />
			<p>
				This is AI powered app will help you to summarize youtube video and save a ton of time!
			</p>
			<ul style="list-style-type: disc;">
				<li>
					<Button variant="link" on:click={() => goto('/summarize')}>Summarize youtube video</Button>
				</li>
			</ul>
		</div>
	</div>
</div>

<style>
</style>
