<script lang="ts">
    import Map from '$lib/components/Map.svelte';
    import CloudSupabase from '$lib/api/CloudSupabase.svelte';
    import Table from '$lib/components/Table.svelte';

    let covidRows = [];
    let errorMessage = '';
</script>

<main>
    <div style="margin-top: -5px;"></div>
    <Map />
    <CloudSupabase bind:covidRows bind:errorMessage />
    {#if !errorMessage && covidRows.length > 0}
      <Table {covidRows} />
    {/if}
</main>
  