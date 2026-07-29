# Aeris product detail page

A React + JavaScript implementation of the e-commerce product-detail coding test. It includes product loading, SKU-driven price/stock, two variant dimensions, constrained quantity controls, cart feedback, and mock API error paths.

## Run locally

```bash
npm install
npm run dev
```

## Mock API service

`src/services/productApi.js` exposes:

- `getProductDetail(productId)` — mock product-detail GET request
- `addToCart({ productId, skuId, quantity })` — mock cart POST request

Stock is tracked per SKU for the lifetime of the mock session. Adding to the cart does not change the SKU stock shown on the page; it only reduces how many more units of that SKU the shopper can add. The Sand / Large SKU demonstrates the out-of-stock state.

The mock service simulates a network exception for 10% of add-to-cart requests. When it occurs, the page displays an error without changing the cart count.
