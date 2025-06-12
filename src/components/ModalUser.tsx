import React, { useRef, useState } from "react";
import { UserService } from "../api/users-service";
import type { Address, UserRequest, UserResponse } from "../models/user.model";
import { useLocalStorage } from "../hooks/use-local-storage";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { useAuth } from "../context/auth-context";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModalUser: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const [userError, setUserError] = useState<string | null>(null);
  const { setUser } = useAuth();
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

  const [, setUserStorage] = useLocalStorage<UserResponse | null>("user", null);
  const userService = useRef(new UserService()).current;

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
        if (result.code != "Created") {
          setUserError("Error al crear el usuario");
        } else {
          setUserStorage(result.data!);
          onClose();
          setUser(result.data!);
        }
      } catch (err) {
        console.error("Error al registrar usuario", err);
      }
    } else {
      if (!email.trim()) return;
      try {
        const result = await userService.getUserByEmail(email);
        if (result.status == 404) {
          setUserError("No existe el usuario");
        } else {
          setUserStorage(result.data!);
          onClose();
          setUser(result.data!);
        }
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

  if (!isOpen) return null;

  const fields: {
    key: Exclude<keyof UserRequest, "address">;
    label: string;
    type?: string;
  }[] = [
    { key: "name", label: "Nombre" },
    { key: "lastname", label: "Apellido" },
    { key: "email", label: "Correo", type: "email" },
    { key: "phoneNumber", label: "Teléfono" },
    { key: "typeDocument", label: "Tipo de documento" },
    { key: "documentNumber", label: "Número de documento" },
  ];

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center px-4 py-8 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h2" className="sr-only">
                  {isRegistering ? "Formulario de Registro" : "Valida registro"}
                </Dialog.Title>

                <div className="flex flex-col md:flex-row">
                  <div className="hidden md:flex w-1/2 bg-rose-100 items-center justify-center p-6">
                    <img
                      src="/assets/logo-cute.png"
                      alt="Decoración"
                      className="max-w-full h-auto"
                    />
                  </div>

                  <div className="w-full md:w-1/2 p-4 sm:p-6 relative">
                    <button
                      onClick={onClose}
                      className="absolute top-2 right-3 text-lg sm:text-xl"
                    >
                      ×
                    </button>
                    <h2 className="text-center text-xs sm:text-sm font-medium mb-4 uppercase">
                      {isRegistering
                        ? "Formulario de Registro"
                        : "Valida registro"}
                    </h2>

                    {isRegistering ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {fields.map(({ key, label, type }) => (
                          <div key={key}>
                            <input
                              type={type || "text"}
                              placeholder={label}
                              value={userForm[key]}
                              onChange={(e) =>
                                handleChange(key, e.target.value)
                              }
                              className={`w-full p-3 border rounded-md mb-2 ${
                                formErrors[key]
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                            />
                            {formErrors[key] && (
                              <p className="text-sm text-red-600">
                                {formErrors[key]}
                              </p>
                            )}
                          </div>
                        ))}

                        <div>
                          <input
                            type="text"
                            placeholder="Dirección principal"
                            value={userForm.address[0].addressLine1}
                            onChange={(e) =>
                              handleAddressChange(
                                "addressLine1",
                                e.target.value
                              )
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
                              handleAddressChange(
                                "addressLine2",
                                e.target.value
                              )
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
                              addressErrors.city
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                          />
                          {addressErrors.city && (
                            <p className="text-sm text-red-600">
                              {addressErrors.city}
                            </p>
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
                    ) : (
                      <>
                        <input
                          type="email"
                          placeholder="Ej.: ejemplo@mail.com"
                          className="w-full p-3 border rounded-md mb-4"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </>
                    )}

                    <button
                      onClick={handleClick}
                      className="w-full mt-4 bg-[#d99a76] text-white font-semibold py-2 rounded-md hover:bg-[#E9B99A] transition"
                    >
                      {isRegistering ? "Registrarme" : "Enviar"}
                    </button>

                    <button
                      onClick={() => setIsRegistering((prev) => !prev)}
                      className="block mt-4 text-sm text-center text-gray-600 hover:underline"
                    >
                      {isRegistering ? "← Volver" : "Registrarme"}
                    </button>
                    {userError && (
                      <p className="text-red-500 text-sm mt-1">{userError}</p>
                    )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
