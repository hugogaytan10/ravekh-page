import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PosV2Shell } from "../../../shared/ui/PosV2Shell";
import { readPosSessionSnapshot } from "../../../shared/config/posSession";
import { CrmWebApi, Conversation, CrmMessage, CrmContact, CrmOpportunity, CrmActivity, CrmChannel, CrmAgent, MetaDiagnostic } from "../api/CrmWebApi";
import "./PosV2CrmPage.css";

type View = "inbox" | "contacts" | "opportunities" | "activities" | "channels" | "agent";
const errorText = (error: unknown) => error instanceof Error ? error.message : "Ocurrió un error de conexión.";
export function PosV2CrmPage() {
  const { token } = useMemo(() => readPosSessionSnapshot(), []);
  const api = useMemo(() => new CrmWebApi(token || ""), [token]);
  const [view, setView] = useState<View>("inbox");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const conversationRequest = useRef(0);
  const [conversationLoading, setConversationLoading] = useState(false);
  const [messages, setMessages] = useState<CrmMessage[]>([]);
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
  const open = async (conversation: Conversation) => {
    const request = ++conversationRequest.current;
    setError(""); setSelected(conversation); setMessages([]); setConversationLoading(true); setAiPreview(""); setSendMode("internal");
    try {
      const [current, entries] = await Promise.all([api.conversation(conversation.Id), api.messages(conversation.Id)]);
      if (request !== conversationRequest.current) return;
      setSelected({ ...conversation, ...current });
      setMessages(entries.slice().reverse());
    } catch (cause) { if (request === conversationRequest.current) setError(errorText(cause)); }
    finally { if (request === conversationRequest.current) setConversationLoading(false); }
  };
  useEffect(() => () => { conversationRequest.current += 1; }, []);
  const send = async (event: FormEvent) => {
    event.preventDefault();
    if (!selected || !draft.trim() || busy || conversationLoading) return;
    setBusy(true); setError("");
    try {
      if(sendMode === "whatsapp") { await api.sendWhatsApp(selected.Id,draft.trim());setSuccess("Mensaje aceptado para envío. Comprueba su estado en el historial."); }
      else await api.sendInternal(selected.Id, draft.trim());
      setDraft(""); await open(selected); await refresh("inbox");
    }
    catch (cause) { setError(errorText(cause)); } finally { setBusy(false); }
  };
  const createContact = async (event: FormEvent) => {
    event.preventDefault(); if (!name.trim() || busy) return;
    setBusy(true); setError("");
    try { await api.createContact({ Name: name.trim(), ...(phone.trim() ? { PhoneNumber: phone.trim() } : {}) }); setName(""); setPhone(""); await refresh("contacts"); }
    catch (cause) { setError(errorText(cause)); } finally { setBusy(false); }
  };
  const createConversation = async (contactId: number) => {
    setBusy(true); setError("");
    try { const result = await api.createConversation(contactId); setView("inbox"); await refresh("inbox"); await open({ Id: result.Id, Status: "OPEN", Version: 0 }); }
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
    // A transient backend-issued ticket is the only onboarding credential in the URL.
    // Pre-open the window on user gesture to prevent popup blockers.
    const popup=window.open("", "ravekh-meta-onboarding", "width=560,height=760");
    await perform(async()=>{const result=await api.beginMetaOnboarding();
      if(!result.url.startsWith("https://") && !result.url.startsWith("http://"))throw new Error("URL de Meta no válida.");
      if(popup)popup.location.assign(result.url);else window.location.assign(result.url);
    },"Se abrió la conexión con Meta. Al terminar, vuelve y actualiza los canales.");
    // La ventana puede estar ahora en otro origen; no se inspecciona su location.
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
        <aside className="rvk-crm__list"><input aria-label="Buscar conversación" placeholder="Buscar conversación" value={filter} onChange={e => setFilter(e.target.value)} />
          {filtered.map(c => <button type="button" key={c.Id} disabled={busy} onClick={() => void open(c)} className={selected?.Id === c.Id ? "active" : ""}><strong>{c.Contact_Name || c.Subject || `Conversación #${c.Id}`}</strong><span>{c.Last_Message_Body || "Sin mensajes"}</span><small>{c.Channel || "Interno"} · {c.Status}{Number(c.Unread_Count)>0 ? ` · ${c.Unread_Count} nuevos` : ""}</small></button>)}
          {!loading && !filtered.length && <p>Aún no hay conversaciones.</p>}
        </aside>
        <section className="rvk-crm__thread">{selected ? <>
          <header><strong>{selected.Contact_Name || selected.Subject || `Conversación #${selected.Id}`}</strong><button type="button" disabled={busy} onClick={() => void changeControl()}>{selected.Control_Mode === "AI" ? "Tomar control" : "Devolver a IA"}</button><select aria-label="Estado de conversación" value={selected.Status} onChange={e => void updateStatus(e.target.value)} disabled={busy || conversationLoading}>{["OPEN","PENDING","RESOLVED","ARCHIVED"].map(v=><option key={v} value={v}>{v}</option>)}</select></header>
          <div className="rvk-crm__messages" aria-label="Historial de mensajes" tabIndex={0} aria-live="polite">{conversationLoading && <p role="status">Cargando conversación…</p>}{messages.map(m => <article key={m.Id} className={m.Direction === "INBOUND" ? "incoming" : "outgoing"}><p>{m.Body}</p><small>{m.Direction === "INTERNAL" ? "Nota interna" : m.Direction === "OUTBOUND" ? "Enviado" : "Recibido"} · {new Date(m.Created_At).toLocaleString("es-MX")}</small></article>)}{!conversationLoading && messages.length===0 && <p>No hay mensajes todavía.</p>}</div>
          <section className="rvk-crm__chat-tools">
            <label>Tipo de mensaje <select value={sendMode} onChange={e=>setSendMode(e.target.value as "internal"|"whatsapp")}><option value="internal">Nota interna</option><option value="whatsapp" disabled={selected.Channel !== "WHATSAPP"}>WhatsApp al cliente</option></select></label>
            <button type="button" disabled={busy} onClick={()=>void perform(async()=>{const enabled=(await api.agents()).find(a=>Boolean(Number(a.Enabled)));if(!enabled)throw Error("Primero activa un agente de IA.");const result=await api.previewAi(selected.Id,enabled.Id);setAiPreview(result.Body);},"Borrador generado: no se envió al cliente.")}>Generar borrador IA</button>
          </section>
          {aiPreview && <section className="rvk-crm__preview"><strong>Propuesta IA (sin enviar)</strong><p>{aiPreview}</p><button type="button" onClick={()=>{setDraft(aiPreview);setSendMode("internal");}}>Copiar al editor</button></section>}
          {selected.Control_Mode === "AI" ? <p className="rvk-crm__hint">Esta conversación está controlada por IA. Toma el control desde el flujo de transferencia autorizado antes de escribir.</p> : <form onSubmit={send}><textarea aria-label="Mensaje" placeholder={sendMode === "whatsapp" ? "Escribe al cliente por WhatsApp…" : "Escribe una nota interna…"} value={draft} onChange={e=>setDraft(e.target.value)} rows={2} maxLength={10000}/><button disabled={busy || conversationLoading || !draft.trim()} type="submit">{sendMode === "whatsapp" ? "Enviar por WhatsApp" : "Guardar nota interna"}</button></form>}
          <small className="rvk-crm__hint">Los envíos por WhatsApp requieren un canal activo y la ventana o plantilla permitida por Meta.</small>
        </> : <div className="rvk-crm__empty">Selecciona una conversación para ver su historial.</div>}</section>
      </div>}
      {view === "contacts" && <section className="rvk-crm__panel"><h3>Contactos</h3><form onSubmit={createContact} className="rvk-crm__form"><input aria-label="Nombre" placeholder="Nombre del contacto" value={name} onChange={e=>setName(e.target.value)} required maxLength={160}/><input aria-label="Teléfono" placeholder="Teléfono (opcional)" value={phone} onChange={e=>setPhone(e.target.value)} maxLength={45}/><button disabled={busy} type="submit">Agregar contacto</button></form><div className="rvk-crm__rows">{contacts.map(c=><div key={c.Id}><span><strong>{c.Name}</strong><small>{c.PhoneNumber || c.Email || "Sin teléfono"}</small></span><button disabled={busy} onClick={()=>void createConversation(c.Id)}>Abrir conversación</button></div>)}</div></section>}
      {view === "opportunities" && <section className="rvk-crm__panel"><h3>Oportunidades</h3><div className="rvk-crm__rows">{opportunities.map(o=><div key={o.Id}><span><strong>{o.Title}</strong><small>{o.Status || "OPEN"}</small></span><span>{Number(o.Amount || 0).toLocaleString("es-MX",{style:"currency",currency:o.Currency || "MXN"})}</span></div>)}{!loading && !opportunities.length && <p>No hay oportunidades registradas.</p>}</div></section>}
      {view === "channels" && <section className="rvk-crm__panel rvk-crm__settings">
        <h3>Conectar WhatsApp con Meta</h3><p>Conecta tu cuenta de WhatsApp Business a RAVEKH. La conexión se registra primero como pendiente y solo se activa tras la verificación real del webhook de Meta.</p>
        <button type="button" disabled={busy} onClick={()=>void beginMeta()}>Conectar con Meta</button>
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
        <form className="rvk-crm__agent-form" onSubmit={e=>{e.preventDefault();void perform(async()=>{await api.createAgent(agentName.trim(),agentInstructions.trim());setAgentName("");setAgentInstructions("");},"Agente creado desactivado. Puedes habilitarlo desde la lista.","agent");}}><label>Nombre<input value={agentName} onChange={e=>setAgentName(e.target.value)} required maxLength={120}/></label><label>Instrucciones<textarea rows={5} value={agentInstructions} onChange={e=>setAgentInstructions(e.target.value)} required maxLength={6000} placeholder="Describe el negocio, horarios, reglas de respuesta y cuándo transferir a una persona…" /></label><button disabled={busy} type="submit">Crear agente</button></form>
        <div className="rvk-crm__rows">{agents.map(agent=><div key={agent.Id}><span><strong>{agent.Name}</strong><small>{Boolean(Number(agent.Enabled)) ? "Habilitado" : "Deshabilitado"} · {agent.Model_Name || "Modelo configurado por backend"}</small><small>{agent.Instructions}</small></span><button type="button" disabled={busy} onClick={()=>void perform(()=>api.updateAgent(agent.Id,{Enabled:!Boolean(Number(agent.Enabled))}),"Estado del agente actualizado.","agent")}>{Boolean(Number(agent.Enabled)) ? "Desactivar" : "Habilitar"}</button></div>)}{!loading && !agents.length && <p>No hay agentes configurados.</p>}</div>
      </section>}
      {view === "activities" && <section className="rvk-crm__panel"><h3>Actividades</h3><div className="rvk-crm__rows">{activities.map(a=><div key={a.Id}><span><strong>{a.Title}</strong><small>{a.Kind} · {a.Status}</small></span><span>{a.Due_At ? new Date(a.Due_At).toLocaleDateString("es-MX") : "Sin fecha"}</span></div>)}{!loading && !activities.length && <p>No hay actividades registradas.</p>}</div></section>}
    </div>
  </PosV2Shell>;
}
