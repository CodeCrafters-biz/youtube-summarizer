<script>
	import DataTable from '$lib/components/data-table.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import FormFieldError from '$lib/components/form-field-error.svelte';
	import { zod } from 'sveltekit-superforms/adapters';
	import { superForm } from 'sveltekit-superforms/client';
	import { addUserAdmin, countrySchema } from '$lib/config/zod-schemas';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import { debounce } from 'lodash';
	import qs from 'qs';
	import { createRender } from 'svelte-headless-table';
	import Actions from '$lib/components/data-table/data-table-actions.svelte';
	import UserActions from '$lib/components/data-table/data-table-user-actions.svelte';
	import { Plus } from 'lucide-svelte';
	import DateTableCheckmark from '$lib/components/data-table/data-table-checkmark.svelte';
	import DataTableBadge from '$lib/components/data-table/data-table-badge.svelte';
	import FormSelect from '$lib/components/form-select.svelte';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import * as Select from "$lib/components/ui/select";
	import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte';


	export let data;

	let editOpen = false;
	let addOpen = false;
	let deleteOpen = false;
	let resetPasswordOpen = false;

	const columns = [
		{
			id: 'id',
			title: 'ID',
			accessor: ({ id }) => id
		},
		{
			id: 'email',
			title: 'Email',
			accessor: 'email'
		},
		{
			id: 'firstName',
			title: 'First name',
			accessor: 'firstName'
		},
		{
			id: 'lastName',
			title: 'Last name',
			accessor: 'lastName'
		},
		{
			id: 'role',
			title: 'Role',
			accessor: 'role',
			cell: (item) => createRender(DataTableBadge, {value: item.value})
		},
		{
			id: 'verified',
			title: 'Verified',
			accessor: 'verified',
			cell: (item) => createRender(DateTableCheckmark, {value: item.value})
		},
		{
			id: 'actions',
			title: 'Actions',
			accessor: ({ id }) => id,
			cell: (item) => {
				return createRender(UserActions, {
					id: item.value,
					onEdit: () => {
						editOpen = !editOpen;
						const entity = data.users.find((user) => user.id === item.value);
						editForm.set({
							id: item.value,
							firstName: entity?.firstName,
							lastName: entity?.lastName,
							email: entity?.email,
							password: entity?.password,
							role: entity?.role,
							verified: entity?.verified,
						});
					},
					onResetPassword: () => {
						resetPasswordOpen = !resetPasswordOpen
					},
					onDelete: () => {
						deleteOpen = !deleteOpen;
						deleteForm.set({ id: item.value });
					}
				});
			}
		}
	];

	const onPageChange = async (page) => {
		const queryParams = qs.parse(window.location.search, { ignoreQueryPrefix: true });
		await goto(`/manage/users?${qs.stringify({ ...queryParams, pageIndex: page })}`);
	};

	let search = data.search;
	const onSearch = async () => {
		const { search: _, ...queryParams } = qs.parse(window.location.search, {
			ignoreQueryPrefix: true
		});
		await goto(
			`/manage/users?${qs.stringify({ ...queryParams, ...(search && { search }) })}`
		);
	};

	const {
		form: addForm,
		errors: addFormErrors,
		enhance: addFormEnhance
	} = superForm(
		{},
		{
			taintedMessage: null,
			validators: zod(addUserAdmin.pick({
				firstName: true,
				lastName: true,
				email: true,
				password: true,
				role: true,
				verified: true,
			})),
			delayMs: 0
		}
	);

	const {
		form: editForm,
		errors: editFormErrors,
		enhance: editFormEnhance,
		delayed
	} = superForm(
		{},
		{
			taintedMessage: null,
			validators: zod(addUserAdmin),
			delayMs: 0
		}
	);

	const {
		form: deleteForm,
		errors: deleteFormErrors,
		enhance: deleteFormEnhance
	} = superForm(
		{},
		{
			validators: zod(
				addUserAdmin.pick({
					id: true
				})
			)
		}
	);

	const {
		form: resetPasswordForm,
		errors: resetPasswordFormErrors,
		enhance: resetPasswordFormEnhance
	} = superForm(
		{},
		{
			validators: zod(
				addUserAdmin.pick({
					id: true
				})
			)
		}
	);

	const handleFormError = (errors) => {
		if (errors._errors?.length) {
			errors._errors.forEach((error) => {
				toast.error(error);
			});
		}
	};

	addFormErrors.subscribe(handleFormError);
	editFormErrors.subscribe(handleFormError);
	deleteFormErrors.subscribe(handleFormError);
	resetPasswordFormErrors.subscribe(handleFormError);
</script>

<DataTable
	data={data.users}
	columnsData={columns}
	pageNumber={data.pageIndex}
	initialPageSize={data.pageSize}
	totalCount={data.totalCount}
	{onSearch}
	{onPageChange}
	bind:search
>
<data slot="action">
	<Button on:click={() => addOpen = !addOpen}>
		Add new <Plus class="ml-2 h-4 w-4" />
	</Button>
</data>
</DataTable>

