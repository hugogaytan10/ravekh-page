const express = require('express');
const net = require('net');

const app = express();
app.use(express.json());

const PRINTER_IP = process.env.PRINTER_IP || '192.168.1.114';
const PRINTER_PORT = Number(process.env.PRINTER_PORT || 9100);
const SERVER_PORT = Number(process.env.PRINTER_SERVER_PORT || 3090);

const buildQrPayload = (qrUrl, title = 'QR visita online') => {
  const commands = [];
  const text = (value) => Buffer.from(value, 'ascii');
  const qrData = Buffer.from(qrUrl, 'utf8');
  const storeLen = qrData.length + 3;

  commands.push(Buffer.from([0x1B, 0x40])); // ESC @
  commands.push(Buffer.from([0x1B, 0x61, 0x01])); // center
  commands.push(text(`${title}\n\n`));

  // GS ( k - set model 2
  commands.push(Buffer.from([0x1D, 0x28, 0x6B, 0x04, 0x00, 0x31, 0x41, 0x32, 0x00]));
  // module size
  commands.push(Buffer.from([0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x43, 0x08]));
  // error level M
  commands.push(Buffer.from([0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x45, 0x31]));
  // store qr data
  commands.push(Buffer.concat([
    Buffer.from([0x1D, 0x28, 0x6B, storeLen & 0xff, (storeLen >> 8) & 0xff, 0x31, 0x50, 0x30]),
    qrData,
  ]));
  // print qr
  commands.push(Buffer.from([0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x51, 0x30]));

  commands.push(text(`\n${qrUrl}\n\n\n`));
  commands.push(Buffer.from([0x1D, 0x56, 0x00])); // cut

  return Buffer.concat(commands);
};

const printToNetworkPrinter = (payload) => new Promise((resolve, reject) => {
  const client = net.createConnection({ host: PRINTER_IP, port: PRINTER_PORT }, () => {
    client.write(payload);
    client.end();
  });

  client.on('error', (err) => reject(err));
  client.on('close', () => resolve());
});

app.post('/api/print/visits-qr', async (req, res) => {
  try {
    const qrUrl = typeof req.body?.qrUrl === 'string' ? req.body.qrUrl.trim() : '';
    if (!qrUrl) {
      return res.status(400).json({ ok: false, message: 'qrUrl es requerido.' });
    }

    const payload = buildQrPayload(qrUrl);
    await printToNetworkPrinter(payload);

    return res.json({ ok: true, message: 'Impresión enviada a la impresora de red.' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido de impresión';
    return res.status(500).json({ ok: false, message });
  }
});

app.listen(SERVER_PORT, () => {
  console.log(`[printer-server] listening on http://localhost:${SERVER_PORT}`);
  console.log(`[printer-server] printer target ${PRINTER_IP}:${PRINTER_PORT}`);
});
