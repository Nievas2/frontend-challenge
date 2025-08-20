import { useEffect, useState } from "react"
import ProductCard from "../components/ProductCard"
import ProductFilters from "../components/ProductFilters"
import { products as allProducts } from "../data/products"
import { Product } from "../types/Product"
import "./ProductList.css"
import { useSearchParams } from "react-router-dom"

const ProductList = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [priceRange, setPriceRange] = useState<{ min: number | null; max: number | null }>({
    min: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : null,
    max: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : null,
  })
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(allProducts)
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all")
  const [selectedSupplier, setSelectedSupplier] = useState(searchParams.get("supplier") || "all")
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "name")

  // function to filter products based on selected criteria
  // This function will be called whenever the filters change
  const filterProducts = (
    category: string,
    search: string,
    sort: string,
    supplier: string,
    price: { min: number | null; max: number | null }
  ) => {
    let filtered = [...allProducts]
    if (category !== "all") filtered = filtered.filter(p => p.category === category)
    if (supplier !== "all") filtered = filtered.filter(p => p.supplier === supplier)
    if (price.min !== null) filtered = filtered.filter(p => p.basePrice >= price.min!)
    if (price.max !== null) filtered = filtered.filter(p => p.basePrice <= price.max!)
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(p => p.name.toLowerCase().includes(searchLower) || p.sku.toLowerCase().includes(searchLower))
    }
    switch (sort) {
      case "name": filtered.sort((a, b) => a.name.localeCompare(b.name)); break
      case "price": filtered.sort((a, b) => a.basePrice - b.basePrice); break
      case "stock": filtered.sort((a, b) => b.stock - a.stock); break
    }
    setFilteredProducts(filtered)
  }

  // useEffect to update filtered products when filters change
  useEffect(() => {
    const params: Record<string, string> = {}
    if (selectedCategory !== "all") params.category = selectedCategory
    if (selectedSupplier !== "all") params.supplier = selectedSupplier
    if (searchQuery) params.search = searchQuery
    if (sortBy !== "name") params.sort = sortBy
    if (priceRange.min !== null) params.minPrice = String(priceRange.min)
    if (priceRange.max !== null) params.maxPrice = String(priceRange.max)

    setSearchParams(params)
    filterProducts(selectedCategory, searchQuery, sortBy, selectedSupplier, priceRange)
  }, [selectedCategory, selectedSupplier, searchQuery, sortBy, priceRange, setSearchParams])

  const handleCategoryChange = (category: string) => setSelectedCategory(category)
  const handleSupplierChange = (supplier: string) => setSelectedSupplier(supplier)
  const handleSearchChange = (search: string) => setSearchQuery(search)
  const handleSortChange = (sort: string) => setSortBy(sort)
  const handlePriceRangeChange = (min: number | null, max: number | null) => setPriceRange({ min, max })
  const handleClearFilters = () => {
    setSelectedCategory("all")
    setSelectedSupplier("all")
    setSearchQuery("")
    setSortBy("name")
    setPriceRange({ min: null, max: null })
  }

  const countCategories = () => new Set(allProducts.map(p => p.category)).size

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

          {/* Page Stats */}
          <div className="page-stats">
            <div className="stat-item">
              <span className="stat-value p1-medium">
                {filteredProducts.length}
              </span>
              <span className="stat-label l1">productos</span>
            </div>
            <div className="stat-item">
              <span className="stat-value p1-medium">{countCategories()}</span>
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
              {/* Render filtered products */}
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
