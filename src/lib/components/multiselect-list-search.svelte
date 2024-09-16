<script>
	import * as Table from '$lib/components/ui/table';
	import { Checkbox } from '$lib/components/ui/checkbox';
    import { Input } from "$lib/components/ui/input"
    import { Badge } from "$lib/components/ui/badge";
    import { dbi } from "$lib/utils";
    import { X } from 'lucide-svelte'

	export let list = [];
    export let displayField = (item) => {
        return dbi(item, 'name')
    }
    export let group = []
    export let name

    // To handle the transition

    let displayList = list

	function toggleSelection(id) {
		const index = group.indexOf(id);
        index !== -1 ? group?.splice(index, 1) : group?.push(id); 
        group = [...group]
	}

    function filterOptions(event) {
        displayList = list.filter((item) => {
            return displayField(item)?.toLowerCase().includes(event.target.value.toLowerCase())
        })
        displayList = [...displayList]
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
    <input type="hidden" class='wrapperopen' name={name} value={group} />
    <div class='mt-2 mb-2 wrapper' class:open={group.length}>
        <div class='inner'>
            {#each group as selectedItemId}
            <div on:click={() => toggleSelection(selectedItemId)} class='inline-block m-1'>
                <Badge>
                    {displayField(list?.find((c) => c.id === selectedItemId))}
                    <X size='15'/>
                </Badge>
            </div>
        {/each}
        </div>
    </div>
    <Input on:input={filterOptions} placeholder="Search" class='mb-2'/>
    <Table.Root>
        <Table.Body>
            <div class='wrapper' class:open={displayList.length}>
                <div class='inner w-full'>
                    <div class='max-h-48 overflow-auto'>
                        {#each displayList as item, i (i)}
                        <Table.Row class="py-1 w-full">
                            <Table.Cell class="font-medium py-1 w-2 h-2">
                                <Checkbox
                                    checked={group?.includes(item.id)}
                                    onCheckedChange={() => toggleSelection(item.id)}
                                />
                            </Table.Cell>
                            <Table.Cell class="py-1 w-full">
                                {displayField(item)}
                            </Table.Cell>
                        </Table.Row>
                    {/each}
                    </div>
                </div>
            </div>
        </Table.Body>
    </Table.Root>
</div>
