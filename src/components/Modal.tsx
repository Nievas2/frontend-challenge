import React, { ReactNode, useEffect } from "react"
import ReactDOM from "react-dom"
import "./Modal.css"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  const modalRoot = document.getElementById("modal-root") || document.body

  /* Close modal when escape key is pressed */
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleEsc)
    return () => document.removeEventListener("keydown", handleEsc)
  }, [onClose])

  // Effect to handle body overflow when menu is open
  useEffect(() => {
    if (isOpen) {
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
  }, [isOpen])

  if (!isOpen) return null

  /* Render modal using React Portal */
  // This allows the modal to be rendered outside the normal DOM hierarchy
  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        {children}
      </div>
    </div>,
    modalRoot
  )
}

export default Modal
