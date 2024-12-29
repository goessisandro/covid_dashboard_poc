<script lang="ts">
    import { onMount } from 'svelte';
    import { createClient } from '@supabase/supabase-js';

    // Use your actual anon public key without "process.env."
    const supabaseUrl = 'https://bpptastxdrjeygalkpzh.supabase.co';
    const supabaseKey =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwcHRhc3R4ZHJqZXlnYWxrcHpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU0OTk5NDUsImV4cCI6MjA1MTA3NTk0NX0.9FZYbXPlzsgHLB5mCf82oSacxXGchBjupPYwtfZLagM';

    const supabase = createClient(supabaseUrl, supabaseKey);

    let name = '';
    let email = '';
    let message = '';
    let successMessage = '';
    let errorMessage = '';

    async function sendFeedback() {
        try {
            // Insert a row into the "feedback" table
            const { data, error } = await supabase
                .from('feedback')
                .insert([{ name, email, message }]);

            if (error) {
                console.error(error); // optional: log the actual error
                throw error;
            }

            successMessage = 'Thank you for your feedback!';
            name = '';
            email = '';
            message = '';
            errorMessage = ''; // clear any previous error
        } catch (err) {
            // Show a user-friendly message
            errorMessage = 'There was an error sending your feedback. Please try again later.';
        }
    }
</script>

<main class="page-background">
  <div class="feedback-container">
    <!-- LEFT: Title & text -->
    <div class="feedback-left">
      <h1>Feedback</h1>
      <p style="text-align: justify;">
        We value your feedback and want to ensure our dashboard and website meet your needs. 
        Whether you have feature requests, want to report bugs or data quality issues, or have 
        ideas for optimizations or new data sources, we’d love to hear from you. Please fill out 
        the form to share your thoughts, and help us continually improve your experience with 
        the Covid-19 Dashboard of Switzerland.
      </p>
      <p style="text-align: justify; margin-top: 1rem;">
        Thank you for reaching out—we truly appreciate hearing from you and look forward to your suggestions!
      </p>
    </div>

    <!-- RIGHT: The form -->
    <div class="feedback-right">
      {#if successMessage}
        <p class="success">{successMessage}</p>
      {/if}

      {#if errorMessage}
        <p class="error">{errorMessage}</p>
      {/if}

      <form on:submit|preventDefault={sendFeedback} class="feedback-form">
        <div class="form-group">
          <label for="name">Name</label>
          <input type="text" id="name" bind:value={name} required />
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" bind:value={email} required />
        </div>

        <div class="form-group">
          <label for="message">Message</label>
          <textarea id="message" bind:value={message} required></textarea>
        </div>

        <button type="submit">Send Feedback</button>
      </form>
    </div>
  </div>
</main>

<style>
  .page-background {
    background-color: #F0F4F7;
    padding: 2rem;
    font-family: Arial, sans-serif;
  }

  .feedback-container {
    display: flex;
    flex-wrap: wrap;
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .feedback-left,
  .feedback-right {
    background-color: #FFFFFF;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    flex: 1 1 300px;
  }

  .feedback-left h1 {
    font-size: 2rem;
    color: #2F4356;
    margin-bottom: 1rem;
  }

  .feedback-left p {
    line-height: 1.6;
    color: #333;
  }

  .feedback-form .form-group {
    margin-bottom: 1rem;
  }

  .feedback-form label {
    display: block;
    font-weight: bold;
    margin-bottom: 0.5rem;
  }

  .feedback-form input,
  .feedback-form textarea {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  .feedback-form textarea {
    height: 150px;
    resize: vertical;
  }

  button {
    background-color: #2F4356;
    color: #fff;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
  }

  button:hover {
    background-color: #1e2d3b;
  }

  .success {
    color: green;
    margin-bottom: 1rem;
  }

  .error {
    color: red;
    margin-bottom: 1rem;
  }

  @media (max-width: 768px) {
    .feedback-container {
      flex-direction: column;
      gap: 1rem;
    }
  }
</style>

