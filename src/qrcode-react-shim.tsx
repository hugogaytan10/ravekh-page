import React, { useMemo } from "react";
import QRCode from "./coupons/lib/QRCode";
import QRErrorCorrectLevel from "./coupons/lib/QRCode/QRErrorCorrectLevel";

type Level = "L" | "M" | "Q" | "H";

type QRCodeSVGProps = {
  value: string;
  size?: number;
  level?: Level;
  className?: string;
};

const errorLevelMap: Record<Level, number> = {
  L: QRErrorCorrectLevel.L,
  M: QRErrorCorrectLevel.M,
  Q: QRErrorCorrectLevel.Q,
  H: QRErrorCorrectLevel.H,
};

export const QRCodeSVG: React.FC<QRCodeSVGProps> = ({
  value,
  size = 128,
  level = "M",
  className,
}) => {
  const modules = useMemo(() => {
    if (!value) {
      return null;
    }

    try {
      const qr = new QRCode(0, errorLevelMap[level]);
      qr.addData(value);
      qr.make();

      const count = qr.getModuleCount();
      const matrix: boolean[][] = [];

      for (let row = 0; row < count; row += 1) {
        const rowData: boolean[] = [];
        for (let col = 0; col < count; col += 1) {
          rowData.push(qr.isDark(row, col));
        }
        matrix.push(rowData);
      }

      return matrix;
    } catch {
      return null;
    }
  }, [level, value]);

  if (!modules) {
    return <div className={className} style={{ width: size, height: size, background: "#f3f4f6" }} />;
  }

  const moduleCount = modules.length;
  const moduleSize = size / moduleCount;

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Código QR"
      shapeRendering="crispEdges"
    >
      <rect x="0" y="0" width={size} height={size} fill="#ffffff" />
      {modules.map((row, rowIndex) =>
        row.map((isDark, colIndex) =>
          isDark ? (
            <rect
              key={`${rowIndex}-${colIndex}`}
              x={colIndex * moduleSize}
              y={rowIndex * moduleSize}
              width={moduleSize}
              height={moduleSize}
              fill="#000000"
            />
          ) : null,
        ),
      )}
    </svg>
  );
};
