import assert from "node:assert/strict";
import { loadReportTicket, renderReportTicket } from "../../../../src/new/systems/pos/features/reporting/ui/reportTicket";
import { DEFAULT_TICKET_CUSTOMIZATION } from "../../../../src/new/systems/pos/shared/config/posTicket";
import type { HttpClient, HttpRequest } from "../../../../src/new/core/api/HttpClient";
import type { SalesTicket } from "../../../../src/new/systems/pos/features/reporting/model/SalesReport";
export async function run() {
  const sale: SalesTicket = {id:7,branchId:3,type:"ORDER",date:"",paymentMethod:"OTROS",currency:"MXN",customerName:null,employeeName:null,total:50,discountApplied:0,taxesApplied:0,products:[]};
  let operation = {Id:7,Total:200,Discount:10,TotalDiscount:180,Tax:1,TotalTaxes:208.8,AmountReceived:250,PaymentMethod:"EFECTIVO",MoneyTipe:"USD",Date:"2026-10-16T12:30:00",Note:"Sin bolsa <script>"};
  let products = [{Item_Name:"Café <especial>",Item_Price:100,Item_Quantity:2,Employee_Name:"Ana",Customer_Name:"María",Item_Notes:"Sin azúcar",Color_Name:"Rojo",Size_Name:"Grande"}];
  const calls: HttpRequest[]=[];
  const http: HttpClient = {request: async <T,>(request:HttpRequest):Promise<T> => {calls.push(request);return (request.path.startsWith("products/")?products:operation) as T;}};
  const ticket=await loadReportTicket(http,sale,"token");
  assert.equal(ticket.total,208.8);assert.equal(ticket.subtotal,200);assert.equal(ticket.discountApplied,20);assert.equal(ticket.taxesApplied,28.8);assert.equal(ticket.products[0].detailAmount,200);assert.equal(ticket.customerName,"María");assert.equal(ticket.employeeName,"Ana");assert.equal(ticket.products[0].notes,null);
  assert.deepEqual(calls.map(x=>x.path),["orders/7","products/order/7"]);assert.ok(calls.every(x=>x.branchId===3&&x.token==="token"));
  const html=renderReportTicket(ticket,{Name:"Mi tienda",PhoneNumber:"555"},DEFAULT_TICKET_CUSTOMIZATION,"58");
  for(const value of ["Mi tienda","Café &lt;especial&gt;","Rojo","Grande","María","Ana","208.80","250.00","41.20","USD","Sin bolsa &lt;script&gt;","width:58mm"])assert.ok(html.includes(value),value);
  assert.ok(!html.includes("<script>"));
  const command=await loadReportTicket(http,{...sale,type:"COMMAND"},"token");
  assert.equal(command.products[0].notes,"Sin azúcar");assert.equal(calls[2].path,"commands/7");assert.equal(calls[3].path,"products/command/7");
  operation={...operation,Discount:0,Tax:0,Total:0,AmountReceived:0};
  const free=await loadReportTicket(http,sale,"token");assert.equal(free.total,0);assert.equal(free.amountReceived,0);
  products=[];await assert.rejects(()=>loadReportTicket(http,sale,"token"),/detalle/);
  products=[{Item_Name:"Mal",Item_Price:NaN,Item_Quantity:1} as typeof products[number]];await assert.rejects(()=>loadReportTicket(http,sale,"token"),/inválidos/);
  await assert.rejects(()=>loadReportTicket({request:async()=>{throw new Error("Sin conexión");}},sale,"token"),/Sin conexión/);
}
