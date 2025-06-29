export async function fetchCovidWastewaterData() {
    const url = 'https://www.covid19.admin.ch/api/data/20231206-0sxi4s4a/sources/COVID19Wastewater_vl.csv';
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`);
    }
    return response.text();
}


const BASE_URL = 'https://api.idd.bag.admin.ch/api/v1';

export async function getAvailableFiles(version = 'current') {
    const response = await fetch(`${BASE_URL}/export/${version}/files`);
    if (!response.ok) {
        throw new Error(`Error fetching files: ${response.statusText}`);
    }
    return response.json();
}

export async function getFile(version = 'current', file, format = 'csv') {
    const response = await fetch(`${BASE_URL}/export/${version}/${file}/${format}`);
    if (!response.ok) {
        throw new Error(`Error fetching file: ${response.statusText}`);
    }
    return response.text();
}

export async function getAvailableVersions() {
    const response = await fetch(`${BASE_URL}/version`);
    if (!response.ok) {
        throw new Error(`Error fetching versions: ${response.statusText}`);
    }
    return response.json();
}

export async function getDataSets() {
    const response = await fetch(`${BASE_URL}/data/sets`);
    if (!response.ok) {
        throw new Error(`Error fetching data sets: ${response.statusText}`);
    }
    return response.json();
}

export async function getDataSetDetails(topic, chapter, aggregation, temporality) {
    const response = await fetch(`${BASE_URL}/data/${topic}/${chapter}/${aggregation}/${temporality}/details`);
    if (!response.ok) {
        throw new Error(`Error fetching data set details: ${response.statusText}`);
    }
    return response.json();
}

export async function getData(topic, chapter, aggregation, temporality, body) {
    const response = await fetch(`${BASE_URL}/data/${topic}/${chapter}/${aggregation}/${temporality}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });
    if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`);
    }
    return response.json();
}