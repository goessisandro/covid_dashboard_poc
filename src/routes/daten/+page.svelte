<script>
    // The array with your sections + embedded links:
    const sections = [
        {
            title: "Rest API",
            content: `
                Access to the published data is available via an Application Programming Interface (API). 
                This new API has replaced the previous API of the COVID-19 dashboard, which is documented 
                <a class="link" href="https://opendata.swiss/de/dataset/covid-19-schweiz" target="_blank">here</a>.
            `
        },
        {
            title: "Legal Basis",
            content: `
                The legal basis corresponds to the Federal Office of Public Health's obligation to provide information 
                on communicable diseases according to Article 9 of the 
                <a class="link" href="https://www.fedlex.admin.ch/eli/cc/2015/297/de" target="_blank">
                    Epidemics Act (SR 818.101)
                </a>. 
                The publication of data implements the 
                <a class="link" href="https://www.bfs.admin.ch/bfs/de/home/dienstleistungen/ogd/strategie.html" target="_blank">
                    Strategy for Open Government Data in Switzerland 2019-2023
                </a>, 
                which mandates the publication of administrative data unless legitimate protection interests 
                (e.g., data protection reasons) oppose it. These are publicly available data that can be used 
                with appropriate source attribution.
            `
        },
        {
            title: "Available Data Sources / Collection Systems",
            content: `
                The API includes data from all collection systems integrated into the COVID-19 dashboard. 
                However, not all collection systems provide data for every indicator or category. 
                Changes to the available data sources are documented in the Data Release Notes. 
                For more information, refer to the "Data Collection Systems" section or the relevant COVID-19 indicators.
            `
        },
        {
            title: "API Access",
            content: `
                The API follows the REST (Representational State Transfer) paradigm, which defines principles 
                for unified and efficient data access. API access is documented here using Swagger.
            `
        }
    ];

    // Additional text for "Data Downloads" section
    const downloadContent = `
        In addition to the API described here, the latest COVID-19 data is available in CSV format. 
        All data on SARS-CoV-2 published on the Federal Office of Public Health (FOPH) information portal 
        is available here for download in the latest published version. For each collection system, 
        a CSV file packaged as a ZIP archive can be downloaded below. The data is also published on opendata.swiss.
    `;
</script>

<style>
    .page {
        background-color: #F0F4F7;
        padding: 2rem;
        font-family: Arial, sans-serif;
    }

    .section {
        background-color: #FFFFFF;
        border-radius: 8px;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .section h2 {
        font-size: 1.5rem;
        margin-bottom: 0.5rem;
        color: #2F4356;
    }

    .section p {
        line-height: 1.6;
        color: #333;
    }

    /* Make this a global rule so <a class="link"> from {@html ...} is styled */
    :global(.link) {
        color: red;
        text-decoration: underline;
    }

    .footer {
        margin-top: 2rem;
    }

    .footer p {
        font-size: 0.9rem;
        color: #666;
    }
</style>

<div class="page">
    <div class="section">
        <h2>Data</h2>
        <p>
            The data underlying all information published on the dashboard about COVID-19 
            can be accessed not only through the data packages provided for individual indicators 
            but also via the API (Application Programming Interface) described on this page. 
            The data is updated weekly, every Wednesday.
        </p>
    </div>

    {#each sections as section}
        <div class="section">
            <h2>{section.title}</h2>
            <!-- Insert each section's HTML content -->
            <p>{@html section.content}</p>
        </div>
    {/each}

    <div class="section">
        <h2>Data Downloads</h2>
        <p>{@html downloadContent}</p>
        <ul>
            <li style="margin-top: 1rem;">
                <strong>Covid-19 – Data Download</strong>
                <a class="link" href="https://www.idd.bag.admin.ch/api/v1/export/20241224/COVID19_oblig/zip" target="_blank">
                    <span style="display: flex; align-items: center;">
                        <img src="\assets\download_icon.png" alt="Download Icon" style="width: 16px; height: 16px; margin-right: 8px;" />
                        Mandatory Reporting System
                    </span>
                </a>
            </li>
            <li>
                <a class="link" href="https://www.idd.bag.admin.ch/api/v1/export/20241224/COVID19_genomic_surveillance/zip" target="_blank">
                    <span style="display: flex; align-items: center;">
                        <img src="\assets\download_icon.png" alt="Download Icon" style="width: 16px; height: 16px; margin-right: 8px;" />
                        Genomic Surveillance
                    </span>
                </a>
            </li>
            <li>
                <a class="link" href="https://www.idd.bag.admin.ch/api/v1/export/20241224/RESPVIRUSES_wastewater/zip" target="_blank">
                    <span style="display: flex; align-items: center;">
                        <img src="\assets\download_icon.png" alt="Download Icon" style="width: 16px; height: 16px; margin-right: 8px;" />
                        Wastewater Monitoring
                    </span>
                </a>
            </li>
            <li>
                <a class="link" href="https://www.idd.bag.admin.ch/api/v1/export/20241224/COVID19_wastewater_sequencing/zip" target="_blank">
                    <span style="display: flex; align-items: center;">
                        <img src="\assets\download_icon.png" alt="Download Icon" style="width: 16px; height: 16px; margin-right: 8px;" />
                        Wastewater Variants Sequencing
                    </span>
                </a>
            </li>
        </ul>
    </div>

    <div class="footer">
        <p>Legal Information | Data Protection | Impressum | Release Notes</p>
    </div>
</div>
