import {useEffect, useRef, useState} from 'react';
import {FiArrowLeft, FiChevronRight, FiCheckCircle, FiSearch, FiX} from 'react-icons/fi';
import type {BranchCopyInventoryRow, BranchCopyOptions} from '../../../shared/api/PosBranchApi';

type Props = {
  rows: BranchCopyInventoryRow[]; sourceName: string; value: BranchCopyOptions; configured: boolean; uniformStock: string | null;
  onClose: () => void; onConfirm: (value: BranchCopyOptions, uniform: string | null) => void;
};
const keyOf = (row: BranchCopyInventoryRow) => `${row.kind}:${row.id}`;
const validQuantity = (text: string) => {const number = Number(text.replace(',', '.') || '0'); return Number.isFinite(number) && number >= 0 && number <= Number.MAX_SAFE_INTEGER;};

export const BranchCopyWizard = ({rows, sourceName, value, configured, uniformStock, onClose, onConfirm}: Props) => {
  const dialog = useRef<HTMLDialogElement>(null);
  const products = rows.filter(row => row.kind === 'product');
  const [step, setStep] = useState<'products' | 'inventory'>('products');
  const [ids, setIds] = useState<number[]>(configured ? value.productIds ?? products.map(row => row.id) : []);
  const [query, setQuery] = useState('');
  const [stockQuery, setStockQuery] = useState('');
  const [productLimit, setProductLimit] = useState(50);
  const [stockLimit, setStockLimit] = useState(50);
  const [mode, setMode] = useState<'zero' | 'copy' | 'fixed' | 'manual'>(uniformStock !== null ? 'fixed' : value.inventoryMode);
  const [individualView, setIndividualView] = useState(value.inventoryMode === 'manual' && uniformStock === null);
  const [quantity, setQuantity] = useState(uniformStock ?? '');
  const [drafts, setDrafts] = useState<Record<string, string>>(() => Object.fromEntries(rows.filter(row => row.stock !== null).map(row => [keyOf(row), String(value.inventory?.find(item => item.kind === row.kind && item.id === row.id)?.stock ?? uniformStock ?? 0)])));
  const selected = new Set(ids);
  const selectedRows = ids.length === products.length ? rows : rows.filter(row => selected.has(row.kind === 'product' ? row.id : row.productId ?? -1));
  const controlled = selectedRows.filter(row => row.stock !== null);
  const matching = products.filter(row => row.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  const matchingStock = controlled.filter(row => row.name.toLocaleLowerCase().includes(stockQuery.trim().toLocaleLowerCase()));
  const invalidFixed = mode === 'fixed' && (!quantity.trim() || !validQuantity(quantity));
  const invalidRow = mode === 'manual' ? controlled.find(row => !validQuantity(drafts[keyOf(row)] ?? '0')) : undefined;
  const canFill = Boolean(quantity.trim()) && validQuantity(quantity);
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    dialog.current?.showModal(); document.body.style.overflow = 'hidden';
    return () => {document.body.style.overflow = previousOverflow; previousFocus?.focus();};
  }, []);
  useEffect(() => {dialog.current?.querySelector<HTMLElement>(step === 'products' ? '[data-product-search]' : '[data-step-heading]')?.focus();}, [step]);
  const fillAll = () => setDrafts(previous => ({...previous, ...Object.fromEntries(controlled.map(row => [keyOf(row), quantity.replace(',', '.')]))}));
  const save = () => {
    if (step !== 'inventory' || !ids.length || invalidFixed || invalidRow) return;
    const inventory = mode === 'fixed' || mode === 'manual' ? selectedRows.map(row => ({kind: row.kind, id: row.id,
      stock: row.stock === null ? null : Number((mode === 'fixed' ? quantity : drafts[keyOf(row)] ?? '0').replace(',', '.') || '0'),
    })) : [];
    onConfirm({...value, productIds: ids.length === products.length ? undefined : ids, inventoryMode: mode === 'fixed' ? 'manual' : mode, inventory}, mode === 'fixed' ? quantity.replace(',', '.') : null);
  };
  return <dialog ref={dialog} className="pos-branch-copy-flow" aria-labelledby="branch-copy-flow-title"
    onCancel={event => {event.preventDefault(); step === 'inventory' ? setStep('products') : onClose();}}
    onKeyDown={event => {if (event.key === 'Enter' && event.target instanceof HTMLInputElement) event.preventDefault();}}>
    <header className="pos-branch-copy-flow__header">
      <button type="button" aria-label="Volver" onClick={() => step === 'inventory' ? setStep('products') : onClose()}><FiArrowLeft aria-hidden="true"/></button>
      <h2 id="branch-copy-flow-title" data-step-heading tabIndex={-1}>{step === 'products' ? 'Elegir productos' : 'Inventario'}</h2>
      <button type="button" aria-label="Cancelar copia" onClick={onClose}><FiX aria-hidden="true"/></button>
    </header>
    <div className="pos-branch-copy-flow__progress"><span>Paso {step === 'products' ? '1' : '2'} de 2</span><span aria-live="polite">{ids.length} {ids.length === 1 ? 'producto seleccionado' : 'productos seleccionados'}</span></div>
    {step === 'products' ? <>
      <div className="pos-branch-copy-flow__tools">
        <label className="pos-branch-copy-flow__search"><FiSearch aria-hidden="true"/><input data-product-search type="search" aria-label="Buscar productos para copiar" placeholder="Buscar productos" value={query} onChange={event => {setQuery(event.target.value); setProductLimit(50);}}/></label>
        <div className="pos-branch-copy-flow__actions"><button type="button" onClick={() => setIds(products.map(row => row.id))}>Seleccionar todos ({products.length})</button><button type="button" onClick={() => setIds([])}>Desmarcar todos</button></div>
      </div>
      <div className="pos-branch-copy-flow__body">
        {matching.slice(0, productLimit).map(row => <label key={row.id} className="pos-branch-copy-flow__product"><input type="checkbox" checked={selected.has(row.id)} onChange={event => setIds(previous => event.target.checked ? [...previous, row.id] : previous.filter(id => id !== row.id))}/><span>{row.name}</span></label>)}
        {!matching.length && <p>No hay productos que coincidan.</p>}
        {matching.length > productLimit && <button type="button" onClick={() => setProductLimit(limit => limit + 50)}>Mostrar más productos</button>}
      </div>
    </> : <div className="pos-branch-copy-flow__body">
      {individualView ? <>
        <div className="pos-branch-copy-flow__section-heading"><h3>Cantidades por producto</h3><button type="button" onClick={() => setIndividualView(false)}>Cambiar opción</button></div>
        <label className="pos-branch-copy-flow__search"><FiSearch aria-hidden="true"/><input type="search" aria-label="Buscar entre los productos elegidos" placeholder="Buscar producto" value={stockQuery} onChange={event => {setStockQuery(event.target.value); setStockLimit(50);}}/></label>
        <div className="pos-branch-copy-flow__fill"><label>Rellenar todos y ajustar solo los que necesites<input aria-label="Cantidad para rellenar los productos seleccionados" inputMode="decimal" placeholder="Cantidad" value={quantity} onChange={event => setQuantity(event.target.value)}/></label><button type="button" className="is-primary" disabled={!canFill} onClick={() => {if (canFill) fillAll();}}>Rellenar todos</button></div>
        {matchingStock.slice(0, stockLimit).map(row => <label key={keyOf(row)} className="pos-branch-copy-flow__quantity-card"><span>{row.name}</span><span>Unidades<input aria-label={`Cantidad de ${row.name}`} aria-invalid={!validQuantity(drafts[keyOf(row)] ?? '0')} inputMode="decimal" value={drafts[keyOf(row)] ?? '0'} onFocus={event => event.target.select()} onChange={event => {const next = event.target.value; setDrafts(previous => ({...previous, [keyOf(row)]: next}));}}/></span></label>)}
        {!matchingStock.length && <p>{stockQuery.trim() ? 'No hay productos que coincidan.' : 'Estos productos no llevan control de cantidades.'}</p>}
        {matchingStock.length > stockLimit && <button type="button" onClick={() => setStockLimit(limit => limit + 50)}>Mostrar más productos</button>}
      </> : <>
        <h3>¿Cómo empezarán estos productos?</h3>
        <div className="pos-branch-copy-flow__choices">{([
          ['zero', 'Empezar en cero', 'Sin existencias iniciales'], ['copy', 'Copiar existencias', `Las mismas cantidades que ${sourceName}`],
          ['fixed', 'La misma cantidad para todos', 'Escribe una sola cantidad'], ['manual', 'Una cantidad distinta por producto', 'Edita los productos que elegiste'],
        ] as const).map(([key, label, description]) => <button key={key} type="button" aria-pressed={mode === key} className={`pos-branch-copy-flow__choice ${mode === key ? 'is-selected' : ''}`} onClick={() => {if (key === 'manual' && mode === 'fixed' && canFill) fillAll(); setMode(key); setIndividualView(key === 'manual');}}><span><strong>{label}</strong><small>{description}</small></span>{key === 'manual' ? <FiChevronRight aria-hidden="true"/> : mode === key ? <FiCheckCircle aria-hidden="true"/> : null}</button>)}</div>
        {mode === 'fixed' && <label className="pos-branch-copy-flow__uniform">Unidades para cada producto<input aria-label="Cantidad para los productos elegidos" inputMode="decimal" placeholder="Ej. 20" value={quantity} onChange={event => setQuantity(event.target.value)}/></label>}
      </>}
    </div>}
    <footer className="pos-branch-copy-flow__footer">
      {step === 'products' ? <>
        {!ids.length && <p>Selecciona al menos un producto para continuar.</p>}
        <button type="button" className="is-primary" disabled={!ids.length} onClick={() => {if (ids.length) setStep('inventory');}}>Siguiente: inventario <FiChevronRight aria-hidden="true"/></button>
      </> : <>
        {invalidFixed && <p role={quantity.trim() ? 'alert' : 'status'}>Escribe una cantidad válida para continuar.</p>}
        {invalidRow && <p role="alert">Revisa la cantidad de {invalidRow.name}. <button type="button" onClick={() => {setIndividualView(true); setStockQuery(invalidRow.name); setStockLimit(50);}}>Mostrar producto</button></p>}
        <div className="pos-branch-copy-flow__actions"><button type="button" onClick={() => setStep('products')}><FiArrowLeft aria-hidden="true"/> Anterior</button><button type="button" className="is-primary" disabled={invalidFixed || Boolean(invalidRow)} onClick={save}>Guardar inventario</button></div>
      </>}
    </footer>
  </dialog>;
};
