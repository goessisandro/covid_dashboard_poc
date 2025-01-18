<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import { goto } from '$app/navigation';

  export let covidRows = []; // passed in from parent, if needed

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

  // 7-step color palette
  const colorStops = [
    '#fee5d9',
    '#fcbba1',
    '#fc9272',
    '#fb6a4a',
    '#ef3b2c',
    '#cb181d',
    '#99000d'
  ];

  let mapCreated = false;

  // When mounted or updated, create map if not done
  onMount(() => {
    maybeCreateMap();
  });

  // Also watch if covidRows changes, create map if not done
  $: if (!mapCreated && covidRows.length > 0) {
    maybeCreateMap();
  }

  async function maybeCreateMap() {
    if (mapCreated) return;
    if (covidRows.length === 0) return;

    mapCreated = true;

    // 1. Load GeoJSON
    const geoData = await d3.json('/geo/switzerland_cantons.geojson');

    // 2. Merge data
    geoData.features.forEach(feature => {
      const fullName = feature.properties.kantName;
      const abbr = nameToAbbr[fullName];
      // find matching row in covidRows
      if (abbr) {
        const row = covidRows.find(r => r.canton === abbr);
        if (row) {
          feature.properties.seven_day_incidence  = row.seven_day_incidence;
          feature.properties.cases_today          = row.cases_today;
          feature.properties.cases_total          = row.cases_total;
          feature.properties.deaths_today         = row.deaths_today;
          feature.properties.deaths_total         = row.deaths_total;
          feature.properties.test_positivity_rate = row.test_positivity_rate;
        } else {
          // fallback
          feature.properties.seven_day_incidence  = 0;
          feature.properties.cases_today          = 0;
          feature.properties.cases_total          = 0;
          feature.properties.deaths_today         = 0;
          feature.properties.deaths_total         = 0;
          feature.properties.test_positivity_rate = 0;
        }
      }
    });

    // 3. color scale from incidence
    const incidenceValues = geoData.features.map(f => f.properties.seven_day_incidence || 0);
    const [minVal, maxVal] = d3.extent(incidenceValues);

    const colorScale = d3.scaleSequential()
      .domain([minVal, maxVal])
      .interpolator(d3.interpolateRgbBasis(colorStops));

    // 4. Projection
    const projection = d3.geoMercator()
      .fitSize([MAP_WIDTH, MAP_HEIGHT], geoData);
    const pathGenerator = d3.geoPath().projection(projection);

    // 5. Main SVG
    const svg = d3.select('#map')
      .attr('viewBox', `0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%')
      .style('height', 'auto');

    // 6. Tooltip
    const tooltip = d3.select('body')
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
    svg.selectAll('path')
      .data(geoData.features)
      .enter()
      .append('path')
      .attr('d', pathGenerator)
      .attr('stroke', '#fff')
      .attr('stroke-width', 0.5)
      .attr('fill', d => colorScale(d.properties.seven_day_incidence))
      .attr('class', d => d.properties.kantName === 'Schwyz' ? 'clickable' : '')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .attr('stroke', '#2F4356')
          .attr('stroke-width', 2)
          .raise();

        tooltip.style('display', 'block')
          .html(`
            <strong>${d.properties.kantName}</strong><br>
            7-day Incidence: ${d.properties.seven_day_incidence}<br>
            Cases Today: ${d.properties.cases_today}<br>
            Cases Total: ${d.properties.cases_total}<br>
            Deaths Today: ${d.properties.deaths_today}<br>
            Deaths Total: ${d.properties.deaths_total}<br>
            Test Positivity Rate: ${d.properties.test_positivity_rate}
          `);
      })
      .on('mousemove', function(event) {
        tooltip
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 20) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('stroke', '#fff')
          .attr('stroke-width', 0.5);

        tooltip.style('display', 'none');
      })
      .on('click', function(event, d) {
        if (d.properties.kantName === 'Schwyz') {
          tooltip.style('display', 'none');
          goto('/schwyz');
        }
      });

    // 8. legend
    createLegend(minVal, maxVal, colorScale);
  }

  function createLegend(minVal, maxVal, colorScale) {
    const legendSvg = d3.select('#legend')
      .attr('viewBox', '0 0 300 50')
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%')
      .style('height', 'auto');

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
    <h3 class="legend-title">7-Day Incidence</h3>
    <svg id="legend"></svg>
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


  
  
  