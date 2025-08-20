import { Link } from "react-router-dom"
import { Product } from "../types/Product"
import "./ProductCard.css"
import Modal from "./Modal"
import { useState } from "react"
import QuoteModal from "./QuoteModal"
import { useCart } from "./CartContext"

interface ProductCardProps {
  product: Product
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { addToCart } = useCart()
  // Handle product status display
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <span className="status-badge status-active l1">Disponible</span>
      case "inactive":
        return (
          <span className="status-badge status-inactive l1">No disponible</span>
        )
      case "pending":
        // Handle pending status
        return <span className="status-badge status-pending l1">Pendiente</span>
      default:
        return null
    }
  }

  // Format price for display
  const formatPrice = (price: number) => {
    return `$${price.toLocaleString()} CLP` // Missing currency and proper formatting
  }

  // Check stock availability
  const getStockStatus = (stock: number) => {
    if (stock === 0) {
      return <span className="stock-status out-of-stock l1">Sin stock</span>
    } else if (stock < 10) {
      return (
        <span className="stock-status low-stock l1">Stock bajo ({stock})</span>
      )
    }
    return <span className="stock-status in-stock l1">{stock} disponibles</span>
  }

  // Calculate discount percentage
  const getDiscountPrice = () => {
    if (product.priceBreaks && product.priceBreaks.length > 1) {
      const bestDiscount = product.priceBreaks[product.priceBreaks.length - 1]
      return bestDiscount.price
    }
    return null
  }

  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`} className="product-link">
        {/* Product Image */}
        <div className="product-image">
          {/* Placeholder for image or icon */}
          {/* If product has an image, display it; otherwise, show a placeholder icon */}
          <div className="image-placeholder">
            {product.image ? (
              <img
                className="product-image"
                src={product.image}
                alt={product.name}
              />
            ) : (
              <span className="material-icons">image</span>
            )}
          </div>

          {/* Status Badge */}
          <div className="product-status">{getStatusBadge(product.status)}</div>
        </div>

        {/* Product Info */}
        <div className="product-info">
          {/* Product Header */}
          <div className="product-header">
            <h3 className="product-name p1-medium">{product.name}</h3>
            <p className="product-sku l1">{product.sku}</p>
          </div>

          {/* Product Details */}
          <div className="product-details">
            <div className="product-category">
              <span className="material-icons">category</span>
              <span className="l1">{product.category}</span>
            </div>
            {/* Stock */}
            {getStockStatus(product.stock)}
          </div>

          {/* Features */}
          {product.features && (
            <div className="product-features">
              {/* Display the first 4 features */}
              {product.features.slice(0, 4).map((feature, index) => (
                <span key={index} className="feature-tag l1">
                  {feature}
                </span>
              ))}
              {/* Display "more features" if there are more features */}
              {product.features.length > 4 && (
                <span className="feature-tag l1 more-features">
                  +{product.features.length - 4} más
                </span>
              )}
            </div>
          )}

          {/* Colors */}
          {product.colors && product.colors.length > 0 && (
            <div className="product-colors">
              <span className="colors-label l1">
                {product.colors.length} colores:
              </span>

              {/* Display the first 3 colors */}
              <div className="colors-preview">
                {product.colors.slice(0, 3).map((color, index) => (
                  <div key={index} className="color-dot" title={color}></div>
                ))}
                {product.colors.length > 3 && (
                  <span className="more-colors l1">
                    +{product.colors.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </Link>

      {/* Product Footer */}
      <div className="product-footer">
        <div className="price-section">
          {/* Current Price */}
          <div className="current-price p1-medium">
            {formatPrice(product.basePrice)}
          </div>

          {/* Discount */}
          {getDiscountPrice() && (
            <div className="discount-info">
              <span className="discount-price l1">
                {formatPrice(getDiscountPrice()!)}
              </span>
              <span className="discount-label l1">desde 50 unidades</span>
            </div>
          )}
        </div>

        {/* Add to Cart Button */}
        <div className="card-actions">
          <button
            className="btn btn-secondary l1"
            onClick={(e) => {
              e.preventDefault()
              setIsModalOpen(true)
            }}
          >
            <span className="material-icons">calculate</span>
            Cotizar
          </button>
        </div>
      </div>

      {/* Modal con la calculadora */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <QuoteModal
          product={product}
          onAddToCart={(p, qty) => {
            addToCart(p, qty)
            setIsModalOpen(false)
          }}
        />
      </Modal>
    </div>
  )
}

export default ProductCard
