# Technology Proof-of-Concept: COVID-19 Dashboard

This is a COVID-19 dashboard application built with Svelte, Supabase, and D3.js. The dashboard was developed to test and evaluate the chosen technology stack for building COVID-19 dashboards, as part of the master's thesis "*Data Visualization in the COVID-19 Pandemic – Developing a Framework for Public Health Dashboard Design: From Research to Prototype"*, authored by Sandro Gössi at the University of St. Gallen.

## Features

- **Interactive Map:** Displays a COVID-19 choropleth map of Switzerland, showing data by canton at the first level and by municipality at the second. This feature was used to test the integration of GeoJSON files and geospatial data visualization using D3.js.

- **Cloud-Based Back End:** Fetches data from a PostgreSQL database hosted on Supabase. This setup was used to test real-time data storage, RESTful API access, and backend-to-frontend integration.

- **Official Public Health Data (FOPH API):** Retrieves official COVID-19 data from the Swiss Federal Office of Public Health via the opendata.swiss API. This was implemented to test API functionality and the use of official government data sources.

- **Interactive Tooltips:** Displays detailed statistics when hovering over cantons or municipalities. This feature tests the interactivity between Svelte and D3.js components.

- **Additional Charts:** Visualizes COVID-19 variant data using Chart.js and Observable Plot, including line and bar charts. This was used to evaluate different JavaScript charting libraries.

- **Responsive Design:** The dashboard is fully responsive and adapts to various screen sizes. This was used to test CSS and Tailwind CSS utility classes for building mobile-friendly layouts.

- **Supporting Pages:** Includes an About and a Feedback page. These were created to explore Svelte component structure, HTML/CSS integration, and form handling. The feedback form is connected to Supabase, allowing users to submit responses directly to the database.

## Recommended Technologies

Based on the research conducted in this thesis and the practical insights gained from the proof of concept (PoC), the following technology stack is recommended for building modern, interactive public health dashboards that are accessible via any web browser and device with an internet connection:

**PostgreSQL**

Used as the primary relational database for storing structured public health data, including metrics, time series, and geospatial information.

**Cloud Infrastructure and Real-Time Data Storage**

Supabase: Employed in this project as a cloud-based backend-as-a-service (BaaS) platform. It offers real-time database syncing, RESTful API generation, user authentication, and file storage.
Alternative cloud database solutions:
- Databricks – for large-scale analytics and machine learning.
- Snowflake – for high-performance cloud data warehousing.
- Google Firebase – for rapid front-end development, offering built-in authentication, hosting, and flexible NoSQL storage database services (Firestore).
Choose a solution based on your project’s resources, scalability, performance, and integration needs.

**JavaScript / TypeScript**

Used as the core programming language for building front-end interactivity. TypeScript provides additional type safety and improves code maintainability.

**HTML5**

Provides the structural foundation of the web application, including content layout and semantic organization of interface components.

**CSS3 / Tailwind CSS**

Used to style the application and implement responsive design. Tailwind CSS offers utility-first classes to speed up UI development and ensure consistent design across devices.

**Svelte & SvelteKit**

Serve as the main front-end framework and application router. Svelte enables reactive and efficient UI components with minimal overhead, while SvelteKit simplifies routing, server-side rendering (SSR), and integration with backend APIs.

**D3.js, Chart.js, and Observable Plot**

Used for data visualization.
- D3.js is ideal for building fully customizable, interactive visualizations, including choropleth maps.

- Chart.js is useful for quickly rendering standard chart types with built-in interactivity.

- Observable Plot simplifies statistical visualizations with a higher-level abstraction built on D3.js.

**GeoJSON Data Format**

Used to represent geospatial features such as canton and municipality boundaries for rendering interactive maps.


**Svelte UI Libraries (optional)**

Libraries such as svelte-headlessui, svelte-materialify, or shadcn-svelte can be used to accelerate development of ready-made UI components, such as modals, tabs, tooltips, and dropdowns, while maintaining accessibility and consistency.


Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npx sv create

# create a new project in my-app
npx sv create my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
