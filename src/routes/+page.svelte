<script lang="ts">
  import Map from '$lib/components/Map.svelte';
  import CloudSupabase from '$lib/api/CloudSupabase.svelte';
  import Table from '$lib/components/Table.svelte';

  // Store the shared data and any error messages
  let covidRows = [];
  let errorMessage = '';
</script>


<main>
  <div style="margin-top: -5px;"></div>
  <CloudSupabase bind:covidRows={covidRows} bind:errorMessage={errorMessage} />
  {#if errorMessage}
  <p style="color: red">{errorMessage}</p>
  {/if}
  {#if covidRows.length > 0}
  <Map {covidRows} />
  <Table {covidRows} />
  {:else}
  <p>Loading data...</p>
  {/if}
</main>


