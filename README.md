# Technology Proof-of-Concept: COVID-19 Dashboard

## 📖 Description

This is a COVID-19 dashboard application built with Svelte, Supabase, and D3.js. The dashboard was developed to test and evaluate a modern web technology stack for building responsive, interactive dashboards. It was created as part of the master's thesis *"Data Visualization in the COVID-19 Pandemic – Developing a Framework for Public Health Dashboard Design: From Research to Prototype"*, authored by **Sandro Gössi** at the **University of St. Gallen**.

## 📚 Table of Contents

- [Description](#-description)
- [Features](#-features)
- [Recommended Technologies](#recommended-technologies)
- [Installation](#installation)
- [Building](#building)
- [Contributing](#contributing)
- [Aknowledgements](#aknowledgements)
- [License](#license)
- [Contact](#contact)

---

## ✅ Features

- **Interactive Map**  
  Displays a COVID-19 choropleth map of Switzerland, showing data by **canton** (national level) and **municipality** (regional level). Used to test the integration of GeoJSON files and geospatial data visualization using D3.js.

- **Cloud-Based Backend**  
  Connects to a PostgreSQL database hosted on **Supabase** via API requests to fetch COVID-19 data. Used to test real-time data storage, syncing, and RESTful API access.

- **Official Public Health Data Integration**  
  Retrieves live COVID-19 statistics from the **Swiss Federal Office of Public Health (FOPH)** via the [opendata.swiss](https://opendata.swiss) API. Used to test API functionality and the use of official government data sources.

- **Interactive Tooltips**  
  Displays detailed statistics on hover over the map using D3.js and reactive Svelte components. Used to test the interactivity capabilities of Svelte and data visualization libraries.

- **Additional Charts**  
  Visualizes variant data using **Chart.js** and **Observable Plot** for comparative analysis and trends. Used to test and evaluate different JavaScript data visualization libraries.

- **Responsive Design**  
  Responsive layout built with **CSS/Tailwind CSS** that adapts to various screen sizes. Used to test CSS and Tailwind CSS utility classes for building mobile-friendly layouts.

- **Supporting Pages**  
  Includes an **About** page and a **Feedback** form that connects directly to Supabase for submitting responses. Used to to explore Svelte funcionalities such as component structure, page routing, and form handling and get more familar with HTML/CSS/JavaScript basics.

---




## Recommended Technologies

Based on the research conducted in this thesis and the practical insights gained from the proof of concept (PoC), the following technology stack is recommended for building modern, interactive public health dashboards that are accessible via any web browser and device with an internet connection:

**1. [PostgreSQL](https://www.postgresql.org/):** Used as the primary relational database for storing structured public health data, including metrics, time series, and geospatial information.

**2. Cloud Infrastructure and Real-Time Data Storage**
- [Supabase](https://supabase.com/): Employed in this project as a cloud-based backend-as-a-service (BaaS) platform. It offers real-time database syncing, RESTful API generation, user authentication, and file storage.

Alternative cloud database solutions:
- [Databricks](https://www.databricks.com/) – for large-scale analytics and machine learning.
- [Snowflake](https://www.snowflake.com/) – for high-performance cloud data warehousing.
- [Firebase](https://firebase.google.com/) – for rapid front-end development, offering built-in authentication, hosting, and flexible NoSQL storage database services (Firestore).
Choose a solution based on your project’s resources, scalability, performance, and integration needs.

**3. [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript) / [TypeScript](https://www.typescriptlang.org/):** Used as the core programming language for building front-end interactivity. TypeScript provides additional type safety and improves code maintainability.

**4. [HTML5](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5):** Provides the structural foundation of the web application, including content layout and semantic organization of interface components.

**5. [CSS3](https://developer.mozilla.org/en-US/docs/Web/CSS) / [Tailwind CSS](https://tailwindcss.com/):** Used to style the application and implement responsive design. Tailwind CSS offers utility-first classes to speed up UI development and ensure consistent design across devices.

**6. [Svelte](https://svelte.dev/) & [SvelteKit](https://kit.svelte.dev/):** Serve as the main front-end framework and application router. Svelte enables reactive and efficient UI components with minimal overhead, while SvelteKit simplifies routing, server-side rendering (SSR), and integration with backend APIs.

**7. Data Visualization Libraries** Used for data visualization.
- [D3.js](https://d3js.org/): is ideal for building fully customizable, interactive visualizations, including choropleth maps.

- [Chart.js](https://www.chartjs.org/): is useful for quickly rendering standard chart types with built-in interactivity.

- [Observable Plot](https://observablehq.com/plot): Simplifies statistical visualizations with a higher-level abstraction built on D3.js.

**8. [GeoJSON](https://geojson.org/):**  Used to represent geospatial features such as canton and municipality boundaries for rendering interactive maps.


**9. Svelte UI Libraries (optional):** Libraries such as [svelte-headlessui](https://github.com/rgossiaux/svelte-headlessui), [svelte-materialify](https://github.com/TheComputerM/svelte-materialify) , or [shadcn-svelte](https://github.com/huntabyte/shadcn-svelte) can be used to accelerate development of ready-made UI components, such as modals, tabs, tooltips, and dropdowns, while maintaining accessibility and consistency.


## Installation
Ensure that NodeJS and GitHub is installed abd that your System is allowed to execute Scripts.
- https://nodejs.org/en/download
- https://git-scm.com/downloads

1. Clone the repository:
   ```bash
   git clone https://github.com/goessisandro/covid_dashboard_poc.git
   cd covid_dashboard_poc
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to [`http://localhost:3000`](http://localhost:300).

## Building

To create a production version of your app:

```bash
npm run build
```

## Contributing

Contributions are welcome!
Feel free to open an issue or submit a pull request with improvements, bug fixes, or suggestions.

## Aknowledgements
Supervised by:

- Prof. Dr. Johannes Schöning

- Dr. Gian-Luca Savino

- Prof. Dr. Tobias Kowatsch

Thank you for the valuable feedback and academic support.

## License

This project is licensed under the MIT License. Open to use as long you give credit.


## Contact

For questions, suggestions, or feedback, feel free to reach out: [hsgmasterthesis@gmail.com](hsgmasterthesis@gmail.com).
