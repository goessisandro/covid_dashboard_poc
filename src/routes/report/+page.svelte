<!-- src/routes/Aktuell.svelte (or wherever you want) -->
<script lang="ts">
    import { onMount } from 'svelte';
    import Papa from 'papaparse';
    import VariantTable from '$lib/components/VariantsTable.svelte'
    import VariantsLineChart from '$lib/components/VariantsLineChart.svelte';
    // ^ adjust this import path according to where your VariantTable file is stored
  
    let variantData = [];
    let loading = true;
    let error: string | null = null;
  
    // URL to local server endpoint that returns the CSV:
    const CSV_URL = "/opendataswissapi/variants";
  
    onMount(async () => {
      try {
        const response = await fetch(CSV_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        const csvText = await response.text();
        const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
        variantData = parsed.data;
        loading = false;
      } catch (err) {
        error = (err as Error).message;
        loading = false;
      }
    });
  </script>
  
  <main> 
    {#if loading}
      <p>Loading CSV data…</p>
    {:else if error}
      <p style="color: red;">Error: {error}</p>
    {:else}
      <!-- Pass the `variantData` array to separate table component -->
      <VariantsLineChart {variantData} />
    {/if}
  </main>
  
  


