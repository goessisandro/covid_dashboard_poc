<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';

    // Stores the parsed CSV rows in csvData
    let csvData: any[] = [];
    let errorMsg = '';
    let loading = true;

    onMount(async () => {
        try {
            const url = 'https://www.covid19.admin.ch/api/data/20231206-0sxi4s4a/sources/COVID19Wastewater_vl.csv';

            // 1) Fetchs the raw CSV text
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const csvText = await response.text();

            // 2) Use d3.csvParse to convert text -> array of objects
            //    each row will have keys like "Canton", "7-day Incidence", etc.
            csvData = d3.csvParse(csvText);

            console.log('Parsed CSV data:', csvData);
        } catch (err) {
            if (err instanceof Error) {
                errorMsg = `Error fetching CSV: ${err.message}`;
            } else {
                errorMsg = 'An unknown error occurred';
            }
            console.error('Error details:', err);
        } finally {
            loading = false;
        }
    });
</script>
  
  <style>
    .container {
      background-color: #FFFFFF;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      padding: 1.5rem;
      max-width: 90%;
      margin: 2rem auto;
      font-family: Arial, sans-serif;
    }
    
    h1 {
      font-size: 1.5rem;
      color: #2F4356;
      text-align: center;
      margin-bottom: 1rem;
    }
  
    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
  
    th, td {
      padding: 10px;
      border-bottom: 1px solid #ddd;
    }
  
    tr:nth-child(even) {
      background-color: #f9f9f9;
    }
  </style>
  
  <div class="container">
    <h1>COVID-19 CSV Data (Wastewater) </h1>
    
    {#if loading}
      <p>Loading data from CSV...</p>
    {:else if errorMsg}
      <p style="color: red;">{errorMsg}</p>
    {:else}
      <table>
        <thead>
          {#if csvData.length > 0}
            <tr>
              {#each Object.keys(csvData[0]) as header}
                <th>{header}</th>
              {/each}
            </tr>
          {/if}
        </thead>
        <tbody>
          {#each csvData as row}
            <tr>
              {#each Object.keys(row) as column}
                <td>{row[column]}</td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  </div>
  