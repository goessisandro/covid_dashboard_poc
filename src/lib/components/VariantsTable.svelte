<!-- src/lib/VariantTable.svelte -->

<script lang="ts">
    /**
     * Expects the parent to pass in `variantData`.
     * Declares it as a prop using "export let"
     */
    export let variantData: Array<Record<string, any>> = [];
</script>
  
  <!-- Render the table -->
  <table>
    <thead>
      <tr>
        <th>geoRegion</th>
        <th>variant_type</th>
        <th>date</th>
        <th>entries</th>
        <th>sumTotal</th>
        <th>freq</th>
        <th>prct_mean7d</th>
        <th>prct</th>
        <th>prct_lower_ci</th>
        <th>prct_upper_ci</th>
        <th>timeframe_all</th>
        <th>type</th>
        <th>version</th>
        <th>classification</th>
        <th>data_source</th>
      </tr>
    </thead>
    <tbody>
      {#each variantData as row, i}
        <tr>
          <td>{row.geoRegion}</td>
          <td>{row.variant_type}</td>
          <td>{row.date}</td>
          <td>{row.entries}</td>
          <td>{row.sumTotal}</td>
          <td>{row.freq}</td>
          <td>{row.prct_mean7d}</td>
          <td>{row.prct}</td>
          <td>{row.prct_lower_ci}</td>
          <td>{row.prct_upper_ci}</td>
          <td>{row.timeframe_all}</td>
          <td>{row.type}</td>
          <td>{row.version}</td>
          <td>{row.classification}</td>
          <td>{row.data_source}</td>
        </tr>
      {/each}
    </tbody>
  </table>
  