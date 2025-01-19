<!-- src/routes/schwyz/+page.svelte -->
<script lang="ts">
    import CloudSupabaseSchwyz from '$lib/api/CloudSupabaseSchwyz.svelte';
    import MapSchwyz from '$lib/components/MapSchwyz.svelte';
    
    let covidRows = [];
    let errorMessage = '';
</script>

<main>
    <CloudSupabaseSchwyz 
      bind:covidRows
      bind:errorMessage
    />
  
    {#if errorMessage}
      <p style="color: red;">{errorMessage}</p>
    {/if}
  
    <!-- Pass covidRows into the MapSchwyz component -->
    <MapSchwyz {covidRows} />
</main>
  