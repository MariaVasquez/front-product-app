import { Link } from "react-router-dom";
import { ModalUser } from "./ModalUser";
import { useState } from "react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [openModal, setOpenModal] = useState(false);
  const handleCloseModal = () => {
    setOpenModal(false);
  };

  if (!isOpen) return null;

  return (
    <>
      {!openModal ? (
        <div className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.5)] flex items-center justify-center transition-opacity">
          <div className="bg-white rounded-xl shadow-2xl p-10 w-[450px] max-w-full">
            <h2 className="text-2xl font-bold mb-6 text-center text-red-600">
              ⚠ Atención
            </h2>
            <p className="text-base text-gray-700 text-center mb-8 leading-relaxed">
              Debes iniciar sesión o registrarte para continuar con el proceso
              de pago.
            </p>
            <div className="flex justify-center gap-6">
              <Link to={`/`}>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-gray-300 rounded-md hover:bg-gray-400 text-base font-medium"
                >
                  Cerrar
                </button>
              </Link>

              <button
                onClick={() => {
                  setOpenModal(true);
                }}
                className="px-6 py-3 bg-[#d99a76] hover:bg-[#e9b99a] text-white rounded-md text-base font-semibold"
              >
                Iniciar sesión
              </button>
            </div>
          </div>
        </div>
      ) : null}
      <ModalUser isOpen={openModal} onClose={handleCloseModal} />
    </>
  );
};
