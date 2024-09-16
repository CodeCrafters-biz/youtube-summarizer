<script lang="ts">
	import Navigation from '$lib/components/navigation.svelte'
	export let data
</script>

<Navigation role={data.user.role}/>
<div class='ml-8'>
	<slot />
</div>
