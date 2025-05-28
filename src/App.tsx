import { Home } from "./pages/Home";
import { Header } from "./components/Header";
import { Routes, Route } from "react-router-dom";
import { ProductDetail } from "./pages/ProductDetail";
import { Checkout } from "./pages/Checkout";

function App() {
  return (
    <div className="min-h-screen bg-white overflow-auto">
      <Header />
      <main className="p-6" >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products/:slug" element={<ProductDetail />} />
          <Route path="/checkouts/" element={<Checkout />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
