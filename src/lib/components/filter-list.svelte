<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Input } from '$lib/components/ui/input';
	import { dbi, localStorageWritable } from '$lib/utils';
    import {derived} from 'svelte/store'

    export let criteriaName
    export let criteria = []
    export let displayField = (criteriaItem) => {
        return dbi(criteriaItem, 'name')
    }

	const appliedFilters = localStorageWritable(`${criteriaName}_filters`, []);

    function toggleSelection(id) {
        appliedFilters.update((all) => {
            const index = all.indexOf(id);
            if (index !== -1) {
                all.splice(index, 1);
            } else {
                all.push(id);
            }
            return all
        });
    }
</script>

<div>
	<Input placeholder="search" class="mb-2"/>
	<Table.Root>
		<Table.Header>
			<Table.Row class="py-5">
				<Table.Head class="w-[100px]">#</Table.Head>
				<Table.Head>Name</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each criteria as criteriaItem, i (i)}
				<Table.Row class="py-1">
					<Table.Cell class="font-medium py-2">
						<Checkbox
							id="terms"
                            checked={$appliedFilters.includes(criteriaItem.id)}
                            onCheckedChange={() => toggleSelection(criteriaItem.id)}
							aria-labelledby="terms-label"
						/>
					</Table.Cell>
					<Table.Cell class="py-1">
                        {displayField(criteriaItem)}
                    </Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</div>
