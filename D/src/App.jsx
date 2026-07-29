import React, { useEffect, useMemo, useState } from 'react'
import { addToCart, getProductDetail } from './services/productApi'

const formatPrice = (price) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price)

function OptionGroup({ label, options, value, onChange, colorOptions = false }) {
  return (
    <section className="option-group" aria-labelledby={`${label}-label`}>
      <div className="option-heading">
        <span id={`${label}-label`}>{label}</span>
        <strong>{value}</strong>
      </div>
      <div className="option-list">
        {options.map((option) => (
          <button
            className={`option ${value === option ? 'selected' : ''}`}
            key={option}
            type="button"
            aria-pressed={value === option}
            onClick={() => onChange(option)}
          >
            {colorOptions && <i className={`color-dot ${option.toLowerCase()}`} aria-hidden="true" />}
            {option}
          </button>
        ))}
      </div>
    </section>
  )
}

function ProductPage({ product, cartCount, setCartCount }) {
  const colors = [...new Set(product.variants.map((variant) => variant.color))]
  const sizes = [...new Set(product.variants.map((variant) => variant.size))]
  const [color, setColor] = useState(colors[0])
  const [size, setSize] = useState(sizes[0])
  const [quantity, setQuantity] = useState(1)
  const [feedback, setFeedback] = useState(null)
  const [isAdding, setIsAdding] = useState(false)
  // This tracks the quantity this shopper can still add, independently from
  // product stock. Adding an item to a cart does not reduce displayed stock.
  const [cartAllowanceBySku, setCartAllowanceBySku] = useState(() =>
    Object.fromEntries(product.variants.map((variant) => [variant.skuId, variant.stock])),
  )

  const selectedSku = useMemo(
    () => product.variants.find((variant) => variant.color === color && variant.size === size),
    [product.variants, color, size],
  )
  const remainingCartAllowance = cartAllowanceBySku[selectedSku.skuId]

  useEffect(() => {
    setQuantity((current) => Math.min(Math.max(1, current), Math.max(1, remainingCartAllowance)))
    setFeedback(null)
  }, [selectedSku, remainingCartAllowance])

  const updateColor = (nextColor) => {
    const combinationExists = product.variants.some((item) => item.color === nextColor && item.size === size)
    setColor(nextColor)
    if (!combinationExists) setSize(sizes[0])
  }

  const handleAddToCart = async () => {
    setFeedback(null)
    setIsAdding(true)
    try {
      const response = await addToCart({ productId: product.productId, skuId: selectedSku.skuId, quantity })

      if (response.success) {
        setCartCount(response.cartCount)
        setCartAllowanceBySku((current) => ({
          ...current,
          [selectedSku.skuId]: current[selectedSku.skuId] - quantity,
        }))
        setFeedback({ type: 'success', message: `${quantity} item${quantity > 1 ? 's' : ''} added to your cart.` })
      } else {
        setFeedback({ type: 'error', message: response.message || 'Something went wrong. Please try again.' })
      }
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'A network error occurred. Please try again.',
      })
    } finally {
      setIsAdding(false)
    }
  }

  const outOfStock = selectedSku.stock === 0
  const cartLimitReached = remainingCartAllowance === 0
  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Aeris home">aeris<span>·</span></a>
        <button className="cart-button" type="button" aria-label={`Cart, ${cartCount} items`}>
          <span className="cart-icon" aria-hidden="true">⌑</span> Cart <b>{cartCount}</b>
        </button>
      </header>

      <div className="breadcrumb">Home <span>/</span> Audio <span>/</span> Headphones</div>
      <article className="product-layout" id="top">
        <section className="image-panel" aria-label={product.name}>
          <div className="image-badge">NEW RELEASE</div>
          <img src={product.images[0]} alt="Aeris One over-ear headphones" />
          <div className="image-caption">Designed to disappear. Tuned to bring everything closer.</div>
        </section>

        <section className="details-panel">
          <p className="eyebrow">AERIS AUDIO / 01</p>
          <h1>{product.name}</h1>
          <div className="price-row">
            <span className="price">{formatPrice(selectedSku.price)}</span>
            <span className={`stock ${outOfStock ? 'out' : ''}`}>
              <i /> {outOfStock ? 'Out of stock' : `${selectedSku.stock} in stock`}
            </span>
          </div>
          <p className="description">{product.description}</p>

          <div className="rule" />
          <OptionGroup label="Color" options={colors} value={color} onChange={updateColor} colorOptions />
          <OptionGroup label="Fit" options={sizes} value={size} onChange={setSize} />

          <div className="purchase-row">
            <div className="quantity" aria-label="Quantity selector">
              <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} disabled={quantity <= 1 || isAdding}>−</button>
              <span aria-live="polite">{quantity}</span>
              <button type="button" onClick={() => setQuantity((value) => Math.min(remainingCartAllowance, value + 1))} disabled={quantity >= remainingCartAllowance || isAdding || cartLimitReached}>+</button>
            </div>
            <button className="add-button" type="button" onClick={handleAddToCart} disabled={outOfStock || cartLimitReached || isAdding}>
              {isAdding ? 'Adding…' : outOfStock ? 'Out of stock' : cartLimitReached ? 'Cart limit reached' : 'Add to cart'} <span>→</span>
            </button>
          </div>
          <p className="stock-note">
            {outOfStock
              ? 'Choose another fit or color to continue.'
              : cartLimitReached
                ? 'All available units of this selection are already in your cart.'
                : `You can add up to ${remainingCartAllowance} more for this selection.`}
          </p>
          {feedback && <div className={`feedback ${feedback.type}`} role="status">{feedback.message}</div>}

          <div className="benefits">
            <span>Free shipping</span><span>30-day returns</span><span>2-year warranty</span>
          </div>
        </section>
      </article>
    </main>
  )
}

function App() {
  const [state, setState] = useState({ status: 'loading', product: null, error: '' })
  const [cartCount, setCartCount] = useState(0)

  const loadProduct = async () => {
    setState({ status: 'loading', product: null, error: '' })
    try {
      const product = await getProductDetail('P001')
      setState({ status: 'ready', product, error: '' })
    } catch (error) {
      setState({ status: 'error', product: null, error: error.message })
    }
  }

  useEffect(() => { loadProduct() }, [])

  if (state.status === 'loading') {
    return <main className="state-screen"><div className="loader" /><p>Loading the listening experience…</p></main>
  }
  if (state.status === 'error') {
    return <main className="state-screen"><p className="state-label">Something went wrong</p><h1>{state.error}</h1><button type="button" onClick={loadProduct}>Try again</button></main>
  }
  return <ProductPage product={state.product} cartCount={cartCount} setCartCount={setCartCount} />
}

export default App
