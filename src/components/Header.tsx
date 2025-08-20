import { Link } from 'react-router-dom'
import './Header.css'
import { useCart } from './CartContext'

const Header = () => {
  const { items } = useCart()
  console.log(items);
  
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
            <Link to="/" className="nav-link l1">
              <span className="material-icons">home</span>
              Catálogo
            </Link>
            <Link to="/cart" className="nav-link l1">
              <span className="material-icons">shopping_cart</span>
              Carrito ({items.length})
            </Link>
          </nav>

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