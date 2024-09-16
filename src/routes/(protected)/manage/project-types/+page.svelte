<script>
	import DataTable from '$lib/components/data-table.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { createRender } from 'svelte-headless-table';
	import Actions from '$lib/components/data-table/data-table-actions.svelte';
	import { Pickaxe, Plus } from 'lucide-svelte';
	import AddForm from './components/addForm.svelte';
	import EditForm from './components/editForm.svelte';
	import DeleteForm from './components/deleteForm.svelte';
	import BulkDeleteForm from './components/bulkDeleteForm.svelte';
	import { onSearch, onPageChange } from '$lib/utils'

	export let data;
	let search = data.search;
	let editOpen = false;
	let addOpen = false;
	let deleteOpen = false;
	let bulkDeleteOpen = false;
	let selectedIds = [];
	let editObj = {}
	let deleteObj = {}
	let deleteIds = {}

	const columns = [
		{
			id: 'id',
			title: 'ID',
			accessor: ({ id }) => id
		},
		{
			id: 'name_en',
			title: 'name_en',
			accessor: 'name_en'
		},
		{
			id: 'id',
			title: 'name_fi',
			accessor: 'name_fi'
		},
		{
			id: 'Actions',
			title: 'Actions',
			accessor: ({ id }) => id,
			cell: (item) => {
				return createRender(Actions, {
					id: item.value,
					onEdit: () => {
						const entity = data.projectTypes.find((entity) => entity.id === item.value);
						editObj = {
							id: item.value,
							name_en: entity?.name_en,
							name_fi: entity?.name_fi,
						}
						editOpen = !editOpen;
					},
					onDelete: () => {
						deleteObj = { id: item.value };
						deleteOpen = !deleteOpen;
					}
				});
			}
		}
	];

</script>

<DataTable
	data={data.projectTypes}
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
		<Button on:click={() => addOpen = !addOpen}>
			Add new <Plus class="ml-2 h-4 w-4" />
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

<Dialog.Root bind:open={editOpen}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Edit project type</Dialog.Title>
			<Dialog.Description>
				Make changes to record here. Click save when you're done.
			</Dialog.Description>
		</Dialog.Header>
		<EditForm bind:open={editOpen} initialValues={editObj}/>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={deleteOpen}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Delete project type</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to delete record? this action is ireversible
			</Dialog.Description>
		</Dialog.Header>
		<DeleteForm bind:open={deleteOpen} initialValues={deleteObj}></DeleteForm>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={bulkDeleteOpen}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Delete project types</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to delete these records? this action is ireversible
			</Dialog.Description>
		</Dialog.Header>
		<BulkDeleteForm bind:open={bulkDeleteOpen} initialValues={deleteIds}></BulkDeleteForm>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={addOpen}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Create new Project type</Dialog.Title>
			<Dialog.Description>Fill in information about new project type</Dialog.Description>
		</Dialog.Header>
		<AddForm bind:open={addOpen} ></AddForm>
	</Dialog.Content>
</Dialog.Root>