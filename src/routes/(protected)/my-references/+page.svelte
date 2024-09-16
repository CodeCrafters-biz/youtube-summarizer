<script>
	import { goto } from "$app/navigation";
    import ReferenceCard from "$lib/components/reference-card.svelte";
    import { Plus, List, Table, Pickaxe } from 'lucide-svelte/icons';
    import { Button } from '$lib/components/ui/button';
    import { onSearch, onPageChange } from '$lib/utils'
    import DataTable from '$lib/components/data-table.svelte';
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import Actions from '$lib/components/data-table/data-table-actions.svelte';
	import { createRender } from "svelte-headless-table";
    import * as Dialog from '$lib/components/ui/dialog';
	import BulkDeleteForm from "./components/bulkDeleteForm.svelte";
    import { dbi } from '$lib/utils'
    import { i, language } from '@inlang/sdk-js';
    import moment from 'moment-with-locales-es6';

    moment.locale(language);

    export let data
    let search = data.search;
    let selectedIds = [];
    let deleteIds = [];
    let deleteObj = {};
    let deleteOpen = false;
    let bulkDeleteOpen = false
    export let mode = 'table'

    const columns = [
		{
			id: 'id',
			title: 'ID',
			accessor: ({ id }) => id
		},
		{
			id: 'description_en',
			title: 'description_en',
			accessor: 'description_en'
		},
		{
			id: 'projectNumber',
			title: 'projectNumber',
			accessor: 'projectNumber'
		},
		{
			id: 'projectValue',
			title: 'projectValue',
			accessor: 'projectValue'
		},
		{
			id: 'language',
			title: 'language',
			accessor: 'language'
		},
		{
			id: 'clientContact',
			title: 'clientContact',
			accessor: 'clientContact'
		},
		{
			id: 'comments',
			title: 'comments',
			accessor: 'comments'
		},
		{
			id: 'projectTypes',
			title: 'projectTypes',
			accessor: ({ projectType }) => projectType?.map((type) => dbi(type, 'name')).join(', ')
		},
		{
			id: 'businessLines',
			title: 'businessLines',
			accessor: ({ businessLine }) => businessLine?.map((line) => dbi(line, 'name')).join(', ')
		},
		{
			id: 'clients',
			title: 'clients',
			accessor: ({ clients }) => clients?.map((client) => dbi(client, 'name')).join(', ')
		},
		{
			id: 'country',
			title: 'country',
			accessor: ({ country }) => country?.map((item) => dbi(item, 'name')).join(', ')
		},
		{
			id: 'projectManagers',
			title: 'projectManagers',
			accessor: ({ projectManagers }) => projectManagers?.map((projectManager) => `${dbi(projectManager, 'firstName')} ${dbi(projectManager, 'lastName')}`).join(', ')
		},
		{
			id: 'people',
			title: 'people',
			accessor: ({ people }) => people?.map((person) => `${dbi(person, 'firstName')} ${dbi(person, 'lastName')}`).join(', ')
		},
		{
			id: 'start_date',
			title: 'start_date',
			accessor: ({ start_date }) => moment(start_date).format('LL')
		},
		{
			id: 'end_date',
			title: 'end_date',
			accessor: ({ end_date }) => moment(end_date).format('LL')
		},
		{
			id: 'description_fi',
			title: 'description_fi',
			accessor: 'description_fi'
		},
		{
			id: 'Actions',
			title: 'Actions',
			accessor: ({ id }) => id,
			cell: (item) => {
				return createRender(Actions, {
					id: item.value,
					onEdit: () => goto(`/edit-reference/${item.value}`),
					onDelete: () => {
						// deleteObj = { id: item.value };
						// deleteOpen = !deleteOpen;
					}
				});
			}
		}
	];

</script>


<div class="container flex-column">
    <h1 class='text-3xl font-semibold mb-2'>My references
        {#if mode != 'table'}
            <Button on:click={() => mode = 'table'} variant="outline" size="icon">
                <Table class="h-[1.2rem] w-[1.2rem]" />
                <span class="sr-only">Toggle mode</span>
            </Button>
        {/if}
        {#if mode != 'list'}
            <Button on:click={() => mode = 'list'} variant="outline" size="icon">
                <List class="h-[1.2rem] w-[1.2rem]" />
                <span class="sr-only">Toggle mode</span>
            </Button>
        {/if}
    </h1>

    <div class='flex-column'>
        {#if mode === 'list'}
            {#each data.references as reference}
            <div class='mb-4'>
                <ReferenceCard data={reference} onEdit={() => goto(`/edit-reference/${reference.id}`)}></ReferenceCard>
            </div>
        {/each}
        {/if}
        {#if mode === 'table'}
        <DataTable
        data={data.references}
        columnsData={columns}
        pageNumber={data.pageIndex}
        initialPageSize={data.pageSize}
        totalCount={data.totalCount}
        onSearch={() => onSearch(search)}
        {onPageChange}
        bind:search
        bind:selectedIds
    >
        <data slot="action">
            <Button on:click={() => goto('/create-reference')}>
                Create reference <Plus class="ml-2 h-4 w-4" />
            </Button>
        </data>
        <data slot="bulk">
            <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild let:builder>
                    <Button size="sm" builders={[builder]}>
                        Bulk
                        <Pickaxe size="17" class="ml-2" />
                    </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content>
                    <DropdownMenu.Group>
                        <DropdownMenu.Label>Bulk actions</DropdownMenu.Label>
                    </DropdownMenu.Group>
                    <DropdownMenu.Item class="text-red-500" on:click={() => {
                        bulkDeleteOpen = !bulkDeleteOpen;
                        deleteIds = {ids: selectedIds}
                    }}>
                        Delete
                    </DropdownMenu.Item>
                </DropdownMenu.Content>
            </DropdownMenu.Root>
        </data>
    </DataTable>
        {/if}
    </div>
</div>

<Dialog.Root bind:open={bulkDeleteOpen}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Delete clients</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to delete these records? this action is ireversible
			</Dialog.Description>
		</Dialog.Header>
		<BulkDeleteForm bind:open={bulkDeleteOpen} initialValues={deleteIds}></BulkDeleteForm>
	</Dialog.Content>
</Dialog.Root>
