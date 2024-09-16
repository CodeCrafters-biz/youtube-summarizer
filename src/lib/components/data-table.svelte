<script lang="ts">
	import { Render, Subscribe, createRender, createTable } from 'svelte-headless-table';
	import {
		addHiddenColumns,
		addPagination,
		addSelectedRows,
		addSortBy,
		addTableFilter
	} from 'svelte-headless-table/plugins';
	import { readable, writable } from 'svelte/store';
	import { ArrowUpDown, ChevronDown, Plus, Search, Pickaxe } from 'lucide-svelte';
	import DataTableCheckbox from './data-table/data-table-checkbox.svelte';
	import * as Table from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { cn } from '$lib/utils.js';
	import { Input } from '$lib/components/ui/input';

	export let columnsData = [];
	export let data;
	export let onSearch;

	export let pageNumber;
	export let onPageChange;
	export let totalCount;
	export let initialPageSize;
	export let search = '';
	export let selectedIds = [];

	const syncedData = writable([]);

	const table = createTable(syncedData, {
		sort: addSortBy({ disableMultiSort: true }),
		page: addPagination({
			serverSide: true,
			initialPageSize,
			initialPageIndex: pageNumber,
			serverItemCount: writable(totalCount)
		}),
		filter: addTableFilter({
			fn: ({ filterValue, value }) => value.includes(filterValue)
		}),
		select: addSelectedRows(),
		hide: addHiddenColumns()
	});

	$: syncedData.set(data);

	const columnsTable = [
		table.column({
			header: (_, { pluginStates }) => {
				const { allPageRowsSelected } = pluginStates.select;
				return createRender(DataTableCheckbox, {
					checked: allPageRowsSelected
				});
			},
			accessor: ({ id }) => id,
			cell: ({ row }, { pluginStates }) => {
				const { getRowState } = pluginStates.select;
				const { isSelected } = getRowState(row);

				return createRender(DataTableCheckbox, {
					checked: isSelected
				});
			},
			plugins: {
				sort: {
					disable: true
				},
				filter: {
					exclude: true
				}
			}
		}),
		...columnsData.reduce((acc, column) => {
			acc.push(table.column({
				header: column.title,
				accessor: column.accessor,
				plugins: { sort: { disable: false }, filter: { exclude: false } },
                cell: column.cell,
				...column.settings
			}));
            return acc;
		}, []),
		// table.column({
		// 	header: '',
		// 	accessor: ({ name_en }) => '',
		// 	plugins: {
		// 		sort: {
		// 			disable: true
		// 		}
		// 	}
		// }),
	];

    const columns = table.createColumns(columnsTable)

	const { headerRows, pageRows, tableAttrs, tableBodyAttrs, flatColumns, pluginStates, rows } =
		table.createViewModel(columns);

	const { sortKeys } = pluginStates.sort;

	const { hiddenColumnIds } = pluginStates.hide;
	const ids = flatColumns.map((c) => c.id);
	let hideForId = Object.fromEntries(ids.map((id) => [id, true]));

	$: $hiddenColumnIds = Object.entries(hideForId)
		.filter(([, hide]) => !hide)
		.map(([id]) => id);

	const { hasNextPage, hasPreviousPage, pageIndex, pageCount } = pluginStates.page;

	$: onPageChange($pageIndex);

	const { filterValue } = pluginStates.filter;
    
	const { selectedDataIds } = pluginStates.select;

    selectedDataIds.subscribe((val) => {
        selectedIds = Object.keys(val).map((key) => {
            return $pageRows.find((obj) => obj.id == key)?.original?.id
        })
    })

    $: {
        const newSelectedDataIds = {}; // Create a new object to trigger reactivity
        selectedIds.forEach(id => {
        const row = $pageRows.find(obj => obj?.original?.id == id); // Find in pageRows
            if (row) newSelectedDataIds[row.id] = true; // Add to new object
        });
        selectedDataIds.set(newSelectedDataIds); // Update store
    }

	const hideableCols = [...columnsData.map((column) => column.id), 'ID'];
