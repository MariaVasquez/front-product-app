import { Link } from "react-router-dom";

type SuccessModalProps = {
  message: string;
  onClose: () => void;
};

export const SuccessModal: React.FC<SuccessModalProps> = ({
  message,
  onClose,
}) => (
  <div className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.5)] flex items-center justify-center transition-opacity">
    <div className="bg-white rounded-2xl shadow-2xl p-10 w-[90%] max-w-xl text-center">
      <h2 className="text-2xl md:text-3xl font-bold text-green-600 mb-6">
        ✔ Transacción Exitosa
      </h2>
      <p className="text-gray-700 text-lg md:text-xl mb-8">{message}</p>
      <Link to={`/`}>
        <button
          onClick={onClose}
          className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white text-base md:text-lg rounded-lg font-semibold transition"
        >
          Cerrar
        </button>
      </Link>
    </div>
  </div>
);
