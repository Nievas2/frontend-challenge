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

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleEsc)
    return () => document.removeEventListener("keydown", handleEsc)
  }, [onClose])

  if (!isOpen) return null

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
