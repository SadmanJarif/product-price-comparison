"""Product Details microservice — IBM Course 11 final project.

Python / Flask. Serves the product catalogue that the
Dealer Evaluation frontend displays. Prices live in the
separate Dealer Pricing (Node.js) microservice, not here.

Run locally:
    python -m venv .venv && .venv/bin/pip install -r requirements.txt
    python app.py            # listens on http://localhost:5000
"""
import json
import os

from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # frontend runs on a different localhost port

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(BASE_DIR, "products.json"), encoding="utf-8") as f:
    PRODUCTS = json.load(f)["products"]

PRODUCTS_BY_ID = {p["id"]: p for p in PRODUCTS}


@app.route("/")
def index():
    return jsonify(
        {
            "service": "product-details",
            "status": "ok",
            "description": "Product Details microservice (Flask) — IBM Course 11 final project",
            "endpoints": ["/products", "/products/<product_id>", "/health"],
            "product_count": len(PRODUCTS),
        }
    )


@app.route("/health")
def health():
    return jsonify({"service": "product-details", "status": "ok"})


@app.route("/products")
def list_products():
    return jsonify({"products": PRODUCTS})


@app.route("/products/<product_id>")
def get_product(product_id):
    product = PRODUCTS_BY_ID.get(product_id)
    if product is None:
        return jsonify({"error": f"product not found: {product_id}"}), 404
    return jsonify(product)


if __name__ == "__main__":
    # 0.0.0.0 so the service is reachable the same way a deployed
    # container would be; port 5000 matches the course convention.
    app.run(host="0.0.0.0", port=5000)
