<script>
    import { Check, X } from 'lucide-svelte';
    export let value = ''
</script>

{#if value}
    <Check />
{:else}
    <X />
{/if}