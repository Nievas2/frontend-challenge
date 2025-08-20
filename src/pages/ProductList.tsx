import { useState } from "react"
import ProductCard from "../components/ProductCard"
import ProductFilters from "../components/ProductFilters"
import { products as allProducts } from "../data/products"
import { Product } from "../types/Product"
import "./ProductList.css"

const ProductList = () => {
  const [filteredProducts, setFilteredProducts] =
    useState<Product[]>(allProducts)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [selectedSupplier, setSelectedSupplier] = useState("all")
  const [priceRange, setPriceRange] = useState<{
    min: number | null
    max: number | null
  }>({ min: null, max: null })

  const filterProducts = (
    category: string,
    search: string,
    sort: string,
    supplier: string,
    price: { min: number | null; max: number | null }
  ) => {
    let filtered = [...allProducts]

    if (category !== "all") {
      filtered = filtered.filter((product) => product.category === category)
    }

    if (supplier !== "all") {
      filtered = filtered.filter((product) => {
        console.log(`Filtrando por proveedor: ${product.supplier}`)

        return product.supplier === supplier
      })
      console.log(`Filtrando por proveedor: ${filtered}`)
    }

    if (price.min !== null) {
      filtered = filtered.filter((product) => product.basePrice >= price.min!)
    }

    if (price.max !== null) {
      filtered = filtered.filter((product) => product.basePrice <= price.max!)
    }

    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchLower) ||
          product.sku.toLowerCase().includes(searchLower)
      )
    }

    switch (sort) {
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "price":
        filtered.sort((a, b) => a.basePrice - b.basePrice)
        break
      case "stock":
        filtered.sort((a, b) => b.stock - a.stock)
        break
    }

    setFilteredProducts(filtered)
  }

  const handleSupplierChange = (supplier: string) => {
    setSelectedSupplier(supplier)
    filterProducts(selectedCategory, searchQuery, sortBy, supplier, priceRange)
  }

  const handlePriceRangeChange = (min: number | null, max: number | null) => {
    setPriceRange({ min, max })
    filterProducts(selectedCategory, searchQuery, sortBy, selectedSupplier, {
      min,
      max,
    })
  }

  const handleClearFilters = () => {
    setSelectedCategory("all")
    setSearchQuery("")
    setSortBy("name")
    setSelectedSupplier("all")
    setPriceRange({ min: null, max: null })
    setFilteredProducts(allProducts)
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    filterProducts(category, searchQuery, sortBy, selectedSupplier, priceRange)
  }

  const handleSearchChange = (search: string) => {
    setSearchQuery(search)
    filterProducts(
      selectedCategory,
      search,
      sortBy,
      selectedSupplier,
      priceRange
    )
  }

  const handleSortChange = (sort: string) => {
    setSortBy(sort)
    filterProducts(
      selectedCategory,
      searchQuery,
      sort,
      selectedSupplier,
      priceRange
    )
  }

  return (
    <div className="product-list-page">
      <div className="container">
        {/* Page Header */}
        <div className="page-header">
          <div className="page-info">
            <h1 className="page-title h2">Catálogo de Productos</h1>
            <p className="page-subtitle p1">
              Descubre nuestra selección de productos promocionales premium
            </p>
          </div>

          <div className="page-stats">
            <div className="stat-item">
              <span className="stat-value p1-medium">
                {filteredProducts.length}
              </span>
              <span className="stat-label l1">productos</span>
            </div>
            <div className="stat-item">
              <span className="stat-value p1-medium">6</span>
              <span className="stat-label l1">categorías</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <ProductFilters
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
          sortBy={sortBy}
          selectedSupplier={selectedSupplier}
          priceRange={priceRange}
          onCategoryChange={handleCategoryChange}
          onSearchChange={handleSearchChange}
          onSortChange={handleSortChange}
          onSupplierChange={handleSupplierChange}
          onPriceRangeChange={handlePriceRangeChange}
          onClearFilters={handleClearFilters}
        />

        {/* Products Grid */}
        <div className="products-section">
          {filteredProducts.length === 0 ? (
            <div className="empty-state">
              <span className="material-icons">search_off</span>
              <h3 className="h2">No hay productos</h3>
              <p className="p1">
                No se encontraron productos que coincidan con tu búsqueda.
              </p>
              <button
                className="btn btn-primary cta1"
                onClick={() => {
                  setSearchQuery("")
                  setSelectedCategory("all")
                  filterProducts("all", "", sortBy, "all", {
                    min: null,
                    max: null,
                  })
                }}
              >
                Ver todos los productos
              </button>
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductList
