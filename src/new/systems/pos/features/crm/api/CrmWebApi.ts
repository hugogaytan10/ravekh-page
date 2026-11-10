import type { HttpClient } from "../../../../../core/api/HttpClient";
import { FetchHttpClient } from "../../../../../core/api/FetchHttpClient";
import { getPosApiBaseUrl } from "../../../shared/config/posEnv";

export type Conversation = { Id: number; Contact_Name?: string; Subject?: string; Status: string; Channel?: string; Control_Mode?: string; Version: number; Last_Message_Body?: string; Unread_Count?: number };
export type CrmMessage = { Id: number; Local_Key?: string; Body: string; Direction: string; Sender_Type?: string; Created_At: string; Delivery_Status?: string };
export type CrmContact = { Id: number; Name: string; Email?: string; PhoneNumber?: string; Source?: string };
export type CrmOpportunity = { Id: number; Title: string; Status?: string; Amount?: number; Currency?: string; Contact_Id?: number };
export type CrmActivity = { Id: number; Title: string; Status: string; Kind: string; Due_At?: string };
export type CrmChannel = { Id:number; Provider:string; External_Account_Id:string; Enabled:number|boolean; Webhook_Subscribed_At?:string|null };
export type CrmAgent = { Id:number; Name:string; Instructions:string; Enabled:number|boolean; Model_Name?:string };
export type MetaDiagnostic = { local:{enabled:boolean;webhookSubscribed:boolean;phoneNumberId:string;wabaId:string|null}; meta:{reachable:boolean;reason?:string;wabaName?:string;displayPhoneNumber?:string;verifiedName?:string} };
type Envelope<T> = { success: boolean; data: T; message?: string };

/** The CRM controller returns {success,data}; unlike legacy POS resources. */
export class CrmWebApi {

