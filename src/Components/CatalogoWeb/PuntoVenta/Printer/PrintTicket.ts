export const PrintTicket = (
    storeName: string,
    cart: CartPos[],
    amountR: number,
    discount: number
  ) => {
    const truncateText = (text: string, length: number) => {
      return text.length > length ? text.substring(0, length) + "..." : text;
    };
  
    // Calcular totales
    let total = 0;
    let change = 0;
    cart.forEach((item) => {
      total += item.Price * item.Quantity;
    });
    change = amountR - total;
  
    // Generar el HTML para el ticket
    const ticketHTML = `
      <div style="width: 100%; font-family: Arial, sans-serif; font-size: 12px; margin: 0; text-align: left;">
        <h2 style="text-align: center; margin: 0; font-size: 16px;">${storeName}</h2>
        <p style="text-align: center; margin: 5px 0; font-size: 10px;">${new Date().toLocaleString()}</p>
        <hr style="border: 1px dashed #000; margin: 5px 0;" />
        <table style="width: 100%; margin: 0; border-collapse: collapse; text-align: left;">
          <thead>
            <tr>
              <th style="text-align: left; width: 20%;">Cant</th>
              <th style="text-align: left; width: 50%;">Producto</th>
              <th style="text-align: right; width: 30%;">Sub</th>
            </tr>
          </thead>
          <tbody>
            ${cart
              .map(
                (item) => `
                  <tr>
                    <td>${item.Quantity}</td>
                    <td>${truncateText(item.Name, 15)}</td>
                    <td style="text-align: right;">$${(
                      item.Price * item.Quantity
                    ).toFixed(2)}</td>
                  </tr>
                `
              )
              .join("")}
          </tbody>
        </table>
        <hr style="border: 1px dashed #000; margin: 5px 0;" />
        <div style="margin: 0;">
          <p style="margin: 0; font-size: 13px;">Total: <span style="float: right;">$${total.toFixed(2)}</span></p>
          <p style="margin: 0; font-size: 13px;">Recibido: <span style="float: right;">$${amountR.toFixed(2)}</span></p>
          <p style="margin: 0; font-size: 13px;">Descuento: <span style="float: right;">${discount.toFixed(2)}%</span></p>
          <p style="margin: 0; font-size: 13px;">Cambio: <span style="float: right;">$${change.toFixed(2)}</span></p>
        </div>
        <hr style="border: 1px dashed #000; margin: 5px 0;" />
        <p style="text-align: center; font-size: 12px;">Gracias por su compra</p>
      </div>
    `;
  
    // Crear una nueva ventana para la impresión
    const printWindow = window.open("", "_blank", "width=400,height=600");
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(`
        <html>
          <head>
            <title>Ticket</title>
            <style>
              body {
                margin: 0;
                padding: 0;
                font-family: Arial, sans-serif;
                width: 100%;
              }
              div {
                padding: 0;
                margin: 0;
              }
            </style>
          </head>
          <body onload="window.print(); window.close();">
            ${ticketHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };
  