import assert from "node:assert/strict";
import { CrmWebApi, type Conversation } from "../../../../src/new/systems/pos/features/crm/api/CrmWebApi";
import type { HttpClient, HttpRequest } from "../../../../src/new/core/api/HttpClient";
export async function run() {
  let current: Conversation={Id:12,Status:"OPEN",Version:8};
  let failure=false;
  const calls:HttpRequest[]=[];
  const client: HttpClient={request:async<T,>(request:HttpRequest):Promise<T>=>{
    calls.push(request);
    assert.equal(request.path,"crm/inbox/conversations/12");assert.equal(request.token,"token");
    if(request.method==="PATCH") {
      if(failure)throw new Error("La conversación cambió");
      const body=request.body as {Expected_Version:number;Status:string};
      assert.equal(body.Expected_Version,current.Version);
      current={...current,Status:body.Status,Version:current.Version+1};
    }
    return {success:true,data:current} as T;
  }};
  const api=new CrmWebApi("token",client);
  const stale={Id:12,Status:"OPEN",Version:1};
  for(const status of ["PENDING","RESOLVED","ARCHIVED","OPEN"]) {
    const saved=await api.changeStatus(stale,status);
    assert.equal(saved.Status,status);assert.equal(saved.Version,current.Version);
  }
  assert.deepEqual(calls.map(call=>call.method),["GET","PATCH","GET","PATCH","GET","PATCH","GET","PATCH"]);
  failure=true;
  await assert.rejects(()=>api.changeStatus(stale,"PENDING"),/conversación cambió/);
  assert.equal(current.Status,"OPEN");
}
