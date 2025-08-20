import { useState } from 'react'
import { Product } from '../types/Product'
import './PricingCalculator.css'
import { useCart } from './CartContext'

interface PricingCalculatorProps {
  product: Product
  isInCart: boolean
}

const PricingCalculator = ({ product, isInCart }: PricingCalculatorProps) => {
  const [quantity, setQuantity] = useState<number>(1)
  const [selectedBreak, setSelectedBreak] = useState<number>(0)
  const [errorStock, setErrorStock] = useState<string | null>(null)
  const {addToCart} = useCart()

  // Calculate best pricing for quantity
  const calculatePrice = (qty: number) => {
   if (!product.priceBreaks || product.priceBreaks.length === 0) {
     return product.basePrice * qty
   }

   // Sort price breaks by minQty in ascending order
   const sortedBreaks = [...product.priceBreaks].sort((a, b) => a.minQty - b.minQty)

   // Find the applicable price break
   let applicableBreak = sortedBreaks[0]
   for (let i = 0; i < sortedBreaks.length; i++) {
     if (qty >= sortedBreaks[i].minQty) {
       applicableBreak = sortedBreaks[i]
     }
   }
 
   return applicableBreak.price * qty
 }

  // Calculate discount amount
  const getDiscount = (qty: number) => {
    if (!product.priceBreaks || product.priceBreaks.length === 0) {
      return 0
    }

    const baseTotal = product.basePrice * qty
    const discountedTotal = calculatePrice(qty)
    
    // Calculate savings percentage
    return ((baseTotal - discountedTotal) / baseTotal) * 100
  }

  // Format price display
  const formatPrice = (price: number) => {
    return `$${price.toLocaleString()} CLP` // Should be CLP formatting
  }

  const currentPrice = calculatePrice(quantity)
  const discountPercent = getDiscount(quantity)

  return (
    <div className="pricing-calculator">
      <div className="calculator-header">
        <h3 className="calculator-title p1-medium">Calculadora de Precios</h3>
        <p className="calculator-subtitle l1">
          Calcula el precio según la cantidad que necesitas
        </p>
      </div>

      <div className="calculator-content">
        {/* Quantity Input */}
        <div className="quantity-section">
          <label className="quantity-label p1-medium">Cantidad</label>
          <div className="quantity-input-group">
            <input
              type="number"
              value={quantity}
              onChange={(e) => {
                if(parseInt(e.target.value) > product.stock) {
                  setErrorStock('No hay suficiente stock disponible para añadir al carrito.')
                  return setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                }
                if(errorStock) setErrorStock(null)
                setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              }
              className="quantity-input p1"
              min="1"
            />
            <span className="quantity-unit l1">unidades de {product.stock} disponibles</span>
          </div>
        </div>

        {/* Price Breaks */}
        {product.priceBreaks && product.priceBreaks.length > 0 && (
          <div className="price-breaks-section">
            <h4 className="breaks-title p1-medium">Descuentos por volumen</h4>
            <div className="price-breaks">
              {[...product.priceBreaks]
                .sort((a, b) => a.minQty - b.minQty)
                .map((priceBreak, index) => {
                  const isActive = quantity >= priceBreak.minQty
                  const isSelected = selectedBreak === index
                  
                  return (
                    <div 
                      key={index}
                      className={`price-break ${isActive ? 'active' : ''} ${isSelected ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedBreak(index)
                        setQuantity(priceBreak.minQty)
                      }}
                    >
                      <div className="break-quantity l1">
                        {priceBreak.minQty}+ unidades
                      </div>
                      <div className="break-price p1-medium">
                        {formatPrice(priceBreak.price)}
                      </div>
                      {priceBreak.discount && (
                        <div className="break-discount l1">
                          -{priceBreak.discount}%
                        </div>
                      )}
                    </div>
                  )
                })}
            </div>
          </div>
        )}

        {/* Price Summary */}
        <div className="price-summary">
          <div className="summary-row">
            <span className="summary-label p1">Precio unitario:</span>
            <span className="summary-value p1-medium">
              {formatPrice(calculatePrice(quantity) / quantity)}
            </span>
          </div>
          
          <div className="summary-row">
            <span className="summary-label p1">Cantidad:</span>
            <span className="summary-value p1-medium">{quantity} unidades</span>
          </div>

          {discountPercent > 0 && (
            <div className="summary-row discount-row">
              <span className="summary-label p1">Descuento:</span>
              <span className="summary-value discount-value p1-medium">
                -{discountPercent.toFixed(1)}%
              </span>
            </div>
          )}

          <div className="summary-row total-row">
            <span className="summary-label p1-medium">Total:</span>
            <span className="summary-value total-value h2">
              {formatPrice(currentPrice)}
            </span>
          </div>
        </div>

        {errorStock && <div className="error-message text-end"
        >{errorStock}</div>}

        {isInCart && (
         <div className="in-cart-message p1 text-end">
           El producto ya esta en su carrito.
         </div>
        )}

        {/* Actions */}
        <div className="calculator-actions">
          <button 
            className="btn btn-secondary cta1"
            onClick={() => {
              // Handle quote request
              alert(`Cotización solicitada para ${quantity} unidades de ${product.name}`)
            }}
          >
            <span className="material-icons">email</span>
            Solicitar cotización oficial
          </button>
          
          <button 
            className="btn btn-primary cta1"
            onClick={() => {
              // Add to cart functionality
              addToCart(product, quantity)
            }}
            disabled={errorStock !== null} // Disable if there's a stock error
          >
            <span className="material-icons">shopping_cart</span>
            Agregar al carrito
          </button>
        </div>

        {/* Additional Info */}
        <div className="additional-info">
          <div className="info-item">
            <span className="material-icons">local_shipping</span>
            <div className="info-content">
              <span className="info-title l1">Envío gratis</span>
              <span className="info-detail l1">En pedidos sobre $50.000</span>
            </div>
          </div>
          
          <div className="info-item">
            <span className="material-icons">schedule</span>
            <div className="info-content">
              <span className="info-title l1">Tiempo de producción</span>
              <span className="info-detail l1">7-10 días hábiles</span>
            </div>
          </div>
          
          <div className="info-item">
            <span className="material-icons">verified</span>
            <div className="info-content">
              <span className="info-title l1">Garantía</span>
              <span className="info-detail l1">30 días de garantía</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PricingCalculator