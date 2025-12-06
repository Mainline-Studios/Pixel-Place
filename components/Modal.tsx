'use client';

import { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  title: string;
  text: string;
  onConfirm?: () => void;
  onClose: () => void;
  onlyClose?: boolean;
}

export default function Modal({ isOpen, title, text, onConfirm, onClose, onlyClose }: ModalProps) {
  useEffect(() => {
    const overlay = document.getElementById('modalOverlay');
    if (overlay) {
      if (isOpen) {
        overlay.classList.add('show');
      } else {
        overlay.classList.remove('show');
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div id="modalOverlay" className={isOpen ? 'show' : ''} onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h3 id="modalTitle">{title}</h3>
        <div id="modalText">{text}</div>
        <div className="modal-buttons">
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          {!onlyClose && onConfirm && (
            <button className="btn" onClick={onConfirm}>
              Confirm
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


