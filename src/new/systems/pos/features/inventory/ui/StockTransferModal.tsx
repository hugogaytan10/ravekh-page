import {useEffect,useMemo,useRef,useState} from 'react';
import {FetchHttpClient,createIdempotencyKey} from '../../../../../core/api/FetchHttpClient';
import {PosBranchApi,StockTransferItem} from '../../../shared/api/PosBranchApi';
import {getPosApiBaseUrl} from '../../../shared/config/posEnv';
import {PosBranch,readActivePosBranchId} from '../../../shared/config/posBranch';
import {resolvePosOperatorRole} from '../../../shared/config/posSession';

export const StockTransferModal=({token,onTransferred}:{token:string;onTransferred:()=>void})=>{
 const api=useMemo(()=>new PosBranchApi(new FetchHttpClient(getPosApiBaseUrl())),[]);
 const [open,setOpen]=useState(false),[branches,setBranches]=useState<PosBranch[]>([]),[source,setSource]=useState(0),[target,setTarget]=useState(0);
 const [items,setItems]=useState<StockTransferItem[]>([]),[selected,setSelected]=useState(''),[quantity,setQuantity]=useState('');
 const [loading,setLoading]=useState(false),[saving,setSaving]=useState(false),[uncertain,setUncertain]=useState(false),[error,setError]=useState('');
 const key=useRef(''),busy=useRef(false);
 const isAdmin=resolvePosOperatorRole(token)==='admin';
 useEffect(()=>{if(!open||!isAdmin)return;let active=true;api.list(token).then(rows=>{if(active){setBranches(rows);setSource(current=>current||readActivePosBranchId()||rows[0]?.id||0);}}).catch(e=>{if(active)setError(e.message);});return()=>{active=false;};},[open,isAdmin,api,token]);
 useEffect(()=>{if(!open||!source||!isAdmin||uncertain)return;let active=true;setLoading(true);setItems([]);setSelected('');setError('');api.transferItems(source,token).then(rows=>{if(active)setItems(rows);}).catch(e=>{if(active)setError(e.message||'Los traspasos aún no están disponibles.');}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[open,source,isAdmin,api,token,uncertain]);
 if(!isAdmin)return null;
 const item=items.find(i=>`${i.kind}:${i.id}`===selected),amount=Number(quantity.replace(',','.')),locked=saving||uncertain;
 const valid=!!item&&source!==target&&target>0&&quantity.trim()!==''&&Number.isFinite(amount)&&amount>0&&amount<=item.stock&&Math.abs(amount*100-Math.round(amount*100))<0.000001;
 const submit=async()=>{if(!valid||!item||busy.current)return;busy.current=true;setSaving(true);setError('');key.current ||=createIdempotencyKey();
  try{await api.transferStock({sourceBranchId:source,targetBranchId:target,kind:item.kind,itemId:item.id,quantity:amount},token,key.current);key.current='';setUncertain(false);setOpen(false);setSelected('');setQuantity('');onTransferred();}
  catch(e){const status=Number((e as {status?:number}).status||0),ambiguous=status===0||status===408||status>=500||(e as {payload?:{code?:string}}).payload?.code==='IDEMPOTENCY_REQUEST_IN_PROGRESS';setUncertain(ambiguous);if(!ambiguous)key.current='';setError(ambiguous?'No se confirmó la respuesta. Reintenta el mismo traspaso para comprobarlo sin duplicarlo.':(e as Error).message);}
  finally{busy.current=false;setSaving(false);}
 };
 return <>
  <button type="button" onClick={()=>setOpen(true)}>Traspasar stock</button>
  {open&&<section className="pos-v2-inventory__modal" role="dialog" aria-modal="true" aria-label="Traspasar stock" onClick={()=>{if(!saving)setOpen(false);}}>
   <form onClick={e=>e.stopPropagation()} onSubmit={e=>{e.preventDefault();void submit();}}>
    <h3>Traspasar stock</h3><p>Se descuenta del origen y se suma al destino. No modifica precios ni categorías existentes.</p>
    <label>Origen<select disabled={locked} value={source} onChange={e=>{setSource(Number(e.target.value));setSelected('');if(target===Number(e.target.value))setTarget(0);}}>{branches.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select></label>
    <label>Destino<select disabled={locked} value={target} onChange={e=>setTarget(Number(e.target.value))}><option value={0}>Seleccionar sucursal</option>{branches.filter(b=>b.id!==source).map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select></label>
    <label>Producto o variante<select disabled={locked||loading} value={selected} onChange={e=>setSelected(e.target.value)}><option value="">{loading?'Cargando inventario…':'Seleccionar producto'}</option>{items.map(i=><option key={`${i.kind}:${i.id}`} value={`${i.kind}:${i.id}`}>{i.name} · {i.stock} disponibles</option>)}</select></label>
    {!loading&&!items.length&&<p>No hay productos con stock disponible.</p>}
    <label>Cantidad a traspasar<input autoFocus disabled={locked} inputMode="decimal" value={quantity} onChange={e=>setQuantity(e.target.value)}/></label>
    {item&&<p>Disponible en origen: {item.stock}</p>}
    {!!error&&<p role="alert" className="pos-v2-inventory__error">{error}</p>}
    <div><button type="button" className="is-secondary" disabled={saving} onClick={()=>setOpen(false)}>Cerrar</button><button type="submit" disabled={!valid||saving||loading}>{saving?'Traspasando…':uncertain?'Reintentar traspaso':'Confirmar traspaso'}</button></div>
   </form>
  </section>}
 </>;
};
