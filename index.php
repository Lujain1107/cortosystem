<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Corto Lab Café — Management & Ordering</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap"
      rel="stylesheet"
    />
<link rel="stylesheet" href="assets/css/styles.css" />  </head>
  <body>
    <div class="grain" aria-hidden="true"></div>

    <div class="announce-backdrop" id="announceBackdrop" hidden>
      <div class="announce-modal" role="dialog" aria-modal="true" aria-labelledby="announceTitle">
        <div class="announce-glow"></div>
        <header class="announce-head">
          <span class="badge-live">Today at Corto</span>
          <h2 id="announceTitle">Welcome to Corto Lab Café</h2>
          <p class="announce-sub">Quick heads-up before you explore the app.</p>
        </header>
        <div class="announce-carousel" id="announceCarousel"></div>
        <div class="announce-dots" id="announceDots"></div>
        <footer class="announce-foot">
          <button type="button" class="btn btn-ghost" id="announceSkip">Skip</button>
          <button type="button" class="btn btn-primary" id="announceCta">Open menu</button>
        </footer>
      </div>
    </div>

    <header class="site-header">
      <a class="logo" href="#/home" data-link>
        <span class="logo-mark">CL</span>
        <span class="logo-text">Corto Lab Café</span>
      </a>
      <nav class="nav" id="mainNav">
        <a href="#/home" data-link>Home</a>
        <a href="#/menu" data-link>Menu</a>
        <a href="#/search" data-link>Search</a>
        <a href="#/reservations" data-link>Reservations</a>
        <a href="#/wishlist" data-link>Wishlist</a>
        <a href="#/orders" data-link>Orders</a>
        <a href="#/amenities" data-link>Amenities</a>
        <a href="#/help" data-link>Help</a>
      </nav>
      <div class="header-actions">
        <button type="button" class="icon-btn" id="notifBtn" title="Notifications" aria-expanded="false">
          <span class="icon-bell" aria-hidden="true"></span>
          <span class="notif-badge" id="notifBadge" hidden>0</span>
        </button>
        <a class="btn btn-sm btn-outline" href="#/cart" data-link>Cart <span id="cartCount">0</span></a>
        <span id="authNav"></span>
      </div>
      <button class="nav-toggle" id="navToggle" type="button" aria-label="Menu" aria-expanded="false">
        <span></span><span></span>
      </button>
    </header>

    <div class="notif-panel" id="notifPanel" hidden>
      <div class="notif-panel-head">
        <strong>Notifications</strong>
        <button type="button" class="link-btn" id="markAllRead">Mark all read</button>
      </div>
      <div class="notif-list" id="notifList"></div>
    </div>

    <main class="app-main" id="app">
      <p class="page-lead" style="padding: 2rem 0">
        Loading… If this message stays, open the folder
        <strong>corto-lab-cafe</strong> and double-click <strong>index.html</strong>, or press F12 → Console for errors.
        <code>app.js</code> must be in the same folder as this file.
      </p>
    </main>

    <noscript>
      <p style="padding: 1rem 4vw; color: #fecaca">Enable JavaScript to run Corto Lab Café.</p>
    </noscript>

    <footer class="site-footer">
      <div class="footer-inner">
        <div>
          <strong>Corto Lab Café</strong>
          <p>Prototype UI — data stored in this browser only (localStorage).</p>
        </div>
        <div class="footer-links">
          <a href="#/contact" data-link>Contact</a>
          <a href="#/feedback" data-link>Feedback</a>
          <a href="#/wifi" data-link>Wi‑Fi</a>
        </div>
      </div>
    </footer>

    <div class="toast-stack" id="toastStack" aria-live="polite"></div>
<script src="assets/js/app.js"></script>
  </body>
</html>
