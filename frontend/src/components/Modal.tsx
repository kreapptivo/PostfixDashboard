import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center">
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      <div
        className="relative bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md border border-gray-700"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex justify-between items-center mb-4">
          {title && <h2 className="text-xl font-semibold text-gray-100">{title}</h2>}
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl font-bold">
            &times;
          </button>
        </div>
        <div className="text-gray-300">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
