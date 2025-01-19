// src/lib/api/variants/+server.ts
import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
  const CSV_URL = 'https://www.covid19.admin.ch/api/data/20231206-0sxi4s4a/sources/COVID19Variants_wgs.csv';
  try {
    const resp = await fetch(CSV_URL);
    if (!resp.ok) {
      throw error(500, `Failed to fetch CSV: ${resp.status} ${resp.statusText}`);
    }

    // text() to retrieve CSV as string
    const csvText = await resp.text();

    // Return it as raw text (or JSON, or do the parsing on the server side if desired)
    return new Response(csvText, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv'
      }
    });
  } catch (e: any) {
    throw error(500, e.message);
  }
};
