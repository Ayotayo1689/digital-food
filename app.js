const products = [
  { id: "rice-5kg", name: "Mama Gold Parboiled Rice", category: "Rice & grains", size: "5 kg bag", price: 12900, oldPrice: 14500, tag: "SAVE ₦1,600", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=640&h=520&q=82" },
  { id: "noodles-carton", name: "Indomie Chicken Noodles", category: "Noodles & pasta", size: "Carton · 40 packs", price: 14800, tag: "WHOLESALE PICK", image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=640&h=520&q=82" },
  { id: "oil-3l", name: "Golden Terra Soya Oil", category: "Cooking essentials", size: "3 litre bottle", price: 12650, oldPrice: 13900, tag: "WEEKLY DEAL", image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=640&h=520&q=82" },
  { id: "tomato-400g", name: "Gino Tomato Paste", category: "Cooking essentials", size: "400 g tin", price: 1850, tag: "PANTRY FAVOURITE", image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=640&h=520&q=82" },
  { id: "spaghetti-500g", name: "Golden Penny Spaghetti", category: "Noodles & pasta", size: "500 g pack", price: 1200, oldPrice: 1400, tag: "SAVE ₦200", image: "https://images.unsplash.com/photo-1551462147-ff29053bfc14?auto=format&fit=crop&w=640&h=520&q=82" },
  { id: "juice-1l", name: "Chivita Active Juice", category: "Drinks", size: "1 litre carton", price: 2350, tag: "BUY MORE, SAVE MORE", image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=640&h=520&q=82" },
  { id: "biscuits", name: "Digestive Biscuits", category: "Snacks", size: "Family pack · 400 g", price: 1900, tag: "FAMILY SIZE", image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=640&h=520&q=82" },
  { id: "beans-5kg", name: "Honey Beans", category: "Rice & grains", size: "5 kg bag", price: 14200, tag: "MARKET FRESH", image: "https://images.unsplash.com/photo-1515543904379-3d757afe72e4?auto=format&fit=crop&w=640&h=520&q=82" },
];

const byId = (id) => document.getElementById(id);
const productGrid = byId("product-grid");
const cart = new Map();
const favoriteIds = new Set();
let activeCategory = "All products";
let dealsOnly = false;
let searchQuery = "";
let toastTimer;

const formatNaira = (amount) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(amount);

function showToast(message) {
  const toast = byId("toast");
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2500);
}

function productCardMarkup(product, index) {
  const favorite = favoriteIds.has(product.id);
  return `
    <article class="product-card" style="animation-delay:${index * 45}ms">
      <div class="product-image">
        <img src="${product.image}" alt="${product.name}" loading="lazy" />
        <span class="product-tag ${product.oldPrice ? "tag-deal" : ""}">${product.tag}</span>
        <button class="favorite-button${favorite ? " is-favorite" : ""}" type="button" aria-label="${favorite ? "Remove" : "Save"} ${product.name} ${favorite ? "from" : "to"} favourites" aria-pressed="${favorite}"><svg class="icon"><use href="#i-heart" /></svg></button>
      </div>
      <div class="product-info">
        <span class="product-category">${product.category}</span>
        <h3>${product.name}</h3>
        <span class="product-size">${product.size}</span>
        <div class="product-price-row">
          <span class="product-price">${formatNaira(product.price)}${product.oldPrice ? `<span class="product-old-price">${formatNaira(product.oldPrice)}</span>` : ""}</span>
          <button class="add-button" type="button" data-add="${product.id}"><svg class="icon"><use href="#i-plus" /></svg> Add</button>
        </div>
      </div>
    </article>
  `;
}

function renderProducts() {
  const visible = products.filter((product) => {
    const matchesCategory = activeCategory === "All products" || activeCategory === "Deals"
      ? activeCategory === "Deals" ? Boolean(product.oldPrice) : true
      : product.category === activeCategory;
    const matchesSearch = `${product.name} ${product.category} ${product.size}`.toLowerCase().includes(searchQuery);
    return matchesCategory && matchesSearch && (!dealsOnly || Boolean(product.oldPrice));
  });

  productGrid.innerHTML = visible.map(productCardMarkup).join("");
  byId("empty-state").hidden = visible.length > 0;
}

function renderSavedItems() {
  const saved = products.filter((product) => favoriteIds.has(product.id));
  byId("saved-grid").innerHTML = saved.map(productCardMarkup).join("");
  byId("saved-empty").hidden = saved.length > 0;
}

function updateCart() {
  const quantity = [...cart.values()].reduce((total, item) => total + item.quantity, 0);
  const subtotal = [...cart.values()].reduce((total, item) => total + item.product.price * item.quantity, 0);
  document.querySelectorAll(".cart-count").forEach((counter) => { counter.textContent = quantity; });
  document.querySelector(".drawer-item-count").textContent = `(${quantity})`;

  byId("cart-items").innerHTML = [...cart.values()].map(({ product, quantity: count }) => `
    <div class="cart-item">
      <img src="${product.image}" alt="" />
      <div><h3>${product.name}</h3><small>${product.size}</small><div class="cart-item-price">${formatNaira(product.price)}</div></div>
      <div class="quantity-control">
        <button type="button" aria-label="Remove one ${product.name}" data-quantity="${product.id}" data-change="-1"><svg class="icon"><use href="#i-minus" /></svg></button>
        <span>${count}</span>
        <button type="button" aria-label="Add one ${product.name}" data-quantity="${product.id}" data-change="1"><svg class="icon"><use href="#i-plus" /></svg></button>
      </div>
    </div>
  `).join("");

  byId("cart-empty").hidden = quantity > 0;
  byId("cart-summary").hidden = quantity === 0;
  byId("cart-subtotal").textContent = formatNaira(subtotal);
  const remaining = Math.max(0, 50000 - subtotal);
  byId("delivery-remaining").textContent = remaining === 0 ? "You've unlocked free delivery" : `${formatNaira(remaining)} away`;
  byId("delivery-progress").style.width = `${Math.min(100, subtotal / 50000 * 100)}%`;
  byId("delivery-fee").textContent = remaining === 0 ? "Free" : "Calculated at checkout";
}

function setCategory(category) {
  activeCategory = category;
  dealsOnly = category === "Deals";
  document.querySelectorAll(".nav-category").forEach((link) => {
    link.classList.toggle("active", link.dataset.category === category);
  });
  document.querySelectorAll(".category-card").forEach((card) => {
    card.classList.toggle("selected", card.dataset.category === category);
  });
  document.querySelectorAll(".product-filter").forEach((button) => {
    button.classList.toggle("active", button.dataset.filter === (dealsOnly ? "Deals" : "All products"));
  });
  renderProducts();
}

function openCart() {
  byId("cart-overlay").hidden = false;
  byId("cart-drawer").classList.add("is-open");
  byId("cart-drawer").setAttribute("aria-hidden", "false");
  document.body.classList.add("drawer-open");
}

function closeCart() {
  byId("cart-drawer").classList.remove("is-open");
  byId("cart-drawer").setAttribute("aria-hidden", "true");
  document.body.classList.remove("drawer-open");
  window.setTimeout(() => { byId("cart-overlay").hidden = true; }, 300);
}

function enterStore() {
  byId("public-site").hidden = true;
  byId("login-page").hidden = true;
  byId("store-page").hidden = false;
  switchAppScreen("shop");
  window.scrollTo({ top: 0, behavior: "smooth" });
  renderProducts();
}

function openLogin() {
  byId("public-site").hidden = true;
  byId("login-page").hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showPublicPage(page) {
  byId("public-site").hidden = false;
  byId("login-page").hidden = true;
  byId("store-page").hidden = true;
  byId("public-home").hidden = page !== "home";
  byId("public-delivery").hidden = page !== "delivery";
  document.querySelectorAll(".public-nav-link").forEach((link) => {
    link.classList.toggle("active", link.dataset.publicPage === page);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function switchAppScreen(screenId) {
  document.querySelectorAll(".app-screen").forEach((screen) => {
    screen.hidden = screen.id !== screenId;
  });
  byId("category-nav").hidden = screenId !== "shop";
  document.querySelectorAll(".app-tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.screen === screenId);
  });
  if (screenId === "saved-screen") renderSavedItems();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.querySelectorAll("[data-open-login]").forEach((button) => {
  button.addEventListener("click", openLogin);
});
document.querySelectorAll("[data-public-page]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    showPublicPage(link.dataset.publicPage);
  });
});
byId("public-home-link").addEventListener("click", (event) => {
  event.preventDefault();
  showPublicPage("home");
});
document.querySelectorAll(".login-page .brand").forEach((brandLink) => {
  brandLink.addEventListener("click", (event) => {
    event.preventDefault();
    showPublicPage("home");
  });
});

byId("login-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const email = new FormData(form).get("email").toString();
  const firstName = email.split("@")[0].split(/[._-]/)[0];
  const displayName = `${firstName.charAt(0).toUpperCase()}${firstName.slice(1)}`;
  document.querySelector(".account-greeting").innerHTML = `Hello, ${displayName}<small>My account</small>`;
  document.querySelectorAll(".account-avatar").forEach((avatar) => { avatar.textContent = firstName.slice(0, 2).toUpperCase(); });
  byId("profile-name").textContent = displayName;
  byId("profile-email").textContent = email;
  enterStore();
});
byId("guest-button").addEventListener("click", enterStore);
byId("password-toggle").addEventListener("click", (event) => {
  const input = byId("password");
  const visible = input.type === "password";
  input.type = visible ? "text" : "password";
  event.currentTarget.textContent = visible ? "Hide" : "Show";
  event.currentTarget.setAttribute("aria-label", visible ? "Hide password" : "Show password");
});
byId("forgot-link").addEventListener("click", (event) => {
  event.preventDefault();
  showToast("Password reset is available when your account is connected.");
});
byId("signup-link").addEventListener("click", (event) => {
  event.preventDefault();
  showToast("Account registration can be connected for your client demo.");
});
byId("login-form").addEventListener("input", () => { byId("login-error").textContent = ""; });

document.querySelectorAll(".nav-category").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    setCategory(link.dataset.category);
    byId("products-heading").scrollIntoView({ behavior: "smooth", block: "start" });
  });
});
document.querySelectorAll(".category-card").forEach((card) => {
  card.addEventListener("click", () => {
    setCategory(card.dataset.category);
    byId("products-heading").scrollIntoView({ behavior: "smooth", block: "start" });
  });
});
document.querySelectorAll(".product-filter").forEach((button) => {
  button.addEventListener("click", () => {
    activeCategory = "All products";
    dealsOnly = button.dataset.filter === "Deals";
    document.querySelectorAll(".nav-category").forEach((link) => link.classList.toggle("active", link.dataset.category === "All products"));
    document.querySelectorAll(".product-filter").forEach((filter) => filter.classList.toggle("active", filter === button));
    renderProducts();
  });
});
byId("search-form").addEventListener("submit", (event) => event.preventDefault());
byId("search-input").addEventListener("input", (event) => {
  searchQuery = event.currentTarget.value.trim().toLowerCase();
  renderProducts();
  byId("products").scrollIntoView({ behavior: "smooth", block: "start" });
});
document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    byId("search-input").focus();
  }
  if (event.key === "Escape") closeCart();
});
productGrid.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add]");
  const favoriteButton = event.target.closest(".favorite-button");
  if (addButton) {
    const product = products.find((item) => item.id === addButton.dataset.add);
    if (product) {
      const current = cart.get(product.id);
      cart.set(product.id, { product, quantity: (current?.quantity ?? 0) + 1 });
      updateCart();
      showToast(`${product.name} added to your basket`);
    }
  }
  if (favoriteButton) {
    const productCard = favoriteButton.closest(".product-card");
    const product = products.find((item) => item.name === productCard.querySelector("h3").textContent);
    if (product) {
      if (favoriteIds.has(product.id)) favoriteIds.delete(product.id);
      else favoriteIds.add(product.id);
      renderProducts();
      if (!byId("saved-screen").hidden) renderSavedItems();
    }
  }
});
byId("saved-grid").addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add]");
  const favoriteButton = event.target.closest(".favorite-button");
  if (addButton) {
    const product = products.find((item) => item.id === addButton.dataset.add);
    if (product) {
      const current = cart.get(product.id);
      cart.set(product.id, { product, quantity: (current?.quantity ?? 0) + 1 });
      updateCart();
      showToast(`${product.name} added to your basket`);
    }
  }
  if (favoriteButton) {
    const product = products.find((item) => item.name === favoriteButton.closest(".product-card").querySelector("h3").textContent);
    if (product) {
      favoriteIds.delete(product.id);
      renderSavedItems();
      renderProducts();
    }
  }
});
byId("cart-items").addEventListener("click", (event) => {
  const button = event.target.closest("[data-quantity]");
  if (!button) return;
  const item = cart.get(button.dataset.quantity);
  if (!item) return;
  item.quantity += Number(button.dataset.change);
  if (item.quantity <= 0) cart.delete(button.dataset.quantity);
  updateCart();
});
byId("cart-button").addEventListener("click", openCart);
byId("mobile-cart-button").addEventListener("click", openCart);
byId("close-cart").addEventListener("click", closeCart);
byId("cart-overlay").addEventListener("click", closeCart);
byId("empty-shop").addEventListener("click", closeCart);
byId("checkout-button").addEventListener("click", () => {
  showToast("Checkout is ready to connect to your preferred payment provider.");
});
byId("account-button").addEventListener("click", () => showToast("Your customer account is ready for the demo."));
document.querySelectorAll("[data-screen]").forEach((button) => {
  button.addEventListener("click", () => switchAppScreen(button.dataset.screen));
});
byId("home-link").addEventListener("click", (event) => {
  event.preventDefault();
  setCategory("All products");
  searchQuery = "";
  byId("search-input").value = "";
  switchAppScreen("shop");
});
byId("mobile-menu").addEventListener("click", () => {
  document.querySelector(".category-nav").scrollIntoView({ behavior: "smooth", block: "center" });
});
byId("next-products").addEventListener("click", () => {
  const controls = [...document.querySelectorAll(".product-filter")];
  const next = controls.find((button) => !button.classList.contains("active"));
  next?.click();
});
byId("show-all").addEventListener("click", (event) => {
  event.preventDefault();
  setCategory("All products");
  searchQuery = "";
  byId("search-input").value = "";
  byId("products-heading").scrollIntoView({ behavior: "smooth", block: "start" });
});
byId("whatsapp-button").addEventListener("click", () => {
  window.open("https://wa.me/?text=Hello%20Nupat%20Foods%2C%20I%20need%20a%20hand%20with%20my%20order.", "_blank", "noopener,noreferrer");
});
byId("account-help-button").addEventListener("click", () => {
  window.open("https://wa.me/?text=Hello%20Nupat%20Foods%2C%20I%20need%20a%20hand%20with%20my%20order.", "_blank", "noopener,noreferrer");
});
byId("signout-button").addEventListener("click", () => {
  byId("store-page").hidden = true;
  byId("login-form").reset();
  showPublicPage("home");
});

renderProducts();
updateCart();
