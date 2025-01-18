<script lang="ts">
  export let covidRows: Array<any> = [];

  let sortKey = '';
  let sortOrder = 1; // 1 for ascending, -1 for descending

  function sortTable(key: string) {
    if (sortKey === key) {
      sortOrder *= -1;
    } else {
      sortKey = key;
      sortOrder = 1;
    }

    covidRows = [...covidRows].sort((a, b) => {
      if (a[key] < b[key]) return -1 * sortOrder;
      if (a[key] > b[key]) return 1 * sortOrder;
      return 0;
    });
  }

  function getSortIcon(key: string) {
    if (sortKey === key) {
      return sortOrder === 1 ? '▲' : '▼';
    }
    return '';
  }
</script>

<style>
  .table-container {
    background-color: #FFFFFF;
    border-radius: 8px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    padding: 1.5rem;
    max-width: 90%;
    margin: 2rem auto;
  }

  h1 {
    font-size: 1.5rem;
    font-weight: 500;
    color: black;
    text-align: center;
    margin-bottom: 1rem;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
    border-radius: 8px;
    overflow: hidden;
  }

  th {
    cursor: pointer;
    background-color: #2F4356;
    color: white;
    padding: 10px;
    position: relative;
  }

  th:hover {
    background-color: #1e2d3b;
  }

  th::after {
    content: attr(data-sort-icon);
    position: absolute;
    right: 10px;
    color: white;
    font-size: 0.8rem;
  }

  td {
    padding: 10px;
    border-bottom: 1px solid #ddd;
  }

  tr:nth-child(even) {
    background-color: #f9f9f9;
  }

  tr:hover {
    background-color: #e0e0e0;
  }

  @media (max-width: 600px) {
    table {
      font-size: 12px;
    }
  }
</style>

<div class="table-container">
  <h1>Covid Data Switzerland</h1>
  <table>
    <thead>
      <tr>
        <th on:click={() => sortTable('canton')} data-sort-icon={getSortIcon('canton')}>Canton</th>
        <th on:click={() => sortTable('seven_day_incidence')} data-sort-icon={getSortIcon('seven_day_incidence')}>7-day Incidence</th>
        <th on:click={() => sortTable('cases_today')} data-sort-icon={getSortIcon('cases_today')}>Cases Today</th>
        <th on:click={() => sortTable('cases_total')} data-sort-icon={getSortIcon('cases_total')}>Total Cases</th>
        <th on:click={() => sortTable('deaths_today')} data-sort-icon={getSortIcon('deaths_today')}>Deaths Today</th>
        <th on:click={() => sortTable('deaths_total')} data-sort-icon={getSortIcon('deaths_total')}>Total Deaths</th>
        <th on:click={() => sortTable('test_positivity_rate')} data-sort-icon={getSortIcon('test_positivity_rate')}>Test Positivity Rate</th>
      </tr>
    </thead>
    <tbody>
      {#each covidRows as row}
        <tr>
          <td>{row.canton}</td>
          <td>{row.seven_day_incidence}</td>
          <td>{row.cases_today}</td>
          <td>{row.cases_total}</td>
          <td>{row.deaths_today}</td>
          <td>{row.deaths_total}</td>
          <td>{row.test_positivity_rate}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>



