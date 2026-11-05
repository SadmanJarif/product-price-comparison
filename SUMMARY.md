# Course 11 Final Project — Product Price Comparison — SUMMARY

Project: IBM Full Stack Software Developer, Course 11
("Application Development using Microservices and Serverless"),
final project — Product Price Comparison microservices.
Mark: learner/2126, 15 points.
Status: **Built and verified locally. NOT submitted to Coursera / Mark.
NOT published to GitHub. No score claimed, no URLs invented.**

Built 2026-11-06 (Asia/Dhaka; verification run 2026-11-05 21:36 UTC).
All services run on localhost only — nothing was deployed to IBM Cloud
Code Engine or any public host.

## What was built

Three microservices, each in its own folder:

| # | Service | Stack | Port | Entry point |
| --- | --- | --- | --- | --- |
| 1 | Product Details | Python 3.12 / Flask 3.1.3 | 5000 | `product-details/app.py` |
| 2 | Dealer Pricing | Node.js 24 / Express 4.19 | 3000 | `dealer-pricing/server.js` |
| 3 | Dealer Evaluation frontend | Static HTML/CSS/JS (no build step) | 8080 | `dealer-evaluation-frontend/index.html` |

Data (sample/demo, labelled as such in the UI — not live retailer data):
- 6 products: Apple iPhone 15, Samsung Galaxy S24, Sony WH-1000XM5
  Headphones, Dell XPS 13 Laptop, Apple MacBook Air M3 13-inch,
  LG C3 55-inch OLED evo TV.
- 4 dealers: ElectroMart, TechHub, GadgetWorld, PrimeStore.
- Every product has a price from every dealer (24 prices, USD).
  Example — iPhone 15: TechHub $779 (cheapest), PrimeStore $789,
  ElectroMart $799, GadgetWorld $819.

API endpoints:
- Product Details: `GET /`, `GET /health`, `GET /products`,
  `GET /products/<product_id>` (404 for unknown id).
- Dealer Pricing: `GET /`, `GET /health`,
  `GET /dealers?product_id=<id>` and `/dealers/<id>`,
  `GET /price?product_id=<id>&dealer_id=<id>` and `/price/<id>/<id>`,
  `GET /prices?product_id=<id>` and `/prices/<id>` (cheapest first).
- Frontend `app.js` points at the local services via two constants:
  `PRODUCT_DETAILS_URL = "http://localhost:5000"` and
  `DEALER_PRICING_URL = "http://localhost:3000"`.
  To point at deployed services, change those two constants and
  redeploy the frontend.

## File list

```
~/workspace/course11-price-comparison/
  README.md
  SUMMARY.md                          (this file)
  start-all.sh                        (start all 3 services + run tests)
  stop-all.sh                         (stop all 3 services)
  test.sh                             (curl verification, exits 0 on pass)
  .gitignore                          (node_modules/, logs/, __pycache__/)
  product-details/
    app.py  products.json  requirements.txt  Dockerfile  README.md
  dealer-pricing/
    server.js  package.json  package-lock.json  Dockerfile  README.md
    node_modules/                     (installed, git-ignored)
  dealer-evaluation-frontend/
    index.html  style.css  app.js  README.md
  logs/
    product-details.log  dealer-pricing.log  frontend.log  test-output.txt
  screenshots/
    01-product_details_deploy.png
    02-dealer-pricing-deployment.png
    03-frontend-git-clone.png
    04-updated-api-endpoint-code.png
    05-frontend-deployment.png
    06-homepage-products-preloaded.png
    07-dealers-for-selected-product.png
    08-price-for-selected-dealer.png
    09-prices-for-all-dealers.png
    logs/  (verbatim .txt behind screenshots 01, 02, 03, 05)
```

## How to run

```bash
cd ~/workspace/course11-price-comparison
./start-all.sh     # starts all three services, then runs ./test.sh
# or individually:
#   /tmp/course11-venv/bin/python product-details/app.py   (port 5000)
#   node dealer-pricing/server.js                          (port 3000)
#   python3 -m http.server 8080 --directory dealer-evaluation-frontend
./stop-all.sh      # stop all three
```

Open http://localhost:8080/ — products preload from the Flask service;
click a product for its dealers, a dealer for its price, or
"Show prices from all dealers" for the comparison table.
Deep links: `?product=p1`, `?product=p1&dealer=d2`, `?product=p1&view=all`.

## Test command and result

Command: `./test.sh` (also run automatically by `./start-all.sh`).
Full output saved at `logs/test-output.txt`.

```
=== Course 11 local verification — 2026-11-05 21:36 UTC ===
PASS [200] product-details root — http://localhost:5000/
PASS [200] product-details /products — http://localhost:5000/products
PASS [200] product-details /products/p1 — http://localhost:5000/products/p1
PASS [200] dealer-pricing root — http://localhost:3000/
PASS [200] dealer-pricing /dealers?p1 — http://localhost:3000/dealers?product_id=p1
PASS [200] dealer-pricing /price p1/d2 — http://localhost:3000/price?product_id=p1&dealer_id=d2
PASS [200] dealer-pricing /prices?p1 — http://localhost:3000/prices?product_id=p1
PASS [200] frontend homepage — http://localhost:8080/
PASS [200] frontend app.js endpoints — http://localhost:8080/app.js
PASS [404] product-details unknown product 404s
PASS [404] dealer-pricing unknown product 404s
RESULT: ALL CHECKS PASSED
```

