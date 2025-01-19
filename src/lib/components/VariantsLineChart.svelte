<script lang="ts">
    import { onMount } from 'svelte';
    import * as Plot from '@observablehq/plot';
    import * as d3 from 'd3'; // for date parsing, tick formatting, etc.
  
    /**
     * We expect the parent to pass in "variantData", which is an
     * array of objects, each with these fields (at least):
     *
     * {
     *   geoRegion: string;
     *   variant_type: string;
     *   date: string;     // e.g. "2022-09-01" (YYYY-MM-DD)
     *   entries: string|number;
     *   // plus the other fields (sumTotal, freq, prct, etc.) ...
     * }
     */
    export let variantData: Array<Record<string, any>> = [];
  
    // We'll store a reference to a <div> to mount the chart
    let chartContainer: HTMLDivElement;
  
    onMount(() => {
      // 1) Filter out rows where variant_type is "all_sequenced" or "other_linages"
      let filteredData = variantData.filter(
        d => d.variant_type !== 'all_sequenced' && d.variant_type !== 'other_linages'
      );
  
      // 2) Convert "date" to a JavaScript Date object, and "entries" to number
      filteredData.forEach(d => {
        // If dates are in YYYY-MM-DD format, this works well:
        d.date = new Date(d.date);
        // Convert entries to a number
        d.entries = +d.entries;
      });
  
      // 3) Build the Plot chart
      //    We'll group by (x = date, color/stroke = variant_type)
      //    and sum all "entries" for each date+variant_type.
      const chart = Plot.plot({
        width: 800,
        height: 500,
        marginLeft: 70,
        marginRight: 20,
        marginTop: 40,
        marginBottom: 60,
  
        // X-axis config
        x: {
          label: 'Date',
          tickRotate: -45,                   // tilt labels if you have many dates
          tickFormat: d3.utcFormat('%Y-%m-%d') 
        },
  
        // Y-axis config
        y: {
          label: 'Total Entries (Occurrences)',
          grid: true
        },
  
        color: {
          label: 'Variant Type', 
          legend: true,
          range: [
            '#1f77b4', '#9467bd', '#2ca02c', '#d62728', '#ff7f0e', 
            '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#98df8a',
            '#aec7e8', '#ffbb78', '#17becf'
          ]
        },
  
        marks: [
          // We use Plot.lineY, but group by date to sum the 'entries' per variant_type
          Plot.lineY(
            filteredData,
            Plot.groupX(
              { y: 'sum' },
              {
                x: 'date',
                y: 'entries',
                stroke: 'variant_type',
                strokeWidth: 1.5
              }
            )
          )
        ]
      });
  
      // 4) Append the Plot chart (an <svg> element) to our container
      chartContainer.appendChild(chart);
    });
</script>

<!-- This <div> is where we insert the generated SVG chart -->
<div class="chart-card">
  <h2 class="chart-title">Dominant COVID-19 Variants During the Course of the Pandemic</h2>
  <div class="chart-container" bind:this={chartContainer}></div>
</div>

<style>
  .chart-card {
    background-color: #FFFFFF;
    border-radius: 8px;
    box-shadow: 0 8px 16px rgba(0,0,0,0.1);
    padding: 1rem;
    max-width: 90%;
    margin: 2rem auto;
  }

  .chart-title {
    font-size: 1.5rem;
    font-weight: 500;
    color: black;
    text-align: center;
    margin-bottom: 1rem;
  }

  .chart-container {
    display: flex;
    justify-content: center;
  }

  #chart {
    display: block;
    margin: 0 auto;
  }
</style>