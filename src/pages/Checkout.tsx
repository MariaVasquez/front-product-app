import React, { useState } from "react";
import { WompiService } from "../api/wompi-service";
import { useLocation } from "react-router-dom";
import type { OrderRequest } from "../models/order-request.model";
import type { UserResponse } from "../models/user.model";
import { useLocalStorage } from "../hooks/use-local-storage";

export const Checkout: React.FC = () => {
  const location = useLocation();
  const orderInfo = location.state as OrderRequest;
  const [user] = useLocalStorage<UserResponse | null>("user", null);
  const wompiService = new WompiService();
  const [card, setCard] = useState({
    number: "",
    expMonth: "",
    expYear: "",
    cvc: "",
    cardHolder: "",
  });

  console.log(orderInfo);
  console.log(user);
  
  

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCard({ ...card, [e.target.name]: e.target.value });
  };


  const handlePay = async () => {
   const acceptToken = await wompiService.getAcceptanceToken();
   console.log(acceptToken);
   
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Formulario de pago</h1>
      <div className="space-y-2 mt-4">
        <input name="cardHolder" onChange={handleInput} placeholder="Titular" />
        <input name="number" onChange={handleInput} placeholder="Número" />
        <input name="expMonth" onChange={handleInput} placeholder="Mes (MM)" />
        <input name="expYear" onChange={handleInput} placeholder="Año (AA)" />
        <input name="cvc" onChange={handleInput} placeholder="CVC" />
        <button
          onClick={handlePay}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Pagar con tarjeta
        </button>
      </div>
    </div>
  );
};
