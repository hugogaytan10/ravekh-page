import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PosV2Shell } from "../../../shared/ui/PosV2Shell";
import { readPosSessionSnapshot } from "../../../shared/config/posSession";
import { CrmWebApi, Conversation, CrmMessage, CrmContact, CrmOpportunity, CrmActivity, CrmChannel, CrmAgent, MetaDiagnostic } from "../api/CrmWebApi";
import "./PosV2CrmPage.css";

type View = "inbox" | "contacts" | "opportunities" | "activities" | "channels" | "agent";
const mergeMessages = (entries:CrmMessage[], current:CrmMessage[], sending=false) => {
  const known=new Map(current.map(message=>[String(message.Id),message]));
  const ranks:Record<string,number>={SENT:2,DELIVERED:3,READ:4};
  const incoming=entries.filter(message=>!sending||message.Direction==='INBOUND'||known.has(String(message.Id)));
  const seen=new Set(incoming.map(message=>String(message.Id)));
  const confirmed=incoming.map(message=>{
    const previous=known.get(String(message.Id));
    const next=previous?.Local_Key?{...message,Local_Key:previous.Local_Key}:message;
    return (ranks[previous?.Delivery_Status||'']||0)>(ranks[next.Delivery_Status||'']||0)
      ? {...next,Delivery_Status:previous!.Delivery_Status}:next;
  });
  return [...current.filter(message=>message.Id>0&&!seen.has(String(message.Id))),...confirmed].sort((a,b)=>a.Id-b.Id)
    .concat(current.filter(message=>message.Id<0));
};
const errorText = (error: unknown) => error instanceof Error ? error.message : "Ocurrió un error de conexión.";
export function PosV2CrmPage() {
  const { token } = useMemo(() => readPosSessionSnapshot(), []);
  const api = useMemo(() => new CrmWebApi(token || ""), [token]);
  const [view, setView] = useState<View>("inbox");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const conversationRequest = useRef(0);
  const localId=useRef(0);
  const pendingSends=useRef(new Map<number,number>());
  const [conversationLoading, setConversationLoading] = useState(false);
  const [messages, setMessages] = useState<CrmMessage[]>([]);
  const messageListRef=useRef<HTMLDivElement|null>(null);
  const followLatestRef=useRef(true);
  const lastReadRef=useRef(new Map<number,number>());
  const draftsRef=useRef(new Map<number,string>());
  const [contacts, setContacts] = useState<CrmContact[]>([]);
  const [opportunities, setOpportunities] = useState<CrmOpportunity[]>([]);
  const [activities, setActivities] = useState<CrmActivity[]>([]);
  const [draft, setDraft] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [channels,setChannels] = useState<CrmChannel[]>([]);
  const [agents,setAgents] = useState<CrmAgent[]>([]);
  const [diagnostics,setDiagnostics] = useState<Record<number,MetaDiagnostic>>({});
  const [metaPhone,setMetaPhone] = useState("");
  const [metaWaba,setMetaWaba] = useState("");
  const [metaToken,setMetaToken] = useState("");
  const [agentName,setAgentName] = useState("");
  const [agentInstructions,setAgentInstructions] = useState("");
  const [aiPreview,setAiPreview] = useState("");
  const [success,setSuccess] = useState("");
  const [sendMode,setSendMode] = useState<"internal"|"whatsapp">("internal");
  const [filter, setFilter] = useState("");
  const refresh = useCallback(async (tab: View) => {
    if (!token) { setError("Inicia sesión para abrir el CRM."); return; }
    setLoading(true); setError("");
    try {
      if (tab === "inbox") setConversations(await api.conversations());
      if (tab === "contacts") setContacts(await api.contacts());
      if (tab === "opportunities") setOpportunities(await api.opportunities());
      if (tab === "activities") setActivities(await api.activities());
      if (tab === "channels") setChannels(await api.channels());
      if (tab === "agent") setAgents(await api.agents());
    } catch (cause) { setError(errorText(cause)); }
    finally { setLoading(false); }
  }, [api, token]);
  useEffect(() => { void refresh(view); }, [refresh, view]);
  useEffect(() => {
    if (view !== "channels") return;
    const refreshChannels = () => { void refresh("channels"); };
    window.addEventListener("focus", refreshChannels);
    return () => window.removeEventListener("focus", refreshChannels);
  }, [refresh, view]);
  const selectedId = selected?.Id;
  useEffect(()=>{
    const list=messageListRef.current;
    if(list&&followLatestRef.current)list.scrollTop=list.scrollHeight;
  },[messages,selectedId]);
  const markRead=useCallback((conversationId:number,entries:CrmMessage[])=>{
    if(document.hidden||!followLatestRef.current)return;
    const latest=entries.filter(item=>item.Direction==='INBOUND').reduce((max,item)=>Math.max(max,Number(item.Id)||0),0);
    if(latest<1||latest<=(lastReadRef.current.get(conversationId)||0))return;
    lastReadRef.current.set(conversationId,latest);
    void api.markRead(conversationId,latest).then(()=>{
      setConversations(list=>list.map(item=>item.Id===conversationId?{...item,Unread_Count:0}:item));
    }).catch(()=>{if(lastReadRef.current.get(conversationId)===latest)lastReadRef.current.delete(conversationId);});
  },[api]);
  useEffect(() => {
    if (!token || view !== "inbox" || busy || loading || conversationLoading) return;
    let disposed = false;
    let running = false;
    let dirty = false;
    let syncError = "";
    const syncInbox = async () => {
      if (document.hidden || disposed) return;
      if (running) { dirty = true; return; }
      dirty = false;
      const request = conversationRequest.current;
      const isCurrent=()=>!disposed&&request===conversationRequest.current;
      running = true;
      try {
        const listRequest=api.conversations().then(list=>{if(isCurrent())setConversations(list);});
        const threadRequest=selectedId?api.conversation(selectedId).then(thread=>{
          if(isCurrent())setSelected(value=>value?.Id===selectedId&&value.Version<=thread.Version?{...value,...thread}:value);
        }):Promise.resolve();
        const messagesRequest=selectedId?api.messages(selectedId).then(entries=>{
          if(!isCurrent())return;
          setMessages(current=>mergeMessages(entries,current,(pendingSends.current.get(selectedId)||0)>0));
          markRead(selectedId,entries);
        }):Promise.resolve();
        const results=await Promise.allSettled([listRequest,threadRequest,messagesRequest]);
        if(!isCurrent())return;
        const failure=results.find(result=>result.status==='rejected');
        if(failure?.status==='rejected')throw failure.reason;
        if (syncError) setError(value => value === syncError ? "" : value);
      } catch (cause) {
        if (!disposed && request === conversationRequest.current) {
          syncError = errorText(cause);
          setError(syncError);
        }
      } finally { running = false; if (dirty && !disposed) void syncInbox(); }
    };
    let disconnect:(()=>void)|undefined;
    const resume = () => {
      if(document.hidden){disconnect?.();disconnect=undefined;return;}
      if(!disconnect)disconnect=api.subscribeInbox(()=>void syncInbox(),message=>{
        if(!disposed){syncError=message;setError(message);}
      });
    };
    resume();
    const onResume=()=>{resume();if(!document.hidden)void syncInbox();};
    window.addEventListener("focus", onResume);
    document.addEventListener("visibilitychange", onResume);
    return () => {
      disposed = true;
      disconnect?.();
      window.removeEventListener("focus", onResume);
      document.removeEventListener("visibilitychange", onResume);
    };
  }, [api, token, view, selectedId, busy, loading, conversationLoading,markRead]);
  const open = async (conversation: Conversation) => {
    const request = ++conversationRequest.current;
    if(selected)draftsRef.current.set(selected.Id,draft);
    setDraft(draftsRef.current.get(conversation.Id)||'');
    followLatestRef.current=true;
    setError("");setSelected(conversation);setMessages([]);setConversationLoading(true);setAiPreview("");
    setSendMode(conversation.Channel==='WHATSAPP'?'whatsapp':'internal');
    void api.conversation(conversation.Id).then(current=>{
      if(request===conversationRequest.current)setSelected(value=>value?.Id===conversation.Id&&value.Version<=current.Version?{...value,...current}:value);
    }).catch(cause=>{if(request===conversationRequest.current)setError(errorText(cause));});
    try {
      const entries=await api.messages(conversation.Id);
      if(request!==conversationRequest.current)return;
      setMessages(current=>mergeMessages(entries,current,(pendingSends.current.get(conversation.Id)||0)>0));
      markRead(conversation.Id,entries);
    } catch(cause){if(request===conversationRequest.current)setError(errorText(cause));}
    finally{if(request===conversationRequest.current)setConversationLoading(false);}
  };
  useEffect(() => () => { conversationRequest.current += 1; }, []);
  const send = async (event: FormEvent) => {
    event.preventDefault();
    if (!selected || !draft.trim() || busy || conversationLoading) return;
    const request=conversationRequest.current;
    const conversationId=selected.Id;
    const local=--localId.current;
    const message:CrmMessage={Id:local,Local_Key:`local:${local}`,Body:draft.trim(),
      Direction:sendMode==='whatsapp'?'OUTBOUND':'INTERNAL',
      Created_At:new Date().toISOString(),Delivery_Status:'SENDING'};
    pendingSends.current.set(conversationId,(pendingSends.current.get(conversationId)||0)+1);
    followLatestRef.current=true;draftsRef.current.delete(conversationId);
    setDraft("");setError("");setMessages(current=>[...current,message]);
    setConversations(current=>current.map(item=>item.Id===conversationId?{...item,Last_Message_Body:message.Body}:item));
    try {
      const result=sendMode==='whatsapp'?await api.sendWhatsApp(conversationId,message.Body):await api.sendInternal(conversationId,message.Body);
      if(request!==conversationRequest.current)return;
      setMessages(current=>{
        const existing=current.find(item=>String(item.Id)===String(result.Id));
        return current.filter(item=>String(item.Id)!==String(result.Id)).map(item=>item.Id===local
          ? {...item,...result,...existing,Local_Key:message.Local_Key,Delivery_Status:existing?.Delivery_Status??result.Delivery_Status??'SENT'} : item);
      });
    } catch(cause) {
      if(request!==conversationRequest.current)return;
      setMessages(current=>current.map(item=>item.Id===local?{...item,Delivery_Status:'REVIEW'}:item));
      setError(`${errorText(cause)} Comprueba su estado antes de reenviarlo.`);
    } finally {
      const remaining=(pendingSends.current.get(conversationId)||1)-1;
      if(remaining)pendingSends.current.set(conversationId,remaining);
      else pendingSends.current.delete(conversationId);
      if(!remaining && request===conversationRequest.current){
        const latestSend=localId.current;
        void api.messages(conversationId).then(entries=>{
          if(request===conversationRequest.current && latestSend===localId.current && !pendingSends.current.has(conversationId)){
            setMessages(current=>mergeMessages(entries,current));
            markRead(conversationId,entries);
          }
        }).catch(()=>undefined);
      }
    }
  };
  const createContact = async (event: FormEvent) => {
    event.preventDefault(); if (!name.trim() || busy) return;
    setBusy(true); setError("");
    try { await api.createContact({ Name: name.trim(), ...(phone.trim() ? { PhoneNumber: phone.trim() } : {}) }); setName(""); setPhone(""); await refresh("contacts"); }
    catch (cause) { setError(errorText(cause)); } finally { setBusy(false); }
  };
  const createConversation = async (contactId: number) => {
    setBusy(true); setError("");
    try {
      const result=await api.createConversation(contactId);
      const contact=contacts.find(item=>item.Id===contactId);
      const conversation:Conversation={Id:result.Id,Contact_Name:contact?.Name,Status:"OPEN",Version:0,Channel:"INTERNAL"};
      setFilter("");setView("inbox");
      setConversations(current=>[conversation,...current.filter(item=>item.Id!==conversation.Id)]);
      await open(conversation);
    }
    catch (cause) { setError(errorText(cause)); } finally { setBusy(false); }
  };
  const changeControl = async () => {
    if (!selected) return;
    setBusy(true); setError("");
    try {
      if (selected.Control_Mode === "AI") await api.takeover(selected);
      else await api.releaseToAi(selected);
      const list = await api.conversations(); setConversations(list);
      const updated = list.find(item => item.Id === selected.Id);
      if (updated) setSelected(updated);
    } catch (cause) { setError(errorText(cause)); } finally { setBusy(false); }
  };
  const updateStatus = async (status: string) => {
    if (!selected || busy || conversationLoading || status === selected.Status) return;
    setBusy(true); setError("");
    try {
      const updated = await api.changeStatus(selected, status);
      setSelected(current => current?.Id === selected.Id ? { ...current, ...updated } : current);
      setConversations(list => list.map(item => item.Id === selected.Id ? { ...item, ...updated } : item));
    } catch (cause) { setError(errorText(cause)); } finally { setBusy(false); }
  };
  const perform = async (action:()=>Promise<unknown>,onSuccess:string,tab?:View) => {
    if(busy)return;setBusy(true);setError("");setSuccess("");
    try {await action();setSuccess(onSuccess);if(tab)await refresh(tab);}
    catch(cause){setError(errorText(cause));}finally{setBusy(false);}
  };
  const beginMeta = async () => {
    if (busy) return;
    // Reserve the popup synchronously on the user click to avoid popup blockers.
    const popup = window.open("", "ravekh-meta-onboarding", "width=560,height=760");
    if (!popup || popup.closed) {
      setError("Permite las ventanas emergentes para conectar con Meta y vuelve a intentarlo.");
      return;
    }
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const result = await api.beginMetaOnboarding();
      if (!result.url || !result.url.startsWith("https://")) {
        throw new Error("El backend no devolvió una URL segura para conectar con Meta.");
      }
      if (popup && !popup.closed) {
        popup.location.assign(result.url);
        popup.focus();
        setSuccess("Se abrió la conexión desde RAVEKH. Completa los pasos y regresa aquí para ver el canal registrado.");
      } else {
        throw new Error("La ventana de conexión se cerró. Vuelve a conectar con Meta.");
      }
    } catch (cause) {
      if (popup && !popup.closed) popup.close();
      setError(errorText(cause));
    } finally {
      setBusy(false);
    }
  };
  const filtered = conversations.filter(c => `${c.Contact_Name || ""} ${c.Subject || ""} ${c.Last_Message_Body || ""}`.toLowerCase().includes(filter.toLowerCase()));
  return <PosV2Shell title="CRM" subtitle="Conversaciones y seguimiento comercial">
    <div className="rvk-crm">
      <nav className="rvk-crm__tabs" aria-label="Secciones CRM">
        {([ ["inbox", "Conversaciones"], ["contacts", "Contactos"], ["opportunities", "Oportunidades"], ["activities", "Actividades"], ["channels", "Conectar Meta"], ["agent", "Agente IA"] ] as const).map(([key,label]) => <button type="button" key={key} className={view===key ? "active" : ""} onClick={() => { conversationRequest.current += 1; setConversationLoading(false); setView(key); setSelected(null); }}>{label}</button>)}
      </nav>
      {success && <p className="rvk-crm__success" role="status">{success}</p>}
      {error && <p className="rvk-crm__error" role="alert">{error}</p>}
      {loading && <p role="status">Cargando {view === "inbox" ? "conversaciones" : "información"}…</p>}
      {view === "inbox" && <div className="rvk-crm__chat">
        <aside className="rvk-crm__list"><input autoCorrect="on" spellCheck={true} aria-label="Buscar conversación" placeholder="Buscar conversación" value={filter} onChange={e => setFilter(e.target.value)} />
          {filtered.map(c => <button type="button" key={c.Id} disabled={busy} onClick={() => void open(c)} className={selected?.Id === c.Id ? "active" : ""}><strong>{c.Contact_Name || c.Subject || `Conversación #${c.Id}`}</strong><span>{c.Last_Message_Body || "Sin mensajes"}</span><small>{c.Channel || "Interno"} · {c.Status}{Number(c.Unread_Count)>0 ? ` · ${c.Unread_Count} nuevos` : ""}</small></button>)}
          {!loading && !filtered.length && <p>Aún no hay conversaciones.</p>}
        </aside>
        <section className="rvk-crm__thread">{selected ? <>
          <header><strong>{selected.Contact_Name || selected.Subject || `Conversación #${selected.Id}`}</strong><button type="button" disabled={busy} onClick={() => void changeControl()}>{selected.Control_Mode === "AI" ? "Tomar control" : "Devolver a IA"}</button><select aria-label="Estado de conversación" value={selected.Status} onChange={e => void updateStatus(e.target.value)} disabled={busy || conversationLoading}>{["OPEN","PENDING","RESOLVED","ARCHIVED"].map(v=><option key={v} value={v}>{v}</option>)}</select></header>
          <div ref={messageListRef} onScroll={event=>{const list=event.currentTarget;followLatestRef.current=list.scrollHeight-list.scrollTop-list.clientHeight<80;if(followLatestRef.current&&selectedId)markRead(selectedId,messages);}} className="rvk-crm__messages" aria-label="Historial de mensajes" tabIndex={0} aria-live="polite">{conversationLoading && <p role="status">Cargando conversación…</p>}{messages.map(m => <article key={m.Local_Key ?? m.Id} className={m.Direction === "INBOUND" ? "incoming" : "outgoing"}><p>{m.Body}</p><small>{m.Delivery_Status === "REVIEW" ? "Sin confirmar" : m.Delivery_Status === "SENDING" ? "Pendiente" : m.Direction === "INTERNAL" ? "Nota interna" : m.Direction === "OUTBOUND" ? ({PENDING:"Pendiente",QUEUED:"Pendiente",SENT:"Enviado",DELIVERED:"Entregado",READ:"Leído",FAILED:"No enviado"}[m.Delivery_Status || ""] || "Pendiente") : "Recibido"} · {new Date(m.Created_At).toLocaleString("es-MX")}</small></article>)}{!conversationLoading && messages.length===0 && <p>No hay mensajes todavía.</p>}</div>
          <section className="rvk-crm__chat-tools">
            <label>Tipo de mensaje <select value={sendMode} onChange={e=>setSendMode(e.target.value as "internal"|"whatsapp")}><option value="internal">Nota interna</option><option value="whatsapp" disabled={selected.Channel !== "WHATSAPP"}>WhatsApp al cliente</option></select></label>
            <button type="button" disabled={busy} onClick={()=>void perform(async()=>{const enabled=(await api.agents()).find(a=>Boolean(Number(a.Enabled)));if(!enabled)throw Error("Primero activa un agente de IA.");const result=await api.previewAi(selected.Id,enabled.Id);setAiPreview(result.Body);},"Borrador generado: no se envió al cliente.")}>Generar borrador IA</button>
          </section>
          {aiPreview && <section className="rvk-crm__preview"><strong>Propuesta IA (sin enviar)</strong><p>{aiPreview}</p><button type="button" onClick={()=>{setDraft(aiPreview);setSendMode("internal");}}>Copiar al editor</button></section>}
          {selected.Control_Mode === "AI" ? <p className="rvk-crm__hint">Esta conversación está controlada por IA. Toma el control desde el flujo de transferencia autorizado antes de escribir.</p> : <form onSubmit={send}><textarea onKeyDown={event=>{if(event.key==="Enter"&&!event.shiftKey&&!event.nativeEvent.isComposing){event.preventDefault();event.currentTarget.form?.requestSubmit();}}} autoCorrect="on" spellCheck={true} aria-label="Mensaje" placeholder={sendMode === "whatsapp" ? "Escribe al cliente por WhatsApp…" : "Escribe una nota interna…"} value={draft} onChange={e=>setDraft(e.target.value)} rows={2} maxLength={10000}/><button disabled={busy || conversationLoading || !draft.trim()} type="submit">{sendMode === "whatsapp" ? "Enviar por WhatsApp" : "Guardar nota interna"}</button></form>}
          <small className="rvk-crm__hint">Los envíos por WhatsApp requieren un canal activo y la ventana o plantilla permitida por Meta.</small>
        </> : <div className="rvk-crm__empty">Selecciona una conversación para ver su historial.</div>}</section>
      </div>}
      {view === "contacts" && <section className="rvk-crm__panel"><h3>Contactos</h3><form onSubmit={createContact} className="rvk-crm__form"><input autoCorrect="on" spellCheck={true} aria-label="Nombre" placeholder="Nombre del contacto" value={name} onChange={e=>setName(e.target.value)} required maxLength={160}/><input aria-label="Teléfono" placeholder="Teléfono (opcional)" value={phone} onChange={e=>setPhone(e.target.value)} maxLength={45}/><button disabled={busy} type="submit">Agregar contacto</button></form><div className="rvk-crm__rows">{contacts.map(c=><div key={c.Id}><span><strong>{c.Name}</strong><small>{c.PhoneNumber || c.Email || "Sin teléfono"}</small></span><button disabled={busy} onClick={()=>void createConversation(c.Id)}>Abrir conversación</button></div>)}</div></section>}
      {view === "opportunities" && <section className="rvk-crm__panel"><h3>Oportunidades</h3><div className="rvk-crm__rows">{opportunities.map(o=><div key={o.Id}><span><strong>{o.Title}</strong><small>{o.Status || "OPEN"}</small></span><span>{Number(o.Amount || 0).toLocaleString("es-MX",{style:"currency",currency:o.Currency || "MXN"})}</span></div>)}{!loading && !opportunities.length && <p>No hay oportunidades registradas.</p>}</div></section>}
      {view === "channels" && <section className="rvk-crm__panel rvk-crm__settings">
        <h3>Conectar WhatsApp con Meta</h3><p>Conecta tu cuenta de WhatsApp Business a RAVEKH. La conexión se registra primero como pendiente y solo se activa tras la verificación real del webhook de Meta.</p>
        <button type="button" disabled={busy} onClick={()=>void beginMeta()}>{busy ? "Procesando…" : "Conectar con Meta"}</button>
        <p className="rvk-crm__hint">Se abrirá la página segura de conexión de RAVEKH y, desde ella, el diálogo de Meta. Al terminar, regresa aquí para actualizar los canales automáticamente.</p>
        <p className="rvk-crm__hint">Si ya tienes una aplicación y un número configurado directamente en Meta, también puedes vincularlos manualmente.</p>
        <form className="rvk-crm__form" onSubmit={e=>{e.preventDefault();void perform(async()=>{await api.linkExistingMeta(metaPhone.trim(),metaWaba.trim(),metaToken.trim());setMetaToken("");},"Número registrado; revisa su diagnóstico y suscribe el webhook.","channels");}}>
          <input aria-label="ID del número de Meta" placeholder="Phone Number ID" value={metaPhone} onChange={e=>setMetaPhone(e.target.value)} pattern="[0-9]{5,30}" required />
          <input aria-label="ID de cuenta WABA" placeholder="WhatsApp Business Account ID" value={metaWaba} onChange={e=>setMetaWaba(e.target.value)} pattern="[0-9]{5,30}" required />
          <input type="password" autoComplete="off" aria-label="Token de acceso de Meta" placeholder="Token de acceso de Meta" value={metaToken} onChange={e=>setMetaToken(e.target.value)} required minLength={20} />
          <button disabled={busy} type="submit">Vincular número existente</button>
        </form>
        <div className="rvk-crm__section-header"><h3>Canales registrados</h3><button type="button" disabled={busy} onClick={()=>void refresh("channels")}>Actualizar</button></div>
        <div className="rvk-crm__rows">{channels.map(channel=><div key={channel.Id}><span><strong>{channel.Provider} · {channel.External_Account_Id}</strong><small>{Boolean(Number(channel.Enabled)) ? "Activo" : channel.Webhook_Subscribed_At ? "Webhook suscrito; pendiente de mensaje de verificación" : "Pendiente de configuración"}</small>{diagnostics[channel.Id] && <small>Meta: {diagnostics[channel.Id].meta.reachable ? `Conectado · ${diagnostics[channel.Id].meta.displayPhoneNumber || "Número verificado"}` : diagnostics[channel.Id].meta.reason || "No disponible"}</small>}</span><span className="rvk-crm__actions"><button disabled={busy} type="button" onClick={()=>void perform(async()=>{const d=await api.metaDiagnostic(channel.Id);setDiagnostics(v=>({...v,[channel.Id]:d}));},"Diagnóstico actualizado.")}>Diagnóstico</button>{channel.Provider==="WHATSAPP" && !channel.Webhook_Subscribed_At && <button disabled={busy} type="button" onClick={()=>void perform(()=>api.subscribeWebhook(channel.Id),"Meta aceptó la suscripción. Envía un mensaje de prueba a tu número para completar la validación.","channels")}>Suscribir webhook</button>}</span></div>)}{!loading && !channels.length && <p>Sin canales vinculados. Usa “Conectar con Meta” para comenzar.</p>}</div>
      </section>}
      {view === "agent" && <section className="rvk-crm__panel rvk-crm__settings"><h3>Asistente de IA</h3><p>Configura las instrucciones que recibirá el asistente. La vista previa genera borradores: no responde ni envía mensajes automáticamente.</p>
        <form className="rvk-crm__agent-form" onSubmit={e=>{e.preventDefault();void perform(async()=>{await api.createAgent(agentName.trim(),agentInstructions.trim());setAgentName("");setAgentInstructions("");},"Agente creado desactivado. Puedes habilitarlo desde la lista.","agent");}}><label>Nombre<input autoCorrect="on" spellCheck={true} value={agentName} onChange={e=>setAgentName(e.target.value)} required maxLength={120}/></label><label>Instrucciones<textarea onKeyDown={event=>{if(event.key==="Enter"&&!event.shiftKey&&!event.nativeEvent.isComposing){event.preventDefault();event.currentTarget.form?.requestSubmit();}}} autoCorrect="on" spellCheck={true} rows={5} value={agentInstructions} onChange={e=>setAgentInstructions(e.target.value)} required maxLength={6000} placeholder="Describe el negocio, horarios, reglas de respuesta y cuándo transferir a una persona…" /></label><button disabled={busy} type="submit">Crear agente</button></form>
        <div className="rvk-crm__rows">{agents.map(agent=><div key={agent.Id}><span><strong>{agent.Name}</strong><small>{Boolean(Number(agent.Enabled)) ? "Habilitado" : "Deshabilitado"} · {agent.Model_Name || "Modelo configurado por backend"}</small><small>{agent.Instructions}</small></span><button type="button" disabled={busy} onClick={()=>void perform(()=>api.updateAgent(agent.Id,{Enabled:!Boolean(Number(agent.Enabled))}),"Estado del agente actualizado.","agent")}>{Boolean(Number(agent.Enabled)) ? "Desactivar" : "Habilitar"}</button></div>)}{!loading && !agents.length && <p>No hay agentes configurados.</p>}</div>
      </section>}
      {view === "activities" && <section className="rvk-crm__panel"><h3>Actividades</h3><div className="rvk-crm__rows">{activities.map(a=><div key={a.Id}><span><strong>{a.Title}</strong><small>{a.Kind} · {a.Status}</small></span><span>{a.Due_At ? new Date(a.Due_At).toLocaleDateString("es-MX") : "Sin fecha"}</span></div>)}{!loading && !activities.length && <p>No hay actividades registradas.</p>}</div></section>}
    </div>
  </PosV2Shell>;
}
