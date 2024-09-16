<script>
	import * as Popover from '$lib/components/ui/popover';
	import CalendarIcon from 'lucide-svelte/icons/calendar';
	import { Button } from '$lib/components/ui/button';
	import { Calendar } from '$lib/components/ui/calendar';
	import { cn } from '$lib/utils';
	import { DateFormatter, getLocalTimeZone, CalendarDate } from '@internationalized/date';
    import { i, language } from "@inlang/sdk-js";

    const locales = {
        'fi': 'fi-FI',
        'en': 'en-US'
    }

	export let value
	export let name

	const df = new DateFormatter(locales[language] || 'en-US', {
		dateStyle: 'long'
	});

	const computeDate = (value) => {
		if (!value) {
			return null
		}
		const date = value ? new Date(value) : new Date()
		return new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate())
	}

	let internalValue = computeDate(value)
    $: internalValue = computeDate(value)

	// Handle date change from Calendar component
	const handleDateChange = (event) => {
		internalValue = event;
		value = event.toDate('Africa/Abidjan').toISOString()
	};

	console.log(internalValue)

</script>
<div>
	<input type="hidden" name={name} value={value} />
	<Popover.Root>
		<Popover.Trigger asChild let:builder>
			<Button
				variant="outline"
				class={cn(
					'w-full justify-start text-left font-normal',
					!internalValue && 'text-muted-foreground'
				)}
				builders={[builder]}
			>
				<CalendarIcon class="mr-2 h-4 w-4" />
				{internalValue ? df.format(internalValue?.toDate(getLocalTimeZone())) : 'Pick a date'}
			</Button>
		</Popover.Trigger>
		<Popover.Content class="w-auto p-0">
			<Calendar bind:value={internalValue} onValueChange={handleDateChange} initialFocus />
		</Popover.Content>
	</Popover.Root>
</div>
