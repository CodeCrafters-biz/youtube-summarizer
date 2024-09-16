<script lang="ts">
	import * as Tabs from "$lib/components/ui/tabs";
	import SignIn from '$lib/components/sign-in.svelte';
	import SignUp from '$lib/components/sign-up.svelte';
	import { i } from '@inlang/sdk-js'
	export let data;

	//let tab: string = $page.params.tab;
	//let tabSet: string = tab === 'sign-up' ? 'signUp' : 'signIn';
	let tabSet: string = 'signIn';
</script>
<div class='container w-full'>
	<Tabs.Root value="signin" class="w-[400px]">
		<Tabs.List class="grid w-full grid-cols-2">
		  <Tabs.Trigger value="signin">{i('signin')}</Tabs.Trigger>
		  <Tabs.Trigger value="signup">{i('signup')}</Tabs.Trigger>
		</Tabs.List>
		<Tabs.Content value="signin">
			<SignIn {data} />
		</Tabs.Content>
		<Tabs.Content value="signup">
			<SignUp {data} />
		</Tabs.Content>
	  </Tabs.Root>
</div>
