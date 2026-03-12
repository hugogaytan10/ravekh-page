import { MainCatalogo } from "../../../Components/CatalogoWeb/MainCatalogo";
import { DetalleProducto } from "../../../Components/CatalogoWeb/DetalleProducto";
import { Pedido } from "../../../Components/CatalogoWeb/Pedido";
import { MainCategoria } from "../../../Components/CatalogoWeb/Categoria";

export const catalogWebFeatureRoutes = [
  { path: "/catalogo/:idBusiness", element: <MainCatalogo /> },
  { path: "/catalogo/producto/:idProducto/:telefono", element: <DetalleProducto /> },
  { path: "/catalogo/pedido", element: <Pedido view="cart" /> },
  { path: "/catalogo/pedido-info", element: <Pedido view="info" /> },
  { path: "/categoria/:idCategoria", element: <MainCategoria /> },
];
