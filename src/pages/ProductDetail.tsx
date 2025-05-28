import { useLocation, useNavigate } from "react-router-dom";
import { ProductService } from "../api/products-service";
import { useEffect, useRef, useState } from "react";
import type { ProductResponse } from "../models/product-response.model";
import { useLocalStorage } from "../hooks/use-local-storage";
import { useCart } from "../context/cart-context";
export const ProductDetail: React.FC = () => {
  const productService = useRef(new ProductService()).current;
  const location = useLocation();
  const productId = location.state?.id;
  const [product, setProduct] = useState<ProductResponse>({
    id: null,
    name: "",
    description: "",
    price: 0,
    currency: "",
    stock: 0,
    isActive: false,
    createdAt: undefined,
    updatedAt: undefined,
    images: [],
    productColor: { color: "", hexadecimalRgb: "" },
  });
  const [quantity, setQuantity] = useState(1);
  const url: string = product.images.find((img) => img.isMain)?.url || "";
  const [cart, setCart] = useLocalStorage<{
    items: { productId: number; quantity: number }[];
  }>("cart", { items: [] });
  const navigate = useNavigate();
  const { dispatch } = useCart();

  useEffect(() => {
    try {
      productService
        .getProductById(productId)
        .then((data) => {
          setProduct(data.data!);
        })
        .catch((err) => console.error(err));
    } catch (err) {
      console.error("Error al registrar usuario", err);
    }
  }, [productId]);

  const handleAddToCart = () => {
    if (product.id == null) return;

    const existingItem = cart.items.find(
      (item) => item.productId === product.id
    );

    let updatedCart;
    if (existingItem) {
      updatedCart = {
        items: cart.items.map((item) =>
          item.productId === product.id ? { ...item, quantity: quantity } : item
        ),
      };
    } else {
      updatedCart = {
        items: [...cart.items, { productId: product.id, quantity }],
      };
    }

    setCart(updatedCart);

    dispatch({
      type: "ADD_ITEM",
      payload: {
        productId: product.id,
        quantity: quantity,
      },
    });
  };

  const handleAddToCartWrapper = () => {
    setTimeout(() => {
      handleAddToCart();
    }, 0);
  };

  const handleGoToCheckoutToPay = () => {
    if (!product.id) return;

    const newItem = { productId: product.id, quantity: 1 };

    const exists = cart.items.find((item) => item.productId === product.id);

    if (!exists) {
      dispatch({
        type: "ADD_ITEM",
        payload: {
          productId: product.id,
          quantity: 1,
        },
      });
    }

    const updatedCart = exists ? cart : { items: [...cart.items, newItem] };

    setCart(updatedCart);

    navigate("/checkouts", { state: updatedCart });
  };

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 pt-20 px-8">
      <div className="w-full flex justify-center">
        {url && (
          <img
            src={url}
            alt="Producto"
            className="max-w-xl w-full object-cover rounded-lg shadow-md"
          />
        )}
      </div>

      <div className="space-y-6 text-left">
        <p className="text-base tracking-widest text-gray-500 uppercase">
          CUTE
        </p>

        <h1 className="text-4xl font-bold leading-snug">{product.name}</h1>

        <p className="text-2xl font-semibold text-black">
          ${product.price.toLocaleString("es-CO")}
        </p>

        <p className="text-base text-gray-600">{product.description}</p>

        <div>
          <p className="text-base font-medium mb-1">Color</p>
          <button
            className="border border-black px-5 py-2 text-black text-base rounded-full"
            style={{ backgroundColor: product.productColor.hexadecimalRgb }}
          >
            {product.productColor.color}
          </button>
        </div>

        <div>
          <p className="text-base font-medium mb-1">Cantidad</p>
          <div className="flex items-center border border-gray-400 w-40 rounded overflow-hidden">
            <button
              className="flex-1 py-2 text-lg font-bold"
              onClick={() =>
                setQuantity((prevQuantity) => Math.max(1, prevQuantity - 1))
              }
            >
              −
            </button>
            <span className="flex-1 text-center text-lg">{quantity}</span>
            <button
              className="flex-1 py-2 text-lg font-bold"
              onClick={() => setQuantity((prevQuantity) => prevQuantity + 1)}
            >
              +
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Stock disponible: {product.stock} unidades
          </p>
        </div>

        <div className="space-y-3 pt-4">
          <button
            className="w-full border border-black py-3 text-base font-medium hover:bg-gray-100 transition"
            onClick={handleAddToCartWrapper}
          >
            Agregar al carrito
          </button>
          <button
            className="w-full bg-[#d99a76] text-white font-semibold py-3 rounded-md hover:bg-[#E9B99A] transition"
            onClick={() => handleGoToCheckoutToPay()}
          >
            Comprar ahora
          </button>
        </div>
      </div>
    </div>
  );
};
