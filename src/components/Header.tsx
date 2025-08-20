import { Link, useLocation } from "react-router-dom"
import { useEffect, useState } from "react"
import "./Header.css"
import { useCart } from "./CartContext"

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const patchname = useLocation().pathname
  const { items } = useCart()

  // Toggle mobile menu open/close state
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  // Effect to handle body overflow when menu is open
  // This prevents the body from scrolling when the mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden"
      document.body.style.paddingRight = "0px"
    } else {
      document.body.style.overflow = "auto"
      document.body.style.paddingRight = "0px"
    }

    return () => {
      document.body.style.overflow = "auto"
      document.body.style.paddingRight = "0px"
    }
  }, [isMenuOpen])

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          {/* Logo */}
          <Link to="/" className="logo">
            <div className="logo-icon">
              <span className="material-icons">store</span>
            </div>

            <span className="logo-text p1-medium">SWAG Challenge</span>
          </Link>

          {/* Navigation */}
          <nav className="nav">
            <Link
              to="/"
              className={`nav-link ${patchname == "/" ? "active" : ""}`}
            >
              <span className="material-icons">home</span>
              Catálogo
            </Link>

            <Link
              to="/cart"
              className={`nav-link ${patchname == "/cart" ? "active" : ""}`}
            >
              <span className="material-icons">shopping_cart</span>
              Carrito ({items.length})
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button className="mobile-menu-toggle" onClick={toggleMenu}>
            <span className="material-icons">
              {isMenuOpen ? "close" : "menu"}
            </span>
          </button>

          {/* Mobile Dropdown Menu */}
          <div className={`mobile-menu ${isMenuOpen ? "open" : ""}`} >
            <Link
              to="/"
              className={`mobile-nav-link ${patchname == "/" ? "active" : ""}`}
            >
              <span className="material-icons">home</span>
              Catálogo
            </Link>

            <Link
              to="/cart"
              className={`mobile-nav-link ${
                patchname == "/cart" ? "active" : ""
              }`}
            >
              <span className="material-icons">shopping_cart</span>
              Carrito ({items.length})
            </Link>

            <div>
              <button
                className="btn btn-secondary mobile-cta"
              >
                <span className="material-icons">person</span>
                Iniciar Sesión
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="header-actions">
            <button className="btn btn-secondary cta1">
              <span className="material-icons">person</span>
              Iniciar Sesión
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
