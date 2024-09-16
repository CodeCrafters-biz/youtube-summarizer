<script>
    import { Button } from '$lib/components/ui/button';
    import { Loader2 } from 'lucide-svelte';
    export let loading
</script>

<Button {...$$restProps} disabled={loading}>
    {#if loading}
        <Loader2 class="mr-2 h-4 w-4 animate-spin" />
        Please wait
    {:else}
        <slot />
    {/if}
</Button>