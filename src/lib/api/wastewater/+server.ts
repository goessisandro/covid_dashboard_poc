import { error } from '@sveltejs/kit';

export async function GET() {
  const url = 'https://www.covid19.admin.ch/api/data/20231206-0sxi4s4a/sources/COVID19Wastewater_vl.csv';

  const res = await fetch(url);
  if (!res.ok) {
    throw error(500, `Failed to download CSV. Status: ${res.status}`);
  }

  const csvArray = await res.arrayBuffer();

  return new Response(csvArray, {
    headers: {
      'Content-Type': 'text/csv',
    }
  });
}
