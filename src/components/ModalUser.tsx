import React, { useEffect, useState } from "react";
import { UserService } from "../api/users-service";
import type { Address, UserRequest, UserResponse } from "../models/user.model";
import { useLocalStorage } from "../hooks/use-local-storage";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserChange?: () => void;
}

export const ModalUser: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onUserChange,
}) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [userForm, setUserForm] = useState<UserRequest>({
    name: "",
    lastname: "",
    email: "",
    phoneNumber: "",
    typeDocument: "",
    documentNumber: "",
    address: [
      {
        addressLine1: "",
        city: "",
        region: "",
        country: "",
        addressLine2: "",
        postalCode: "",
        isActive: true,
      },
    ],
  });
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof UserRequest, string>>
  >({});
  const [addressErrors, setAddressErrors] = useState<
    Partial<Record<keyof Address, string>>
  >({});
  const [user, setUser] = useLocalStorage<UserResponse | null>("user", null);
  const userService = new UserService();

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof UserRequest, string>> = {};
    const addrErrors: Partial<Record<keyof Address, string>> = {};

    if (!userForm.name.trim()) errors.name = "Nombre requerido";
    if (!userForm.lastname.trim()) errors.lastname = "Apellido requerido";
    if (!userForm.email.trim()) errors.email = "Correo requerido";
    if (!userForm.phoneNumber.trim()) errors.phoneNumber = "Teléfono requerido";
    if (!userForm.typeDocument.trim())
      errors.typeDocument = "Tipo de documento requerido";
    if (!userForm.documentNumber.trim())
      errors.documentNumber = "Número de documento requerido";

    const address = userForm.address[0];
    if (!address.addressLine1.trim())
      addrErrors.addressLine1 = "Dirección requerida";
    if (!address.city.trim()) addrErrors.city = "Ciudad requerida";
    if (!address.region.trim()) addrErrors.region = "Región requerida";
    if (!address.country.trim()) addrErrors.country = "País requerido";

    setFormErrors(errors);
    setAddressErrors(addrErrors);

    return (
      Object.keys(errors).length === 0 && Object.keys(addrErrors).length === 0
    );
  };

  const handleClick = async () => {
    if (isRegistering) {
      if (!validateForm()) return;
      try {
        const result = await userService.saveUser(userForm);
        setUser(result.data!);
        onClose();
      } catch (err) {
        console.error("Error al registrar usuario", err);
      }
    } else {
      if (!email.trim()) return;
      try {
        const result = await userService.getUserByEmail(email);
        setUser(result.data!);
        onClose();
      } catch (err) {
        console.error("Error al buscar usuario", err);
      }
    }
  };

  const handleChange = (field: keyof UserRequest, value: string) => {
    setUserForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (field: keyof Address, value: string) => {
    setUserForm((prev) => ({
      ...prev,
      address: [{ ...prev.address[0], [field]: value }],
    }));
  };

  useEffect(() => {
    if (user?.name) {
      onUserChange?.();
    }
  }, [user]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.5)] flex items-center justify-center transition-opacity">
      <div className="bg-white w-full max-w-3xl rounded-lg overflow-hidden shadow-lg flex">
        <div className="w-1/2 bg-rose-100 flex items-center justify-center p-6">
          <img
            src="/assets/logo-cute.png"
            alt="Decoración"
            className="max-w-full h-auto"
          />
        </div>

        <div className="w-1/2 p-6 relative">
          <button onClick={onClose} className="absolute top-2 right-3 text-lg">
            ×
          </button>

          <h2 className="text-center text-sm font-medium mb-4 uppercase">
            {isRegistering ? "Formulario de Registro" : "Valida registro"}
          </h2>

          {isRegistering ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <input
                    type="text"
                    placeholder="Nombre"
                    value={userForm.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className={`w-full p-3 border rounded-md mb-2 ${
                      formErrors.name ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {formErrors.name && (
                    <p className="text-sm text-red-600">{formErrors.name}</p>
                  )}
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Apellido"
                    value={userForm.lastname}
                    onChange={(e) => handleChange("lastname", e.target.value)}
                    className={`w-full p-3 border rounded-md mb-2 ${
                      formErrors.lastname ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {formErrors.lastname && (
                    <p className="text-sm text-red-600">
                      {formErrors.lastname}
                    </p>
                  )}
                </div>

                <div>
                  <input
                    type="email"
                    placeholder="Correo"
                    value={userForm.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className={`w-full p-3 border rounded-md mb-2 ${
                      formErrors.email ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {formErrors.email && (
                    <p className="text-sm text-red-600">{formErrors.email}</p>
                  )}
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Teléfono"
                    value={userForm.phoneNumber}
                    onChange={(e) =>
                      handleChange("phoneNumber", e.target.value)
                    }
                    className={`w-full p-3 border rounded-md mb-2 ${
                      formErrors.phoneNumber
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {formErrors.phoneNumber && (
                    <p className="text-sm text-red-600">
                      {formErrors.phoneNumber}
                    </p>
                  )}
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Tipo de documento"
                    value={userForm.typeDocument}
                    onChange={(e) =>
                      handleChange("typeDocument", e.target.value)
                    }
                    className={`w-full p-3 border rounded-md mb-2 ${
                      formErrors.typeDocument
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {formErrors.typeDocument && (
                    <p className="text-sm text-red-600">
                      {formErrors.typeDocument}
                    </p>
                  )}
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Número de documento"
                    value={userForm.documentNumber}
                    onChange={(e) =>
                      handleChange("documentNumber", e.target.value)
                    }
                    className={`w-full p-3 border rounded-md mb-2 ${
                      formErrors.documentNumber
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {formErrors.documentNumber && (
                    <p className="text-sm text-red-600">
                      {formErrors.documentNumber}
                    </p>
                  )}
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Dirección principal"
                    value={userForm.address[0].addressLine1}
                    onChange={(e) =>
                      handleAddressChange("addressLine1", e.target.value)
                    }
                    className={`w-full p-3 border rounded-md mb-2 ${
                      addressErrors.addressLine1
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {addressErrors.addressLine1 && (
                    <p className="text-sm text-red-600">
                      {addressErrors.addressLine1}
                    </p>
                  )}
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Detalle de la dirección"
                    value={userForm.address[0].addressLine2}
                    onChange={(e) =>
                      handleAddressChange("addressLine1", e.target.value)
                    }
                    className="w-full p-3 border rounded-md mb-2 border-gray-300"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Ciudad"
                    value={userForm.address[0].city}
                    onChange={(e) =>
                      handleAddressChange("city", e.target.value)
                    }
                    className={`w-full p-3 border rounded-md mb-2 ${
                      addressErrors.city ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {addressErrors.city && (
                    <p className="text-sm text-red-600">{addressErrors.city}</p>
                  )}
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Región"
                    value={userForm.address[0].region}
                    onChange={(e) =>
                      handleAddressChange("region", e.target.value)
                    }
                    className={`w-full p-3 border rounded-md mb-2 ${
                      addressErrors.region
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {addressErrors.region && (
                    <p className="text-sm text-red-600">
                      {addressErrors.region}
                    </p>
                  )}
                </div>

                <div>
                  <select
                    value={userForm.address[0].country}
                    onChange={(e) =>
                      handleAddressChange("country", e.target.value)
                    }
                    className={`w-full p-3 border rounded-md mb-2 ${
                      addressErrors.country
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="">Selecciona un país</option>
                    <option value="CO">Colombia</option>
                    {/* Aquí puedes agregar más países si lo deseas */}
                  </select>

                  {addressErrors.country && (
                    <p className="text-sm text-red-600">
                      {addressErrors.country}
                    </p>
                  )}
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Código postal"
                    value={userForm.address[0].postalCode}
                    onChange={(e) =>
                      handleAddressChange("postalCode", e.target.value)
                    }
                    className="w-full p-3 border rounded-md mb-2 border-gray-300"
                  />
                </div>
              </div>
            </>
          ) : (
            <input
              type="email"
              placeholder="Ej.: ejemplo@mail.com"
              className="w-full p-3 border rounded-md mb-4"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          )}

          <button
            onClick={handleClick}
            className="w-full top-2 bg-[#d99a76] text-white font-semibold py-2 rounded-md hover:bg-[#E9B99A] transition"
          >
            {isRegistering ? "Registrarme" : "Enviar"}
          </button>

          <button
            onClick={() => setIsRegistering((prev) => !prev)}
            className="block mt-4 text-sm text-center text-gray-600 hover:underline"
          >
            {isRegistering ? "← Volver" : "Registrarme"}
          </button>
        </div>
      </div>
    </div>
  );
};
