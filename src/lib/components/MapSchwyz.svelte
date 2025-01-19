<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import { goto } from '$app/navigation';

  // We'll receive covidRows from outside
  export let covidRows = [];

  // Dimensions
  const MAP_WIDTH = 1000;
  const MAP_HEIGHT = 800;

  // We'll store the loaded GeoJSON in a variable
  let geoData = null;

  // We'll keep track of whether we've built the map yet
  let mapCreated = false;

  // The drop-down will let us pick from these metrics
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

  // We'll store the path selection so we can recolor easily
  let paths = null;

  // A color palette
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
  const colorScale = d3.scaleSequential().interpolator(d3.interpolateRgbBasis(colorStops));

  // We'll keep an in-memory reference to the tooltip
  let tooltipDiv = null;

  onMount(() => {
    maybeCreateMap();
  });

  // If covidRows arrives later, re-check
  $: if (!mapCreated && covidRows.length > 0) {
    maybeCreateMap();
  }

  /**
   * Called whenever the user changes the drop-down
   */
  function handleMetricChange(event) {
    selectedMetric = event.target.value;
    updateMap();  // Recompute color scale, recolor
  }

  /**
   * On first creation, load GeoJSON, merge data, build map elements.
   */
  async function maybeCreateMap() {
    if (mapCreated) return;
    if (covidRows.length === 0) return;

    mapCreated = true;

    // 1. Load entire Gemeinden GeoJSON
    const allGemeinden = await d3.json('/geo/switzerland_gemeinden.geojson');

    // 2. Filter only Schwyz
    const schwyzFeatures = allGemeinden.features.filter(
      f => f.properties.kantName === 'Schwyz'
    );

    geoData = {
      type: 'FeatureCollection',
      name: 'SchwyzGemeinden',
      crs: allGemeinden.crs,
      features: schwyzFeatures
    };

    // 3. Merge your covidRows into geoData
    geoData.features.forEach(feature => {
      const vogeName = feature.properties.vogeName;
      const row = covidRows.find(r => r.vogeName === vogeName);

      if (row) {
        feature.properties.seven_day_incidence   = row.seven_day_incidence   || 0;
        feature.properties.cases_today           = row.cases_today           || 0;
        feature.properties.cases_total           = row.cases_total           || 0;
        feature.properties.deaths_today          = row.deaths_today          || 0;
        feature.properties.deaths_total          = row.deaths_total          || 0;
        feature.properties.test_positivity_rate  = row.test_positivity_rate  || 0;
      } else {
        feature.properties.seven_day_incidence   = 0;
        feature.properties.cases_today           = 0;
        feature.properties.cases_total           = 0;
        feature.properties.deaths_today          = 0;
        feature.properties.deaths_total          = 0;
        feature.properties.test_positivity_rate  = 0;
      }
    });

    // 4. Create projection + path generator
    const projection = d3.geoMercator().fitSize([MAP_WIDTH, MAP_HEIGHT], geoData);
    const pathGenerator = d3.geoPath().projection(projection);

    // 5. Main SVG
    const svg = d3.select('#schwyz-map')
      .attr('viewBox', `0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%')
      .style('height', 'auto');

    // 6. Tooltip
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

    // 7. Draw paths
    paths = svg.selectAll('path')
      .data(geoData.features)
      .enter()
      .append('path')
      .attr('d', pathGenerator)
      .attr('stroke', '#fff')
      .attr('stroke-width', 0.5)
      .on('mouseover', function(event, d) {
        d3.select(this)
          .attr('stroke', '#2F4356')
          .attr('stroke-width', 2)
          .raise();

        // The friendly label for the selected metric
        const metricLabel = METRICS.find(m => m.value === selectedMetric)?.label || selectedMetric;
        const metricValue = d.properties[selectedMetric];

        // Build tooltip HTML:
        // We'll bold the chosen metric line, and show the other lines normally
        const html = `
          <strong>${d.properties.vogeName}</strong><br>
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
        // Example: goto(`/schwyz/${d.properties.vogeName}`);
      });

    // Finally, call updateMap() for the initial selected metric
    updateMap();
  }

  /**
   * Recomputes the color scale domain for the currently selected metric,
   * updates the fill on each path, and updates the legend.
   */
  function updateMap() {
    if (!geoData || !paths) return;

    // 1. Extract values for the chosen metric
    const values = geoData.features.map(f => f.properties[selectedMetric] || 0);

    // 2. Get min & max
    const [minVal, maxVal] = d3.extent(values);

    // 3. Update colorScale domain
    colorScale.domain([minVal, maxVal]);

    // 4. Refill paths
    paths
      .transition().duration(500)
      .attr('fill', d => colorScale(d.properties[selectedMetric]));

    // 5. Rebuild legend
    createLegend(minVal, maxVal);
  }

  function createLegend(minVal, maxVal) {
    const legendSvg = d3.select('#schwyz-legend')
      .attr('viewBox', '0 0 300 50')
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%')
      .style('height', 'auto');

    // Clear old contents (if re-building)
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
  <h2 class="map-title">Gemeinden of Schwyz</h2>
  <svg id="schwyz-map"></svg>

  <div class="legend-container">
    <h3 class="legend-title">Selected Metric</h3>
    <!-- The color legend -->
    <svg id="schwyz-legend"></svg>

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

  #schwyz-map {
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

  #schwyz-legend {
    display: block;
    margin: 0 auto 1rem auto;
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

  /* On desktop (>= 992px): put the legend top-left, shrink map a bit */
  @media (min-width: 992px) {
    #schwyz-map {
      max-width: 60%;
    }
    .legend-container {
      position: absolute;
      top: 1rem;
      left: 1rem;
      margin: 0; /* override the auto margin */
    }
  }
</style>

