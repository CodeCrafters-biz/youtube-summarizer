<script>
    import * as Tooltip from "$lib/components/ui/tooltip";
    import { Settings, Asterisk, Search, FilePlus2, ChevronLeft, Home, List, Mail, NotebookPen, Brain} from "lucide-svelte"
    import { page } from '$app/stores';

    let route
    export let role = 'USER'
    $: route = $page.route.id?.split('/')[2]

    let activeClasses = 'group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base'
    let inactiveClasses = 'flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground transition-colors hover:text-foreground md:h-8 md:w-8'

</script>

<aside class="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
    <nav class="flex flex-col items-center gap-4 px-2 sm:py-5">
        <Tooltip.Root>
          <Tooltip.Trigger>
            <a
              class={ route === 'summarize' ? activeClasses : inactiveClasses }
              href="/summarize"
            >
              <Brain class="h-5 w-5" />
              <span class="sr-only">Summarize youtube videos</span>
            </a>
          </Tooltip.Trigger>
          <Tooltip.Content side="right">Summarize youtube videos</Tooltip.Content>
        </Tooltip.Root>
    </nav>
    <nav class="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
        <Tooltip.Root>
            <Tooltip.Trigger>
              <a
              class={ route === 'settings' ? activeClasses : inactiveClasses }
              href="/settings"
              >
                <Settings class="h-5 w-5" />
                <span class="sr-only">Settings</span>
              </a>
            </Tooltip.Trigger>
            <Tooltip.Content side="right">Settings</Tooltip.Content>
          </Tooltip.Root>
    </nav>
  </aside>