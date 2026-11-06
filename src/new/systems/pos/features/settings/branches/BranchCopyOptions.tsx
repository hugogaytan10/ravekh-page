import {useCallback, useEffect, useState} from 'react';
import {FiChevronDown, FiChevronRight, FiChevronUp} from 'react-icons/fi';
import {PosBranchApi, type BranchCopyOptions as CopyOptions, type BranchCopyInventoryRow} from '../../../shared/api/PosBranchApi';
import {BranchCopyWizard} from './BranchCopyWizard';

export type BranchCopyNextStep = {label: string; onClick: () => void};
type Props = {api: PosBranchApi; sourceId: number; sourceName: string; token: string; disabled: boolean; value: CopyOptions; onChange: (value: CopyOptions) => void; onReady: (sourceId: number | null, nextStep?: BranchCopyNextStep) => void};

export const BranchCopyOptions = ({api, sourceId, sourceName, token, disabled, value, onChange, onReady}: Props) => {
  const [rows, setRows] = useState<BranchCopyInventoryRow[]>([]);
  const [loadedSource, setLoadedSource] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [configured, setConfigured] = useState(false);
  const [uniformStock, setUniformStock] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [customize, setCustomize] = useState(false);
  const openWizard = useCallback(() => setOpen(true), []);
  const retryPreview = useCallback(() => setRetry(number => number + 1), []);
  useEffect(() => {
    let active = true;
    setOpen(false); setConfigured(false); setUniformStock(null); setLoadedSource(null); setError('');
    api.copyPreview(sourceId, token).then(data => {if (active) {setRows(data); setLoadedSource(sourceId);}})
      .catch(() => {if (active) setError('No se pudieron cargar los productos. Vuelve a intentarlo.');});
    return () => {active = false;};
  }, [api, sourceId, token, retry]);
  const incomplete = value.products && (!configured || value.productIds?.length === 0);
  useEffect(() => {
    const nextStep = error ? {label: 'Volver a cargar productos', onClick: retryPreview}
      : loadedSource === sourceId && incomplete ? {label: 'Elegir productos', onClick: openWizard} : undefined;
    onReady(incomplete ? null : loadedSource, nextStep);
  }, [loadedSource, sourceId, incomplete, error, onReady, openWizard, retryPreview]);
  const count = value.productIds?.length ?? rows.filter(row => row.kind === 'product').length;
  const stockLabel = value.inventoryMode === 'copy' ? `Mismas cantidades que ${sourceName}` : uniformStock !== null ? `${uniformStock} unidades por producto` : value.inventoryMode === 'manual' ? 'Cantidades individuales' : 'Empiezan en cero';
  return <fieldset className="pos-branches__copy-options" disabled={disabled}>
    <legend>Preparar la copia</legend>
    {value.products && loadedSource === sourceId && <button type="button" className="pos-branches__copy-summary" onClick={openWizard}>
      <span><strong>Productos e inventario</strong><small>{configured ? `${count} ${count === 1 ? 'producto' : 'productos'} · ${stockLabel}` : 'Elige los productos y después sus cantidades'}</small></span><span>{configured ? 'Cambiar' : 'Configurar'} <FiChevronRight aria-hidden="true"/></span>
    </button>}
    <button type="button" className="pos-branches__copy-summary" aria-expanded={customize} onClick={() => setCustomize(current => !current)}><span><strong>Personalizar copia</strong><small>{[value.categories && 'Categorías', value.prices && 'Precios', value.shipping && 'Envío', value.tables && 'Mesas'].filter(Boolean).join(' · ') || 'Sin ajustes adicionales'}</small></span>{customize ? <FiChevronUp aria-hidden="true"/> : <FiChevronDown aria-hidden="true"/>}</button>
    {customize && <div className="pos-branches__copy-toggles">{([['products', 'Productos'], ['categories', 'Categorías'], ['prices', 'Precios'], ['shipping', 'Configuración de envío'], ['tables', 'Mesas y zonas']] as const).map(([key, label]) => <label className="pos-branches__toggle" key={key}>
      <input type="checkbox" checked={Boolean(value[key])} disabled={key === 'prices' && !value.products} onChange={event => {
        if (key === 'products') {setConfigured(false); setUniformStock(null); onChange({...value, products: event.target.checked, productIds: undefined, prices: event.target.checked, inventoryMode: 'zero', inventory: []});}
        else onChange({...value, [key]: event.target.checked});
      }}/>{label}
    </label>)}{value.tables && <p>Las mesas nuevas empiezan libres.</p>}{value.products && !value.categories && <p>Los productos se copiarán sin categoría.</p>}</div>}
    {error ? <p role="alert" className="pos-branches__error">{error} <button type="button" onClick={retryPreview}>Reintentar</button></p>
      : loadedSource !== sourceId ? <p role="status">Cargando productos…</p> : <p>La tienda de origen no cambia.</p>}
    {open && <BranchCopyWizard rows={rows} sourceName={sourceName} value={value} configured={configured} uniformStock={uniformStock} onClose={() => setOpen(false)} onConfirm={(options, uniform) => {onChange(options); setUniformStock(uniform); setConfigured(true); setOpen(false);}}/>}
  </fieldset>;
};
