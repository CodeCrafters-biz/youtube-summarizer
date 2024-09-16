<script lang="ts">
	// The ordering of these imports is critical to your app working properly
	// import '@skeletonlabs/skeleton/themes/theme-skeleton.css';
	//import '../theme.postcss';
	// If you have source.organizeImports set to true in VSCode, then it will auto change this ordering
	// import '@skeletonlabs/skeleton/styles/all.css';
	// Most of your app wide CSS should be put in this file
	import '../app.postcss';
	import { enhance } from '$app/forms';
	import { toast } from "svelte-sonner";
	import { i, languages, language, switchLanguage } from '@inlang/sdk-js';
	import { APP_NAME } from '$lib/config/constants';
	import Footer from '$lib/components/footer.svelte';
	import { LogOut, Menu } from 'lucide-svelte';
	import convertNameToInitials from '$lib/_helpers/convertNameToInitials';
	import { onMount } from 'svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { ModeWatcher } from 'mode-watcher';
	import Sun from 'lucide-svelte/icons/sun';
	import Moon from 'lucide-svelte/icons/moon';
	import { Toaster } from '$lib/components/ui/sonner';

	import { toggleMode } from 'mode-watcher';
	import { Button } from '$lib/components/ui/button/index.js';

	export let data;

	let initials = '';
	onMount(() => {
		if (data?.user?.firstName && data?.user?.lastName) {
			initials = convertNameToInitials(data?.user?.firstName, data?.user?.lastName);
		}
	});

	$: initials = initials;
</script>
<div class='flex min-h-screen w-full flex-col bg-muted/40'>
	<div class="container flex justify-end mt-2 items-center">
		{#if data?.user}
			<div class="flex align-center mr-2 items-center">{data?.user?.firstName} {data?.user?.lastName}</div>
			<form
				use:enhance
				action="/auth/sign-out"
				method="post"
			>
				<Button type='submit' variant="ghost" size="sm" class="mr-2"><LogOut />{i('signout')}</Button>
			</form>
		{/if}
		<!-- <div class="flex align-center mr-2">
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>Lang ({language})</DropdownMenu.Trigger>
				<DropdownMenu.Content>
					<DropdownMenu.Group>
						<DropdownMenu.Label>Change language</DropdownMenu.Label>
						<DropdownMenu.Separator />
						{#each languages as lang}
							<DropdownMenu.Item on:click={() => switchLanguage(lang)}>{lang}</DropdownMenu.Item>
						{/each}
					</DropdownMenu.Group>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div> -->
		<Button on:click={toggleMode} variant="outline" size="icon">
			<Sun
				class="h-[1.2rem] w-[1.2rem] rotate-0 scale-0 transition-all dark:rotate-90 dark:scale-100"
			/>
			<Moon
				class="absolute h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:rotate-90 dark:scale-0"
			/>
			<span class="sr-only">Toggle theme</span>
		</Button>
	</div>
	<Toaster />
	<ModeWatcher />
	<slot />
</div>
