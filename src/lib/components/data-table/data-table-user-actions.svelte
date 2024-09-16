<script lang="ts">
    import { Pickaxe } from "lucide-svelte";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import { Button } from "$lib/components/ui/button";
   
    export let id: string;
    export let onEdit = () => {};
    export let onDelete = () => {};
    export let onResetPassword = () => {};

  </script>
   
  <DropdownMenu.Root>
    <DropdownMenu.Trigger asChild let:builder>
      <Button
        variant="ghost"
        builders={[builder]}
        size="icon"
        class="relative h-8 w-8 p-0"
      >
        <span class="sr-only">Open menu</span>
        <Pickaxe class="h-4 w-4" />
      </Button>
    </DropdownMenu.Trigger> 
    <DropdownMenu.Content>
      <DropdownMenu.Group>
        <DropdownMenu.Label>Actions</DropdownMenu.Label>
      </DropdownMenu.Group>
      <DropdownMenu.Item on:click={onEdit}>
        Edit
      </DropdownMenu.Item>
      <DropdownMenu.Item on:click={onResetPassword}>
        Reset password
      </DropdownMenu.Item>
      <DropdownMenu.Separator />
      <DropdownMenu.Item on:click={onDelete} class='text-red-500'>Delete</DropdownMenu.Item>
    </DropdownMenu.Content>
  </DropdownMenu.Root>

