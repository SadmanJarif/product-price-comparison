/* Dealer Evaluation frontend — IBM Course 11 final project.
 *
 * API endpoints (updated for local deployment):
 *   Product Details microservice (Flask)  -> http://localhost:5000
 *   Dealer Pricing microservice (Node.js) -> http://localhost:3000
 * To point at deployed services instead, change the two constants
 * below to the deployed base URLs and redeploy this frontend.
 */
const PRODUCT_DETAILS_URL = "http://localhost:5000";
const DEALER_PRICING_URL = "http://localhost:3000";

const statusEl = document.getElementById("status");
const productsEl = document.getElementById("products");
const productDropdown = document.getElementById("product-dropdown");
const dealersSection = document.getElementById("dealers-section");
const dealersEl = document.getElementById("dealers");
const selectedProductNameEl = document.getElementById("selected-product-name");
const priceSection = document.getElementById("price-section");
const priceEl = document.getElementById("price");
const allPricesSection = document.getElementById("all-prices-section");
const allPricesEl = document.getElementById("all-prices");
const cheapestEl = document.getElementById("cheapest");

let products = [];
let dealers = [];
let selectedProduct = null;
let selectedDealer = null;

function setStatus(message, isError) {
  statusEl.textContent = message;
  statusEl.classList.toggle("error", Boolean(isError));
}

function money(n) {
  return "$" + Number(n).toLocaleString("en-US");
}

function syncUrl() {
  const params = new URLSearchParams();
  if (selectedProduct) params.set("product", selectedProduct.id);
  if (selectedDealer) params.set("dealer", selectedDealer.id);
  if (!allPricesSection.hidden) params.set("view", "all");
  const query = params.toString();
  history.replaceState(null, "", query ? "?" + query : location.pathname);
}

async function loadProducts() {
  const res = await fetch(PRODUCT_DETAILS_URL + "/products");
  if (!res.ok) throw new Error("Product Details API returned HTTP " + res.status);
  const data = await res.json();
  products = data.products || [];
  // Populate the product dropdown (Mark Q6) from the same API response.
  productDropdown.innerHTML = '<option value="">-- Select a product --</option>';
  products.forEach((p) => {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = p.name;
    productDropdown.appendChild(opt);
  });
  productsEl.innerHTML = "";
  products.forEach((p) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "card product-card";
    card.dataset.productId = p.id;
    card.innerHTML =
      "<h3>" + p.name + "</h3>" +
      "<p>" + p.brand + " · " + p.category + "</p>" +
      "<p>" + p.description + "</p>";
    card.addEventListener("click", () => selectProduct(p.id));
    productsEl.appendChild(card);
  });
  setStatus("Loaded " + products.length + " products from Product Details API (" + PRODUCT_DETAILS_URL + "/products).");
}

async function selectProduct(productId) {
  selectedProduct = products.find((p) => p.id === productId) || null;
  if (!selectedProduct) return;
  selectedDealer = null;
  priceSection.hidden = true;
  allPricesSection.hidden = true;
  // Keep the dropdown in sync when a product is chosen via a card or a deep link.
  if (productDropdown.value !== productId) productDropdown.value = productId;
  document.querySelectorAll(".product-card").forEach((c) =>
    c.classList.toggle("selected", c.dataset.productId === productId));
  selectedProductNameEl.textContent = selectedProduct.name;
  dealersSection.hidden = false;
  const res = await fetch(DEALER_PRICING_URL + "/dealers?product_id=" + encodeURIComponent(productId));
  if (!res.ok) throw new Error("Dealer Pricing API returned HTTP " + res.status);
  const data = await res.json();
  dealers = data.dealers || [];
  dealersEl.innerHTML = "";
  dealers.forEach((d) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "card dealer-card";
    card.dataset.dealerId = d.id;
    card.innerHTML =
      "<h3>" + d.name + "</h3>" +
      "<p>Rating: " + d.rating + " / 5</p>" +
      "<p class='meta'>" + d.delivery + "</p>";
    card.addEventListener("click", () => selectDealer(d.id));
    dealersEl.appendChild(card);
  });
  setStatus("Showing dealers for " + selectedProduct.name + " from Dealer Pricing API (" + DEALER_PRICING_URL + "/dealers).");
  syncUrl();
}

async function selectDealer(dealerId) {
  selectedDealer = { id: dealerId };
  document.querySelectorAll(".dealer-card").forEach((c) =>
    c.classList.toggle("selected", c.dataset.dealerId === dealerId));
  const url = DEALER_PRICING_URL + "/price?product_id=" + encodeURIComponent(selectedProduct.id) +
    "&dealer_id=" + encodeURIComponent(dealerId);
  const res = await fetch(url);
  if (!res.ok) throw new Error("Dealer Pricing API returned HTTP " + res.status);
  const data = await res.json();
  priceSection.hidden = false;
  priceEl.innerHTML =
    "<p><strong>" + data.dealer + "</strong> — " + selectedProduct.name + "</p>" +
    "<p class='big'>" + money(data.price_usd) + " " + data.currency + "</p>" +
    "<p>" + (data.in_stock ? "In stock" : "Out of stock") + "</p>";
  setStatus("Price for " + selectedProduct.name + " from " + data.dealer + ": " + money(data.price_usd) + ".");
  syncUrl();
}

async function showAllPrices() {
  const res = await fetch(DEALER_PRICING_URL + "/prices?product_id=" + encodeURIComponent(selectedProduct.id));
  if (!res.ok) throw new Error("Dealer Pricing API returned HTTP " + res.status);
  const data = await res.json();
  const rows = data.prices || [];
  allPricesEl.innerHTML = "";
  rows.forEach((row, i) => {
    const info = dealers.find((d) => d.id === row.dealer_id) || {};
    const tr = document.createElement("tr");
    if (i === 0) tr.className = "cheapest-row";
    tr.innerHTML =
      "<td>" + row.dealer + (i === 0 ? " — cheapest" : "") + "</td>" +
      "<td>" + (info.rating !== undefined ? info.rating + " / 5" : "") + "</td>" +
      "<td>" + (info.delivery || "") + "</td>" +
      "<td>" + money(row.price_usd) + "</td>";
    allPricesEl.appendChild(tr);
  });
  allPricesSection.hidden = false;
  if (rows.length) {
    cheapestEl.textContent = "Cheapest: " + rows[0].dealer + " at " + money(rows[0].price_usd) + ".";
  }
  setStatus("Showing prices from all " + rows.length + " dealers for " + selectedProduct.name + ".");
  syncUrl();
}

document.getElementById("show-all-btn").addEventListener("click", () => {
  showAllPrices().catch((err) => setStatus("Error: " + err.message, true));
});

// Dropdown selection loads the same dealers as clicking a product card.
productDropdown.addEventListener("change", () => {
  if (productDropdown.value) {
    selectProduct(productDropdown.value).catch((err) => setStatus("Error: " + err.message, true));
  }
});

async function init() {
  try {
    await loadProducts();
    const params = new URLSearchParams(location.search);
    const productId = params.get("product");
    if (productId && products.some((p) => p.id === productId)) {
      await selectProduct(productId);
      const dealerId = params.get("dealer");
      if (dealerId) await selectDealer(dealerId);
      if (params.get("view") === "all") await showAllPrices();
    }
  } catch (err) {
    setStatus("Error: " + err.message + " — is the Product Details service (port 5000) and Dealer Pricing service (port 3000) running?", true);
  }
}

init();
