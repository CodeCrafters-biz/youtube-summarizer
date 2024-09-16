<script>
    import { page } from '$app/stores';

    export let data
    let route
    $: route = $page.route.id?.split('/')[3]
    let activeClasses = 'font-semibold text-primary'
</script>

<main class="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10 ml-4 sm:ml-4">
    <div class="mx-auto grid w-full max-w-6xl gap-2">
      <h1 class="text-3xl font-semibold">Manage</h1>
    </div>
    <div class="mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
      <nav class="grid gap-4 text-sm text-muted-foreground">
        {#if data.user.role === 'MANAGER' || data.user.role === 'ADMIN'}
          <a class={ route === 'project-types' ? activeClasses : '' } href="/manage/project-types">Project types</a>
          <a class={ route === 'countries' ? activeClasses : '' } href="/manage/countries">Countries</a>
          <a class={ route === 'clients' ? activeClasses : '' } href="/manage/clients">Clients</a>
          <a class={ route === 'business-lines' ? activeClasses : '' } href="/manage/business-lines">Business Lines</a>
          <a class={ route === 'people' ? activeClasses : '' } href="/manage/people">People</a>
        {/if}
        {#if data.user.role === 'ADMIN'}
          <a class={ route === 'users' ? activeClasses : '' } href="/manage/users">Users</a>
        {/if}
      </nav>
      <div class="grid gap-6">
        <slot></slot>
      </div>
    </div>
  </main>