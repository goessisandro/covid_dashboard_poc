<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import { goto } from '$app/navigation';

  // We'll receive `covidRows` from outside, each row keyed by `canton` (like 'ZH', 'BE', etc.).
  export let covidRows = [];

  // Dimensions for the SVG
  const MAP_WIDTH = 1000;
  const MAP_HEIGHT = 800;

  // Map from kantName -> short code
  const nameToAbbr = {
    'Zürich': 'ZH',
    'Bern / Berne': 'BE',
    'Luzern': 'LU',
    'Uri': 'UR',
    'Schwyz': 'SZ',
    'Obwalden': 'OW',
    'Nidwalden': 'NW',
    'Glarus': 'GL',
    'Zug': 'ZG',
    'Fribourg / Freiburg': 'FR',
    'Solothurn': 'SO',
    'Basel-Stadt': 'BS',
    'Basel-Landschaft': 'BL',
    'Schaffhausen': 'SH',
    'Appenzell Ausserrhoden': 'AR',
    'Appenzell Innerrhoden': 'AI',
    'St. Gallen': 'SG',
    'Graubünden / Grigioni / Grischun': 'GR',
    'Aargau': 'AG',
    'Thurgau': 'TG',
    'Ticino': 'TI',
    'Vaud': 'VD',
    'Valais / Wallis': 'VS',
    'Neuchâtel': 'NE',
    'Genève': 'GE',
    'Jura': 'JU'
  };

  // The metrics we want to allow switching between
  const METRICS = [
    { value: 'seven_day_incidence', label: '7-Day Incidence' },
    { value: 'cases_today',         label: 'Cases Today' },
    { value: 'cases_total',         label: 'Cases Total' },
    { value: 'deaths_today',        label: 'Deaths Today' },
    { value: 'deaths_total',        label: 'Deaths Total' },
    { value: 'test_positivity_rate',label: 'Test Positivity Rate' }
  ];

  // Default selected metric
  let selectedMetric = 'seven_day_incidence';

  // We'll store the path selection so we can re-color easily
  let paths = null;

  // A 7-step color palette
  const colorStops = [
    '#fee5d9',
    '#fcbba1',
    '#fc9272',
    '#fb6a4a',
    '#ef3b2c',
    '#cb181d',
    '#99000d'
  ];

  // We'll keep a colorScale that we can re-domain
  const colorScale = d3.scaleSequential()
    .interpolator(d3.interpolateRgbBasis(colorStops));

  // We'll keep an in-memory reference to the tooltip
  let tooltipDiv = null;

  // Whether we've built the map yet
  let mapCreated = false;

  // Called onMount and again if `covidRows` changes
  onMount(() => {
    maybeCreateMap();
  });

  // If `covidRows` arrives later, re-check
  $: if (!mapCreated && covidRows.length > 0) {
    maybeCreateMap();
  }

  /**
   * Handle metric dropdown changes:
   */
  function handleMetricChange(event) {
    selectedMetric = event.target.value;
    updateMap();  // re-color paths and rebuild legend
  }

  /**
   * Possibly create the map if not created.
   */
  async function maybeCreateMap() {
    if (mapCreated) return;
    if (covidRows.length === 0) return;

    mapCreated = true;

    // 1. Load the Swiss cantons GeoJSON
    const geoData = await d3.json('/geo/switzerland_cantons.geojson');

    // 2. Merge data into the GeoJSON
    geoData.features.forEach(feature => {
      const fullName = feature.properties.kantName;
      const abbr = nameToAbbr[fullName]; // e.g. 'ZH'
      if (abbr) {
        // find a row in covidRows
        const row = covidRows.find(r => r.canton === abbr);
        if (row) {
          feature.properties.seven_day_incidence  = row.seven_day_incidence   || 0;
          feature.properties.cases_today          = row.cases_today           || 0;
          feature.properties.cases_total          = row.cases_total           || 0;
          feature.properties.deaths_today         = row.deaths_today          || 0;
          feature.properties.deaths_total         = row.deaths_total          || 0;
          feature.properties.test_positivity_rate = row.test_positivity_rate  || 0;
        } else {
          // fallback if no data
          feature.properties.seven_day_incidence  = 0;
          feature.properties.cases_today          = 0;
          feature.properties.cases_total          = 0;
          feature.properties.deaths_today         = 0;
          feature.properties.deaths_total         = 0;
          feature.properties.test_positivity_rate = 0;
        }
      }
    });

    // 3. Create projection + path generator
    const projection = d3.geoMercator()
      .fitSize([MAP_WIDTH, MAP_HEIGHT], geoData);

    const pathGenerator = d3.geoPath().projection(projection);

    // 4. Create the main SVG
    const svg = d3.select('#map')
      .attr('viewBox', `0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%')
      .style('height', 'auto');

    // 5. Create the tooltip
    tooltipDiv = d3.select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('background', '#f9f9f9')
      .style('border', '1px solid #d3d3d3')
      .style('padding', '8px')
      .style('border-radius', '4px')
      .style('display', 'none')
      .style('pointer-events', 'none');

    // 6. Draw the canton paths
    paths = svg.selectAll('path')
      .data(geoData.features)
      .enter()
      .append('path')
      .attr('d', pathGenerator)
      .attr('stroke', '#fff')
      .attr('stroke-width', 0.5)
      // We'll fill them in `updateMap()` after we define color domain
      .on('mouseover', function(event, d) {
        d3.select(this)
          .attr('stroke', '#2F4356')
          .attr('stroke-width', 2)
          .raise();

        const kantName = d.properties.kantName || 'Unknown';
        const metricValue = d.properties[selectedMetric];
        const metricLabel = METRICS.find(m => m.value === selectedMetric)?.label || selectedMetric;

        // build HTML for tooltip
        const html = `
          <strong>${kantName}</strong><br>
          <strong>${metricLabel}:</strong> ${metricValue}<br>
          ${selectedMetric !== 'seven_day_incidence' ? `7-day Incidence: ${d.properties.seven_day_incidence}<br>` : ''}
          ${selectedMetric !== 'cases_today' ? `Cases Today: ${d.properties.cases_today}<br>` : ''}
          ${selectedMetric !== 'cases_total' ? `Cases Total: ${d.properties.cases_total}<br>` : ''}
          ${selectedMetric !== 'deaths_today' ? `Deaths Today: ${d.properties.deaths_today}<br>` : ''}
          ${selectedMetric !== 'deaths_total' ? `Deaths Total: ${d.properties.deaths_total}<br>` : ''}
          ${selectedMetric !== 'test_positivity_rate' ? `Test Positivity Rate: ${d.properties.test_positivity_rate}` : ''}`;

        tooltipDiv.style('display', 'block').html(html);
      })
      .on('mousemove', function(event) {
        tooltipDiv
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 20) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('stroke', '#fff')
          .attr('stroke-width', 0.5);

        tooltipDiv.style('display', 'none');
      })
      .on('click', function(event, d) {
        // Example: go to /schwyz if kantName is Schwyz
        if (d.properties.kantName === 'Schwyz') {
          tooltipDiv.style('display', 'none');
          goto('/schwyz');
        }
      });

    // 7. Now color them according to the initial selected metric
    updateMap();
  }

  /**
   * Recomputes the color scale domain for the currently selected metric,
   * updates the fill on each path, and updates the legend.
   */
  function updateMap() {
    if (!paths) return;

    // 1. Get all values for the chosen metric
    const dataValues = paths.data().map(d => d.properties[selectedMetric] || 0);

    // 2. Compute domain
    const [minVal, maxVal] = d3.extent(dataValues);

    // 3. Update colorScale
    colorScale.domain([minVal, maxVal]);

    // 4. Update path fills
    paths
      .transition().duration(500)
      .attr('fill', d => colorScale(d.properties[selectedMetric]));

    // 5. Update legend
    createLegend(minVal, maxVal);
  }

  /**
   * Build or rebuild the color legend
   */
  function createLegend(minVal, maxVal) {
    const legendSvg = d3.select('#legend')
      .attr('viewBox', '0 0 300 50')
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%')
      .style('height', 'auto');

    // clear old stuff
    legendSvg.selectAll('*').remove();

    const g = legendSvg.append('g').attr('transform', 'translate(10,15)');

    const gradient = g.append('defs')
      .append('linearGradient')
      .attr('id', 'legendGradient')
      .attr('x1', '0%').attr('x2', '100%')
      .attr('y1', '0%').attr('y2', '0%');

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', colorScale(minVal));

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', colorScale(maxVal));

    g.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 250)
      .attr('height', 15)
      .style('fill', 'url(#legendGradient)');

    const xScale = d3.scaleLinear()
      .domain([minVal, maxVal])
      .range([0, 250]);

    const xAxis = d3.axisBottom(xScale)
      .ticks(5)
      .tickSize(0);

    g.append('g')
      .attr('transform', 'translate(0,15)')
      .call(xAxis)
      .select('.domain').remove();
  }
</script>

<div class="map-card">
  <h2 class="map-title">Covid-19 Statistics by Canton</h2>
  <svg id="map"></svg>

  <div class="legend-container">
    <!-- We'll dynamically show the selected metric in the legend-title, or we can keep it static -->
    <h3 class="legend-title">Select Metric</h3>
    <svg id="legend"></svg>

    <!-- The drop-down below the legend -->
    <div class="metric-selector">
      <label for="metricSelect">Pick a Metric:</label>
      <select id="metricSelect" on:change={handleMetricChange}>
        {#each METRICS as m}
          <option value={m.value} selected={m.value === selectedMetric}>
            {m.label}
          </option>
        {/each}
      </select>
    </div>
  </div>
</div>

<style>
  :global(body) {
    background-color: #F0F4F7;
    margin: 0;
    padding: 0;
    font-family: sans-serif;
  }

  .map-card {
    position: relative;
    background-color: #FFFFFF;
    border-radius: 8px;
    box-shadow: 0 8px 16px rgba(0,0,0,0.1);
    padding: 1rem;
    max-width: 90%;
    margin: 2rem auto;
  }

  .map-title {
    font-size: 1.5rem;
    font-weight: 500;
    color: black;
    text-align: center;
    margin-bottom: 0rem;
  }

  #map {
    display: block;
    margin: 0 auto;
  }

  .legend-container {
    background: #fff;
    padding: 0.5rem;
    border-radius: 6px;
    box-shadow: 1px 1px 5px rgba(0,0,0,0.2);
    max-width: 300px;
    margin: 0.5rem auto;
  }

  .legend-title {
    font-size: 1rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
    text-align: center;
  }

  #legend {
    display: block;
    margin: 0 auto;
  }

  .metric-selector {
    text-align: center;
    margin-top: 0.5rem;
  }

  .metric-selector label {
    margin-right: 0.5rem;
    font-weight: bold;
  }

  .tooltip {
    font-size: 12px;
    box-shadow: 2px 2px 5px rgba(0,0,0,0.1);
  }

  /*
    Make the path for Schwyz clickable (hand pointer)
    We do this by adding a "clickable" class if kantName === "Schwyz"
  */
  :global(.clickable) {
    cursor: pointer;
  }

  @media (min-width: 992px) {
    #map {
      max-width: 60%;
    }
    .legend-container {
      position: absolute;
      bottom: 1rem;
      right: 1rem;
      margin-left: 0;
      margin-right: 0;
    }
  }
</style>



  
  
  