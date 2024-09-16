<script>
    import * as Card from '$lib/components/ui/card';
    import { Button } from '$lib/components/ui/button';
    import moment from 'moment-with-locales-es6'
    import { i, language } from "@inlang/sdk-js";
	  import { dbi } from '$lib/utils';
    moment.locale(language)
    export let data

    export let onEdit = () => {}
    
    const projectValue = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR' // Specify your currency code here
    }).format(data.projectValue);
</script>

<Card.Root class="w-full max-w-4xl">
    <Card.Header class="bg-gray-100 px-6 py-4 dark:bg-gray-800">
      <div class="flex items-center justify-between">
        <div class="space-y-1">
          <h2 class="text-xl font-bold">Reference</h2>
          <p class="text-gray-500 dark:text-gray-400">Project #{data.projectNumber}</p>
        </div>
        <div class="flex items-center space-x-4">
          <div class="flex flex-wrap gap-2">
            <Button class='mr-2' variant='outline' on:click={onEdit}>Edit</Button>
            <Button size='sm'>Export</Button>
          </div>
        </div>
      </div>
    </Card.Header>
    <Card.Content class="px-6 py-8 grid gap-6">
      <div class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        <div>
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Start Date</p>
          <p class="text-base font-medium">{moment(data.start_date).format('LL')}</p>
        </div>
        <div>
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400">End Date</p>
          <p class="text-base font-medium">{moment(data.end_date).format('LL')}</p>
        </div>
        <div>
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Project Value</p>
          <p class="text-base font-medium">{projectValue}</p>
        </div>
        <div>
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Language</p>
          <p class="text-base font-medium">{data.language}</p>
        </div>
      </div>
      <div class="prose prose-lg dark:prose-invert">
        <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Project description</p>
        <p>
          {dbi(data, 'description')}
        </p>
      </div>
      <div class="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-4">
        <div>
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Project Types</p>
          <div class="flex flex-wrap gap-2">
            {#each data.projectType as projectType}
              <div>{dbi(projectType, 'name')}</div>
            {:else}
              None
            {/each} 
          </div>
        </div>
        <div>
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Business Lines</p>
          <div class="flex flex-wrap gap-2">
            {#each data.businessLine as businessLine}
              <div>{dbi(businessLine, 'name')}</div>
            {:else}
              None
            {/each} 
          </div>
        </div>
        <div>
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Clients</p>
          <div class="flex flex-wrap gap-2">
            {#each data.clients as client}
              <div>{dbi(client, 'name')}</div>
            {:else}
              None
            {/each} 
          </div>
        </div>
        <div>
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Project Managers</p>
          <div class="flex flex-wrap gap-2">
            {#each data.projectManagers as projectManager}
              <div>{projectManager.firstName} {projectManager.lastName}</div>
            {:else}
              None
            {/each} 
          </div>
        </div>
        <div>
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400">People</p>
          <div class="flex flex-wrap gap-2">
            {#each data.people as person}
              <div>{person.firstName} {person.lastName}</div>
            {:else}
              None
            {/each}
          </div>
        </div>
        <div>
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Countries</p>
          <div class="flex flex-wrap gap-2">
            {#each data.country as country}
              <div>{country.name}</div>
            {:else}
              None
            {/each}
          </div>
        </div>  
      </div>
    </Card.Content>
  </Card.Root>