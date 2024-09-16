<script>
    import { i } from "@inlang/sdk-js";
	import { readable } from "svelte/store";
	import { SuperFormError } from "sveltekit-superforms";

    export let errors
    export let field
</script>

{#if $errors?.[field] && Array.isArray($errors?.[field])}
    {#each $errors?.[field] as error}
        <p class="text-sm text-red-500">{i(error) || error}</p>
    {/each}
{/if}