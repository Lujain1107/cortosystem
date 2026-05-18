/* Corto Lab Café — English prototype (localStorage). Demo-only passwords. */
(function () {
  "use strict";

  if (!Array.prototype.find) {
    Array.prototype.find = function (fn, thisArg) {
      for (var i = 0; i < this.length; i++) {
        if (fn.call(thisArg != null ? thisArg : this, this[i], i, this)) return this[i];
      }
      return undefined;
    };
  }

  if (typeof NodeList !== "undefined" && NodeList.prototype && !NodeList.prototype.forEach) {
    NodeList.prototype.forEach = Array.prototype.forEach;
  }

  var STORAGE_KEY = "cortoLabCafeApp_v1";
  var ANNOUNCE_KEY = "cortoLabCafeAnnounce_en_v1";

  function uid() {
    return "id_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  function esc(s) {
    return String(s != null ? s : "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function money(n) {
    return "EGP " + (Math.round(Number(n) * 100) / 100).toFixed(2);
  }

  function simpleHash(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return String(h >>> 0);
  }

  function toast(msg, isErr) {
    var stack = document.getElementById("toastStack");
    if (!stack) return;
    var el = document.createElement("div");
    el.className = "toast" + (isErr ? " err" : "");
    el.textContent = msg;
    stack.appendChild(el);
    setTimeout(function () {
      el.remove();
    }, 3200);
  }

  function defaultMenuItems() {
    return [
      { id: "m1", name: "Corto Lab Green Latte", description: "Matcha, vanilla, oat milk", price: 45, category: "Drinks", available: true, type: "menu" },
      { id: "m2", name: "Smoked Cortado", description: "Short espresso, light smoke note", price: 38, category: "Drinks", available: true, type: "menu" },
      { id: "m3", name: "Midnight Mocha", description: "Dark cocoa + cream", price: 42, category: "Drinks", available: true, type: "menu" },
      { id: "m4", name: "Cold Brew Mint", description: "Slow cold brew, fresh mint", price: 36, category: "Drinks", available: true, type: "menu" },
      { id: "m5", name: "Flat White", description: "Double ristretto, silky microfoam", price: 40, category: "Drinks", available: true, type: "menu" },
      { id: "f1", name: "Truffle Grilled Cheese", description: "Sourdough, aged cheddar, truffle butter", price: 95, category: "Food", available: true, type: "menu" },
      { id: "f2", name: "Lab Salad Bowl", description: "Quinoa, avocado, citrus dressing", price: 88, category: "Food", available: true, type: "menu" },
      { id: "f3", name: "Basil Pesto Pasta", description: "House pesto, pine nuts", price: 110, category: "Food", available: true, type: "menu" },
      { id: "s1", name: "Extra Espresso Shot", description: "Add-on", price: 15, category: "Services", available: true, type: "service" },
      { id: "s2", name: "Laptop Lock Rental", description: "4 hours", price: 20, category: "Services", available: true, type: "service" },
    ];
  }

  function defaultGames() {
    return [
      { id: "g1", name: "Catan", available: true },
      { id: "g2", name: "Codenames", available: true },
      { id: "g3", name: "Switch + Mario Kart", available: true },
    ];
  }

  function defaultEvents() {
    return [
      { id: "e_movie", title: "Movie Night — Green Hour", type: "movie_night", date: "2026-05-23", seatsTotal: 24, seatsLeft: 14 },
      { id: "e_match", title: "Live Match — Finals Night", type: "match", date: "2026-05-24", tablesTotal: 10, tablesLeft: 4 },
      { id: "e_canvas", title: "Canvas Painting Session", type: "canvas", date: "2026-05-25", seatsTotal: 12, seatsLeft: 5 },
    ];
  }

  function defaultPromos() {
    return [
      { code: "SAVE10", percent: 10, expires: "2099-12-31" },
      { code: "WELCOME5", percent: 5, expires: "2099-12-31" },
    ];
  }

  function emptyState() {
    return {
      users: [
        {
          id: "u_admin",
          email: "admin@corto.cafe",
          passwordHash: simpleHash("admin123"),
          name: "Lab Admin",
          role: "admin",
        },
        {
          id: "u_staff",
          email: "staff@corto.cafe",
          passwordHash: simpleHash("staff123"),
          name: "Nour Staff",
          role: "staff",
        },
        {
          id: "u_demo",
          email: "customer@demo.com",
          passwordHash: simpleHash("demo123"),
          name: "Demo Customer",
          role: "customer",
        },
      ],
      sessionUserId: null,
      guestCart: [],
      carts: {},
      wishlists: {},
      menuItems: defaultMenuItems(),
      games: defaultGames(),
      gameSessions: [],
      events: defaultEvents(),
      orders: [],
      reservations: [],
      notifications: [],
      contacts: [],
      feedbacks: [],
      promos: defaultPromos(),
      donations: [],
      prayerCornerOccupied: false,
      prayerCornerBy: null,
      photoBoothSession: null,
      settings: { prayerNotifications: true },
    };
  }

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return emptyState();
      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed.menuItems) || !parsed.menuItems.length) parsed.menuItems = defaultMenuItems();
      if (!Array.isArray(parsed.games) || !parsed.games.length) parsed.games = defaultGames();
      if (!Array.isArray(parsed.events) || !parsed.events.length) parsed.events = defaultEvents();
      if (!Array.isArray(parsed.promos) || !parsed.promos.length) parsed.promos = defaultPromos();
      if (!Array.isArray(parsed.users)) parsed.users = emptyState().users;
      var hasAdmin = parsed.users.some(function (x) {
        return x.role === "admin";
      });
      if (!hasAdmin) {
        parsed.users.push({
          id: "u_admin",
          email: "admin@corto.cafe",
          passwordHash: simpleHash("admin123"),
          name: "Lab Admin",
          role: "admin",
        });
      }
      if (!parsed.carts || typeof parsed.carts !== "object" || Array.isArray(parsed.carts)) parsed.carts = {};
      if (!parsed.wishlists || typeof parsed.wishlists !== "object" || Array.isArray(parsed.wishlists)) parsed.wishlists = {};
      if (!Array.isArray(parsed.guestCart)) parsed.guestCart = [];
      if (!Array.isArray(parsed.orders)) parsed.orders = [];
      if (!Array.isArray(parsed.reservations)) parsed.reservations = [];
      if (!Array.isArray(parsed.notifications)) parsed.notifications = [];
      if (!Array.isArray(parsed.contacts)) parsed.contacts = [];
      if (!Array.isArray(parsed.feedbacks)) parsed.feedbacks = [];
      if (!Array.isArray(parsed.donations)) parsed.donations = [];
      if (parsed.prayerCornerOccupied === undefined) parsed.prayerCornerOccupied = false;
      if (!parsed.settings) parsed.settings = { prayerNotifications: true };
      if (!parsed.gameSessions) parsed.gameSessions = [];
      return parsed;
    } catch (e) {
      return emptyState();
    }
  }

  function saveState(s) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  }

  var state = loadState();

  function persist() {
    saveState(state);
    renderChrome();
  }

  function getUser() {
    if (!state.sessionUserId) return null;
    return state.users.find(function (u) {
      return u.id === state.sessionUserId;
    }) || null;
  }

  function isStaffOrAdmin(u) {
    return u && (u.role === "staff" || u.role === "admin");
  }

  function isAdmin(u) {
    return u && u.role === "admin";
  }

  function postLoginRedirect() {
    var u = getUser();
    if (!u) return "#/home";
    if (u.role === "admin") return "#/admin";
    if (u.role === "staff") return "#/staff";
    return "#/home";
  }

  function adminSetRole(userId, newRole) {
    var cur = getUser();
    if (!isAdmin(cur)) return;
    if (newRole !== "customer" && newRole !== "staff" && newRole !== "admin") return;
    var target = state.users.find(function (u) {
      return u.id === userId;
    });
    if (!target) return;
    if (target.id === cur.id && newRole !== "admin") {
      toast("You cannot remove your own admin role.", true);
      route();
      return;
    }
    target.role = newRole;
    persist();
    notify(target.id, "Your role was changed to " + newRole + ".");
    toast("Role updated.");
    route();
  }

  function notify(userId, text) {
    state.notifications.unshift({
      id: uid(),
      userId: userId || "all",
      text: text,
      read: false,
      ts: new Date().toISOString(),
    });
    persist();
  }

  function mergeGuestCartToUser(uidStr) {
    var g = state.guestCart || [];
    if (!g.length) return;
    state.carts[uidStr] = state.carts[uidStr] || [];
    g.forEach(function (line) {
      var ex = state.carts[uidStr].find(function (l) {
        return l.itemId === line.itemId;
      });
      if (ex) ex.qty += line.qty;
      else state.carts[uidStr].push({ itemId: line.itemId, qty: line.qty });
    });
    state.guestCart = [];
  }

  function getCartLines() {
    var u = getUser();
    if (u) return state.carts[u.id] || [];
    return state.guestCart || [];
  }

  function setCartLines(lines) {
    var u = getUser();
    if (u) state.carts[u.id] = lines;
    else state.guestCart = lines;
    persist();
  }

  function findItem(id) {
    return state.menuItems.find(function (m) {
      return m.id === id;
    });
  }

  function cartTotals(lines) {
    var sub = 0;
    lines.forEach(function (l) {
      var it = findItem(l.itemId);
      if (it && it.available) sub += it.price * l.qty;
    });
    return { subtotal: sub };
  }

 function addToCart(itemId) {
  var it = findItem(itemId);

  if (!it || !it.available) {
    toast("Item unavailable.", true);
    return;
  }

  var lines = getCartLines().slice();

  var ex = lines.find(function (l) {
    return l.itemId === itemId;
  });

  if (ex) ex.qty += 1;
  else lines.push({ itemId: itemId, qty: 1 });

  setCartLines(lines);

  fetch("controllers/cartcontroller.php?action=add", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "item_id=" + itemId + "&quantity=1"
  })
  .then(res => res.text())
  .then(data => {
    toast(data);
  });
}

  function setQty(itemId, qty) {
    var q = Math.max(0, parseInt(qty, 10) || 0);
    var lines = getCartLines()
      .map(function (l) {
        if (l.itemId !== itemId) return l;
        return { itemId: itemId, qty: q };
      })
      .filter(function (l) {
        return l.qty > 0;
      });
    setCartLines(lines);
  }

  function removeFromCart(itemId) {
    setCartLines(
      getCartLines().filter(function (l) {
        return l.itemId !== itemId;
      })
    );
    toast("Removed from cart.");
  }

  function wishlistIds() {
    var u = getUser();
    if (!u) return [];
    return state.wishlists[u.id] || [];
  }

  function toggleWishlist(itemId) {
    var u = getUser();
    if (!u) {
      toast("Log in to use wishlist.", true);
      return;
    }
    var w = state.wishlists[u.id] || [];
    var i = w.indexOf(itemId);
    if (i >= 0) w.splice(i, 1);
    else w.push(itemId);
    state.wishlists[u.id] = w;
    persist();
    toast(i >= 0 ? "Removed from wishlist." : "Saved to wishlist.");
    route();
  }

  async function login(email, password, portal) {

  try {

    const response = await fetch("controllers/authenticationcontroller.php?action=login", {

      method: "POST",

      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },

      body:
        "username=" + encodeURIComponent(email) +
        "&password=" + encodeURIComponent(password)

    });

    const result = await response.text();

    if (result.includes("success")) {

      toast("Signed in.");

      window.location.reload();

      return true;

    } else {

      toast(result, true);

      return false;
    }

  } catch (e) {

    toast("Login failed", true);

    return false;
  }
}

  function logout() {

  window.location.href =
    "controllers/authenticationcontroller.php?logout=true";
}

  async function register(name, email, password) {

  try {

    const response = await fetch("controllers/authenticationcontroller.php?action=register", {

      method: "POST",

      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },

      body:
        "name=" + encodeURIComponent(name) +
        "&username=" + encodeURIComponent(email) +
        "&email=" + encodeURIComponent(email) +
        "&password=" + encodeURIComponent(password)

    });

    const result = await response.text();

    if (result.includes("success")) {

      toast("Account created.");

      window.location.reload();

      return true;

    } else {

      toast(result, true);

      return false;
    }

  } catch (e) {

    toast("Register failed", true);

    return false;
  }
}

  function updateProfile(name) {
    var u = getUser();
    if (!u) return;
    u.name = name.trim();
    persist();
    toast("Profile updated.");
  }

  function updatePassword(current, next) {
    var u = getUser();
    if (!u) return;
    if (u.passwordHash !== simpleHash(current)) {
      toast("Current password incorrect.", true);
      return;
    }
    if (next.length < 6) {
      toast("New password too short.", true);
      return;
    }
    u.passwordHash = simpleHash(next);
    persist();
    toast("Password updated.");
  }

  function forgotMock(email) {
    toast("Demo: no email sent. Try customer@demo.com / demo123 · staff@corto.cafe / staff123 · admin@corto.cafe / admin123.");
  }

  function applyPromo(code, subtotal) {
    if (!code) return { discount: 0, msg: "" };
    var c = code.trim().toUpperCase();
    var p = state.promos.find(function (x) {
      return x.code === c;
    });
    if (!p) return { discount: 0, msg: "Invalid code." };
    if (new Date(p.expires) < new Date()) return { discount: 0, msg: "Expired code." };
    return { discount: (subtotal * p.percent) / 100, msg: "Applied " + p.percent + "% off." };
  }

  async function submitOrder(paymentMethod, promoCode, donationAmount) {

  try {

    const response = await fetch("checkout.php", {

      method: "POST",

      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },

      body:
        "payment_method=" + encodeURIComponent(paymentMethod) +
        "&promo_code=" + encodeURIComponent(promoCode || "") +
        "&donation=" + encodeURIComponent(donationAmount || 0)

    });

   const result = await response.json();

if (result.success) {

   if(paymentMethod === "visa"){
      window.location.href = result.iframe_url;
   }else{
      toast("Order placed successfully.");
      location.hash = "#/orders";
   }

}

  } catch (e) {

    toast("Checkout failed", true);

    return false;
  }
}

  function startGameSession(gameId) {
    var u = getUser();
    if (!u) {
      toast("Log in first.", true);
      return;
    }
    var g = state.games.find(function (x) {
      return x.id === gameId;
    });
    if (!g || !g.available) {
      toast("Game unavailable.", true);
      return;
    }
    g.available = false;
    state.gameSessions.push({ id: uid(), gameId: gameId, userId: u.id, startedAt: new Date().toISOString() });
    notify(u.id, g.name + " checked out — enjoy! Timer started (demo).");
    persist();
    toast("Game assigned.");
    route();
  }

  function endGameSession(sessionId) {
    var s = state.gameSessions.find(function (x) {
      return x.id === sessionId;
    });
    if (!s) return;
    var g = state.games.find(function (x) {
      return x.id === s.gameId;
    });
    if (g) g.available = true;
    state.gameSessions = state.gameSessions.filter(function (x) {
      return x.id !== sessionId;
    });
    notify(s.userId, (g && g.name) + " returned to shelf.");
    persist();
    toast("Game returned.");
    route();
  }

  function parseHash() {
    var h = (location.hash || "#/home").replace(/^#/, "");
    var parts = h.split("?");
    var path = parts[0] || "/home";
    if (path[0] !== "/") path = "/" + path;
    var q = {};
    if (parts[1]) {
      parts[1].split("&").forEach(function (pair) {
        var p = pair.split("=");
        q[decodeURIComponent(p[0] || "")] = decodeURIComponent(p[1] || "");
      });
    }
    return { path: path, query: q };
  }

  function renderChrome() {
    var u = getUser();
    var auth = document.getElementById("authNav");
    if (auth) {
      if (u) {
        var staffBtn = isStaffOrAdmin(u) ? '<a class="btn btn-sm btn-outline" href="#/staff" data-link>Staff</a>' : "";
        var adminBtn = isAdmin(u) ? '<a class="btn btn-sm btn-outline" href="#/admin" data-link>Admin</a>' : "";
        auth.innerHTML =
          adminBtn +
          staffBtn +
          '<a class="btn btn-sm btn-outline" href="#/account" data-link>' +
          esc(u.name) +
          '</a><button type="button" class="btn btn-sm btn-ghost" id="btnLogout">Logout</button>';
        var lo = document.getElementById("btnLogout");
        if (lo) lo.onclick = logout;
      } else {
        auth.innerHTML =
          '<a class="btn btn-sm btn-outline" href="#/portal" data-link>Sign in</a>' +
          '<a class="btn btn-sm btn-primary" href="#/register" data-link>Register</a>';
      }
    }
    var lines = getCartLines();
    var count = lines.reduce(function (a, l) {
      return a + l.qty;
    }, 0);
    var cc = document.getElementById("cartCount");
    if (cc) cc.textContent = String(count);

    var unread = state.notifications.filter(function (n) {
      return !n.read && (n.userId === "all" || (u && n.userId === u.id));
    }).length;
    var badge = document.getElementById("notifBadge");
    if (badge) {
      badge.hidden = unread === 0;
      badge.textContent = String(unread);
    }

    document.querySelectorAll(".nav a[data-link]").forEach(function (a) {
      var href = a.getAttribute("href") || "";
      var p = href.replace(/^#/, "").split("?")[0];
      var cur = (location.hash || "#/home").replace(/^#/, "").split("?")[0];
      if (cur === "") cur = "/home";
      a.classList.toggle("is-active", p === cur);
    });
  }

  function renderNotificationsList() {
    var u = getUser();
    var list = state.notifications.filter(function (n) {
      return n.userId === "all" || (u && n.userId === u.id);
    });
    var el = document.getElementById("notifList");
    if (!el) return;
    if (!list.length) {
      el.innerHTML = '<p class="page-lead" style="margin:0">No notifications yet.</p>';
      return;
    }
    el.innerHTML = list
      .slice(0, 40)
      .map(function (n) {
        return (
          '<div class="notif-item' +
          (n.read ? "" : " unread") +
          '">' +
          esc(n.text) +
          "<time>" +
          esc(new Date(n.ts).toLocaleString()) +
          "</time></div>"
        );
      })
      .join("");
  }

  /* ---------- Views ---------- */
  function viewHome() {
    var marqueeItems =
      "<span>Movie Night — Green Hour · Friday 8:30 PM · reserve front seats</span>" +
      "<span>New seasonal drinks — try the Smoked Cortado</span>" +
      "<span>Workspace tables — quiet slots 9 AM–6 PM</span>" +
      "<span>Canvas painting session · Sunday afternoon</span>" +
      "<span>Lo-fi study block · next Saturday</span>";
    return (
      '<section class="home-page">' +
      '<div class="home-hero">' +
      '<div class="home-hero-bg" aria-hidden="true"></div>' +
      '<div class="home-hero-inner">' +
      '<div class="home-hero-copy">' +
      '<p class="eyebrow">Corto Lab Café</p>' +
      '<h1 class="home-hero-title">Where your break becomes a scene.</h1>' +
      '<p class="home-hero-lead">Specialty coffee, movie nights, and tables built for focus — all in one calm, green-lit space.</p>' +
      '<div class="home-hero-cta">' +
      '<a class="btn btn-primary btn-lg" href="#/menu" data-link>Explore the menu</a>' +
      '<a class="btn btn-outline btn-lg" href="#/reservations" data-link>Book an experience</a>' +
      "</div></div>" +
      '<div class="home-hero-visual">' +
      '<div class="home-hero-collage">' +
      '<img class="home-img home-img-a" src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&amp;fit=crop&amp;w=640&amp;q=80" width="320" height="400" alt="Specialty coffee being poured" loading="eager" decoding="async"/>' +
      '<img class="home-img home-img-b" src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&amp;fit=crop&amp;w=640&amp;q=80" width="320" height="220" alt="Cinema seating and screen glow" loading="lazy" decoding="async"/>' +
      '<img class="home-img home-img-c" src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&amp;fit=crop&amp;w=640&amp;q=80" width="320" height="220" alt="Calm workspace with natural light" loading="lazy" decoding="async"/>' +
      "</div></div></div></div>" +
      '<div class="home-marquee-wrap" aria-label="Announcements">' +
      '<div class="home-marquee-track">' +
      marqueeItems +
      marqueeItems +
      "</div></div>" +
      '<div class="home-gallery">' +
      '<figure class="home-gallery-item"><img src="https://images.unsplash.com/photo-1447933601403-0c6688cb94f1?auto=format&amp;fit=crop&amp;w=900&amp;q=80" alt="Espresso cups on a tray" loading="lazy" decoding="async" width="600" height="400"/><figcaption>Drinks &amp; bites</figcaption></figure>' +
      '<figure class="home-gallery-item"><img src="https://images.unsplash.com/photo-1517604931442-7e0c8ed296a0?auto=format&amp;fit=crop&amp;w=900&amp;q=80" alt="People watching a screen in a dark room" loading="lazy" decoding="async" width="600" height="400"/><figcaption>Movie nights</figcaption></figure>' +
      '<figure class="home-gallery-item"><img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&amp;fit=crop&amp;w=900&amp;q=80" alt="Friends at a café table" loading="lazy" decoding="async" width="600" height="400"/><figcaption>Gather &amp; work</figcaption></figure>' +
      "</div>" +
      '<div class="home-quick grid grid-3">' +
      '<a class="card home-quick-card" href="#/menu" data-link><h3>Menu</h3><p>Drinks, food, and add-ons.</p></a>' +
      '<a class="card home-quick-card" href="#/reservations" data-link><h3>Reservations</h3><p>Seats, tables, workspace, events.</p></a>' +
      '<a class="card home-quick-card" href="#/amenities" data-link><h3>Amenities</h3><p>Games, booth, Wi‑Fi.</p></a>' +
      "</div>" +
      '<details class="home-details"><summary>Demo logins (for class discussion)</summary>' +
      '<p>Start from <a href="#/portal" data-link>Sign in</a> and choose <strong>Guest &amp; member</strong> or <strong>Café management</strong>. Accounts: customer <code>customer@demo.com</code> / <code>demo123</code> · staff <code>staff@corto.cafe</code> / <code>staff123</code> · admin <code>admin@corto.cafe</code> / <code>admin123</code>. More in <a href="#/help" data-link>Help</a>.</p>' +
      "</details>" +
      "</section>"
    );
  }

  function viewMenu(query) {
    var cat = (query.category || "").toLowerCase();
    var q = (query.q || "").toLowerCase();
    var items = state.menuItems.filter(function (m) {
      var okCat = !cat || m.category.toLowerCase() === cat;
      var okQ =
        !q ||
        m.name.toLowerCase().indexOf(q) >= 0 ||
        m.description.toLowerCase().indexOf(q) >= 0 ||
        m.category.toLowerCase().indexOf(q) >= 0;
      return okCat && okQ;
    });
    var cats = ["All", "Drinks", "Food", "Services"];
    var tabs = cats
      .map(function (c) {
        var href = c === "All" ? "#/menu" : "#/menu?category=" + encodeURIComponent(c);
        var active = (c === "All" && !cat) || (c !== "All" && c.toLowerCase() === cat);
        return '<a class="tab' + (active ? " is-active" : "") + '" href="' + href + '" data-link>' + esc(c) + "</a>";
      })
      .join("");
    var rows = items
      .map(function (m) {
        var wl = wishlistIds().indexOf(m.id) >= 0;
        return (
          '<div class="menu-row">' +
          "<div><h4>" +
          esc(m.name) +
          "</h4><p class=\"desc\">" +
          esc(m.description) +
          "</p><span class=\"chip\">" +
          esc(m.category) +
          "</span> " +
          (m.available ? '<span class="chip ok">Available</span>' : '<span class="chip badge-off">Unavailable</span>') +
          "</div>" +
          '<div class="price">' +
          money(m.price) +
          "</div>" +
          '<div class="row-actions">' +
          '<button type="button" class="btn btn-sm btn-outline" data-wish="' +
          esc(m.id) +
          '">' +
          (wl ? "♥" : "♡") +
          "</button>" +
          '<button type="button" class="btn btn-sm btn-primary" data-add="' +
          esc(m.id) +
          '"' +
          (m.available ? "" : " disabled") +
          ">Add</button></div></div>"
        );
      })
      .join("");
    return (
      "<section><h1 class=\"page-title\">Menu</h1><p class=\"page-lead\">Browse items with availability. Add to cart or wishlist (wishlist requires login).</p>" +
      '<div class="toolbar"><div class="tabs">' +
      tabs +
      '</div><form class="field-row" data-search-menu style="flex:1;min-width:200px">' +
      '<input class="input" name="q" placeholder="Search menu…" value="' +
      esc(query.q || "") +
      '"/>' +
      '<button class="btn btn-outline" type="submit">Search</button></form></div>' +
      '<div class="menu-list">' +
      (rows || '<p class="page-lead">No items match.</p>') +
      "</div></section>"
    );
  }

  function viewSearch(query) {
    var q = (query.q || "").toLowerCase();
    var mi = state.menuItems.filter(function (m) {
      return !q || m.name.toLowerCase().indexOf(q) >= 0 || m.description.toLowerCase().indexOf(q) >= 0;
    });
    var ev = state.events.filter(function (e) {
      return !q || e.title.toLowerCase().indexOf(q) >= 0;
    });
    var menuBlock =
      "<h3>Menu & services</h3><div class=\"menu-list\">" +
      (mi.length
        ? mi
            .map(function (m) {
              return (
                '<div class="menu-row"><div><h4>' +
                esc(m.name) +
                "</h4><p class=\"desc\">" +
                esc(m.description) +
                "</p><span class=\"chip\">" +
                esc(m.category) +
                "</span></div><div class=\"price\">" +
                money(m.price) +
                '</div><div class="row-actions"><button type="button" class="btn btn-sm btn-primary" data-add="' +
                esc(m.id) +
                '"' +
                (m.available ? "" : " disabled") +
                '>Add</button> <a class="btn btn-sm btn-outline" href="#/menu?q=' +
                encodeURIComponent(m.name) +
                '" data-link>Menu</a></div></div>'
              );
            })
            .join("")
        : "<p class=\"page-lead\">No menu or service hits.</p>") +
      "</div>";
    var evBlock =
      "<h3>Events</h3>" +
      (ev.length
        ? ev
            .map(function (e) {
              return (
                '<div class="card"><strong>' +
                esc(e.title) +
                "</strong><p class=\"page-lead\">" +
                esc(e.date) +
                " · " +
                esc(e.type) +
                ' · <a href="#/reservations" data-link>Reserve</a></p></div>'
              );
            })
            .join("")
        : "<p class=\"page-lead\">No event hits.</p>");
    return (
      '<section><h1 class="page-title">Search</h1><p class="page-lead">Search menu items, services, and scheduled events.</p>' +
      '<form class="toolbar" data-search-global><input class="input" name="q" placeholder="Keywords…" value="' +
      esc(query.q || "") +
      '"/><button class="btn btn-primary" type="submit">Search</button></form>' +
      '<div class="split"><div>' +
      menuBlock +
      '</div><div>' +
      evBlock +
      "</div></div></section>"
    );
  }


  function viewCart() {
    var lines = getCartLines();
    var body = lines
      .map(function (l) {
        var it = findItem(l.itemId);
        if (!it) return "";
        return (
          '<tr><td>' +
          esc(it.name) +
          "</td><td>" +
          money(it.price) +
          "</td><td><div class=\"qty\"><button type=\"button\" data-dec=\"" +
          esc(it.id) +
          "\">−</button><span>" +
          l.qty +
          "</span><button type=\"button\" data-inc=\"" +
          esc(it.id) +
          "\">+</button></div></td><td>" +
          money(it.price * l.qty) +
          '</td><td><button type="button" class="btn btn-sm btn-danger" data-remove="' +
          esc(it.id) +
          '">Remove</button></td></tr>'
        );
      })
      .join("");
    var t = cartTotals(lines);
    return (
      '<section><h1 class="page-title">Cart</h1>' +
      (lines.length
        ? '<div class="table-wrap"><table class="data"><thead><tr><th>Item</th><th>Price</th><th>Qty</th><th>Line</th><th></th></tr></thead><tbody>' +
          body +
          "</tbody></table></div>" +
          '<p><strong>Subtotal:</strong> ' +
          money(t.subtotal) +
          '</p><a class="btn btn-primary" href="#/checkout" data-link>Checkout</a>'
        : '<p class="page-lead">Your cart is empty. <a href="#/menu" data-link>Browse menu</a></p>') +
      "</section>"
    );
  }

  function viewCheckout() {
    var u = getUser();
    if (!u)
      return (
        '<section><h1 class="page-title">Checkout</h1><p class="page-lead">Please <a href="#/login/user" data-link>sign in as a customer</a> to checkout.</p></section>'
      );
    var lines = getCartLines();
    if (!lines.length)
      return (
        '<section><h1 class="page-title">Checkout</h1><p class="page-lead">Cart is empty. <a href="#/menu" data-link>Add items</a>.</p></section>'
      );
    var t = cartTotals(lines);
    return (
      '<section><h1 class="page-title">Checkout</h1><p class="page-lead">Order summary, payment method, optional promo & donation.</p>' +
      '<div class="split"><div class="card"><h3>Summary</h3><ul style="padding-left:1.1rem;margin:0;color:var(--muted);font-size:0.9rem">' +
      lines
        .map(function (l) {
          var it = findItem(l.itemId);
          return it ? "<li>" + esc(it.name) + " × " + l.qty + " — " + money(it.price * l.qty) + "</li>" : "";
        })
        .join("") +
      "</ul><p><strong>Subtotal:</strong> " +
      money(t.subtotal) +
      "</p></div>" +
      '<div class="card"><form id="checkoutForm">' +
      '<div class="field"><label>Promo code</label><input class="input" name="promo" placeholder="SAVE10 / WELCOME5"/></div>' +
      '<div class="field"><label>Donation (optional)</label><input class="input" name="donation" type="number" min="0" step="1" placeholder="0"/></div>' +
      '<div class="field"><label>Payment method</label><select class="select" name="payment">' +
      '<option value="cash">Cash at counter</option>' +
      '<option value="visa">Visa (simulated)</option>' +
      "</select></div>" +
      '<button class="btn btn-primary btn-lg" type="submit">Pay & place order</button></form></div></div>' +
      '<p class="page-lead" style="margin-top:1rem">Simulated Visa always succeeds. Cash orders stay <em>pending</em> until staff confirms.</p></section>'
    );
  }


  function viewWishlist() {
    var u = getUser();
    if (!u)
      return (
        '<section><h1 class="page-title">Wishlist</h1><p class="page-lead"><a href="#/login/user" data-link>Customer sign-in</a> required.</p></section>'
      );
    var ids = wishlistIds();
    var items = ids.map(findItem).filter(Boolean);
    var rows = items
      .map(function (m) {
        return (
          '<div class="menu-row"><div><h4>' +
          esc(m.name) +
          "</h4><p class=\"desc\">" +
          esc(m.description) +
          "</p></div><div class=\"price\">" +
          money(m.price) +
          '</div><div class="row-actions"><button type="button" class="btn btn-sm btn-primary" data-add="' +
          esc(m.id) +
          "\">Add to cart</button> <button type=\"button\" class=\"btn btn-sm btn-outline\" data-wish=\"" +
          esc(m.id) +
          '">Remove</button></div></div>'
        );
      })
      .join("");
    return (
      '<section><h1 class="page-title">Wishlist</h1>' +
      (rows || '<p class="page-lead">No saved items. Add hearts from the menu.</p>') +
      "</section>"
    );
  }

  function viewReservations() {
    var u = getUser();
    var mine = state.reservations
      .filter(function (r) {
        return u && r.userId === u.id;
      })
      .map(function (r) {
        return (
          '<div class="card"><strong>' +
          esc(r.type.replace(/_/g, " ")) +
          "</strong><p class=\"page-lead\">" +
          esc(r.note || "") +
          " · " +
          esc(r.slot || r.date || "") +
          "</p></div>"
        );
      })
      .join("");
    var movie = state.events.find(function (e) {
      return e.type === "movie_night";
    });
    var match = state.events.find(function (e) {
      return e.type === "match";
    });
    var canvas = state.events.find(function (e) {
      return e.type === "canvas";
    });
    return (
      '<section><h1 class="page-title">Reservations</h1><p class="page-lead">Movie night seats, match tables, workspace slots, canvas sessions, café tables, and prayer corner.</p>' +
      (u ? "" : '<div class="alert">Login to create reservations.</div>') +
      '<div class="split"><div class="grid">' +
      '<div class="card"><h3>Movie night seats</h3><p class="page-lead">' +
      (movie ? esc(movie.title) + " — " + movie.seatsLeft + " seats left." : "No event.") +
      '</p><form data-res="movie_night"' +
      (u && movie ? "" : " data-blocked=\"1\"") +
      ">" +
      '<input type="hidden" name="eventId" value="' +
      (movie ? esc(movie.id) : "") +
      '"/>' +
      '<div class="field"><label>Seats</label><input class="input" name="seats" type="number" min="1" max="8" value="2"/></div>' +
      '<div class="field"><label>Note</label><input class="input" name="note" placeholder="Optional"/></div>' +
      '<button class="btn btn-primary" type="submit"' +
      (u && movie ? "" : " disabled") +
      ">Reserve</button></form></div>" +
      '<div class="card"><h3>Live match — table</h3><p class="page-lead">' +
      (match ? esc(match.title) + " — " + match.tablesLeft + " tables left." : "") +
      '</p><form data-res="match"' +
      (u && match ? "" : " data-blocked=\"1\"") +
      ">" +
      '<input type="hidden" name="eventId" value="' +
      (match ? esc(match.id) : "") +
      '"/>' +
      '<div class="field"><label>Tables</label><input class="input" name="tables" type="number" min="1" max="3" value="1"/></div>' +
      '<div class="field"><label>Note</label><input class="input" name="note"/></div>' +
      '<button class="btn btn-primary" type="submit"' +
      (u && match ? "" : " disabled") +
      ">Reserve</button></form></div>" +
      '<div class="card"><h3>Workspace table</h3><form data-res="workspace"' +
      (u ? "" : " data-blocked=\"1\"") +
      '><div class="field"><label>Date</label><input class="input" name="date" type="date" required/></div>' +
      '<div class="field"><label>Time slot</label><select class="select" name="slot"><option>09:00–12:00</option><option>12:00–15:00</option><option>15:00–18:00</option></select></div>' +
      '<div class="field"><label>Note</label><input class="input" name="note"/></div>' +
      '<button class="btn btn-primary" type="submit"' +
      (u ? "" : " disabled") +
      ">Reserve</button></form></div>" +
      '<div class="card"><h3>Canvas session</h3><p class="page-lead">' +
      (canvas ? esc(canvas.title) + " — seats left: " + canvas.seatsLeft : "") +
      '</p><form data-res="canvas"' +
      (u && canvas ? "" : " data-blocked=\"1\"") +
      ">" +
      '<input type="hidden" name="eventId" value="' +
      (canvas ? esc(canvas.id) : "") +
      '"/>' +
      '<div class="field"><label>Seats</label><input class="input" name="seats" type="number" min="1" max="4" value="1"/></div>' +
      '<button class="btn btn-primary" type="submit"' +
      (u && canvas ? "" : " disabled") +
      ">Reserve</button></form></div>" +
      '<div class="card"><h3>Café table (dining)</h3><form data-res="cafe_table"' +
      (u ? "" : " data-blocked=\"1\"") +
      '><div class="field"><label>Date</label><input class="input" name="date" type="date" required/></div>' +
      '<div class="field"><label>Guests</label><input class="input" name="guests" type="number" min="1" max="8" value="2"/></div>' +
      '<button class="btn btn-primary" type="submit"' +
      (u ? "" : " disabled") +
      ">Reserve</button></form></div>" +
      '<div class="card"><h3>Prayer corner</h3><p class="page-lead">Status: ' +
      (state.prayerCornerOccupied ? "Occupied" : "Available") +
      "</p>" +
      (u
        ? state.prayerCornerOccupied && state.prayerCornerBy !== u.id
          ? "<p>In use by another guest (demo).</p>"
          : state.prayerCornerOccupied && state.prayerCornerBy === u.id
          ? '<button type="button" class="btn btn-outline" id="prayerRelease">Release</button>'
          : '<button type="button" class="btn btn-primary" id="prayerUse">Use now</button>'
        : "<p>Login required.</p>") +
      "</div></div>" +
      '<div class="card" style="margin-top:1rem"><h3>Your reservations</h3>' +
      (mine || "<p class=\"page-lead\">None yet.</p>") +
      "</div></div></section>"
    );
  }
  /////////////
  function viewAmenities() {
    var booth = state.photoBoothSession;
    return (
      '<section><h1 class="page-title">Amenities</h1><p class="page-lead">Games, consoles (demo inventory), photo booth flow, and Wi‑Fi.</p>' +
      '<div class="grid grid-2">' +
      '<div class="card"><h3>Games & consoles</h3><ul style="margin:0;padding-left:1.1rem;color:var(--muted)">' +
      state.games
        .map(function (g) {
          return (
            "<li>" +
            esc(g.name) +
            " — " +
            (g.available ? "available" : "in use") +
            (g.available ? ' <button type="button" class="btn btn-sm btn-primary" data-game="' + esc(g.id) + '">Request</button>' : "") +
            "</li>"
          );
        })
        .join("") +
      "</ul>" +
      '<p class="page-lead">Active sessions (staff can return):</p><ul style="margin:0;padding-left:1.1rem">' +
      state.gameSessions
        .map(function (s) {
          var g = state.games.find(function (x) {
            return x.id === s.gameId;
          });
          return (
            "<li>" +
            esc((g && g.name) || s.gameId) +
            ' <button type="button" class="btn btn-sm btn-outline" data-endgame="' +
            esc(s.id) +
            '">Return (demo)</button></li>'
          );
        })
        .join("") +
      (state.gameSessions.length ? "" : '<li class="page-lead" style="list-style:none;padding:0">None</li>') +
      "</ul></div>" +
      '<div class="card"><h3>Photo booth</h3><p class="page-lead">' +
      (booth ? "Session active since " + esc(new Date(booth.startedAt).toLocaleTimeString()) : "Idle.") +
      '</p><div class="row-actions">' +
      '<button type="button" class="btn btn-sm btn-primary" id="boothStart"' +
      (booth ? " disabled" : "") +
      ">Start session</button> " +
      '<button type="button" class="btn btn-sm btn-outline" id="boothPrint"' +
      (!booth ? " disabled" : "") +
      ">Print last capture (mock)</button></div></div></div>" +
      '<p class="page-lead"><a href="#/wifi" data-link>Wi‑Fi information →</a></p></section>'
    );
  }

  function viewWifi() {
    return (
      '<section><h1 class="page-title">Wi‑Fi access</h1><div class="card"><h3>Guest network</h3><p><strong>SSID:</strong> CortoLab_Guest</p><p><strong>Password:</strong> corto2026!</p>' +
      '<p class="page-lead">Captive portal / RADIUS integration is out of scope for this static demo.</p>' +
      '<button type="button" class="btn btn-outline" id="wifiDemo">Simulate successful connection</button></div></section>'
    );
  }

  function viewPortal() {
    var u = getUser();
    if (u) {
      var roleLabel = u.role === "customer" ? "Guest / member" : u.role === "staff" ? "Staff" : "Administrator";
      return (
        '<section class="portal-page">' +
        '<h1 class="page-title">You are already signed in</h1>' +
        '<p class="page-lead">Signed in as <strong>' +
        esc(u.name) +
        "</strong> (" +
        esc(roleLabel) +
        ").</p>" +
        '<div class="field-row">' +
        '<a class="btn btn-primary" href="#/home" data-link>Go to home</a>' +
        (isStaffOrAdmin(u) ? '<a class="btn btn-outline" href="#/staff" data-link>Staff desk</a>' : "") +
        (isAdmin(u) ? '<a class="btn btn-outline" href="#/admin" data-link>Admin panel</a>' : "") +
        '<button type="button" class="btn btn-ghost" id="portalLogout">Sign out</button>' +
        "</div></section>"
      );
    }
    return (
      '<section class="portal-page">' +
      '<p class="eyebrow">Corto Lab Café</p>' +
      '<h1 class="page-title">Choose your sign-in</h1>' +
      '<p class="page-lead">Two separate doors: one for guests and members who order and book, and one for people who run the café (staff or admin).</p>' +
      '<div class="portal-grid">' +
      '<a class="portal-card portal-card-customer" href="#/login/user" data-link>' +
      '<span class="portal-card-icon" aria-hidden="true">☕</span>' +
      "<h2>Guest &amp; member</h2>" +
      "<p>Order from the menu, cart &amp; checkout, wishlist, reservations, and your account.</p>" +
      '<span class="portal-card-cta btn btn-primary btn-lg">Customer sign-in</span>' +
      '<span class="portal-card-note">New here? You can create an account on the next step.</span>' +
      "</a>" +
      '<a class="portal-card portal-card-staff" href="#/login/staff" data-link>' +
      '<span class="portal-card-icon" aria-hidden="true">◆</span>' +
      "<h2>Café management</h2>" +
      "<p>Staff desk (orders, cash, menu) and admin tools (users &amp; roles). Not for placing orders as a guest.</p>" +
      '<span class="portal-card-cta btn btn-outline btn-lg">Staff / Admin sign-in</span>' +
      '<span class="portal-card-note">No self-registration — accounts are issued by the lab.</span>' +
      "</a>" +
      "</div></section>"
    );
  }

  function viewLoginUser() {
    return (
      '<section class="login-gate">' +
      '<div class="login-gate-inner">' +
      '<div class="login-brand">' +
      '<p class="eyebrow">Guest &amp; member</p>' +
      "<h1 class=\"page-title\">Customer sign-in</h1>" +
      '<p class="page-lead">Only <strong>customer</strong> accounts sign in here. Ordering, wishlist, and bookings stay on this side of the app.</p>' +
      '<p class="login-hint">Need the staff or admin screen? <a class="link-btn" href="#/login/staff" data-link>Café management sign-in →</a></p>' +
      "</div>" +
      '<div class="card login-card">' +
      '<h2 class="login-card-title">Email &amp; password</h2>' +
      '<form id="loginUserForm">' +
      '<div class="field"><label for="loginUserEmail">Email</label><input id="loginUserEmail" class="input" name="email" type="email" autocomplete="username" required/></div>' +
      '<div class="field"><label for="loginUserPass">Password</label><input id="loginUserPass" class="input" name="password" type="password" autocomplete="current-password" required/></div>' +
      '<button class="btn btn-primary btn-lg" style="width:100%" type="submit">Sign in as customer</button>' +
      '<div class="login-card-foot">' +
      '<a class="link-btn" href="#/forgot" data-link>Forgot password</a>' +
      '<a class="link-btn" href="#/register" data-link>Create account</a>' +
      "</div></form>" +
      '<p class="login-hint" style="margin-top:1rem"><a href="#/portal" data-link>← Back to sign-in choice</a></p>' +
      "</div></div></section>"
    );
  }

  function viewLoginStaff() {
    return (
      '<section class="login-gate login-gate-staff">' +
      '<div class="login-gate-inner">' +
      '<div class="login-brand">' +
      '<p class="eyebrow">Café management</p>' +
      "<h1 class=\"page-title\">Staff / Admin sign-in</h1>" +
      '<p class="page-lead">Only <strong>staff</strong> and <strong>administrator</strong> accounts. After sign-in you will see the Staff desk and/or Admin panel — not the guest shopping flow.</p>' +
      '<p class="login-hint">Ordering as a guest? <a class="link-btn" href="#/login/user" data-link>Customer sign-in →</a></p>' +
      "</div>" +
      '<div class="card login-card login-card-staff">' +
      '<h2 class="login-card-title">Work account</h2>' +
      '<form id="loginStaffForm">' +
      '<div class="field"><label for="loginStaffEmail">Email</label><input id="loginStaffEmail" class="input" name="email" type="email" autocomplete="username" required/></div>' +
      '<div class="field"><label for="loginStaffPass">Password</label><input id="loginStaffPass" class="input" name="password" type="password" autocomplete="current-password" required/></div>' +
      '<button class="btn btn-primary btn-lg" style="width:100%" type="submit">Sign in to management</button>' +
      '<div class="login-card-foot">' +
      '<a class="link-btn" href="#/forgot" data-link>Forgot password (demo)</a>' +
      "</div></form>" +
      '<p class="login-hint" style="margin-top:1rem"><a href="#/portal" data-link>← Back to sign-in choice</a></p>' +
      "</div></div></section>"
    );
  }

  function viewRegister() {
    return (
      '<section><h1 class="page-title">Create customer account</h1>' +
      '<p class="page-lead">Registration is only for <strong>guests / members</strong>. Staff and admin accounts are not created here. <a href="#/login/staff" data-link>Management sign-in →</a></p>' +
      '<form id="regForm" class="card" style="max-width:420px">' +
      '<div class="field"><label>Name</label><input class="input" name="name" required/></div>' +
      '<div class="field"><label>Email</label><input class="input" name="email" type="email" required/></div>' +
      '<div class="field"><label>Password</label><input class="input" name="password" type="password" required minlength="6"/></div>' +
      '<button class="btn btn-primary" type="submit">Register</button></form>' +
      '<p class="page-lead" style="margin-top:1rem"><a href="#/portal" data-link>← Back to sign-in choice</a> · <a href="#/login/user" data-link>Already have an account?</a></p></section>'
    );
  }

  function viewForgot() {
    return (
      '<section><h1 class="page-title">Forgot password</h1><form id="forgotForm" class="card" style="max-width:420px">' +
      '<div class="field"><label>Email</label><input class="input" name="email" type="email" required/></div>' +
      '<button class="btn btn-primary" type="submit">Send reset link (demo)</button></form><p class="page-lead">No email is sent in this prototype.</p>' +
      '<p class="page-lead"><a href="#/login/user" data-link>← Customer sign-in</a> · <a href="#/login/staff" data-link>← Management sign-in</a> · <a href="#/portal" data-link>Choose portal</a></p></section>'
    );
  }

  function viewAccount() {
    var u = getUser();
    if (!u) return '<section><h1 class="page-title">Account</h1><p class="page-lead"><a href="#/login/user" data-link>Sign in</a> (customer) or <a href="#/portal" data-link>choose portal</a>.</p></section>';
    return (
      '<section><h1 class="page-title">Account</h1><div class="split">' +
      '<form id="profileForm" class="card"><h3>Profile</h3>' +
      '<div class="field"><label>Name</label><input class="input" name="name" value="' +
      esc(u.name) +
      '"/></div>' +
      '<div class="field"><label>Email</label><input class="input" value="' +
      esc(u.email) +
      '" disabled/></div>' +
      '<button class="btn btn-primary" type="submit">Save profile</button></form>' +
      '<form id="passForm" class="card"><h3>Change password</h3>' +
      '<div class="field"><label>Current</label><input class="input" name="current" type="password" required/></div>' +
      '<div class="field"><label>New</label><input class="input" name="next" type="password" required minlength="6"/></div>' +
      '<button class="btn btn-primary" type="submit">Update password</button></form>' +
      '</div><div class="card" style="margin-top:1rem"><h3>Preferences</h3><label><input type="checkbox" id="prayToggle"/> Prayer-time style notifications (demo)</label></div></section>'
    );
  }

function viewStaff() {
  var u = getUser();

  if (!isStaffOrAdmin(u))
    return (
      '<section><h1 class="page-title">Staff desk</h1><p class="page-lead">This area is for <strong>staff</strong> or <strong>admin</strong> accounts. <a href="#/login/staff" data-link>Management sign-in</a></p></section>'
    );

  var orders = state.orders
    .map(function (o) {
      var usr = state.users.find(function (x) {
        return x.id === o.userId;
      });

      return (
        "<tr><td>" +
        esc((usr && usr.email) || o.userId) +
        "</td><td>" +
        esc(o.paymentMethod) +
        "</td><td>" +
        esc(o.paymentStatus) +
        "</td><td>" +
        money(o.total) +
        "</td><td>" +
        (o.paymentMethod === "cash" && o.paymentStatus === "pending_cash"
          ? '<button type="button" class="btn btn-sm btn-primary" data-cash="' +
              esc(o.id) +
              '">Confirm cash</button>'
          : "—") +
        "</td></tr>"
      );
    })
    .join("");

  return (
    '<section><h1 class="page-title">Staff dashboard</h1><p class="page-lead">Daily operations: confirm cash, menu availability, contact inbox.' +
    (isAdmin(u)
      ? ' Admins: user management is on the <a href="#/admin" data-link>Admin</a> panel.</p>'
      : "</p>") +
    '<h3>Orders</h3><div class="table-wrap"><table class="data"><thead><tr><th>Customer</th><th>Method</th><th>Pay status</th><th>Total</th><th></th></tr></thead><tbody>' +
    (orders || "<tr><td colspan=\"5\">No orders</td></tr>") +
    "</tbody></table></div>" +
    "</section>"
  );
}

  function viewAdmin() {
    var u = getUser();
    if (!isAdmin(u)) {
      var staffNote =
        u && u.role === "staff"
          ? "<p class=\"page-lead\">You are signed in as <strong>staff</strong>. This panel is only for <strong>admin</strong> accounts — switch user or ask for an admin login.</p>"
          : "";
      return (
        '<section><h1 class="page-title">Administration</h1><p class="page-lead">This page is only for <strong>administrator</strong> accounts. Use <a href="#/login/staff" data-link>Management sign-in</a> with an admin email (see Help).</p>' +
        staffNote +
        '<p class="page-lead">Staff tools: <a href="#/staff" data-link>Staff desk</a> · <a href="#/portal" data-link>Choose sign-in</a></p></section>'
      );
    }
    var rows = state.users
      .map(function (usr) {
        return (
          "<tr><td>" +
          esc(usr.name) +
          "</td><td>" +
          esc(usr.email) +
          '</td><td><select class="select" data-admin-role="' +
          esc(usr.id) +
          '">' +
          ["customer", "staff", "admin"]
            .map(function (r) {
              return '<option value="' + r + '"' + (usr.role === r ? " selected" : "") + ">" + r + "</option>";
            })
            .join("") +
          "</select></td></tr>"
        );
      })
      .join("");
    return (
      '<section><h1 class="page-title">Administration</h1><p class="page-lead">Assign roles: <strong>customer</strong> (order &amp; book), <strong>staff</strong> (floor desk), <strong>admin</strong> (this panel + staff desk). You cannot remove your own admin role here.</p>' +
      '<p class="page-lead"><a class="btn btn-sm btn-outline" href="#/staff" data-link>Open Staff desk</a></p>' +
      '<h3>Users &amp; access</h3><div class="table-wrap"><table class="data"><thead><tr><th>Name</th><th>Email</th><th>Role</th></tr></thead><tbody>' +
      rows +
      "</tbody></table></div>" +
      '<h3>Active promo codes</h3><div class="table-wrap"><table class="data"><thead><tr><th>Code</th><th>Discount</th><th>Expires</th></tr></thead><tbody>' +
      state.promos
        .map(function (p) {
          return "<tr><td>" + esc(p.code) + "</td><td>" + esc(String(p.percent)) + "%</td><td>" + esc(p.expires) + "</td></tr>";
        })
        .join("") +
      "</tbody></table></div>" +
      "<h3>Latest feedback</h3>" +
      (state.feedbacks.length
        ? state.feedbacks
            .slice(0, 8)
            .map(function (f) {
              return '<div class="card"><strong>' + esc(String(f.rating)) + "★</strong><p class=\"page-lead\">" + esc(f.comment) + "</p></div>";
            })
            .join("")
        : '<p class="page-lead">No feedback yet.</p>') +
      "</section>"
    );
  }

  function viewHelp() {
    return (
      '<section><h1 class="page-title">Help & support</h1><div class="grid">' +
      '<div class="card"><h3>Roles &amp; access</h3><p><strong>Two sign-in doors</strong> — open <a href="#/portal" data-link>Sign in</a> and pick <em>Guest &amp; member</em> (customers) or <em>Café management</em> (staff/admin). Wrong door = login is rejected.</p><p><strong>Customer</strong> — menu, cart, checkout, wishlist, reservations. <strong>Staff</strong> — Staff desk. <strong>Admin</strong> — Admin panel + Staff desk.</p><p class="page-lead"><strong>Demo passwords:</strong><br/>Customer <code>customer@demo.com</code> / <code>demo123</code><br/>Staff <code>staff@corto.cafe</code> / <code>staff123</code><br/>Admin <code>admin@corto.cafe</code> / <code>admin123</code></p></div>' +
      '<div class="card"><h3>Placing orders</h3><p>Browse the menu, add items, open the cart, then checkout. Login is required for checkout.</p></div>' +
      '<div class="card"><h3>Payments</h3><p>Cash stays pending until staff confirms. Visa is simulated and always succeeds.</p></div>' +
      '<div class="card"><h3>Reservations</h3><p>Pick a flow, fill the form, and confirm. Capacity numbers update for movie/match/canvas demos.</p></div>' +
      "</div></section>"
    );
  }

  function viewContact() {
    return (
      '<section><h1 class="page-title">Contact us</h1><form id="contactForm" class="card" style="max-width:520px">' +
      '<div class="field"><label>Email</label><input class="input" name="email" type="email" required/></div>' +
      '<div class="field"><label>Message</label><textarea class="textarea" name="message" required></textarea></div>' +
      '<button class="btn btn-primary" type="submit">Send</button></form></section>'
    );
  }

  function viewFeedback() {
    return (
      '<section><h1 class="page-title">Feedback</h1><form id="feedbackForm" class="card" style="max-width:520px">' +
      '<div class="field"><label>Rating</label><div class="stars" id="starRow">' +
      [1, 2, 3, 4, 5]
        .map(function (n) {
          return '<button type="button" class="is-on" data-star="' + n + '">★</button>';
        })
        .join("") +
      '</div><input type="hidden" name="rating" id="ratingVal" value="5"/></div>' +
      '<div class="field"><label>Comment</label><textarea class="textarea" name="comment" required></textarea></div>' +
      '<button class="btn btn-primary" type="submit">Submit</button></form></section>'
    );
  }

  function route() {
    var p = parseHash();
    var path = p.path;
    var q = p.query;
    var app = document.getElementById("app");
    if (!app) return;

    var html = "";
    switch (path) {
      case "/home":
      case "/":
        html = viewHome();
        break;
      case "/menu":
        html = viewMenu(q);
        break;
      case "/search":
        html = viewSearch(q);
        break;
      case "/cart":
        html = viewCart();
        break;
      case "/checkout":
        html = viewCheckout();
        break;
      case "/wishlist":
        html = viewWishlist();
        break;
      case "/reservations":
        html = viewReservations();
        break;
      case "/amenities":
        html = viewAmenities();
        break;
      case "/wifi":
        html = viewWifi();
        break;
      case "/login":
      case "/portal":
        html = viewPortal();
        break;
      case "/login/user":
        html = viewLoginUser();
        break;
      case "/login/staff":
        html = viewLoginStaff();
        break;
      case "/register":
        html = viewRegister();
        break;
      case "/forgot":
        html = viewForgot();
        break;
      case "/account":
        html = viewAccount();
        break;
      case "/staff":
        html = viewStaff();
        break;
      case "/admin":
        html = viewAdmin();
        break;
      case "/help":
        html = viewHelp();
        break;
      case "/contact":
        html = viewContact();
        break;
      case "/feedback":
        html = viewFeedback();
        break;
      default:
        html = '<section><h1 class="page-title">Not found</h1><p class="page-lead"><a href="#/home" data-link>Home</a></p></section>';
    }
    app.innerHTML = html;
    bindPageEvents(path);
    renderChrome();
  }

  function bindPageEvents(path) {
    document.querySelectorAll("[data-link]").forEach(function (a) {
      a.addEventListener("click", function () {
        var nav = document.getElementById("mainNav");
        var t = document.getElementById("navToggle");
        if (nav) nav.classList.remove("is-open");
        if (t) t.setAttribute("aria-expanded", "false");
      });
    });

    var searchMenu = document.querySelector("[data-search-menu]");
    if (searchMenu) {
      searchMenu.onsubmit = function (e) {
        e.preventDefault();
        var fd = new FormData(searchMenu);
        var qq = fd.get("q") || "";
        location.hash = "#/menu?q=" + encodeURIComponent(String(qq));
        route();
      };
    }

    var searchG = document.querySelector("[data-search-global]");
    if (searchG) {
      searchG.onsubmit = function (e) {
        e.preventDefault();
        var fd = new FormData(searchG);
        location.hash = "#/search?q=" + encodeURIComponent(String(fd.get("q") || ""));
        route();
      };
    }

    document.querySelectorAll("[data-add]").forEach(function (btn) {
      btn.onclick = function () {
        addToCart(btn.getAttribute("data-add"));
        route();
      };
    });
    document.querySelectorAll("[data-wish]").forEach(function (btn) {
      btn.onclick = function () {
        toggleWishlist(btn.getAttribute("data-wish"));
      };
    });
    document.querySelectorAll("[data-remove]").forEach(function (btn) {
      btn.onclick = function () {
        removeFromCart(btn.getAttribute("data-remove"));
        route();
      };
    });
    document.querySelectorAll("[data-inc]").forEach(function (btn) {
      btn.onclick = function () {
        var id = btn.getAttribute("data-inc");
        var line = getCartLines().find(function (l) {
          return l.itemId === id;
        });
        if (line) setQty(id, line.qty + 1);
        route();
      };
    });
    document.querySelectorAll("[data-dec]").forEach(function (btn) {
      btn.onclick = function () {
        var id = btn.getAttribute("data-dec");
        var line = getCartLines().find(function (l) {
          return l.itemId === id;
        });
        if (line) setQty(id, line.qty - 1);
        route();
      };
    });

    var cf = document.getElementById("checkoutForm");
    if (cf) {
      cf.onsubmit = function (e) {
        e.preventDefault();
        var fd = new FormData(cf);
        submitOrder(String(fd.get("payment")), String(fd.get("promo") || ""), String(fd.get("donation") || "0"));
      };
    }

    var luf = document.getElementById("loginUserForm");
    if (luf) {
      luf.onsubmit = function (e) {
        e.preventDefault();
        var fd = new FormData(luf);
        if (login(String(fd.get("email")), String(fd.get("password")), "customer")) {
          location.hash = postLoginRedirect();
        }
        route();
      };
    }
    var lsf = document.getElementById("loginStaffForm");
    if (lsf) {
      lsf.onsubmit = function (e) {
        e.preventDefault();
        var fd = new FormData(lsf);
        if (login(String(fd.get("email")), String(fd.get("password")), "staff")) {
          location.hash = postLoginRedirect();
        }
        route();
      };
    }
    var plo = document.getElementById("portalLogout");
    if (plo) {
      plo.onclick = function () {
        logout();
      };
    }
    var rf = document.getElementById("regForm");
    if (rf) {
      rf.onsubmit = function (e) {
        e.preventDefault();
        var fd = new FormData(rf);
        if (register(String(fd.get("name")), String(fd.get("email")), String(fd.get("password")))) location.hash = "#/menu";
        route();
      };
    }
    var ff = document.getElementById("forgotForm");
    if (ff) {
      ff.onsubmit = function (e) {
        e.preventDefault();
        forgotMock(String(new FormData(ff).get("email")));
      };
    }
    var pf = document.getElementById("profileForm");
    if (pf) {
      pf.onsubmit = function (e) {
        e.preventDefault();
        updateProfile(String(new FormData(pf).get("name")));
        route();
      };
    }
    var pwf = document.getElementById("passForm");
    if (pwf) {
      pwf.onsubmit = function (e) {
        e.preventDefault();
        var fd = new FormData(pwf);
        updatePassword(String(fd.get("current")), String(fd.get("next")));
      };
    }
    var pt = document.getElementById("prayToggle");
    if (pt) {
      pt.checked = !!state.settings.prayerNotifications;
      pt.onchange = function () {
        state.settings.prayerNotifications = pt.checked;
        persist();
        toast("Preference saved.");
      };
    }

    document.querySelectorAll("[data-res]").forEach(function (form) {
      form.onsubmit = function (e) {
        e.preventDefault();
        if (form.getAttribute("data-blocked")) {
          toast("Login or event required.", true);
          return;
        }
        var type = form.getAttribute("data-res");
        var fd = new FormData(form);
        var payload = { type: type, note: String(fd.get("note") || "") };
        if (fd.get("eventId")) payload.eventId = String(fd.get("eventId"));
        if (fd.get("seats")) payload.seats = parseInt(String(fd.get("seats")), 10) || 1;
        if (fd.get("tables")) payload.tables = parseInt(String(fd.get("tables")), 10) || 1;
        if (fd.get("date")) payload.date = String(fd.get("date"));
        if (fd.get("slot")) payload.slot = String(fd.get("slot"));
        if (fd.get("guests")) payload.guests = parseInt(String(fd.get("guests")), 10) || 2;
        addReservation(payload);
      };
    });

    var pu = document.getElementById("prayerUse");
    if (pu) {
      pu.onclick = function () {
        var u = getUser();
        if (!u) return;
        state.prayerCornerOccupied = true;
        state.prayerCornerBy = u.id;
        notify(u.id, "Prayer corner marked in use.");
        persist();
        route();
      };
    }
    var pr = document.getElementById("prayerRelease");
    if (pr) {
      pr.onclick = function () {
        state.prayerCornerOccupied = false;
        state.prayerCornerBy = null;
        persist();
        route();
      };
    }

    document.querySelectorAll("[data-game]").forEach(function (b) {
      b.onclick = function () {
        startGameSession(b.getAttribute("data-game"));
      };
    });
    document.querySelectorAll("[data-endgame]").forEach(function (b) {
      b.onclick = function () {
        endGameSession(b.getAttribute("data-endgame"));
      };
    });

    var bs = document.getElementById("boothStart");
    if (bs) {
      bs.onclick = function () {
        var u = getUser();
        if (!u) {
          toast("Login to start booth session.", true);
          return;
        }
        state.photoBoothSession = { userId: u.id, startedAt: new Date().toISOString() };
        notify(u.id, "Photo booth session started (hardware mocked).");
        persist();
        route();
      };
    }
    var bp = document.getElementById("boothPrint");
    if (bp) {
      bp.onclick = function () {
        if (!state.photoBoothSession) return;
        notify(state.photoBoothSession.userId, "Print queued — please collect at booth (demo).");
        toast("Print queued.");
      };
    }

    var wf = document.getElementById("wifiDemo");
    if (wf) {
      wf.onclick = function () {
        toast("Connected (simulated).");
      };
    }

    document.querySelectorAll("[data-cash]").forEach(function (b) {
      b.onclick = function () {
        staffConfirmCash(b.getAttribute("data-cash"));
        route();
      };
    });
    document.querySelectorAll("[data-admin-role]").forEach(function (sel) {
      sel.onchange = function () {
        adminSetRole(sel.getAttribute("data-admin-role"), sel.value);
      };
    });
    document.querySelectorAll("[data-toggle]").forEach(function (b) {
      b.onclick = function () {
        toggleItemAvailability(b.getAttribute("data-toggle"));
      };
    });

    var ctf = document.getElementById("contactForm");
    if (ctf) {
      ctf.onsubmit = function (e) {
        e.preventDefault();
        var fd = new FormData(ctf);
        state.contacts.push({
          id: uid(),
          email: String(fd.get("email")),
          message: String(fd.get("message")),
          ts: new Date().toISOString(),
        });
        persist();
        toast("Message stored for staff.");
        ctf.reset();
      };
    }

    var fbf = document.getElementById("feedbackForm");
    if (fbf) {
      var stars = fbf.querySelectorAll("[data-star]");
      var rv = document.getElementById("ratingVal");
      stars.forEach(function (s) {
        s.onclick = function () {
          var n = parseInt(s.getAttribute("data-star"), 10);
          if (rv) rv.value = String(n);
          stars.forEach(function (x) {
            var nn = parseInt(x.getAttribute("data-star"), 10);
            x.classList.toggle("is-on", nn <= n);
          });
        };
      });
      fbf.onsubmit = function (e) {
        e.preventDefault();
        var fd = new FormData(fbf);
        state.feedbacks.push({
          id: uid(),
          rating: parseInt(String(fd.get("rating")), 10) || 5,
          comment: String(fd.get("comment")),
          ts: new Date().toISOString(),
        });
        persist();
        toast("Thanks for your feedback.");
        fbf.reset();
      };
    }
  }

  function setupAnnounce() {
    var slides = [
      { icon: "🎬", title: "Movie Night — Green Hour", body: "Reserve front-row workspace seats for the Friday screening + cortado flight." },
      { icon: "🎨", title: "Canvas sessions", body: "Small-group painting with guided prompts — book early, seats are limited." },
      { icon: "☕", title: "New seasonal drinks", body: "Try the Smoked Cortado and Midnight Mocha on the menu tab." },
    ];
    var bd = document.getElementById("announceBackdrop");
    var wrap = document.getElementById("announceCarousel");
    var dots = document.getElementById("announceDots");
    if (!bd || !wrap || !dots) return;

    try {
      if (sessionStorage.getItem(ANNOUNCE_KEY) === "1") {
        bd.hidden = true;
        return;
      }
    } catch (e) {}

    wrap.innerHTML = "";
    dots.innerHTML = "";
    slides.forEach(function (s, i) {
      var div = document.createElement("div");
      div.className = "announce-slide" + (i === 0 ? " is-active" : "");
      div.innerHTML = '<div class="as-icon">' + s.icon + "</div><h3>" + esc(s.title) + "</h3><p>" + esc(s.body) + "</p>";
      wrap.appendChild(div);
      var d = document.createElement("button");
      d.type = "button";
      d.setAttribute("aria-current", i === 0 ? "true" : "false");
      d.onclick = function () {
        showSlide(i);
      };
      dots.appendChild(d);
    });

    var idx = 0;
    var timer;

    function showSlide(i) {
      idx = i;
      var sl = wrap.querySelectorAll(".announce-slide");
      var ds = dots.querySelectorAll("button");
      sl.forEach(function (el, j) {
        el.classList.toggle("is-active", j === idx);
      });
      ds.forEach(function (el, j) {
        el.setAttribute("aria-current", j === idx ? "true" : "false");
      });
    }

    function next() {
      showSlide((idx + 1) % slides.length);
    }

    function close() {
      bd.hidden = true;
      try {
        sessionStorage.setItem(ANNOUNCE_KEY, "1");
      } catch (e) {}
      clearInterval(timer);
    }

    bd.hidden = false;
    timer = setInterval(next, 4800);
    var skipBtn = document.getElementById("announceSkip");
    var ctaBtn = document.getElementById("announceCta");
    if (skipBtn) skipBtn.onclick = close;
    if (ctaBtn) {
      ctaBtn.onclick = function () {
        close();
        location.hash = "#/menu";
        route();
      };
    }
    bd.addEventListener("click", function (e) {
      if (e.target === bd) close();
    });
  }

  function setupNavUi() {
    var nav = document.getElementById("mainNav");
    var toggle = document.getElementById("navToggle");
    if (toggle && nav) {
      toggle.onclick = function () {
        var open = nav.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      };
    }

    var nb = document.getElementById("notifBtn");
    var panel = document.getElementById("notifPanel");
    if (nb && panel) {
      nb.onclick = function () {
        var open = panel.hidden === false;
        panel.hidden = open;
        nb.setAttribute("aria-expanded", !open);
        if (!open) {
          state.notifications.forEach(function (n) {
            var u = getUser();
            if (n.userId === "all" || (u && n.userId === u.id)) n.read = true;
          });
          persist();
          renderNotificationsList();
        } else {
          renderNotificationsList();
        }
      };
    }
    var mar = document.getElementById("markAllRead");
    if (mar) {
      mar.onclick = function () {
        state.notifications.forEach(function (n) {
          n.read = true;
        });
        persist();
        renderNotificationsList();
        renderChrome();
      };
    }
  }

  window.addEventListener("hashchange", route);
  document.addEventListener("DOMContentLoaded", function () {
    try {
      if (!location.hash || location.hash === "#") location.hash = "#/home";
      setupAnnounce();
      setupNavUi();
      route();
    } catch (err) {
      var app = document.getElementById("app");
      var msg = err && err.message ? String(err.message) : String(err);
      if (app) {
        app.innerHTML =
          '<section class="card"><h1 class="page-title">Could not start the app</h1><p class="page-lead">' +
          esc(msg) +
          "</p><p class=\"page-lead\">Open <code>corto-lab-cafe/index.html</code> from this folder (not a copy elsewhere). Use an up-to-date Chrome or Edge. Press F12 → Console for details.</p></section>";
      }
      if (typeof console !== "undefined" && console.error) console.error(err);
    }
  });
})();
