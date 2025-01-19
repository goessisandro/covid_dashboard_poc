<script>
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import { goto } from '$app/navigation';
  
    // This array should match your data rows' property names
    export let covidRows = [];
  
    let mapCreated = false;
  
    const MAP_WIDTH = 1000;
    const MAP_HEIGHT = 800;
  
    // Example color palette
    const colorStops = [
      '#fee5d9',
      '#fcbba1',
      '#fc9272',
      '#fb6a4a',
      '#ef3b2c',
      '#cb181d',
      '#99000d'
    ];
  
    onMount(() => {
      maybeCreateMap();
    });
  
    // Re-run if covidRows come in later
    $: if (!mapCreated && covidRows.length > 0) {
      maybeCreateMap();
    }
  
    async function maybeCreateMap() {
      if (mapCreated) return;
      if (covidRows.length === 0) return;
  
      mapCreated = true;
  
      // 1. Load the entire Gemeinden GeoJSON
      const allGemeinden = await d3.json('/geo/switzerland_gemeinden.geojson');
  
      // 2. Filter to only keep features belonging to Schwyz
      const schwyzFeatures = allGemeinden.features.filter(
        f => f.properties.kantName === 'Schwyz'
      );
  
      // Make a new smaller GeoJSON object
      const geoData = {
        type: 'FeatureCollection',
        name: 'SchwyzGemeinden',
        crs: allGemeinden.crs,
        features: schwyzFeatures
      };
  
      // 3. Merge the covidRows data into the geoData
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
  
      // 4. Determine color scale from the incidence values
      const incidenceValues = geoData.features.map(f => f.properties.seven_day_incidence || 0);
      const [minVal, maxVal] = d3.extent(incidenceValues);
  
      const colorScale = d3.scaleSequential()
        .domain([minVal, maxVal])
        .interpolator(d3.interpolateRgbBasis(colorStops));
  
      // 5. Create the projection & path generator
      const projection = d3.geoMercator().fitSize([MAP_WIDTH, MAP_HEIGHT], geoData);
      const pathGenerator = d3.geoPath().projection(projection);
  
      // 6. Setup main SVG
      const svg = d3.select('#schwyz-map')
        .attr('viewBox', `0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .style('width', '100%')
        .style('height', 'auto');
  
      // 7. Tooltip
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
  
      // 8. Draw paths
      svg.selectAll('path')
        .data(geoData.features)
        .enter()
        .append('path')
        .attr('d', pathGenerator)
        .attr('stroke', '#fff')
        .attr('stroke-width', 0.5)
        .attr('fill', d => colorScale(d.properties.seven_day_incidence))
        .on('mouseover', function(event, d) {
          d3.select(this)
            .attr('stroke', '#2F4356')
            .attr('stroke-width', 2)
            .raise();
  
          tooltip.style('display', 'block')
            .html(`
              <strong>${d.properties.vogeName}</strong><br>
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
          // If you want to navigate somewhere on click:
          // goto(`/schwyz/${d.properties.vogeName}`);
        });
  
      // 9. Optional: build a simple color legend
      createLegend(minVal, maxVal, colorScale);
    }
  
    function createLegend(minVal, maxVal, colorScale) {
      const legendSvg = d3.select('#schwyz-legend')
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
        .select('.domain')
        .remove();
    }
  </script>
  
  <div class="map-card">
    <h2 class="map-title">Gemeinden of Schwyz</h2>
    <svg id="schwyz-map"></svg>
  
    <div class="legend-container">
      <h3 class="legend-title">7-Day Incidence</h3>
      <svg id="schwyz-legend"></svg>
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
  
    /* By default, map is full width in mobile, legend is below */
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
      margin: 0 auto;
    }
  
    .tooltip {
      font-size: 12px;
      box-shadow: 2px 2px 5px rgba(0,0,0,0.1);
    }
  
    /* On desktop (>= 992px): put the legend top-left, shrink map a bit */
    @media (min-width: 992px) {
      #schwyz-map {
        max-width: 60%; /* smaller map on desktop */
      }
      .legend-container {
        position: absolute;
        top: 1rem;
        left: 1rem;
        margin: 0; /* override the auto margin so it stays top-left */
      }
    }
  </style>
  
  
  