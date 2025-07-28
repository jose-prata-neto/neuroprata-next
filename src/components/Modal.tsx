
import React, { useEffect, useRef, useState } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  const [isRendered, setIsRendered] = useState(false);
  const modalPanelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Handle mounting and unmounting with a delay for animations
  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
    } else {
      // Delay unmounting to allow for exit animations
      const timer = setTimeout(() => setIsRendered(false), 300); // Must match animation duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle ESC key and focus management for accessibility
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCloseRef.current();
      }
    };

    if (isRendered && isOpen) {
      // Set focus to the modal panel for accessibility
      // Timeout ensures the element is visible and focusable after the animation starts.
      const focusTimer = setTimeout(() => {
        modalPanelRef.current?.focus();
      }, 50);

      window.addEventListener('keydown', handleEsc);

      return () => {
        clearTimeout(focusTimer);
        window.removeEventListener('keydown', handleEsc);
      };
    }
  }, [isRendered, isOpen]);

  if (!isRendered) {
    return null;
  }

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black transition-all duration-300 ease-in-out ${isOpen ? 'bg-opacity-50 backdrop-blur-sm' : 'bg-opacity-0'}`}
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div 
        ref={modalPanelRef}
        tabIndex={-1} // Make the div focusable
        className={`relative w-full max-w-lg transform rounded-xl bg-white p-6 shadow-2xl transition-all duration-300 ease-in-out focus:outline-none ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
            <h2 id="modal-title" className="text-xl font-bold text-slate-800">{title}</h2>
            <button
                type="button"
                className="text-slate-400 hover:text-slate-600"
                onClick={onClose}
                aria-label="Fechar"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