  constructor(private readonly token: string, private readonly client: HttpClient = new FetchHttpClient(getPosApiBaseUrl())) {}
  private async get<T>(path: string): Promise<T> {
    const result = await this.client.request<Envelope<T>>({ method: "GET", path, token: this.token });
    if (!result?.success) throw new Error(result?.message || "Respuesta inválida del CRM.");
    return result.data;
  }
  private async send<T>(method: "POST" | "PATCH" | "PUT", path: string, body: Record<string, unknown>): Promise<T> {
    const result = await this.client.request<Envelope<T>>({ method, path, body, token: this.token });
    if (!result?.success) throw new Error(result?.message || "No se pudo completar la operación.");
    return result.data;
  }
  subscribeInbox(onChange:()=>void,onError:(message:string)=>void):()=>void {
    let closed=false;
    let controller:AbortController|undefined;
    let retry:ReturnType<typeof setTimeout>|undefined;
    const connect=async()=>{
      controller=new AbortController();
      try {
        const response=await fetch(new URL("crm/inbox/events",getPosApiBaseUrl()),{
          method:"POST",headers:{Authorization:`Bearer ${this.token}`,Accept:"text/event-stream"},
          signal:controller.signal,cache:"no-store",
        });
        if(!response.ok||!response.body){
          if(response.status===401||response.status===403)closed=true;
          throw new Error(`No se pudo conectar el chat en vivo (HTTP ${response.status}).`);
        }
        if(!response.headers.get("content-type")?.includes("text/event-stream"))throw new Error("Respuesta inválida del chat en vivo.");
        // Catch up on every handshake, including the first subscription.
        if(!closed)onChange();
        const reader=response.body.getReader();
        const decoder=new TextDecoder();
        let buffer="";
        try {
          while(!closed){
            const {done,value}=await reader.read();
            if(done)break;
            buffer+=decoder.decode(value,{stream:true});
            buffer=buffer.replace(/\r\n/g,"\n");
            let end:number;
            while((end=buffer.indexOf("\n\n"))!==-1){
              const frame=buffer.slice(0,end);buffer=buffer.slice(end+2);
              if(frame.split("\n").some(line=>line==="data: refresh")&&!closed)onChange();
            }
            if(buffer.length>65536)throw new Error("Evento inválido del chat en vivo.");
          }
        } finally { await reader.cancel().catch(()=>undefined); }
        if(!closed)onError("Se perdió la conexión del chat. Reconectando…");
      }catch(error){
        if(!controller.signal.aborted)onError(error instanceof Error?error.message:"No se pudo conectar el chat en vivo.");
      }finally{
        if(!closed)retry=setTimeout(()=>void connect(),2000);
      }
    };
    void connect();
    return()=>{closed=true;controller?.abort();if(retry)clearTimeout(retry);};
  }
  channels() { return this.get<CrmChannel[]>("crm/channels"); }
  beginMetaOnboarding() { return this.send<{ticket:string;appId:string;configId:string;graphVersion:string;url:string}>("POST", "crm/meta/whatsapp/start", {}); }
  completeMetaOnboarding(body:{ticket:string;code:string;wabaId:string;phoneId:string|null;connectionMode:"CLOUD_API"|"COEXISTENCE"}) { return this.send<{Id:number;Status:string;Enabled:boolean}>("POST","crm/meta/whatsapp/complete",body); }
  linkExistingMeta(phoneId:string,wabaId:string,accessToken:string) { return this.send<unknown>("POST", "crm/channels/whatsapp/link-existing", {Phone_Number_Id:phoneId,Waba_Id:wabaId,Access_Token:accessToken}); }
  metaDiagnostic(id:number) { return this.get<MetaDiagnostic>(`crm/channels/whatsapp/${id}/diagnostic`); }
  subscribeWebhook(id:number) { return this.send<unknown>("POST",`crm/channels/whatsapp/${id}/subscribe-webhook`,{}); }
  sendWhatsApp(conversationId:number,body:string) { return this.send<{Id:number;Delivery_Status?:string}>("POST",`crm/channels/whatsapp/${conversationId}/messages`,{Body:body}); }
  agents() { return this.get<CrmAgent[]>("crm/ai/agents"); }
  createAgent(name:string,instructions:string) { return this.send<unknown>("POST","crm/ai/agents",{Name:name,Instructions:instructions}); }
  updateAgent(id:number,body:{Name?:string;Instructions?:string;Enabled?:boolean}) { return this.send<unknown>("PATCH",`crm/ai/agents/${id}`,body); }
  previewAi(id:number,agentId:number) {return this.send<{Body:string;Status:string}>("POST",`crm/ai/conversations/${id}/preview`,{Agent_Id:agentId});}
  conversations() { return this.get<Conversation[]>("crm/inbox/conversations"); }
  conversation(id: number) { return this.get<Conversation>(`crm/inbox/conversations/${id}`); }
  messages(id: number) { return this.get<CrmMessage[]>(`crm/inbox/conversations/${id}/messages`); }
  contacts() { return this.get<CrmContact[]>("crm/contacts"); }
  opportunities() { return this.get<CrmOpportunity[]>("crm/opportunities"); }
  activities() { return this.get<CrmActivity[]>("crm/activities"); }
  createContact(body: { Name: string; Email?: string; PhoneNumber?: string }) { return this.send<{Id:number}>("POST", "crm/contacts", body); }
  createConversation(contactId: number) { return this.send<{Id:number}>("POST", "crm/inbox/conversations", { Contact_Id: contactId }); }
  sendInternal(id: number, body: string) { return this.send<{Id:number;Delivery_Status?:string}>("POST", `crm/inbox/conversations/${id}/messages`, { Body: body }); }
  takeover(conv: Conversation) { return this.send<unknown>("POST", `crm/inbox/conversations/${conv.Id}/takeover`, { Expected_Version: conv.Version }); }
  releaseToAi(conv: Conversation) { return this.send<unknown>("POST", `crm/inbox/conversations/${conv.Id}/release-to-ai`, { Expected_Version: conv.Version }); }
  markRead(id: number, messageId: number) { return this.send<unknown>("PUT", `crm/inbox/conversations/${id}/read`, { Last_Read_Message_Id: messageId }); }
  async changeStatus(conv: Conversation, status: string) {
    const latest = await this.conversation(conv.Id);
    return this.send<Conversation>("PATCH", `crm/inbox/conversations/${conv.Id}`, { Expected_Version: latest.Version, Status: status });
  }
}
