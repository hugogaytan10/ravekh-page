import { CartPos } from "../Model/CarPos";

export const PrintTicket = (
    storeName: string,
    cart: CartPos[],
    amountR: number,
    discount: number
) => {
    const truncateText = (text: string, length: number) => {
        return text.length > length ? text.substring(0, length) + "..." : text;
    };

    let total = 0;
    let change = 0;
    cart.forEach((item) => {
        total += item.Price * item.Quantity;
    });
    change = amountR - total;

    const ticketHTML = `
      <div class="ticket">
        <h2>${storeName}</h2>
        <p>${new Date().toLocaleString()}</p>
        <hr />
        <table>
          <thead>
            <tr>
              <th>Cant</th>
              <th>Producto</th>
              <th>Sub</th>
            </tr>
          </thead>
          <tbody>
            ${cart
              .map(
                (item) => `
                <tr>
                  <td>${item.Quantity}</td>
                  <td>${truncateText(item.Name, 15)}</td>
                  <td>$${(item.Price * item.Quantity).toFixed(2)}</td>
                </tr>
              `
              )
              .join("")}
          </tbody>
        </table>
        <hr />
        <p>Total: <span>$${total.toFixed(2)}</span></p>
        <p>Recibido: <span>$${amountR.toFixed(2)}</span></p>
        <p>Descuento: <span>${discount.toFixed(2)}%</span></p>
        <p>Cambio: <span>$${change.toFixed(2)}</span></p>
        <hr />
        <p class="thanks">Gracias por su compra</p>
      </div>
    `;

    const printWindow = window.open("", "_blank", "width=400,height=600");
    if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(`
        <html>
          <head>
            <title>Ticket</title>
            <style>
              @media print {
                body {
                  width: 56mm;
                  margin: 0;
                  font-family: Arial, sans-serif;
                  font-size: 12px;
                }
                .ticket {
                  width: 56mm;
                  padding: 5px;
                  text-align: left;
                }
                table {
                  width: 100%;
                  border-collapse: collapse;
                }
                th, td {
                  font-size: 12px;
                  text-align: left;
                }
                hr {
                  border: 1px dashed #000;
                }
                .thanks {
                  text-align: center;
                  font-size: 12px;
                }
                @page {
                  size: 56mm auto;
                  margin: 0;
                }
              }
            </style>
          </head>
          <body>
            ${ticketHTML}
          </body>
        </html>
      `);
        printWindow.document.close();
        
        // Permite al usuario revisar la vista previa antes de imprimir
        printWindow.onload = () => {
            printWindow.print();
        };
    }
};
