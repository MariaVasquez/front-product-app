import { ShoppingCart } from "lucide-react";
import { ModalUser } from "./ModalUser";
import { useEffect, useState } from "react";
import { useLocalStorage } from "../hooks/use-local-storage";
import type { UserResponse } from "../models/user.model";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/cart-context";
import { SlidingCartPanel } from "./SlidingCartPanel";

export const Header: React.FC = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [user] = useLocalStorage<UserResponse | null>("user", null);
  const [userName, setUserName] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useCart();
  const hideCart = location.pathname.includes("/checkouts");

  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    if (user?.name) {
      setUserName(`Hola, ${user.name} ${user.lastname}`);
    } else {
      setUserName("MI CUENTA");
    }
  }, [user]);

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 bg-white shadow px-12 py-4 flex justify-between items-center h-20">
        <Link to={`/`}>
          <img
            src="/assets/cute.png"
            alt="Logo Cute"
            className="h-auto max-h-30 object-contain"
          />
        </Link>

        <nav className="bg-white py-4">
          <div className="max-w-screen-lg mx-auto flex items-center justify-center gap-6 font-cinzel text-lg text-gray-800">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();

                if (!user) {
                  setOpenModal(true);
                } else {
                  setShowDropdown((prev) => !prev);
                }
              }}
              className="relative after:absolute after:left-1/2 after:bottom-0 after:translate-x-[-50%] after:h-[1px] after:w-0 after:bg-black hover:after:w-full after:transition-all after:duration-300"
            >
              {userName}
            </a>
            {showDropdown && user && (
              <div className="absolute top-full mt-1/2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50 sm:right-23 right-2">
                <button
                  onClick={() => {
                    localStorage.removeItem("user");
                    setShowDropdown(false);
                    navigate("/");
                    window.location.reload();
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-pink-100"
                >
                  Cerrar Sesión
                </button>
              </div>
            )}

            {location.pathname !== "/checkouts" && (
              <button
                className="relative hover:text-[#d99a76] transition"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingCart className="w-8 h-8" />
                <span className="absolute -top-2 -right-2 bg-[#d99a76] text-white text-xs rounded-full px-1">
                  {totalItems}
                </span>
              </button>
            )}
          </div>
        </nav>
      </header>
      {!hideCart && (
        <SlidingCartPanel
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
        />
      )}
      <ModalUser isOpen={openModal} onClose={handleCloseModal} />
    </>
  );
};
