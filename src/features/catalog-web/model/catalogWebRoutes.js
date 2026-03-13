export const catalogWebRoutesModel = {
  home: "/catalogo/:idBusiness",
  productDetail: "/catalogo/producto/:idProducto/:telefono",
  category: "/categoria/:idCategoria",
  order: "/catalogo/pedido",
  orderInfo: "/catalogo/pedido-info",
};

export const catalogWebRouteKeys = Object.freeze({
  home: "home",
  productDetail: "productDetail",
  category: "category",
  order: "order",
  orderInfo: "orderInfo",
});