<Dialog.Root bind:open={editOpen}>
	<Dialog.Content class="sm:max-w-[425px]">
		<form method="POST" action="?/edit" use:editFormEnhance formData={$editForm}>
			<Dialog.Header>
				<Dialog.Title>Edit user</Dialog.Title>
				<Dialog.Description>
					Make changes to record here. Click save when you're done.
				</Dialog.Description>
			</Dialog.Header>
			{JSON.stringify($editFormErrors)}
			<input type="hidden" name="id" bind:value={$editForm.id} />
			<div class="grid grid-cols-1 gap-4 py-4">
				<div>
					<Label>Name [en]</Label>
					<Input name="name_en" placeholder="Name in english" bind:value={$editForm.name_en} />
					<FormFieldError {editFormErrors} field="name_en" />
				</div>
				<div>
					<Label>Name [fi]</Label>
					<Input name="name_fi" placeholder="Name in finnish" bind:value={$editForm.name_fi} />
					<FormFieldError {editFormErrors} field="name_fi" />
				</div>
				<div>
					<Label>Numeric</Label>
					<Input
						name="numeric"
						placeholder="Country code in numeric format"
						bind:value={$editForm.numeric}
					/>
					<FormFieldError {editFormErrors} field="numeric" />
				</div>
				<div>
					<Label>Alpha 2</Label>
					<Input
						name="alpha2"
						placeholder="Country code in Alpha 2 format"
						bind:value={$editForm.alpha2}
					/>
					<FormFieldError {editFormErrors} field="alpha2" />
				</div>
				<div>
					<Label>Alpha 3</Label>
					<Input
						name="alpha3"
						placeholder="Country code in Alpha 3 format"
						bind:value={$editForm.alpha3}
					/>
					<FormFieldError {editFormErrors} field="alpha3" />
				</div>
			</div>

			<Dialog.Footer>
				<Button type="submit" on:click={() => (editOpen = !editOpen)}>Save changes</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={deleteOpen}>
	<Dialog.Content class="sm:max-w-[425px]">
		<form method="POST" action="?/delete" use:deleteFormEnhance>
			<Dialog.Header>
				<Dialog.Title>Delete country</Dialog.Title>
				<Dialog.Description>
					Are you sure you want to delete record? this action is ireversible
				</Dialog.Description>
			</Dialog.Header>
			<input type="hidden" name="id" bind:value={$deleteForm.id} />
			<Dialog.Footer>
				<Button type="submit" on:click={() => (deleteOpen = !deleteOpen)} variant="destructive"
					>Delete</Button
				>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>


<Dialog.Root bind:open={resetPasswordOpen}>
	<Dialog.Content class="sm:max-w-[425px]">
		<form method="POST" action="?/reset-password" use:resetPasswordFormEnhance>
			<Dialog.Header>
				<Dialog.Title>Reset password</Dialog.Title>
				<Dialog.Description>
					Are you sure you want to reset password? User will get email with instuctions
				</Dialog.Description>
			</Dialog.Header>
			<input type="hidden" name="id" bind:value={$resetPasswordForm.id} />
			<Dialog.Footer>
				<Button type="submit" on:click={() => (resetPasswordOpen = !resetPasswordOpen)} variant="destructive"
					>Delete</Button
				>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={addOpen}>
	<Dialog.Content class="sm:max-w-[425px]">
		<!-- <SuperDebug data={$addForm}/> -->
		<form method="POST" action="?/add" use:addFormEnhance>
			<Dialog.Header>
				<Dialog.Title>Create new user</Dialog.Title>
				<Dialog.Description>Fill in information about new user</Dialog.Description>
			</Dialog.Header>
			{JSON.stringify($addFormErrors)}
			<div class="grid grid-cols-1 gap-4 py-4">
				<div>
					<Label>First Name</Label>
					<Input name="firstName" placeholder="Name in english" bind:value={$addForm.firstName} />
					<FormFieldError {addFormErrors} field="firstName" />
				</div>
				<div>
					<Label>Last Name</Label>
					<Input name="lastName" placeholder="Name in finnish" bind:value={$addForm.lastName} />
					<FormFieldError {addFormErrors} field="lastName" />
				</div>
				<div>
					<Label>Email</Label>
					<Input
						type="email"
						name="email"
						placeholder="User email"
						bind:value={$addForm.email}
					/>
					<FormFieldError {addFormErrors} field="email" />
				</div>
				<div>
					<Label>Password</Label>
					<Input
						name="password"
						placeholder="User password"
						bind:value={$addForm.password}
						class='mb-2'
					/>
					<label for="auto">
						<Checkbox></Checkbox>
						generate automatically
					</label>
					<FormFieldError {addFormErrors} field="password" />
				</div>
				<div class='grid grid-cols-2'>
					<div>
						<Label>Role</Label>
						<FormSelect name='role' bind:value={$addForm.role} items={[
							{value: 'MANAGER', displayName: 'MANAGER'},
							{value: 'ADMIN', displayName: 'ADMIN'},
						]}/>
						<FormFieldError {addFormErrors} field="role" />
					</div>
					<div>
						<Label>Role</Label>
						<Checkbox name='verified' bind:checked={$addForm.verified}>
							<Label>Verified</Label>
						</Checkbox>
					</div>
				</div>

			</div>
			<Dialog.Footer>
				<Button type="submit">Save</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
