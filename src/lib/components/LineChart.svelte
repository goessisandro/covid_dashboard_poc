<script lang="ts">
    import * as d3 from "d3";
    import { onMount } from "svelte";

    interface DataPoint {
        temporal: Date | null;
        value: number;
    }

    let data: DataPoint[] = [];
    let error: string = "";

    onMount(async () => {
        try {
            const response = await fetch("/data/COVID19_oblig/data.csv");
            if (!response.ok) throw new Error("Failed to load data");
            const csvText = await response.text();

            // Parse CSV
            data = d3.csvParse(csvText, (d: any) => ({
                temporal: d.temporal,
                value: +d.value || 0
            }));

            drawLineChart();
        } catch (err: unknown) {
            if (err instanceof Error) {
                error = err.message;
            } else {
                error = "An unknown error occurred";
            }
            console.error(error);
        }
    });

    function drawLineChart() {
        const margin = { top: 40, right: 30, bottom: 100, left: 80 };
        const width = 1000 - margin.left - margin.right;
        const height = 600 - margin.top - margin.bottom;

        // Clear previous chart
        d3.select("#line-chart").selectAll("*").remove();

        const svg = d3
            .select("#line-chart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Tooltip
        const tooltip = d3.select("#line-chart").append("div")
            .style("position", "absolute")
            .style("background", "#f9f9f9")
            .style("border", "1px solid #d3d3d3")
            .style("padding", "8px")
            .style("border-radius", "4px")
            .style("display", "none")
            .style("pointer-events", "none");

        // Parse time and sort data
        const parseTime = d3.timeParse("%Y-W%U");
        data.forEach(d => {
            d.temporal = parseTime(d.temporal as unknown as string);
        });
        data.sort((a, b) => d3.ascending(a.temporal as Date, b.temporal as Date));

        // Define scales
        const x = d3
            .scaleTime()
            .domain(d3.extent(data, d => d.temporal as Date) as [Date, Date])
            .range([0, width]);

        const y = d3
            .scaleLinear()
            .domain([0, d3.max(data, d => d.value) as number])
            .nice()
            .range([height, 0]);

        // Draw axes
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(
                d3.axisBottom(x).tickFormat((d: Date | Number, i: number) => {
                    if (d instanceof Date) {
                        return d3.timeFormat("%B %Y")(d);
                    }
                    return ""; // Return an empty string or handle numbers if needed
                })
            )
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");

        svg.append("g").call(d3.axisLeft(y));

        // Add axis labels
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height + margin.bottom - 20) // Adjusted to increase spacing
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .text("Time (Months)");

        svg.append("text")
            .attr("x", -height / 2)
            .attr("y", -60) // Adjusted to increase spacing
            .attr("transform", "rotate(-90)")
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .text("COVID-19 Cases");

        // Draws line
        const line = svg
            .append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 2)
            .attr(
                "d",
                d3
                    .line<DataPoint>()
                    .x(d => x(d.temporal as Date))
                    .y(d => y(d.value))
            );

        // Hover functionality
        svg.append("rect")
            .attr("width", width)
            .attr("height", height)
            .style("fill", "none")
            .style("pointer-events", "all")
            .on("mousemove", (event) => {
                const [mouseX] = d3.pointer(event);
                const date = x.invert(mouseX);
                const bisect = d3.bisector((d: DataPoint) => d.temporal as Date).left;
                const index = bisect(data, date);
                const d = data[Math.min(index, data.length - 1)];
                tooltip.style("display", "block")
                    .html(
                        `<strong>Month:</strong> ${d3.timeFormat("%B %Y")(d.temporal as Date)}<br>
                        <strong>Cases:</strong> ${d.value}`
                    )
                    .style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY - 20}px`);
            })
            .on("mouseout", () => {
                tooltip.style("display", "none");
            });
    }
</script>

<style>
    #line-chart {
        margin: 40px auto;
        width: 100%;
        max-width: 1000px;
        height: 600px;
    }

    #line-chart div {
        font-size: 12px;
    }
</style>

<div>
    {#if error}
        <p style="color: red;">{error}</p>
    {:else}
        <div id="line-chart"></div>
    {/if}
</div>