/** RAVEKH CRM: Embedded Signup runs in the current origin; FB.login opens Meta's single popup. */
export type MetaSignupConfig = { appId:string; configId:string; graphVersion:string };
export type MetaSignupResult = { code:string; wabaId:string; phoneId:string|null; connectionMode:"CLOUD_API"|"COEXISTENCE" };
type FacebookLoginResponse = { authResponse?: {code?:string}; status?:string; error?:string; error_message?:string };
type FacebookSdk = { init:(config:{appId:string;version:string;autoLogAppEvents:boolean;xfbml:boolean})=>void; login:(callback:(response:FacebookLoginResponse)=>void, config:Record<string,unknown>)=>void };
declare global { interface Window { FB?:FacebookSdk; fbAsyncInit?:()=>void } }
let sdkReady:Promise<void>|undefined;
let initializedApp:string|undefined;
export function loadFacebookSdk():Promise<void> {
  if(window.FB) return Promise.resolve();
  if(sdkReady) return sdkReady;
  sdkReady=new Promise<void>((resolve,reject)=>{
    const timeout=window.setTimeout(()=>reject(new Error('No se pudo cargar el SDK de Meta.')),15000);
    const previous=window.fbAsyncInit;
    window.fbAsyncInit=()=>{previous?.();window.clearTimeout(timeout);resolve();};
    const script=document.createElement('script');script.src='https://connect.facebook.net/es_LA/sdk.js';script.async=true;script.crossOrigin='anonymous';
    script.onerror=()=>{window.clearTimeout(timeout);reject(new Error('El navegador bloqueó la carga de Meta.'));};
    document.head.appendChild(script);
  }).catch(error=>{sdkReady=undefined;throw error;});
  return sdkReady;
}
export function launchMetaSignup(config:MetaSignupConfig):Promise<MetaSignupResult> {
  if(!window.FB) throw new Error('Meta todavía no está listo. Prepara la conexión de nuevo.');
  if(initializedApp!==config.appId){window.FB.init({appId:config.appId,version:config.graphVersion,autoLogAppEvents:false,xfbml:false});initializedApp=config.appId;}
  // Call FB.login synchronously from the actual button click to preserve browser user activation.
  return new Promise((resolve,reject)=>{
    let code:string|null=null;
    let session:{wabaId:string;phoneId:string|null;connectionMode:"CLOUD_API"|"COEXISTENCE"}|null=null;
    let closed=false;
    const cleanup=()=>{closed=true;window.removeEventListener('message',handleMessage);window.clearTimeout(timeout);};
    const fail=(message:string)=>{if(closed)return;cleanup();reject(new Error(message));};
    const finish=()=>{if(closed||!code||!session)return;const result={code,...session};cleanup();resolve(result);};
    const handleMessage=(event:MessageEvent)=>{
      if(event.origin!=='https://www.facebook.com'&&event.origin!=='https://web.facebook.com')return;
      let message:unknown=event.data;
      if(typeof message==='string'){try{message=JSON.parse(message);}catch{return;}}
      if(!message||typeof message!=='object')return;
      const payload=message as {type?:string;event?:string;data?:{waba_id?:unknown;phone_number_id?:unknown}};
      if(payload.type!=='WA_EMBEDDED_SIGNUP')return;
      if(payload.event==='CANCEL'){fail('Cancelaste la conexión en Meta.');return;}
      if(payload.event==='ERROR'){fail('Meta notificó un error al conectar WhatsApp.');return;}
      if(payload.event!=='FINISH'&&payload.event!=='FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING')return;
      const wabaId=String(payload.data?.waba_id??'');
      const phoneId=payload.data?.phone_number_id==null?null:String(payload.data.phone_number_id);
      if(!/^\d{5,30}$/.test(wabaId)||phoneId!==null&&!/^\d{5,30}$/.test(phoneId)){
        fail('Meta finalizó sin identificadores válidos de WhatsApp Business.');return;
      }
      session={wabaId,phoneId,connectionMode:payload.event==='FINISH'?'CLOUD_API':'COEXISTENCE'};
      console.info('[CRM_META_SIGNUP]',{stage:'session_received',hasPhoneId:Boolean(phoneId)});
      finish();
    };
    const timeout=window.setTimeout(()=>fail('No llegaron todos los datos de Meta. Verifica los dominios permitidos para Facebook Login.'),120000);
    window.addEventListener('message',handleMessage);
    try {
      window.FB!.login(response=>{
        if(closed)return;
        if(typeof response?.authResponse?.code==='string'&&response.authResponse.code){
          code=response.authResponse.code;
          console.info('[CRM_META_SIGNUP]',{stage:'authorization_received',hasSession:Boolean(session)});
          finish();
        }else{
          console.warn('[CRM_META_SIGNUP]',{stage:'authorization_missing',status:response?.status??'unknown',hasSession:Boolean(session),hasError:Boolean(response?.error)});
          fail('Meta terminó sin devolver el código de autorización. Revisa la configuración de Facebook Login y los dominios autorizados.');
        }
      },{config_id:config.configId,response_type:'code',override_default_response_type:true,extras:{setup:{},featureType:'whatsapp_business_app_onboarding'}});
    }catch{fail('El navegador no pudo abrir la autorización de Meta.');}
  });
}
