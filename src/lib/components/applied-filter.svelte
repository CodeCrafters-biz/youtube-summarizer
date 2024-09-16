<script>
	
    import { Badge } from "$lib/components/ui/badge";
	import { X } from 'lucide-svelte'
    import { dbi } from '$lib/utils'

    export let criteria
    export let value = []
    export let name

    export let displayField = (criteriaItem) => {
        return dbi(criteriaItem, 'name')
    }

    const removeCriteria = (id) => {
        const index = value.findIndex((critera) => critera === id)
        value.splice(index, 1)
        value = [...value]
    }
</script>

<style>
    .wrapper {
        display: grid;
        grid-template-rows: 0fr;
        transition: grid-template-rows 0.2s ease-in-out;
    }

    .wrapper.open {
        grid-template-rows: 1fr;
    }

    .inner {
        overflow: hidden;
    }
</style>

<div>
    <div class='wrapper' class:open={value.length}>
        <div class='inner flex flex-row mb-2 mr-2'>
            <span class='mr-2'>{name}:</span>
            {#each value as item}
                <div on:click={() => removeCriteria(item)}>
                    <Badge> <span class='text-xs'>{displayField(criteria?.find((c) => c.id === item))}</span> <X size='15' /></Badge>
                </div>
            {/each}
        </div>
    </div>
</div>
