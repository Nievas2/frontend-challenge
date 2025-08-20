import { useState } from "react"
import "./CartPage.css"
import { useCart } from "../components/CartContext"
import { CartItem } from "../types/Product"

const CartPage = () => {
  const { items, subtotal, total, itemCount, updateQuantity, removeFromCart } =
    useCart()

  const [error, setError] = useState<string>("")

  const handleQuantityChange = (
    productId: number,
    newQuantity: number,
    selectedColor?: string,
    selectedSize?: string
  ) => {
    try {
      setError("")
      updateQuantity(productId, newQuantity, selectedColor, selectedSize)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al actualizar cantidad"
      )
      setTimeout(() => setError(""), 3000)
    }
  }

  const handleRemoveItem = (
    productId: number,
    selectedColor?: string,
    selectedSize?: string
  ) => {
    removeFromCart(productId, selectedColor, selectedSize)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(price)
  }

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="breadcrumb">
            <a href="/">Catálogo</a> / Carrito
          </div>
          <div className="empty-cart">
            <h1>Tu carrito está vacío</h1>
            <p>¡Agrega algunos productos para comenzar!</p>
            <button className="continue-shopping-btn">
              Continuar comprando
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="cart-page">
      <div className="container">
        <div className="breadcrumb">
          <a href="/">Catálogo</a> / Carrito ({itemCount})
        </div>

        <div className="cart-content">
          <div className="cart-items">
            <h1>Carrito de Compras</h1>

            {error && <div className="error-message">{error}</div>}

            <div className="cart-items-list">
              {items.map((item: CartItem) => (
                <div
                  key={`${item.id}-${item.selectedColor}-${item.selectedSize}`}
                  className="cart-item"
                >
                  <div className="item-header">
                    <div className="item-image">
                      {item.image ? (
                        <img src={item.image} alt={item.name} />
                      ) : (
                        <div className="placeholder-image">
                          <span>📦</span>
                        </div>
                      )}
                    </div>

                    <div className="item-details">
                      <h3 className="item-name">{item.name}</h3>
                      <p className="item-sku">SKU: {item.sku}</p>
                      <p className="item-category">{item.category}</p>

                      {item.selectedColor && (
                        <div className="item-variant">
                          <span className="variant-label">Color:</span>
                          <span className="variant-value">
                            {item.selectedColor}
                          </span>
                        </div>
                      )}

                      {item.selectedSize && (
                        <div className="item-variant">
                          <span className="variant-label">Talla:</span>
                          <span className="variant-value">
                            {item.selectedSize}
                          </span>
                        </div>
                      )}

                      <div className="stock-info">
                        {item.stock} unidades disponibles
                      </div>
                    </div>

                    <button
                      className="remove-item-btn"
                      onClick={() =>
                        handleRemoveItem(
                          item.id,
                          item.selectedColor,
                          item.selectedSize
                        )
                      }
                      title="Eliminar producto"
                    >
                      🗑️
                    </button>
                  </div>

                  <div className="item-footer">
                    <div className="item-pricing">
                      <div className="unit-price">
                        {formatPrice(item.unitPrice)}
                        {item.unitPrice < item.basePrice && (
                          <span className="original-price">
                            {formatPrice(item.basePrice)}
                          </span>
                        )}
                      </div>
                      <div className="price-per-unit">por unidad</div>
                    </div>

                    <div className="quantity-controls">
                      <button
                        className="quantity-btn"
                        onClick={() =>
                          handleQuantityChange(
                            item.id,
                            item.quantity - 1,
                            item.selectedColor,
                            item.selectedSize
                          )
                        }
                        disabled={item.quantity <= 1}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => {
                          const newQty = parseInt(e.target.value) || 1
                          handleQuantityChange(
                            item.id,
                            newQty,
                            item.selectedColor,
                            item.selectedSize
                          )
                        }}
                        min="1"
                        max={item.stock}
                        className="quantity-input"
                      />
                      <button
                        className="quantity-btn"
                        onClick={() =>
                          handleQuantityChange(
                            item.id,
                            item.quantity + 1,
                            item.selectedColor,
                            item.selectedSize
                          )
                        }
                        disabled={item.quantity >= item.stock}
                      >
                        +
                      </button>
                    </div>

                    <div className="item-total">
                      <div className="total-price">
                        {formatPrice(item.totalPrice)}
                      </div>
                      <div className="total-label">Total</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="cart-summary">
            <div className="summary-card">
              <h2>Resumen del pedido</h2>

              <div className="summary-row">
                <span>Subtotal ({itemCount} productos)</span>
                <span>{formatPrice(subtotal)}</span>
              </div>

              <div className="summary-row">
                <span>Envío</span>
                <span>Calculado en checkout</span>
              </div>

              <div className="summary-total">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>

              <button className="checkout-btn">Proceder al checkout</button>

              <button className="continue-shopping-btn secondary">
                Continuar comprando
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartPage
