<script lang="ts">
  import { createClient } from '@supabase/supabase-js';
  import { onMount } from 'svelte';

  const supabaseUrl = 'https://bpptastxdrjeygalkpzh.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwcHRhc3R4ZHJqZXlnYWxrcHpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU0OTk5NDUsImV4cCI6MjA1MTA3NTk0NX0.9FZYbXPlzsgHLB5mCf82oSacxXGchBjupPYwtfZLagM';
  const supabase = createClient(supabaseUrl, supabaseKey);

  export let covidRows = [];
  export let errorMessage = '';

  onMount(async () => {
    try {
      let { data, error } = await supabase
        .from('covid19schwyz') // your table name
        .select('*'); // or list columns explicitly

      if (error) {
        throw error;
      }
      covidRows = data;
    } catch (err) {
      errorMessage = 'Error fetching data: ' + err.message;
    }
  });
</script>
