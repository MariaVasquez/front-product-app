import { ShoppingCart } from "lucide-react";
import { ModalUser } from "./ModalUser";
import { useEffect, useState } from "react";
import { useLocalStorage } from "../hooks/use-local-storage";
import type { UserResponse } from "../models/user.model";

export const Header: React.FC = () => {
  const [openModal, setOpenModal] = useState(false);
  const [user] = useLocalStorage<UserResponse | null>("user", null);
  const [userName, setUserName] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState(false);

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

  const handleUserChange = () => {
    const stored = localStorage.getItem("user");
    const updatedUser = stored ? JSON.parse(stored) : null;
    if (updatedUser?.name) {
      setUserName(`Hola, ${updatedUser.name} ${updatedUser.lastname}`);
    } else {
      setUserName("MI CUENTA");
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 bg-white shadow-md px-12 py-4 flex justify-between items-center h-20">
        <img
          src="/assets/cute.png"
          alt="Logo Cute"
          className="h-full max-h-10 object-contain"
        />
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
                    window.location.reload();
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-pink-100"
                >
                  Cerrar Sesión
                </button>
              </div>
            )}
            <button className="relative hover:text-rose-600 transition">
              <ShoppingCart className="w-6 h-6" />
              <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-xs rounded-full px-1">
                1
              </span>
            </button>
          </div>
        </nav>
      </header>
      <ModalUser isOpen={openModal} onClose={handleCloseModal} onUserChange={handleUserChange} />
    </>
  );
};
