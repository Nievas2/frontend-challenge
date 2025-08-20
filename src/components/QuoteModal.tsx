import { useState } from "react"
import { Product } from "../types/Product"
import "./QuoteModal.css"

interface QuoteModalProps {
  product: Product
  onAddToCart: (product: Product, quantity: number) => void
}

const QuoteModal = ({ product, onAddToCart }: QuoteModalProps) => {
  const [companyName, setCompanyName] = useState("")
  const [companyEmail, setCompanyEmail] = useState("")
  const [quantity, setQuantity] = useState(1)

  /* Calculate best pricing for quantity */
  const calculatePrice = (qty: number) => {
    if (!product.priceBreaks || product.priceBreaks.length === 0) {
      return product.basePrice * qty
    }
    const sortedBreaks = [...product.priceBreaks].sort(
      (a, b) => a.minQty - b.minQty
    )
    let applicableBreak = sortedBreaks[0]
    for (let i = 0; i < sortedBreaks.length; i++) {
      if (qty >= sortedBreaks[i].minQty) {
        applicableBreak = sortedBreaks[i]
      }
    }
    return applicableBreak.price * qty
  }

  /* Calculate discount amount */
  const total = calculatePrice(quantity)
  const discountPercent =
    product.priceBreaks && product.priceBreaks.length > 0
      ? ((product.basePrice * quantity - total) /
          (product.basePrice * quantity)) *
        100
      : 0

  /* Format price for display */
  const formatPrice = (price: number) => `$${price.toLocaleString()} CLP`

  /* Handle PDF export */
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

  return (
    <div className="quote-modal" id="quote-summary">
      {/* Information about the company */}
      <h3>Datos de la Empresa</h3>
      <div className="company-form">
        <input
          type="text"
          placeholder="Nombre de la empresa"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email de contacto"
          value={companyEmail}
          onChange={(e) => setCompanyEmail(e.target.value)}
        />
      </div>

      {/* Quantity selection */}
      <div className="quantity-section">
        <label>Cantidad:</label>
        <input
          type="number"
          min={1}
          max={product.stock}
          value={quantity}
          onChange={(e) =>
            setQuantity(Math.max(1, parseInt(e.target.value) || 1))
          }
        />
        <span className="stock-note">{product.stock} disponibles</span>
      </div>

      {/* Price summary */}
      <div className="price-summary">
        <div>
          <strong>Precio unitario:</strong> {formatPrice(total / quantity)}
        </div>
        <div>
          <strong>Cantidad:</strong> {quantity} unidades
        </div>
        {discountPercent > 0 && (
          <div className="discount">
            Descuento: -{discountPercent.toFixed(1)}%
          </div>
        )}
        <div className="total">
          <strong>Total:</strong> {formatPrice(total)}
        </div>
      </div>

      {/* Actions */}
      <div className="actions">
        <button
          className="btn btn-primary"
          onClick={() => onAddToCart(product, quantity)}
        >
          Añadir al carrito
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => {
            handleExportPDF()
          }}
        >
          Exportar cotización
        </button>
      </div>
    </div>
  )
}

export default QuoteModal