Exit code 0. All three services were still running when this summary
was written (verify with `./test.sh` any time).

## Screenshots — what each one is, honestly

| # | File | What it shows | How captured |
| --- | --- | --- | --- |
| 1 | `01-product_details_deploy.png` | Flask service running on :5000 + `curl /products` (first products) + `/health` | PNG render of the verbatim terminal output in `screenshots/logs/01-product-details-deploy.txt` |
| 2 | `02-dealer-pricing-deployment.png` | Node service listening on :3000 + `curl /prices?product_id=p1` (all 4 prices, cheapest first) + single price | PNG render of verbatim output in `screenshots/logs/02-dealer-pricing-deploy.txt` |
| 3 | `03-frontend-git-clone.png` | `git clone file:///home/hatch/workspace/course11-price-comparison /tmp/course11-clone-test` succeeding, frontend files present | PNG render of verbatim output in `screenshots/logs/03-frontend-git-clone.txt`. Local `file://` clone only — no remote/GitHub URL exists yet |
| 4 | `04-updated-api-endpoint-code.png` | `dealer-evaluation-frontend/app.js` lines 1–30, showing `PRODUCT_DETAILS_URL = "http://localhost:5000"` and `DEALER_PRICING_URL = "http://localhost:3000"` | PNG render of lines 1–30 read directly from `app.js` |
| 5 | `05-frontend-deployment.png` | Frontend serving on :8080, `curl` HTTP 200 + first lines of `index.html` | PNG render of verbatim output in `screenshots/logs/05-frontend-deploy.txt` |
| 6 | `06-homepage-products-preloaded.png` | Homepage in a real browser: "Loaded 6 products from Product Details API", all 6 product cards | Headless Chromium screenshot of http://localhost:8080/ (1280×1000), visually checked |
| 7 | `07-dealers-for-selected-product.png` | iPhone 15 selected; 4 dealer cards (ElectroMart, TechHub, GadgetWorld, PrimeStore) | Headless Chromium screenshot of http://localhost:8080/?product=p1 (1280×1500), visually checked |
| 8 | `08-price-for-selected-dealer.png` | TechHub selected; "TechHub — Apple iPhone 15, $779 USD, In stock" | Headless Chromium screenshot of http://localhost:8080/?product=p1&dealer=d2 (1280×1700), visually checked |
| 9 | `09-prices-for-all-dealers.png` | Comparison table, cheapest first: TechHub $779, PrimeStore $789, ElectroMart $799, GadgetWorld $819; "Cheapest: TechHub at $779." | Headless Chromium screenshot of http://localhost:8080/?product=p1&view=all (1280×1900), visually checked |

Honesty note: this VM has no GUI terminal to photograph, so
screenshots 01–05 are PNG renders (monospace, terminal-styled) of the
actual captured terminal output — the raw `.txt` files are kept in
`screenshots/logs/` and the PNG text matches them exactly. They are
**not** screenshots of an IBM Cloud / Code Engine deployment: no cloud
deployment was done. Screenshots 06–09 are genuine headless-Chromium
screenshots of the locally running app. The first capture of 09 was
retaken taller because the prices table fell below the fold; the
current file shows the full table.

## What is ready / still missing for Mark submission

Ready:
- All three services build, run, and pass all 11 local checks.
- All 9 screenshots exist in `screenshots/` and were visually verified.
- Local git repo exists in the project folder (commit `724a931`,
  "Course 11: Product Price Comparison microservices (local build)"),
  plus the summary commit. It has **no remote** — nothing pushed anywhere.

Still missing (needs Jarif / the parent agent — not done here):
1. **IBM Cloud deployment (if Mark requires it):** the course's
   original flow deploys each microservice to IBM Cloud Code Engine
   and uses the deployed URLs in the frontend. That was out of scope
   for this local-only task: no IBM Cloud account, credentials, or
   deployment were used. If Mark's rubric requires deployed URLs,
   deploy product-details and dealer-pricing to Code Engine, update
   the two URL constants in `dealer-evaluation-frontend/app.js`,
   redeploy the frontend, re-run `./test.sh` against the new URLs,
   and retake screenshots 01, 02, 04, 05, 06–09 against them.
2. **GitHub publishing (if Mark requires it):** create a public repo
   under Jarif's GitHub account, push this folder, and collect the
   public file URLs. No repo was created and no URLs exist — do not
   invent any.
3. **Mark submission itself:** upload/attach the 9 screenshots (and
   any required code-file links) in Mark (learner/2126, 15 points)
   and submit. Passing grade is not stated in the task — confirm in
   Mark before submitting. No score is claimed here.
4. The exact Mark rubric wording was not available in this task
   (no Coursera/Mark access); the build follows the task's stated
   spec (3 microservices + the 9 named screenshots). If Mark lists
   additional required files or different screenshot names, map them
   to the files above before submitting.
