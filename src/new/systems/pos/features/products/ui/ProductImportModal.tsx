import { useState } from "react";
import { ProductImportResult } from "../interface/IProductsRepository";

type ImportMode = "csv" | "zip";

type ProductImportModalProps = {
  open: boolean;
  businessId: number;
  token: string;
  importing: boolean;
  result: ProductImportResult | null;
  error: string | null;
  onClose: () => void;
  onImportCsv: (file: File) => Promise<void>;
  onImportZip: (file: File) => Promise<void>;
};

export const ProductImportModal = ({
  open,
  businessId,
  token,
  importing,
  result,
  error,
  onClose,
  onImportCsv,
  onImportZip,
}: ProductImportModalProps) => {
  const [importMode, setImportMode] = useState<ImportMode>("csv");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!open) return null;

  const selectedFile = importMode === "csv" ? csvFile : zipFile;
  const canImport = Boolean(selectedFile && token && businessId && !importing);
  const resultErrors = result?.errors ?? [];

  const switchMode = (mode: ImportMode) => {
    if (importing) return;
    setImportMode(mode);
    setValidationError(null);
  };

  const handleSubmit = async () => {
    setValidationError(null);

    if (!token || !businessId) {
      setValidationError("Conecta tu sesión para importar productos.");
      return;
    }

    if (importMode === "csv") {
      if (!csvFile) {
        setValidationError("Selecciona un archivo CSV para continuar.");
        return;
      }
      if (!csvFile.name.toLowerCase().endsWith(".csv")) {
        setValidationError("El archivo debe tener extensión .csv.");
        return;
      }
      await onImportCsv(csvFile);
      return;
    }

    if (!zipFile) {
      setValidationError("Selecciona un archivo ZIP para continuar.");
      return;
    }
    if (!zipFile.name.toLowerCase().endsWith(".zip")) {
      setValidationError("El archivo debe tener extensión .zip.");
      return;
    }

    await onImportZip(zipFile);
  };

  return (
    <div className="pos-v2-products__modal-backdrop" role="presentation">
      <section className="pos-v2-products__modal pos-v2-products__modal--import" role="dialog" aria-modal="true" aria-labelledby="product-import-title">
        <div className="pos-v2-products__modal-head">
          <div>
            <h3 id="product-import-title">Importar productos</h3>
            <p className="pos-v2-products__hint">Elige entre una carga CSV simple o un ZIP con productos.csv e imágenes.</p>
          </div>
          <button type="button" className="pos-v2-products__secondary" onClick={onClose} disabled={importing}>Cerrar</button>
        </div>

        <div className="pos-v2-products__import-tabs" role="tablist" aria-label="Tipos de importación">
          <button type="button" role="tab" aria-selected={importMode === "csv"} className={importMode === "csv" ? "is-active" : ""} onClick={() => switchMode("csv")}>CSV simple</button>
          <button type="button" role="tab" aria-selected={importMode === "zip"} className={importMode === "zip" ? "is-active" : ""} onClick={() => switchMode("zip")}>ZIP con imágenes</button>
        </div>

        {importMode === "csv" ? (
          <div className="pos-v2-products__import-panel">
            <div>
              <h4>Importar CSV simple</h4>
              <p>Selecciona un archivo .csv. El frontend lo leerá y enviará las filas al backend como JSON, manteniendo el flujo actual.</p>
            </div>
            <label className="pos-v2-products__file-drop">
              <span>Archivo CSV</span>
              <input type="file" accept=".csv,text/csv" disabled={importing} onChange={(event) => setCsvFile(event.target.files?.[0] ?? null)} />
              <strong>{csvFile?.name ?? "Seleccionar CSV"}</strong>
            </label>
          </div>
        ) : (
          <div className="pos-v2-products__import-panel">
            <div>
              <h4>Importar productos con imágenes</h4>
              <p>Sube un archivo .zip que incluya un archivo productos.csv y una carpeta imagenes con las fotos de tus productos.</p>
            </div>

            <label className="pos-v2-products__file-drop">
              <span>Archivo ZIP</span>
              <input type="file" accept=".zip,application/zip,application/x-zip-compressed" disabled={importing} onChange={(event) => setZipFile(event.target.files?.[0] ?? null)} />
              <strong>{zipFile?.name ?? "Seleccionar ZIP"}</strong>
            </label>

            <div className="pos-v2-products__import-help">
              <strong>Estructura esperada</strong>
              <pre>{`productos-importacion.zip
├── productos.csv
└── imagenes/
    ├── tenis-blanco.jpg
    ├── playera-negra.jpg
    └── termo-azul.jpg`}</pre>
              <strong>Columnas admitidas</strong>
              <p>Name, Barcode, Category, Subcategory, Color, Price, CostPerItem, Stock, Description, Volume, ForSale, ShowInStore, Available, Image, PromotionPrice, ExpDate, MinStock, OptStock</p>
              <ul>
                <li>Name es obligatorio.</li>
                <li>Barcode es opcional; si ya existe para el mismo negocio, se actualizará el producto existente.</li>
                <li>Category se crea automáticamente si no existe.</li>
                <li>Subcategory solo se usa cuando también existe Category.</li>
                <li>El cliente solo sube el ZIP; el backend sube las imágenes a Cloudinary automáticamente.</li>
              </ul>
              <strong>Ejemplo de CSV</strong>
              <pre>{`Name,Barcode,Category,Subcategory,Color,Price,CostPerItem,Stock,Description,Volume,ForSale,ShowInStore,Available,Image,PromotionPrice,ExpDate,MinStock,OptStock
Tenis blanco,7501000000011,Calzado,Tenis,Blanco,699,420,18,Tenis casual,false,true,true,true,tenis-blanco.jpg,649,,5,20
Playera negra,7501000000028,Ropa,Playeras,Negro,249,125,35,Playera oversize,false,true,true,true,playera-negra.jpg,219,,8,40`}</pre>
              <strong>Valores válidos para Image</strong>
              <p>La columna Image puede contener una o varias imágenes separadas por coma. Las imágenes pueden ser URLs o nombres de archivos incluidos en el ZIP.</p>
              <pre>{`tenis-blanco.jpg
imagenes/tenis-blanco.jpg
tenis-frente.jpg,tenis-lado.jpg
https://res.cloudinary.com/demo/image.jpg,tenis-lado.jpg`}</pre>
            </div>
          </div>
        )}

        {validationError ? <p className="pos-v2-products__save-result is-error" role="alert">{validationError}</p> : null}
        {error ? <p className="pos-v2-products__save-result is-error" role="alert">{error}</p> : null}

        {result ? (
          <div className={`pos-v2-products__import-result ${result.imported === 0 && resultErrors.length > 0 ? "is-error" : "is-success"}`} role="status">
            {result.imported > 0 ? <p>Se importaron {result.imported} productos correctamente.</p> : null}
            {resultErrors.length > 0 ? (
              <div>
                <strong>{result.imported === 0 ? "No se importaron productos." : "Algunas filas no se importaron."}</strong>
                <ul>
                  {resultErrors.map((rowError, index) => <li key={`${rowError}-${index}`}>{rowError}</li>)}
                </ul>
              </div>
            ) : <p>{result.message || "Importación completada sin errores."}</p>}
          </div>
        ) : null}

        <div className="pos-v2-products__form-actions is-modal">
          {result && resultErrors.length === 0 ? <button type="button" className="pos-v2-products__secondary" onClick={onClose}>Finalizar</button> : null}
          <button type="button" className="pos-v2-products__primary" onClick={handleSubmit} disabled={!canImport}>
            {importing ? "Importando..." : importMode === "csv" ? "Importar CSV" : "Importar ZIP"}
          </button>
        </div>
      </section>
    </div>
  );
};
