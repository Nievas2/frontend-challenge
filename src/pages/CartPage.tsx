import { useState } from "react"
import "./CartPage.css"
import { useCart } from "../components/CartContext"
import { CartItem } from "../types/Product"
import { Link } from "react-router-dom"
import { products } from "../data/products"

const CartPage = () => {
  const { items, subtotal, itemCount, updateQuantity, removeFromCart } =
    useCart()

  const [error, setError] = useState<string>("")

  // Datos de empresa
  const [companyData, setCompanyData] = useState({
    name: "",
    cuit: "",
    address: "",
    email: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCompanyData((prev) => ({ ...prev, [name]: value }))
  }

  let finalTotal = subtotal
  if (subtotal > 50000) {
    finalTotal = subtotal
  } else {
    finalTotal = subtotal + 15000 // add shipping cost
  }

  const handleExportPDF = () => {
    const printContent = document.getElementById("quote-summary")?.innerHTML
    const printWindow = window.open("", "", "width=800,height=600")
    if (printWindow && printContent) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Cotización</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1, h2 { color: #333; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background: #f4f4f4; }
            </style>
          </head>
          <body>
            ${printContent}
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const handleQuantityChange = (
    productId: number,
    newQuantity: number,
    selectedColor?: string,
    selectedSize?: string
  ) => {
    try {
      const product = products.find((p) => p.id === productId)
      if (product && newQuantity > product.stock) {
        return setError("La cantidad supera el stock disponible")
      }
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
    return `$${price.toLocaleString()} CLP`
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
            <div className="summary-card" id="quote-summary">
              {/* Formulario empresa */}
              <h2>Datos de la Empresa</h2>
              <input
                type="text"
                name="name"
                placeholder="Nombre de la empresa"
                value={companyData.name}
                onChange={handleInputChange}
              />
              <input
                type="text"
                name="cuit"
                placeholder="CUIT"
                value={companyData.cuit}
                onChange={handleInputChange}
              />
              <input
                type="text"
                name="address"
                placeholder="Dirección"
                value={companyData.address}
                onChange={handleInputChange}
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={companyData.email}
                onChange={handleInputChange}
              />

              <h2>Resumen del pedido</h2>

              <div className="summary-row">
                <span>Subtotal ({itemCount} productos)</span>
                <span>{formatPrice(subtotal)}</span>
              </div>

              <div className="summary-row">
                <span>Envío</span>
                {finalTotal > 50000 ? (
                  <>
                    <div className="discount-info">
                      <p>Envio gratis</p>
                    </div>
                  </>
                ) : (
                  <div className="discount-info">
                    <p>+{formatPrice(15000)}</p>
                  </div>
                )}
              </div>

              {/* Descuentos */}
              <h2>Descuentos</h2>
              {items.map((item: CartItem) => {
                const discount = item.basePrice - item.unitPrice
                return (
                  discount > 0 && (
                    <div className="summary-row" key={item.id}>
                      <span>
                        {item.name} / {item.selectedColor}{" "}
                        {item.selectedSize}
                      </span>
                      <span>-{formatPrice(discount * item.quantity)}</span>
                    </div>
                  )
                )
              })}

              {/* Impuestos */}

              <div className="summary-total">
                <span>Total</span>
                <span>{formatPrice(finalTotal)}</span>
              </div>
            </div>

            <button className="checkout-btn" onClick={handleExportPDF}>
              Exportar Cotización en PDF
            </button>

            <Link to="/">
              <button className="continue-shopping-btn secondary">
                Continuar comprando
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartPage
