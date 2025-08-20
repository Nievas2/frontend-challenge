import { categories, suppliers } from "../data/products"
import "./ProductFilters.css"
interface ProductFiltersProps {
  selectedCategory: string
  searchQuery: string
  sortBy: string
  selectedSupplier: string
  priceRange: { min: number | null; max: number | null }
  onCategoryChange: (category: string) => void
  onSearchChange: (search: string) => void
  onSortChange: (sort: string) => void
  onSupplierChange: (supplier: string) => void
  onPriceRangeChange: (min: number | null, max: number | null) => void
  onClearFilters: () => void
}

const ProductFilters = ({
  selectedCategory,
  searchQuery,
  sortBy,
  selectedSupplier,
  priceRange,
  onCategoryChange,
  onSearchChange,
  onSortChange,
  onSupplierChange,
  onPriceRangeChange,
  onClearFilters,
}: ProductFiltersProps) => {
  return (
    <div className="product-filters">
      <div className="filters-card">
        {/* Search Bar */}
        <div className="search-section">
          <div className="search-box">
            <span className="material-icons">search</span>
            <input
              type="text"
              placeholder="Buscar productos, SKU..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="search-input p1"
            />
            {searchQuery && (
              <button
                className="clear-search"
                onClick={() => onSearchChange("")}
              >
                <span className="material-icons">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Filters */}
        <div className="filter-section">
          <h2 className="filter-title p1-medium">Categorías</h2>
          <div className="category-filters">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`category-btn ${
                  selectedCategory === category.id ? "active" : ""
                }`}
                onClick={() => onCategoryChange(category.id)}
              >
                <span className="material-icons">{category.icon}</span>
                <span className="category-name l1">{category.name}</span>
                <span className="category-count l1">({category.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="filter-section">
          <h3 className="filter-title p1-medium">Proveedor</h3>
          <select
            value={selectedSupplier}
            onChange={(e) => onSupplierChange(e.target.value)}
            className="sort-select p1"
            aria-label="Seleccionar proveedor"
          >
            <option value="all">Todos</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Price Filters */}
        <div className="filter-section">
          <h3 className="filter-title p1-medium">Rango de precios</h3>
          <div className="price-filters">
            <input
              type="number"
              placeholder="Mínimo"
              value={priceRange.min ?? ""}
              onChange={(e) =>
                onPriceRangeChange(
                  e.target.value ? Number(e.target.value) : null,
                  priceRange.max
                )
              }
              min={0}
            />
            <input
              type="number"
              placeholder="Máximo"
              value={priceRange.max ?? ""}
              onChange={(e) =>
                onPriceRangeChange(
                  priceRange.min,
                  e.target.value ? Number(e.target.value) : null
                )
              }
              min={0}
            />
          </div>
        </div>

        {/* Clear Filters */}
        <div className="filter-section flex justify-center items-center">
          <button
            onClick={onClearFilters}
            className="flex justify-center btn btn-primary cta1"
          >
            Limpiar todos los filtros
          </button>
        </div>

        {/* Sort Options */}
        <div className="filter-section">
          <h3 className="filter-title p1-medium">Ordenar por</h3>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="sort-select p1"
            aria-label="Ordenar productos"
          >
            <option value="name">Nombre A-Z</option>
            <option value="price">Precio</option>
            <option value="stock">Stock disponible</option>
          </select>
        </div>

        {/* Quick Stats - Bug: hardcoded values instead of dynamic */}
        <div className="filter-section">
          <h3 className="filter-title p1-medium">Proveedores</h3>
          <div className="supplier-list">
            {suppliers.map((supplier) => (
              <div key={supplier.id} className="supplier-item">
                <span className="supplier-name l1">{supplier.name}</span>
                <span className="supplier-count l1">{supplier.products}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductFilters
