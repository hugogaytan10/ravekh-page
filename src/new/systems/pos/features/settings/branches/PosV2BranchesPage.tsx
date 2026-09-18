import { FormEvent, useEffect, useMemo, useState } from "react";
import { FetchHttpClient } from "../../../../../core/api/FetchHttpClient";
import { PosBranchApi, PosBranchEmployee } from "../../../shared/api/PosBranchApi";
import { getPosApiBaseUrl } from "../../../shared/config/posEnv";
import { persistPosBranch, PosBranch, readActivePosBranchId } from "../../../shared/config/posBranch";
import { readPosSessionSnapshot, resolvePosOperatorRole } from "../../../shared/config/posSession";
import { PosV2Shell } from "../../../shared/ui/PosV2Shell";
import "./PosV2BranchesPage.css";

type EmployeeOption = { Id?: number; Name?: string; LastName?: string; Email?: string; Role?: string };
type BranchForm = { name:string; code:string; slug:string; phoneNumber:string; whatsApp:string; address:string; references:string; catalogEnabled:boolean };
const EMPTY: BranchForm = { name:"",code:"",slug:"",phoneNumber:"",whatsApp:"",address:"",references:"",catalogEnabled:true };
const slugify=(value:string)=>value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,120);

export const PosV2BranchesPage=()=>{
  const session=readPosSessionSnapshot();
  const isAdmin=resolvePosOperatorRole(session.token)==="admin";
  const api=useMemo(()=>new PosBranchApi(new FetchHttpClient(getPosApiBaseUrl())),[]);
  const http=useMemo(()=>new FetchHttpClient(getPosApiBaseUrl()),[]);
  const [branches,setBranches]=useState<PosBranch[]>([]);
  const [selectedId,setSelectedId]=useState(0);
  const [form,setForm]=useState<BranchForm>(EMPTY);
  const [creating,setCreating]=useState(false);
  const [copyFrom,setCopyFrom]=useState<number|"">("");
  const [employees,setEmployees]=useState<EmployeeOption[]>([]);
  const [assigned,setAssigned]=useState<PosBranchEmployee[]>([]);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");
  const selected=branches.find(b=>b.id===selectedId)??null;

  const fromBranch=(b:PosBranch|null):BranchForm=>b?{name:b.name,code:b.code,slug:b.slug,phoneNumber:b.phoneNumber??"",whatsApp:b.whatsApp??"",address:b.address??"",references:b.references??"",catalogEnabled:b.catalogEnabled}:EMPTY;
  const load=async()=>{
    if(!session.token)return;
    try{
      const rows=await api.list(session.token); setBranches(rows);
      const stored=readActivePosBranchId(session.businessId);
      const preferred=rows.find(b=>b.id===stored)??rows.find(b=>b.isMain)??rows[0]??null;
      setSelectedId(current=>rows.some(b=>b.id===current)?current:preferred?.id??0);
      if(!creating)setForm(fromBranch(preferred));
    }catch(e){setError(e instanceof Error?e.message:"No se pudieron cargar las sucursales.")}
  };
  const loadEmployees=async(branchId:number)=>{
    if(!isAdmin||!session.token||!branchId)return;
    try{
      const [all,branchEmployees]=await Promise.all([
        http.request<EmployeeOption[]|{data?:EmployeeOption[]}>({method:"GET",path:`employee/business/${session.businessId}`,token:session.token,skipBranchHeader:true}),
        api.listEmployees(branchId,session.token),
      ]);
      setEmployees(Array.isArray(all)?all:all.data??[]); setAssigned(branchEmployees);
    }catch(e){setError(e instanceof Error?e.message:"No se pudo cargar el personal.")}
  };
  useEffect(()=>{void load()},[]);
  useEffect(()=>{if(creating)return;const b=branches.find(x=>x.id===selectedId)??null;setForm(fromBranch(b));if(b)void loadEmployees(b.id)},[selectedId,branches,creating]);
  const change=(key:keyof BranchForm,value:string|boolean)=>setForm(current=>{const next={...current,[key]:value} as BranchForm;if(key==="name"&&typeof value==="string"){if(!current.slug)next.slug=slugify(value);if(!current.code)next.code=slugify(value).replace(/-/g,"_").slice(0,30).toUpperCase()}return next});
  const save=async(e:FormEvent)=>{
    e.preventDefault();if(!isAdmin||!session.token)return;
    if(!form.name.trim()||!form.code.trim()||!form.slug.trim()){setError("Nombre, código y slug son obligatorios.");return}
    setBusy(true);setError("");setMessage("");
    try{
      if(creating){const created=await api.create({name:form.name.trim(),code:form.code.trim(),slug:slugify(form.slug),phoneNumber:form.phoneNumber.trim()||null,whatsApp:form.whatsApp.trim()||null,address:form.address.trim()||null,references:form.references.trim()||null,catalogEnabled:form.catalogEnabled,copyCatalogFromBranchId:copyFrom===""?null:Number(copyFrom)},session.token);setCreating(false);await load();setSelectedId(created.id);setMessage("Sucursal creada. Si copiaste catálogo, su inventario inicia en 0.")}
      else if(selected){const updated=await api.update(selected.id,{name:form.name.trim(),code:form.code.trim(),slug:slugify(form.slug),phoneNumber:form.phoneNumber.trim()||null,whatsApp:form.whatsApp.trim()||null,address:form.address.trim()||null,references:form.references.trim()||null,catalogEnabled:form.catalogEnabled},session.token);setBranches(cur=>cur.map(b=>b.id===updated.id?updated:b));if(readActivePosBranchId(session.businessId)===updated.id)persistPosBranch(updated);setMessage("Sucursal actualizada.")}
    }catch(err){setError(err instanceof Error?err.message:"No fue posible guardar la sucursal.")}finally{setBusy(false)}
  };
  const toggleEmployee=async(emp:EmployeeOption)=>{if(!selected||!isAdmin||!session.token)return;const id=Number(emp.Id??0);if(!id)return;const active=assigned.some(a=>a.employeeId===id&&a.active);setBusy(true);try{active?await api.removeEmployee(selected.id,id,session.token):await api.assignEmployee(selected.id,id,{isPrimary:false},session.token);await loadEmployees(selected.id)}catch(err){setError(err instanceof Error?err.message:"No se pudo actualizar la asignación.")}finally{setBusy(false)}};
  const deactivate=async()=>{if(!selected||selected.isMain||!session.token)return;if(!window.confirm(`¿Desactivar ${selected.name}?`))return;setBusy(true);try{await api.update(selected.id,{active:false},session.token);await load();setMessage("Sucursal desactivada.")}catch(err){setError(err instanceof Error?err.message:"No se pudo desactivar la sucursal.")}finally{setBusy(false)}};

  if(!isAdmin)return <PosV2Shell title="Sucursales"><section className="pos-branches__notice"><h2>Administración restringida</h2><p>Sólo un administrador puede crear sucursales o cambiar asignaciones. El selector superior muestra las sucursales disponibles para tu usuario.</p></section></PosV2Shell>;
  return <PosV2Shell title="Sucursales"><div className="pos-branches">
    <aside className="pos-branches__sidebar"><div className="pos-branches__sidebar-title"><div><strong>Sucursales</strong><span>{branches.length} activas</span></div><button type="button" onClick={()=>{setCreating(true);setSelectedId(0);setForm(EMPTY);setCopyFrom(branches.find(b=>b.isMain)?.id??"");setAssigned([]);setMessage("");setError("")}}>+ Nueva</button></div><div className="pos-branches__list">{branches.map(b=><button type="button" key={b.id} className={`pos-branches__item ${!creating&&selectedId===b.id?"is-active":""}`} onClick={()=>{setCreating(false);setSelectedId(b.id);setMessage("");setError("")}}><span>{b.name}</span><small>{b.isMain?"Principal":b.code}</small></button>)}</div></aside>
    <div className="pos-branches__content"><form className="pos-branches__card" onSubmit={save}><div className="pos-branches__card-heading"><div><h2>{creating?"Nueva sucursal":selected?.name??"Sucursal"}</h2><p>{creating?"Crea una ubicación sin alterar la principal.":"Datos propios de esta sucursal."}</p></div>{selected?.isMain&&!creating?<span className="pos-branches__badge">Principal</span>:null}</div>
      <div className="pos-branches__grid"><label>Nombre<input value={form.name} onChange={e=>change("name",e.target.value)} required/></label><label>Código<input value={form.code} onChange={e=>change("code",e.target.value)} required/></label><label>Slug público<input value={form.slug} onChange={e=>change("slug",slugify(e.target.value))} required/></label><label>Teléfono<input value={form.phoneNumber} onChange={e=>change("phoneNumber",e.target.value)}/></label><label>WhatsApp<input value={form.whatsApp} onChange={e=>change("whatsApp",e.target.value)}/></label><label className="pos-branches__span-2">Dirección<input value={form.address} onChange={e=>change("address",e.target.value)}/></label><label className="pos-branches__span-2">Referencias<textarea rows={2} value={form.references} onChange={e=>change("references",e.target.value)}/></label></div>
      <label className="pos-branches__toggle"><input type="checkbox" checked={form.catalogEnabled} onChange={e=>change("catalogEnabled",e.target.checked)}/><span>Catálogo público habilitado</span></label>
      {creating?<label className="pos-branches__copy">Copiar catálogo desde<select value={copyFrom} onChange={e=>setCopyFrom(e.target.value?Number(e.target.value):"")}><option value="">No copiar</option>{branches.map(b=><option value={b.id} key={b.id}>{b.name}</option>)}</select><small>El stock de la nueva sucursal inicia en 0.</small></label>:null}
      {error?<div className="pos-branches__error">{error}</div>:null}{message?<div className="pos-branches__success">{message}</div>:null}<div className="pos-branches__actions"><button className="is-primary" disabled={busy}>{busy?"Guardando…":creating?"Crear sucursal":"Guardar cambios"}</button>{!creating&&selected&&!selected.isMain?<button type="button" className="is-danger" disabled={busy} onClick={()=>void deactivate()}>Desactivar</button>:null}</div>
    </form>
    {!creating&&selected?<section className="pos-branches__card"><div className="pos-branches__card-heading"><div><h2>Personal asignado</h2><p>Elige quién puede operar esta sucursal.</p></div></div><div className="pos-branches__employees">{employees.map(emp=>{const id=Number(emp.Id??0);const checked=assigned.some(a=>a.employeeId===id&&a.active);return <label className="pos-branches__employee" key={id}><span><strong>{`${emp.Name??""} ${emp.LastName??""}`.trim()||emp.Email||`Empleado ${id}`}</strong><small>{emp.Email} · {emp.Role}</small></span><input type="checkbox" checked={checked} disabled={busy||id===session.employeeId} onChange={()=>void toggleEmployee(emp)}/></label>})}</div></section>:null}
    </div></div></PosV2Shell>;
};
