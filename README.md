# Frontend - React + TypeScript 🛍️

Este proyecto es una **Single Page Application (SPA)** construida con **React + TypeScript** utilizando **Vite** como *bundler*. El diseño es **mobile-first**, responsivo y optimizado con **Tailwind CSS**. La aplicación consume servicios de una API en NestJS para manejar productos, pedidos y pagos usando **Wompi**.

---

## 🚀 Tecnologías utilizadas

- **React 18** con **Vite**
- **TypeScript**
- **React Router v6** para SPA y navegación por rutas
- **Tailwind CSS** para estilos modernos y responsivos
- **React Query** para manejo de peticiones y caché de datos
- **Redux Toolkit** para la gestión del estado del carrito
- **Wompi API** para procesamiento de pagos
- **Axios** para comunicación con el backend

---

## 📦 Estructura del proyecto

```
src/
├── api/         # Configuración de Axios para comunicación con el backend
├── components/  # Componentes reutilizables como Loader, Header, ProductCard, etc.
├── context/     # Estado global de la aplicación usando context API y reducers
├── hooks/       # Hooks personalizados reutilizables (por ejemplo, useProducts, useCart)
├── pages/       # Vistas principales de la SPA: Home, ProductDetails, Checkout
└── models/      # Interfaces y tipos TypeScript para tipado fuerte
```

---

## 🛒 Funcionalidades principales

- SPA completamente responsiva.
- Listado dinámico de productos.
- Detalle del producto con botón para agregar al carrito.
- Carrito deslizable desde el Header.
- Checkout funcional con integración a pagos con tarjeta (tokenización vía Wompi).
- Loader animado y persistencia del estado del carrito en `localStorage`.

---

## 🧪 Variables de entorno

Crea un archivo `.env` en la raíz del frontend con:

```
VITE_API_BASE_URL= http://localhost:5001/api/
VITE_WOMPI_PUBLIC_KEY=pub_stagtest_
VITE_WOMPI_API_URL=https://api-sandbox.co.uat.wompi.dev/v1
```

> Las claves y endpoints deben cambiar según el entorno (`dev`, `prod`, etc.).

---

## 🧑‍💻 Scripts disponibles

```bash
npm install        # Instala dependencias
npm run dev        # Inicia el servidor local de desarrollo (Vite)
npm run build      # Genera la versión optimizada para producción
npm run preview    # Previsualiza la app ya construida
```

---

## ✨ Extras

- Transición entre rutas sin recargar la página.
- Soporte para navegación con `useNavigate` y paso de estado.
- Estilización con utilidades de Tailwind (sin CSS global manual).
- Componentes reutilizables y desacoplados.
- Buenas prácticas de estructura de carpetas y tipado estricto.

---

## Ajustes

-Se sube a la rama develop los ajustes por error en inicio del home, error en validación de el carrito y el login

---

## ✅ Próximas mejoras

- Validaciones de formularios con Zod o React Hook Form.
- Soporte para historial de compras y login.
- Agregar paginación y filtros.

---

## 📄 Licencia

MIT