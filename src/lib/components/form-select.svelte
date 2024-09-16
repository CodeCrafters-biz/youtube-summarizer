<script>
	import * as Select from '$lib/components/ui/select';
	export let items = [];
	export let name = '';
	export let placeholder = '';
	export let value = '';

    $: selected = items.find((item) => {
        if (typeof item === 'string') {
            return item === value
        }
        item.value === value
    }) || null
</script>

<Select.Root
        selected={selected}
        onSelectedChange={(v) => {
          v && (value = v?.value);
        }}>
	<Select.Input {name} bind:value={value} />
	<Select.Trigger>
		<Select.Value {placeholder} />
	</Select.Trigger>
	<Select.Content>
		{#each items as item}
			<Select.Item value={item?.value || item}>{item?.displayName || item}</Select.Item>
		{/each}
	</Select.Content>
</Select.Root>
