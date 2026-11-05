/**
 * Dealer Pricing microservice — IBM Course 11 final project.
 * Node.js / Express. Serves dealer lists and prices per product.
 *
 * Sample/demo prices in USD (not live retailer data).
 *
 * Run locally:
 *   npm install
 *   npm start              # listens on http://localhost:3000
 */
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const DEALERS = [
  { id: "d1", name: "ElectroMart", rating: 4.6, delivery: "Free delivery, 2-3 days" },
  { id: "d2", name: "TechHub", rating: 4.4, delivery: "Free delivery, 1-2 days" },
  { id: "d3", name: "GadgetWorld", rating: 4.2, delivery: "$5 delivery, 3-5 days" },
  { id: "d4", name: "PrimeStore", rating: 4.7, delivery: "Free delivery, next day" },
];

// price in USD per (product_id, dealer_id). All products are offered by all dealers.
const PRICES = {
  p1: { d1: 799, d2: 779, d3: 819, d4: 789 },
  p2: { d1: 859, d2: 849, d3: 879, d4: 829 },
  p3: { d1: 349, d2: 329, d3: 359, d4: 339 },
  p4: { d1: 1199, d2: 1149, d3: 1249, d4: 1179 },
  p5: { d1: 1099, d2: 1049, d3: 1129, d4: 1079 },
  p6: { d1: 1299, d2: 1249, d3: 1349, d4: 1279 },
};

const KNOWN_PRODUCTS = Object.keys(PRICES);

function dealersFor(productId) {
  return DEALERS.map((d) => ({ ...d, product_id: productId }));
}

function priceFor(productId, dealerId) {
  const dealer = DEALERS.find((d) => d.id === dealerId);
  if (!dealer) return null;
  const price = (PRICES[productId] || {})[dealerId];
  if (price === undefined) return null;
  return { product_id: productId, dealer_id: dealerId, dealer: dealer.name, price_usd: price, currency: "USD", in_stock: true };
}

function allPricesFor(productId) {
  return DEALERS.map((d) => priceFor(productId, d.id)).sort((a, b) => a.price_usd - b.price_usd);
}

app.get("/", (req, res) => {
  res.json({
    service: "dealer-pricing",
    status: "ok",
    description: "Dealer Pricing microservice (Node.js / Express) — IBM Course 11 final project",
    endpoints: [
      "/dealers?product_id=<id>",
      "/dealers/<product_id>",
      "/price?product_id=<id>&dealer_id=<id>",
      "/price/<product_id>/<dealer_id>",
      "/prices?product_id=<id>",
      "/prices/<product_id>",
      "/health",
    ],
  });
});

app.get("/health", (req, res) => res.json({ service: "dealer-pricing", status: "ok" }));

app.get("/dealers", (req, res) => {
  const { product_id } = req.query;
  if (!product_id || !KNOWN_PRODUCTS.includes(product_id)) {
    return res.status(404).json({ error: `unknown product_id: ${product_id || ""}` });
  }
  res.json({ product_id, dealers: dealersFor(product_id) });
});

app.get("/dealers/:product_id", (req, res) => {
  const { product_id } = req.params;
  if (!KNOWN_PRODUCTS.includes(product_id)) {
    return res.status(404).json({ error: `unknown product_id: ${product_id}` });
  }
  res.json({ product_id, dealers: dealersFor(product_id) });
});

app.get("/price", (req, res) => {
  const { product_id, dealer_id } = req.query;
  const result = priceFor(product_id, dealer_id);
  if (!result) return res.status(404).json({ error: `no price for product_id=${product_id} dealer_id=${dealer_id}` });
  res.json(result);
});

app.get("/price/:product_id/:dealer_id", (req, res) => {
  const result = priceFor(req.params.product_id, req.params.dealer_id);
  if (!result) return res.status(404).json({ error: `no price for product_id=${req.params.product_id} dealer_id=${req.params.dealer_id}` });
  res.json(result);
});

app.get("/prices", (req, res) => {
  const { product_id } = req.query;
  if (!product_id || !KNOWN_PRODUCTS.includes(product_id)) {
    return res.status(404).json({ error: `unknown product_id: ${product_id || ""}` });
  }
  res.json({ product_id, prices: allPricesFor(product_id) });
});

app.get("/prices/:product_id", (req, res) => {
  const { product_id } = req.params;
  if (!KNOWN_PRODUCTS.includes(product_id)) {
    return res.status(404).json({ error: `unknown product_id: ${product_id}` });
  }
  res.json({ product_id, prices: allPricesFor(product_id) });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Dealer Pricing microservice listening on http://localhost:${PORT}`);
});
