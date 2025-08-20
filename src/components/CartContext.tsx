import {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
} from "react"
import { CartItem, Product } from "../types/Product"

// types for cart state and actions
export interface CartState {
  items: CartItem[]
  subtotal: number
  total: number
  itemCount: number
}

export interface CartContextType extends CartState {
  addToCart: (
    product: Product,
    quantity?: number,
    selectedColor?: string,
    selectedSize?: string
  ) => void
  removeFromCart: (
    productId: number,
    selectedColor?: string,
    selectedSize?: string
  ) => void
  updateQuantity: (
    productId: number,
    quantity: number,
    selectedColor?: string,
    selectedSize?: string
  ) => void
  clearCart: () => void
  getCartItem: (
    productId: number,
    selectedColor?: string,
    selectedSize?: string
  ) => CartItem | undefined
  checkIsInCart: (
    productId: number,
    selectedColor?: string,
    selectedSize?: string
  ) => boolean
}

// types for cart actions
type CartAction =
  | {
      type: "ADD_TO_CART"
      payload: {
        product: Product
        quantity: number
        selectedColor?: string
        selectedSize?: string
      }
    }
  | {
      type: "REMOVE_FROM_CART"
      payload: {
        productId: number
        selectedColor?: string
        selectedSize?: string
      }
    }
  | {
      type: "UPDATE_QUANTITY"
      payload: {
        productId: number
        quantity: number
        selectedColor?: string
        selectedSize?: string
      }
    }
  | { type: "CLEAR_CART" }

// function to calculate unit price based on quantity and price breaks
function calculateUnitPrice(product: Product, quantity: number): number {
  if (!product.priceBreaks || product.priceBreaks.length === 0) {
    return product.basePrice
  }

  // Sort price breaks from highest to lowest
  const sortedBreaks = [...product.priceBreaks].sort(
    (a, b) => b.minQty - a.minQty
  )

  // Find the applicable price break
  for (const priceBreak of sortedBreaks) {
    if (quantity >= priceBreak.minQty) {
      return priceBreak.price
    }
  }

  return product.basePrice
}

// Function to create a cart item from a product
function createCartItem(
  product: Product,
  quantity: number,
  selectedColor?: string,
  selectedSize?: string
): CartItem {
  const unitPrice = calculateUnitPrice(product, quantity)
  const totalPrice = unitPrice * quantity

  return {
    ...product,
    quantity,
    selectedColor,
    selectedSize,
    unitPrice,
    totalPrice,
  }
}

// Function to generate a unique key for the item (including variants)
function getItemKey(
  productId: number,
  selectedColor?: string,
  selectedSize?: string
): string {
  return `${productId}-${selectedColor || "no-color"}-${
    selectedSize || "no-size"
  }`
}

// Function to calculate cart totals
function calculateTotals(items: CartItem[]): {
  subtotal: number
  total: number
  itemCount: number
} {
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  // For now total is equal to subtotal, but here you could add taxes, discounts, etc.
  const total = subtotal

  return { subtotal, total, itemCount }
}

// Load state from localStorage (if exists)
function loadFromLocalStorage(): CartState {
  try {
    const data = localStorage.getItem("cart")
    if (data) {
      return JSON.parse(data)
    }
  } catch (error) {
    console.error("Error loading cart from localStorage", error)
  }
  return initialState
}

// Initial cart state
const initialState: CartState = {
  items: [],
  subtotal: 0,
  total: 0,
  itemCount: 0,
}

