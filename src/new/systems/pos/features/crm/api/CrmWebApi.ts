import type { HttpClient } from "../../../../../core/api/HttpClient";
import { FetchHttpClient } from "../../../../../core/api/FetchHttpClient";
import { getPosApiBaseUrl } from "../../../shared/config/posEnv";

export type Conversation = { Id: number; Contact_Name?: string; Subject?: string; Status: string; Channel?: string; Control_Mode?: string; Version: number; Last_Message_Body?: string; Unread_Count?: number };
export type CrmMessage = { Id: number; Body: string; Direction: string; Sender_Type?: string; Created_At: string; Delivery_Status?: string };
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
  channels() { return this.get<CrmChannel[]>("crm/channels"); }
  beginMetaOnboarding() { return this.send<{url:string}>("POST", "crm/meta/whatsapp/start", {}); }
  linkExistingMeta(phoneId:string,wabaId:string,accessToken:string) { return this.send<unknown>("POST", "crm/channels/whatsapp/link-existing", {Phone_Number_Id:phoneId,Waba_Id:wabaId,Access_Token:accessToken}); }
  metaDiagnostic(id:number) { return this.get<MetaDiagnostic>(`crm/channels/whatsapp/${id}/diagnostic`); }
  subscribeWebhook(id:number) { return this.send<unknown>("POST",`crm/channels/whatsapp/${id}/subscribe-webhook`,{}); }
  sendWhatsApp(conversationId:number,body:string) { return this.send<unknown>("POST",`crm/channels/whatsapp/${conversationId}/messages`,{Body:body}); }
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
  sendInternal(id: number, body: string) { return this.send<{Id:number}>("POST", `crm/inbox/conversations/${id}/messages`, { Body: body }); }
  takeover(conv: Conversation) { return this.send<unknown>("POST", `crm/inbox/conversations/${conv.Id}/takeover`, { Expected_Version: conv.Version }); }
  releaseToAi(conv: Conversation) { return this.send<unknown>("POST", `crm/inbox/conversations/${conv.Id}/release-to-ai`, { Expected_Version: conv.Version }); }
  markRead(id: number, messageId: number) { return this.send<unknown>("PUT", `crm/inbox/conversations/${id}/read`, { Last_Read_Message_Id: messageId }); }
  async changeStatus(conv: Conversation, status: string) {
    const latest = await this.conversation(conv.Id);
    return this.send<Conversation>("PATCH", `crm/inbox/conversations/${conv.Id}`, { Expected_Version: latest.Version, Status: status });
  }
}
