import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "./Context/AppContext";
import { Producto } from "./Modelo/Producto";
import { FiTruck, FiCreditCard, FiPhone } from "react-icons/fi"; // Importando iconos
import { Order } from "./Modelo/Order";
import { OrderDetails } from "./Modelo/OrderDetails";
import { insertOrder } from "./Petitions";
import trash from '../../assets/trash.svg';

export const Pedido: React.FC = () => {
  const { cart, phoneNumber: storePhoneNumber, idBussiness, setCart } = useContext(AppContext); // Número de la tienda
  const [nombre, setNombre] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [clientPhoneNumber, setClientPhoneNumber] = useState<string>(""); // Número del cliente
  const [deliveryMethod, setDeliveryMethod] = useState<string>("domicilio");
  const [paymentMethod, setPaymentMethod] = useState<string>("transferencia");


  // Campos de dirección
  const [calle, setCalle] = useState<string>("");
  const [codigoPostal, setCodigoPostal] = useState<string>("");
  const [municipio, setMunicipio] = useState<string>("");
  const [estado, setEstado] = useState<string>("");
  const [referencia, setReferencia] = useState<string>("");
  const context = useContext(AppContext);

  // Estados para los errores
  const [errors, setErrors] = useState<{
    nombre?: string;
    email?: string;
    clientPhoneNumber?: string;
  }>({});

  const totalArticulos = cart.reduce(
    (total, item) => total + (item.Quantity || 1),
    0
  );
  const totalPrecio = cart.reduce(
    (total, item) => total + item.Price * (item.Quantity || 1),
    0
  );
  const saveOrder = async () => {
    // Concatenar la dirección si es entrega a domicilio
    const fullAddress =
      deliveryMethod === "domicilio"
        ? `Calle: ${calle}, Código Postal: ${codigoPostal}, Municipio: ${municipio}, Estado: ${estado}, Referencia: ${referencia}`
        : "Recoger en tienda";

    const order: Order = {
      Name: nombre,
      Business_Id: Number(idBussiness),
      Delivery: deliveryMethod === "domicilio" ? 1 : 0,
      PaymentMethod: paymentMethod,
      Address: fullAddress,
      PhoneNumber: clientPhoneNumber,
    };
    //array de detalles de orden
    const orderDetails: OrderDetails[] = cart.map((producto) => ({
      Product_Id: producto.Id,
      Quantity: producto.Quantity || 1,
    }));

    insertOrder(order, orderDetails).then((data) => {
      console.log(data);
    });

  }

  useEffect(() => {
    if (cart.length === 0) {
      const storedCart = localStorage.getItem("cart");
      if (storedCart) {
        const parsedCart = JSON.parse(storedCart);
        if (Array.isArray(parsedCart)) {
          setCart(parsedCart);
        }
      }
    }
  }, [cart, setCart]);

  useEffect(() => {
    const menuIcono = document.getElementById("menuIcono");
    menuIcono?.classList.add("hidden");

    const menuNavegacion = document.getElementById("menuIconoCatalogo");
    menuNavegacion?.classList.remove("hidden");

    //ocultamos la imagen del menu
    const menuImagen = document.getElementById("imgCatalogo");
    menuImagen?.classList.add("hidden");

    //mostramos la flecha de regreso
    const arrowIcon = document.getElementById("backCatalogo");
    arrowIcon?.classList.remove("hidden");
  }, []);

  // Función para validar los campos
  const validate = () => {
    const newErrors: {
      nombre?: string;
      email?: string;
      clientPhoneNumber?: string;
    } = {};

    if (!nombre.trim()) {
      newErrors.nombre = "El nombre es obligatorio.";
    }

    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = "El email no es válido.";
    }

    if (!clientPhoneNumber.trim()) {
      newErrors.clientPhoneNumber = "El teléfono es obligatorio.";
    } else if (!/^\d{7,15}$/.test(clientPhoneNumber)) {
      newErrors.clientPhoneNumber =
        "El teléfono debe contener solo números y tener entre 7 y 15 dígitos.";
    }

    setErrors(newErrors);

    // Retornar true si no hay errores
    return Object.keys(newErrors).length === 0;
  };

  // Función para manejar el envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      // Aquí puedes manejar el envío del formulario, por ejemplo, enviar los datos al servidor o preparar el mensaje para WhatsApp
      //tomamos el numero de la tienda y mandamos un mensaje de whatsapp
      //diciendo 'Hola he hecho un pedido con los siguientes productos...'
      saveOrder();
      const mensaje = `Hola, he hecho un pedido con los siguientes productos:
                        ${cart
          .map(
            (producto) =>
              `${producto.Name} x ${producto.Quantity || 1}`
          )
          .join("\n")}
                        Total: $${totalPrecio.toFixed(2)}
                        Método de entrega: ${deliveryMethod === "domicilio"
          ? "Entrega a domicilio"
          : "Recoger en tienda"
        }
                        Método de pago: ${paymentMethod}
                        Nombre: ${nombre}
                        Email: ${email || "No proporcionado"}
                        Teléfono: ${clientPhoneNumber}`;

      const url = `https://wa.me/${storePhoneNumber}?text=${encodeURIComponent(
        mensaje
      )}`;
      console.log(url);
      window.open(url, "_blank");
    } else {
      console.log("Formulario inválido, mostrando errores.");
    }
  };

  const incrementQuantity = (productId: number) => {
    const updatedCart = cart.map(item => {
      if (item.Id === productId) {
        return { ...item, Quantity: item.Quantity! + 1 };
      }
      return item;
    });
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const decrementQuantity = (productId: number) => {
    const updatedCart = cart.map(item => {
      if (item.Id === productId) {
        if (item.Quantity! > 1) {
          return { ...item, Quantity: item.Quantity! - 1 }; // Reduce la cantidad
        } else {
          const confirmed = window.confirm("¿Estás seguro de eliminar este producto?");
          if (confirmed) {
            context.removeProductFromCart(productId.toString()); // Elimina el producto si se confirma
            return null; // Retorna null para que sea eliminado del array
          }
        }
      }
      return item;
    }).filter(item => item !== null); // Filtra los productos eliminados

    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  return (
    <div className="py-20 px-4 lg:px-0 max-w-lg md:max-w-2xl lg:w-3/4 mx-auto">
      {/* Resumen del pedido */}
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Preparemos su pedido
      </h1>
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Su pedido</h2>
        <div className="divide-y divide-gray-200">
          {cart.map((producto: Producto) => (
            <div
              key={producto.Id}
              className="py-4 flex items-center justify-between"
            >
              <img
                src={producto.Image}
                alt={producto.Name}
                className="w-16 h-16 object-cover rounded-lg mr-4"
              />
              <div className="flex flex-col flex-grow">
                <span className="font-medium text-gray-800">{producto.Name}</span>
                <span className="text-gray-500">${producto.Price} x {producto.Quantity || 1}</span>
              </div>

              <div className="flex flex-col items-end">
                <span className="text-gray-800 font-semibold">
                  ${(producto.Price * (producto.Quantity || 1)).toFixed(2)}
                </span>
                <div className="flex items-center space-x-4 mt-2">
                    {producto.Quantity! > 1 ? (
                    <button
                      onClick={() => decrementQuantity(producto.Id)}
                      className="text-red-600 text-lg"
                    >
                      -
                    </button>
                    ) : (
                    <button onClick={() => decrementQuantity(producto.Id)}>
                      <img src={trash} alt="Eliminar" className="text-red-600" />
                    </button>
                    )}
                  <span className="text-gray-800">{producto.Quantity}</span>
                    <button
                    onClick={() => incrementQuantity(producto.Id)}
                    className="text-green-600 text-lg"
                    >
                    +
                    </button>
                </div>
              </div>



            </div>
          ))}
        </div>

        <div className="flex justify-between items-center mt-6 text-lg font-semibold text-gray-800">
          <span>
            Total artículos ({totalArticulos} artículo
            {totalArticulos > 1 ? "s" : ""})
          </span>
          <span>${totalPrecio.toFixed(2)}</span>
        </div>
        {cart.length > 0 && (
          <div className="flex justify-center mt-6">
            <span
              onClick={() => {
              const confirmed = window.confirm("¿Estás seguro de que quieres limpiar el carrito?");
              if (confirmed) {
                context.clearCart();
              }
              }}
              className="text-red-500 cursor-pointer hover:underline"
            >
              Limpiar Carrito
            </span>
          </div>
        )}
      </div>

      {/* Formulario para el nombre y contacto */}
      <form onSubmit={handleSubmit}>
        <div className="bg-white p-6 rounded-lg shadow-lg mt-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Información de contacto
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-gray-700">Nombre completo</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className={`bg-white w-full p-3 border ${errors.nombre ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:outline-none focus:border-gray-500`}
                placeholder="Introduce tu nombre"
              />
              {errors.nombre && (
                <span className="text-red-500 text-sm mt-1">
                  {errors.nombre}
                </span>
              )}
            </div>
            <div className="flex flex-col">
              <label className="text-gray-700">Email (opcional)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`bg-white w-full p-3 border ${errors.email ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:outline-none focus:border-gray-500`}
                placeholder="Introduce tu email"
              />
              {errors.email && (
                <span className="text-red-500 text-sm mt-1">
                  {errors.email}
                </span>
              )}
            </div>
            <div className="md:col-span-2 flex flex-col">
              <label className="text-gray-700">Teléfono móvil</label>
              <input
                type="text"
                value={clientPhoneNumber}
                onChange={(e) => setClientPhoneNumber(e.target.value)}
                className={`bg-white w-full p-3 border ${errors.clientPhoneNumber
                  ? "border-red-500"
                  : "border-gray-300"
                  } rounded-lg focus:outline-none focus:border-gray-500`}
                placeholder="Introduce tu teléfono"
              />
              {errors.clientPhoneNumber && (
                <span className="text-red-500 text-sm mt-1">
                  {errors.clientPhoneNumber}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Método de entrega */}
        <div className="bg-white p-6 rounded-lg shadow-lg mt-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Método de entrega
          </h2>
          <div className="flex items-center mb-4">
            <FiTruck className="text-gray-600 mr-2" size={24} />
            <label className="text-gray-700">
              Seleccione el método de entrega
            </label>
          </div>
          <select
            value={deliveryMethod}
            onChange={(e) => setDeliveryMethod(e.target.value)}
            className="bg-white w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500"
          >
            <option value="domicilio">Entrega a domicilio</option>
            <option value="recoger">Recoger en tienda</option>
          </select>
        </div>

        {deliveryMethod === "domicilio" && (
          <div className="bg-white p-6 rounded-lg shadow-lg mt-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Dirección de entrega
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-gray-700">Calle</label>
                <input
                  type="text"
                  value={calle}
                  onChange={(e) => setCalle(e.target.value)}
                  className="bg-white w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Introduce tu calle"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-gray-700">Código Postal</label>
                <input
                  type="text"
                  value={codigoPostal}
                  onChange={(e) => setCodigoPostal(e.target.value)}
                  className="bg-white w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Código Postal"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-gray-700">Municipio</label>
                <input
                  type="text"
                  value={municipio}
                  onChange={(e) => setMunicipio(e.target.value)}
                  className="bg-white w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Municipio"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-gray-700">Estado</label>
                <input
                  type="text"
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  className="bg-white w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Estado"
                />
              </div>
              <div className="md:col-span-2 flex flex-col">
                <label className="text-gray-700">Referencia (opcional)</label>
                <input
                  type="text"
                  value={referencia}
                  onChange={(e) => setReferencia(e.target.value)}
                  className="bg-white w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Introduce una referencia (opcional)"
                />
              </div>
            </div>
          </div>
        )}

        {/* Método de pago */}
        <div className="bg-white p-6 rounded-lg shadow-lg mt-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Método de pago
          </h2>
          <div className="flex items-center mb-4">
            <FiCreditCard className="text-gray-600 mr-2" size={24} />
            <label className="text-gray-700">
              Seleccione un método de pago
            </label>
          </div>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="bg-white w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500"
          >
            <option value="transferencia">Transferencia bancaria</option>
            <option value="dinero">Dinero en efectivo</option>
            <option value="tarjeta">Tarjeta de crédito o débito</option>
            <option value="enlace">Enlace de pago</option>
          </select>
        </div>

        {/* Botón para continuar */}
        <div className="flex justify-center mt-8">
          <button
            type="submit"
            className="bg-[#6D01D1] text-white py-3 px-8 rounded-full shadow-lg hover:bg-[#5A01A8] transition-all duration-300 ease-in-out"
          >
            PREPARAR EL PEDIDO
          </button>
        </div>
      </form>

      {/* Mostrar el número de la tienda */}
      <div className="mt-6 text-center">
        <FiPhone className="inline-block text-gray-600 mr-2" size={20} />
        <p className="text-gray-600 inline-block">
          Contacto de la tienda: {storePhoneNumber}
        </p>
      </div>
    </div>
  );
};