// Cart reducer
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_TO_CART": {
      const { product, quantity, selectedColor, selectedSize } = action.payload

      // Check if product is active
      if (product.status !== "active") {
        throw new Error("Inactive products cannot be added to the cart")
      }

      // Check available stock
      if (quantity > product.stock) {
        throw new Error(
          `Insufficient stock. Only ${product.stock} units available`
        )
      }

      // Check minimum and maximum quantity if defined
      if (product.minQuantity && quantity < product.minQuantity) {
        throw new Error(`The minimum quantity is ${product.minQuantity} units`)
      }

      if (product.maxQuantity && quantity > product.maxQuantity) {
        throw new Error(`The maximum quantity is ${product.maxQuantity} units`)
      }

      const itemKey = getItemKey(product.id, selectedColor, selectedSize)
      const existingItemIndex = state.items.findIndex(
        (item) =>
          getItemKey(item.id, item.selectedColor, item.selectedSize) === itemKey
      )

      let newItems: CartItem[]

      if (existingItemIndex >= 0) {
        // Item already exists, update quantity
        const existingItem = state.items[existingItemIndex]
        const newQuantity = existingItem.quantity + quantity

        // Check stock for the new total quantity
        if (newQuantity > product.stock) {
          throw new Error(
            `Insufficient stock. Only ${product.stock} units available`
          )
        }

        // Check maximum quantity for the new total quantity
        if (product.maxQuantity && newQuantity > product.maxQuantity) {
          throw new Error(
            `The maximum quantity is ${product.maxQuantity} units`
          )
        }

        // Create updated item with new quantity and recalculate prices
        const updatedItem = createCartItem(
          product,
          newQuantity,
          selectedColor,
          selectedSize
        )

        newItems = [...state.items]
        newItems[existingItemIndex] = updatedItem
      } else {
        // New item, add it to cart
        const newItem = createCartItem(
          product,
          quantity,
          selectedColor,
          selectedSize
        )
        newItems = [...state.items, newItem]
      }

      const totals = calculateTotals(newItems)
      return { items: newItems, ...totals }
    }

    case "REMOVE_FROM_CART": {
      const { productId, selectedColor, selectedSize } = action.payload
      const itemKey = getItemKey(productId, selectedColor, selectedSize)

      const newItems = state.items.filter(
        (item) =>
          getItemKey(item.id, item.selectedColor, item.selectedSize) !== itemKey
      )

      const totals = calculateTotals(newItems)
      return { items: newItems, ...totals }
    }

    case "UPDATE_QUANTITY": {
      const { productId, quantity, selectedColor, selectedSize } =
        action.payload

      if (quantity <= 0) {
        return cartReducer(state, {
          type: "REMOVE_FROM_CART",
          payload: { productId, selectedColor, selectedSize },
        })
      }

      const itemKey = getItemKey(productId, selectedColor, selectedSize)
      const itemIndex = state.items.findIndex(
        (item) =>
          getItemKey(item.id, item.selectedColor, item.selectedSize) === itemKey
      )

      if (itemIndex === -1) {
        throw new Error("Product not found in cart")
      }

      const existingItem = state.items[itemIndex]

      const updatedItem = createCartItem(
        {
          ...existingItem,
        },
        quantity,
        selectedColor,
        selectedSize
      )

      const newItems = [...state.items]
      newItems[itemIndex] = updatedItem

      const totals = calculateTotals(newItems)
      return { items: newItems, ...totals }
    }

    case "CLEAR_CART":
      return initialState

    default:
      return state
  }
}

// Create the context
const CartContext = createContext<CartContextType | undefined>(undefined)

// Context provider
export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(
    cartReducer,
    initialState,
    loadFromLocalStorage
  )

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(state))
    } catch (error) {
      console.error("Error saving cart to localStorage", error)
    }
  }, [state])

  const addToCart = (
    product: Product,
    quantity: number = 1,
    selectedColor?: string,
    selectedSize?: string
  ) => {
    try {
      dispatch({
        type: "ADD_TO_CART",
        payload: { product, quantity, selectedColor, selectedSize },
      })
    } catch (error) {
      throw error
    }
  }

  const removeFromCart = (
    productId: number,
    selectedColor?: string,
    selectedSize?: string
  ) => {
    dispatch({
      type: "REMOVE_FROM_CART",
      payload: { productId, selectedColor, selectedSize },
    })
  }

  const updateQuantity = (
    productId: number,
    quantity: number,
    selectedColor?: string,
    selectedSize?: string
  ) => {
    try {
      dispatch({
        type: "UPDATE_QUANTITY",
        payload: { productId, quantity, selectedColor, selectedSize },
      })
    } catch (error) {
      throw error
    }
  }

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" })
  }

  const getCartItem = (
    productId: number,
    selectedColor?: string,
    selectedSize?: string
  ): CartItem | undefined => {
    const itemKey = getItemKey(productId, selectedColor, selectedSize)
    return state.items.find(
      (item) =>
        getItemKey(item.id, item.selectedColor, item.selectedSize) === itemKey
    )
  }

  const checkIsInCart = (
    productId: number,
    selectedColor?: string,
    selectedSize?: string
  ): boolean => {
    return getCartItem(productId, selectedColor, selectedSize) !== undefined
  }

  return (
    <CartContext.Provider
      value={{
        ...state,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartItem,
        checkIsInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

// Custom hook to use the context
export function useCart(): CartContextType {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
