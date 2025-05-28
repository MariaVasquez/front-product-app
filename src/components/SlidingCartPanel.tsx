import { useNavigate } from "react-router-dom";
import { useCart } from "../context/cart-context";
import { useProductsByIds } from "../hooks/use-product";
import { useState } from "react";
import { Trash2 } from "lucide-react";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SlidingCartPanel: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const { dispatch } = useCart();
  const { state } = useCart();
  const navigate = useNavigate();
  const [quantities, setQuantities] = useState<{ [productId: number]: number }>(
    {}
  );
  const increase = (productId: number) => {
    const newQuantity = (quantities[productId] || 1) + 1;
    setQuantities((prev) => ({
      ...prev,
      [productId]: newQuantity,
    }));
    dispatch({
      type: "UPDATE_ITEM_QUANTITY",
      payload: { productId, quantity: newQuantity },
    });
  };

  const decrease = (productId: number) => {
    const newQuantity = Math.max(1, (quantities[productId] || 1) - 1);
    setQuantities((prev) => ({
      ...prev,
      [productId]: newQuantity,
    }));
    dispatch({
      type: "UPDATE_ITEM_QUANTITY",
      payload: { productId, quantity: newQuantity },
    });
  };

  const productIds = state.items.map((i) => i.productId);

  const infoProducts = useProductsByIds(productIds);

  const totalAmount = () => {
    let amount = 0;

    infoProducts.forEach((p) => {
      const quantity = state.items.find(
        (i) => i.productId === p.data?.id
      )?.quantity;

      if (typeof quantity !== "number" || quantity <= 0) {
        console.error("Cantidad inválida para el producto", p.data?.id);
        return;
      }

      const price = p.data?.price;

      if (typeof price === "number" && price > 0) {
        amount += price * quantity;
      } else {
        console.warn("Precio inválido para el producto", p.data?.id);
      }
    });

    return amount.toLocaleString("es-CO");
  };

  const handleGoToCheckoutToPay = () => {
    onClose();
    navigate("/checkouts", { state: { items: state.items } });
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white shadow-lg z-50 transform transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Header */}
      <div className="p-7.5 flex justify-between items-center bg-white">
        <button onClick={onClose} className="text-sm text-gray-700 font-medium">
          Volver
        </button>
      </div>

      <h2 className="text-center text-gray-700 text-xl font-bold mb-2">
        Carrito de compras
      </h2>

      <div className="p-4 overflow-y-auto h-[calc(100%-250px)]">
        {infoProducts.length === 0 ? (
          <p className="text-gray-500 text-center mt-10">
            Tu carrito está vacío
          </p>
        ) : (
          infoProducts.map((item) => (
            <div
              key={item.data?.id}
              className="flex items-center justify-between border-b border-gray-300 pb-4 mb-4 pt-4"
            >
              <Trash2
                onClick={() =>
                  dispatch({
                    type: "REMOVE_ITEM",
                    payload: item.data?.id ?? 0,
                  })
                }
                className="w-4 h-4 text-[#d99a76]cursor-pointer hover:text-[#E9B99A]"
              />
              <div className="flex items-center gap-4">
                <img
                  src={item.data?.images.find((i) => i.isMain)?.url || ""}
                  alt="Producto"
                  className="w-14 h-14 object-cover rounded"
                />
                <div>
                  <p className="text-xs text-gray-500">{item.data?.name}</p>
                  <p className="text-sm font-medium leading-tight w-[170px]">
                    {item.data?.description}
                  </p>
                  <p className="text-sm font-semibold">
                    {item.data?.price.toLocaleString("es-CO")}
                  </p>
                </div>
              </div>

              <div className="flex items-center border border-gray-300 w-28 rounded-md overflow-hidden">
                <button
                  className="w-8 h-8 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                  onClick={() => decrease(item.data?.id || 0)}
                >
                  −
                </button>
                <span className="flex-1 text-center text-sm">
                  {state.items.find((i) => i.productId === item.data?.id)
                    ?.quantity || 1}
                </span>
                <button
                  className="w-8 h-8 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                  onClick={() => increase(item.data?.id || 0)}
                >
                  +
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t border-gray-300 bg-white">
        <div className="text-sm font-medium">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>$ {totalAmount()}</span>
          </div>
          <div className="flex justify-between mt-1">
            <span>Total</span>
            <span className="font-bold">$ {totalAmount()}</span>
          </div>
        </div>

        <button
          onClick={() => {
            handleGoToCheckoutToPay();
          }}
          className="w-full mt-2 bg-[#d99a76] text-white font-semibold py-2 rounded-md hover:bg-[#E9B99A] transition"
          disabled={infoProducts.length === 0}
        >
          Ir a pagar
        </button>
      </div>
    </div>
  );
};
