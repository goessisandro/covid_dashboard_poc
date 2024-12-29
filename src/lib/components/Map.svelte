<script>
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
  
    // Natural dimensions for the map's internal coordinate system
    const MAP_WIDTH = 1000;
    const MAP_HEIGHT = 800;
  
    // Example COVID-19 data
    const covidData = {
      ZH: 420,
      BE: 180,
      LU: 70,
      UR: 25,
      SZ: 60,
      OW: 28,
      NW: 29,
      GL: 55,
      ZG: 92,
      FR: 103,
      SO: 110,
      BS: 400,
      BL: 140,
      SH: 75,
      AR: 40,
      AI: 20,
      SG: 150,
      GR: 80,
      AG: 200,
      TG: 130,
      TI: 500,
      VD: 450,
      VS: 220,
      NE: 120,
      GE: 600,
      JU: 90
    };
  
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
  
    // Your requested color stops
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
      createMap();
    });
  
    async function createMap() {
      // 1. Load GeoJSON
      const geoData = await d3.json('/geo/switzerland_cantons.geojson');
  
      // 2. Merge COVID data
      geoData.features.forEach(feature => {
        const fullName = feature.properties.kantName;
        const abbr = nameToAbbr[fullName];
        feature.properties.cases = abbr ? covidData[abbr] || 0 : 0;
      });
  
      // 3. Determine color domain
      const casesValues = geoData.features.map(f => f.properties.cases);
      const [minCases, maxCases] = d3.extent(casesValues);
  
      // 4. Create a *continuous* color scale using your 7-step palette
      //    with d3.interpolateRgbBasis for a smooth gradient.
      const colorScale = d3.scaleSequential()
        .domain([minCases, maxCases])
        .interpolator(d3.interpolateRgbBasis(colorStops));
  
      // 5. Projection & path
      const projection = d3.geoMercator()
        .fitSize([MAP_WIDTH, MAP_HEIGHT], geoData);
      const pathGenerator = d3.geoPath().projection(projection);
  
      // 6. Main map svg with viewBox for responsiveness
      const svg = d3.select('#map')
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
  
      // 8. Draw map paths
      svg.selectAll('path')
        .data(geoData.features)
        .enter()
        .append('path')
        .attr('d', pathGenerator)
        .attr('stroke', '#fff')
        .attr('stroke-width', 0.5)
        .attr('fill', d => colorScale(d.properties.cases))
        .on('mouseover', function(event, d) {
          d3.select(this)
            .attr('stroke', '#2F4356')
            .attr('stroke-width', 2)
            .raise();
  
          tooltip.style('display', 'block')
            .html(`
              <strong>${d.properties.kantName}</strong><br>
              Cases: ${d.properties.cases}
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
        });
  
      // 9. Build a gradient legend
      createLegend(minCases, maxCases, colorScale);
    }
  
    // Basic gradient legend in #legend
    function createLegend(minValue, maxValue, colorScale) {
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
  
      // The colorScale at minValue / maxValue
      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', colorScale(minValue));
      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', colorScale(maxValue));
  
      // color bar
      g.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', 250)
        .attr('height', 15)
        .style('fill', 'url(#legendGradient)');
  
      // xScale for numeric axis
      const xScale = d3.scaleLinear()
        .domain([minValue, maxValue])
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
      <h3 class="legend-title">Number of Cases</h3>
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
  
    /* Legend container */
    .legend-container {
      background: #fff;
      padding: 0.5rem;
      border-radius: 6px;
      border: 0px solid #ccc;
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
  
  
  