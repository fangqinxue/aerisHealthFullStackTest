const product = {
  productId: 'P001',
  name: 'Aeris One Wireless Headphones',
  description:
    'Immersive sound, all-day comfort, and adaptive noise cancellation in a refined everyday design.',
  images: [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=85',
  ],
  variants: [
    { skuId: 'SKU-BLK-STD', color: 'Midnight', size: 'Standard', price: 249, stock: 12 },
    { skuId: 'SKU-BLK-XL', color: 'Midnight', size: 'Large', price: 269, stock: 3 },
    { skuId: 'SKU-SND-STD', color: 'Sand', size: 'Standard', price: 249, stock: 8 },
    { skuId: 'SKU-SND-XL', color: 'Sand', size: 'Large', price: 269, stock: 0 },
  ],
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
let cartCount = 0
const cartItems = new Map()

/** Mock GET /api/product/:productId */
export async function getProductDetail(productId) {
  await wait(700)

  if (productId !== product.productId) {
    throw new Error('We could not find this product. Please try again later.')
  }

  return structuredClone(product)
}

/** Mock POST /api/cart */
export async function addToCart({ productId, skuId, quantity }) {
  await wait(550)

  // Simulate an intermittent network failure in 10% of add-to-cart requests.
  if (Math.random() < 0.1) {
    throw new Error('Network connection interrupted. Please check your connection and try again.')
  }

  const sku = product.variants.find((variant) => variant.skuId === skuId)

  if (productId !== product.productId || !sku) {
    return { success: false, message: 'This item is no longer available.' }
  }

  const quantityInCart = cartItems.get(skuId) || 0
  const remainingStock = sku.stock - quantityInCart

  // Validate against all units of this SKU already added to the cart, not only
  // against the quantity from the current request.
  if (quantity > remainingStock || remainingStock === 0) {
    return { success: false, message: 'Insufficient stock. Please adjust your quantity.' }
  }

  // Persist the count for the lifetime of this mock session, just as a backend
  // would return the updated cart summary after a successful POST /api/cart.
  cartItems.set(skuId, quantityInCart + quantity)
  cartCount += quantity
  return { success: true, cartCount }
}
