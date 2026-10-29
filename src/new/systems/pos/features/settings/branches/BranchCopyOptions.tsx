import {useEffect, useState} from "react";
import {PosBranchApi, BranchCopyOptions as CopyOptions, BranchCopyInventoryRow} from "../../../shared/api/PosBranchApi";

type Props = {api: PosBranchApi; sourceId: number; token: string; disabled: boolean; value: CopyOptions; onChange: (value: CopyOptions) => void; onReady: (sourceId: number | null) => void};

export const BranchCopyOptions = ({api, sourceId, token, disabled, value, onChange, onReady}: Props) => {
  const [rows, setRows] = useState<BranchCopyInventoryRow[]>([]);
  const [loadedSource, setLoadedSource] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(50);
  const [retry, setRetry] = useState(0);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [fixedStock, setFixedStock] = useState('');
  const [fixedMode, setFixedMode] = useState(false);
  const fixedQuantity = Number(fixedStock.replace(',', '.'));
  const invalidFixed = fixedMode && (!fixedStock.trim() || !Number.isFinite(fixedQuantity) || fixedQuantity < 0 || fixedQuantity > Number.MAX_SAFE_INTEGER);
  const setUniformStock = (text: string) => {
    setFixedStock(text);
    const stock = Number(text.replace(',', '.'));
    onChange({...value, inventoryMode: 'manual', inventory: rows.map(row => ({kind: row.kind, id: row.id, stock: row.stock === null ? null : stock}))});
  };
  const invalidDraft = value.products && (invalidFixed || (value.inventoryMode === 'manual' && Object.values(drafts).some(text => {
    const stock = Number(text.replace(',', '.') || '0');
    return !Number.isFinite(stock) || stock < 0 || stock > Number.MAX_SAFE_INTEGER;
  })));
  useEffect(() => {
    let active = true;
    setFixedMode(false); setFixedStock(''); setLoadedSource(null); setError(""); setDrafts({}); setQuery(""); setVisible(50);
    api.copyPreview(sourceId, token).then(data => {
      if (active) {setRows(data); setLoadedSource(sourceId);}
    }).catch(() => {if (active) setError('No se pudo preparar la copia. Intenta de nuevo o contacta a soporte.');});
    return () => {active = false;};
  }, [api, sourceId, token, retry]);
  useEffect(() => {onReady(invalidDraft ? null : loadedSource);}, [invalidDraft, loadedSource, onReady]);
  const filtered = rows.filter(row => row.name.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
  return <fieldset className="pos-branches__copy-options" disabled={disabled}>
    <legend>¿Qué quieres copiar?</legend>
    {([['categories', 'Categorías y subcategorías'], ['products', 'Productos y variantes'], ['prices', 'Precios y promociones de esta sucursal'], ['shipping', 'Configuración de envío'], ['tables', 'Mesas y zonas']] as const).map(([key, label]) =>
      <label className="pos-branches__toggle" key={key}><input type="checkbox" checked={Boolean(value[key])} disabled={key === 'prices' && !value.products}
        onChange={e => {
          if (key === 'products') { setFixedMode(false); setFixedStock('');setDrafts({}); onChange({...value, products: e.target.checked, prices: e.target.checked, inventoryMode: 'zero', inventory: []});}
          else onChange({...value, [key]: e.target.checked});
        }}/>{label}</label>)}
    <p>Las categorías copiadas serán independientes: cambiar su nombre o eliminarlas aquí no modifica la sucursal origen. No se copian empleados.</p>
    {value.tables && <p>Se copian nombres, zonas y capacidad. Todas las mesas comienzan libres, sin pedidos ni consumos.</p>}
    {value.products && !value.categories && <p>Los productos comenzarán sin categoría; podrás organizarlos después.</p>}
    {value.products && <>
      <label>Inventario inicial<select aria-label="Inventario inicial" disabled={loadedSource !== sourceId} value={fixedMode ? 'fixed' : value.inventoryMode} onChange={e => {setDrafts({}); setFixedMode(e.target.value === 'fixed'); setFixedStock(''); onChange({...value, inventoryMode: e.target.value === 'fixed' ? 'manual' : e.target.value as CopyOptions['inventoryMode'], inventory: []});}}>
        <option value="zero">Dejar en cero</option><option value="copy">Copiar existencias</option><option value="manual">Capturar cantidades en bloque</option><option value="fixed">Iniciar con X stock</option>
      </select></label>
      {fixedMode && <>
        <label>Cantidad inicial por producto y variante<input aria-label="Stock inicial para todos" inputMode="decimal" placeholder="Ej. 20" value={fixedStock} onChange={e => setUniformStock(e.target.value)}/></label>
        <p>Se aplica la misma cantidad a todos los productos y variantes con control de inventario.</p>
        {invalidFixed && <p role="alert" className="pos-branches__error">Escribe una cantidad válida mayor o igual a cero.</p>}
      </>}
      <p>{value.inventoryMode === 'copy' ? 'Se duplican las existencias. La sucursal origen conserva su stock; esto no es un traspaso.' : 'El stock de la sucursal origen no cambia. Los productos sin control de inventario conservan esa condición.'}</p>
      {!value.prices && <p>Se usarán los precios generales del negocio.</p>}
    </>}
    {error ? <div role="alert" className="pos-branches__error">{error}<button type="button" onClick={() => setRetry(n => n + 1)}>Volver a cargar</button></div>
      : loadedSource !== sourceId ? <p role="status">Cargando catálogo origen…</p> : <p>{rows.filter(row => row.kind === 'product').length} productos · {rows.filter(row => row.kind === 'variant').length} variantes</p>}
    {value.products && !fixedMode && value.inventoryMode === 'manual' && loadedSource === sourceId && <>
      <div className="pos-branches__actions"><button type="button" onClick={() => {setDrafts({}); onChange({...value, inventory: rows.map(({kind, id, stock}) => ({kind, id, stock}))});}}>Usar cantidades del origen</button>
        <button type="button" onClick={() => {setDrafts({}); onChange({...value, inventory: []});}}>Todo en cero</button></div>
      <label>Buscar producto o variante<input type="search" value={query} onChange={e => {setQuery(e.target.value); setVisible(50);}}/></label>
      <div className="pos-branches__inventory-scroll"><table className="pos-branches__inventory"><thead><tr><th>Producto / variante</th><th>Origen</th><th>Nueva sucursal</th></tr></thead><tbody>
        {filtered.slice(0, visible).map(row => {
          const key = `${row.kind}:${row.id}`;
          const current = value.inventory?.find(item => item.kind === row.kind && item.id === row.id);
          return <tr key={key}><td>{row.name}</td><td>{row.stock === null ? 'Sin control' : row.stock}</td><td>{row.stock === null ? 'Sin control' : <input aria-label={`Cantidad inicial de ${row.name}`} inputMode="decimal"
            value={drafts[key] ?? String(current?.stock ?? 0)} onFocus={e => e.target.select()} onChange={e => {
              const text = e.target.value; setDrafts(previous => ({...previous, [key]: text}));
              const stock = Number(text.replace(',', '.') || '0');
              if (Number.isFinite(stock) && stock >= 0 && stock <= Number.MAX_SAFE_INTEGER) onChange({...value, inventory: [...(value.inventory ?? []).filter(item => !(item.kind === row.kind && item.id === row.id)), {kind: row.kind, id: row.id, stock}]});
            }}/>}</td></tr>;
        })}
      </tbody></table></div>
      {!filtered.length && <p>No hay productos que coincidan.</p>}
      {filtered.length > visible && <button type="button" onClick={() => setVisible(n => n + 50)}>Mostrar más ({visible} de {filtered.length})</button>}
      {invalidDraft && <p role="alert" className="pos-branches__error">Las cantidades deben ser números mayores o iguales a cero.</p>}
    </>}
  </fieldset>;
};
