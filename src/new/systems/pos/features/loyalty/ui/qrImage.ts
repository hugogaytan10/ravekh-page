import QRCode from "../../../../loyalty/features/coupons/lib/QRCode";
import QRErrorCorrectLevel from "../../../../loyalty/features/coupons/lib/QRCode/QRErrorCorrectLevel";

export const renderQrAsDataUrl = (value: string): string => {
  const qr = new QRCode(0, QRErrorCorrectLevel.M);
  qr.addData(value);
  qr.make();

  const moduleCount = qr.getModuleCount();
  const moduleSize = 4;
  const margin = moduleSize * 4;
  const size = (moduleCount + 8) * moduleSize;
  const rects: string[] = [];

  for (let row = 0; row < moduleCount; row += 1) {
    for (let col = 0; col < moduleCount; col += 1) {
      if (qr.isDark(row, col)) {
        const x = (margin + col * moduleSize).toFixed(4);
        const y = (margin + row * moduleSize).toFixed(4);
        const w = moduleSize.toFixed(4);
        rects.push(`<rect x="${x}" y="${y}" width="${w}" height="${w}" fill="#000000" />`);
      }
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="100%" height="100%" fill="#ffffff"/>${rects.join("")}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};
