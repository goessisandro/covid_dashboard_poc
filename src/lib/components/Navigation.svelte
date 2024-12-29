<script lang="ts">
    let isOpen = false;
    let activeLink: string = "dashboard";

    function toggleMenu() {
        isOpen = !isOpen;
    }

    function setActive(link: string): void {
        activeLink = link;
        isOpen = false; // Close the menu on link click (for mobile)
    }
</script>

<style>
    /* General Navbar Styling */
    .navbar {
        background-color: #2F4356;
        position: sticky;
        top: 0;
        width: 100%;
        z-index: 1000;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 1rem;
        font-weight: 500;
    }

    .navbar ul {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        justify-content: space-around;
        align-items: center;
    }

    .navbar li {
        margin: 0 0.5rem;
    }

    .navbar a {
        color: white;
        text-decoration: none;
        padding: 1rem;
        display: block;
        transition: background-color 0.3s, color 0.3s;
    }

    .navbar a:hover,
    .navbar a:focus {
        background-color: rgba(255, 255, 255, 0.1);
        color: white;
    }

    .navbar a.active {
        border-bottom: 4px solid white;
        color: white;
    }

    /* Hamburger Menu Styling */
    .hamburger {
        display: none;
        cursor: pointer;
        flex-direction: column;
        gap: 5px;
    }

    .hamburger div {
        width: 25px;
        height: 3px;
        background-color: white;
        transition: transform 0.3s ease;
    }

    .hamburger.open div:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px);
    }

    .hamburger.open div:nth-child(2) {
        opacity: 0;
    }

    .hamburger.open div:nth-child(3) {
        transform: rotate(-45deg) translate(5px, -5px);
    }

    /* Logo Styling */
    .logo {
        height: 40px;
    }

    /* Mobile Menu Styling */
    @media (max-width: 768px) {
        .navbar ul {
            position: absolute;
            top: 100%;
            left: 0;
            width: 100%;
            background-color: rgba(47, 67, 86, 0.9); /* Semi-transparent background */
            flex-direction: column;
            align-items: center;
            gap: 1rem;
            padding: 1rem 0;
            display: none;
            animation: slideDown 0.3s ease;
        }

        .navbar ul.open {
            display: flex;
        }

        .hamburger {
            display: flex;
        }
    }

    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
</style>

<nav class="navbar" aria-label="Main Navigation">
    <!-- Logo -->
    <img src="/assets/ui-light-logo.png" alt="Logo" class="logo" />

    <!-- Hamburger Menu -->
<button
    class="hamburger {isOpen ? 'open' : ''}"
    on:click={toggleMenu}
    aria-expanded={isOpen}
    aria-controls="nav-menu"
    aria-label="Toggle navigation"
>
    <div></div>
    <div></div>
    <div></div>
</button>


    <!-- Navigation Links -->
    <ul id="nav-menu" class:open={isOpen}>
        <li>
            <a href="/" class={activeLink === "dashboard" ? "active" : ""} on:click={() => setActive("dashboard")}>
                Home
            </a>
        </li>
        <li>
            <a href="/aktuell" class={activeLink === "aktuell" ? "active" : ""} on:click={() => setActive("aktuell")}>
                Aktuell
            </a>
        </li>
        <li>
            <a href="/daten" class={activeLink === "daten" ? "active" : ""} on:click={() => setActive("daten")}>
                Daten
            </a>
        </li>
        <li>
            <a href="/feedback" class={activeLink === "feedback" ? "active" : ""} on:click={() => setActive("feedback")}>
                Feedback
            </a>
        </li>
        <li>
            <a href="/about" class={activeLink === "about" ? "active" : ""} on:click={() => setActive("about")}>
                About
            </a>
        </li>
    </ul>
</nav>