</script>

<div class="w-full">
	<div class="flex items-center py-4">
		<form class="max-w-sm flex w-full mr-2" on:submit|preventDefault={() => onSearch(search)}>
			<Input class="max-w-sm mr-2" placeholder="Search..." type="text" bind:value={search} />
			<Button type="submit" variant="outline" size="icon">
				<Search class="h-[1.2rem] w-[1.2rem]" />
				<span class="sr-only">search</span>
			</Button>
		</form>        
        {#if Object.keys($selectedDataIds).length > 1}
            <slot name="bulk"></slot>
        {/if}
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild let:builder>
				<Button variant="outline" class="ml-auto mr-2" builders={[builder]}>
					Columns <ChevronDown class="ml-2 h-4 w-4" />
				</Button>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content>
				{#each flatColumns as col}
					{#if hideableCols.includes(col.id)}
						<DropdownMenu.CheckboxItem bind:checked={hideForId[col.id]}>
							{col.header}
						</DropdownMenu.CheckboxItem>
					{/if}
				{/each}
			</DropdownMenu.Content>
		</DropdownMenu.Root>
        <slot name="action"></slot>
	</div>
	<div class="rounded-md border bg-background">
		<Table.Root {...$tableAttrs}>
			<Table.Header>
				{#each $headerRows as headerRow}
					<Subscribe rowAttrs={headerRow.attrs()}>
						<Table.Row>
							{#each headerRow.cells as cell, index}
								<Subscribe attrs={cell.attrs()} let:attrs props={cell.props()} let:props>
									<Table.Head {...attrs} class={cn('[&:has([role=checkbox])]:pl-3')}>

										{#if index === 0 || index === 1 || index === headerRow.cells.length - 1}
											<div class="font-medium">
												<Render of={cell.render()} />
											</div>
										{:else}
											<Button variant="ghost" on:click={props.sort.toggle}>
												<Render of={cell.render()} />
												<ArrowUpDown
													class={cn(
														$sortKeys[0]?.id === cell.id && 'text-foreground',
														'ml-2 h-4 w-4'
													)}
												/>
											</Button>
										{/if}
									</Table.Head>
								</Subscribe>
							{/each}
						</Table.Row>
					</Subscribe>
				{/each}
			</Table.Header>
			<Table.Body {...$tableBodyAttrs}>
				{#each $pageRows as row (row.id)}
					<Subscribe rowAttrs={row.attrs()} let:rowAttrs>
						<Table.Row {...rowAttrs} data-state={$selectedDataIds[row.id] && 'selected'}>
							{#each row.cells as cell (cell.id)}
								<Subscribe attrs={cell.attrs()} let:attrs>
									<Table.Cell class="[&:has([role=checkbox])]:pl-3" {...attrs}>
										{#if cell.id === 'ID'}
											<div class="text-xs font-medium leading-none text-muted-foreground">
												<Render of={cell.render()} />
											</div>
										{:else if cell.id === 'amount'}
											<div class="text-right font-medium">
												<Render of={cell.render()} />
											</div>
										{:else if cell.id === 'status'}
											<div class="capitalize">
												<Render of={cell.render()} />
											</div>
										{:else}
											<Render of={cell.render()} />
										{/if}
									</Table.Cell>
								</Subscribe>
							{/each}
						</Table.Row>
					</Subscribe>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
	<div class="flex items-center justify-end space-x-2 py-4">
		<div class="flex-1 text-sm text-muted-foreground">
			{Object.keys($selectedDataIds).length} of {$rows.length} row(s) selected. Total {totalCount} entities
		</div>
		<Button
			variant="outline"
			size="sm"
			on:click={() => ($pageIndex = $pageIndex - 1)}
			disabled={!$hasPreviousPage}>Previous</Button
		>
		<Button
			variant="outline"
			size="sm"
			disabled={!$hasNextPage}
			on:click={() => ($pageIndex = $pageIndex + 1)}>Next</Button
		>
	</div>
</div>
