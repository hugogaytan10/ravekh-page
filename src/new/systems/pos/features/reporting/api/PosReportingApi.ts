import { HttpClient } from "../../../../core/api/HttpClient";
import { IReportingRepository } from "../interface/IReportingRepository";
import { IncomePoint, ReportLeaderboardItem, ReportProductItem, ReportRange, ReportSale, SalesReport, SalesSummary, SalesTicketsPage } from "../model/SalesReport";

type OverviewCurrency={MoneyTipe?:string;sales?:number;transactions?:number;items?:number;cost?:number;estimatedGrossProfit?:number;averageTicket?:number};
type OverviewResponse={data?:{byCurrency?:OverviewCurrency[]}}|{byCurrency?:OverviewCurrency[]};
type PaymentRow={MoneyTipe?:string;paymentMethod?:string;transactions?:number;total?:number};
type ListWrapper<T>={data?:T[]};
type TimelineRow={day?:string;Day?:string;MoneyTipe?:string;total?:number};
type TopItemRow={itemId?:number;productId?:number;productName?:string;variantDescription?:string|null;quantity?:number;revenue?:number;estimatedProfit?:number};
type EmployeeRow={employeeId?:number;name?:string;transactions?:number;total?:number};
type IncomeRow={Id?:number;Name?:string;Amount?:number;Date?:string;MoneyTipe?:string;Order_Id?:number|null;Command_Id?:number|null;Source?:string};

const iso=(d:Date)=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const rangeDates=(range:ReportRange)=>{const now=new Date();if(range==="DAY"){const x=iso(now);return{from:x,to:x}}if(range==="MONTH")return{from:iso(new Date(now.getFullYear(),now.getMonth(),1)),to:iso(new Date(now.getFullYear(),now.getMonth()+1,0))};return{from:iso(new Date(now.getFullYear(),0,1)),to:iso(new Date(now.getFullYear(),11,31))}};
const unwrap=<T,>(payload:T|ListWrapper<T>):T[]=>Array.isArray(payload)?payload:(payload as ListWrapper<T>)?.data??[];
const currencyRow=(rows:OverviewCurrency[])=>rows.find(row=>String(row.MoneyTipe??"").toUpperCase()==="MXN")??rows[0]??{};

export class PosReportingApi implements IReportingRepository{
  constructor(private readonly httpClient:HttpClient){}

  async getSalesReport(businessId:number,token?:string,branchId?:number):Promise<SalesReport>{
    if(!token)return SalesReport.empty(businessId);
    const [day,month,year]=await Promise.all([this.summary("DAY",token,branchId),this.summary("MONTH",token,branchId),this.summary("YEAR",token,branchId)]);
    return new SalesReport(businessId,day,month,year);
  }

  async getIncomeSeries(_businessId:number,range:ReportRange,token?:string,branchId?:number):Promise<IncomePoint[]>{
    if(!token)return[];const dates=rangeDates(range);
    const response=await this.httpClient.request<ListWrapper<TimelineRow>|TimelineRow[]>({method:"GET",path:"reports/branch/timeline",token,branchId,query:dates});
    return unwrap(response).map(row=>new IncomePoint(String(row.day??row.Day??""),Number(row.total??0)));
  }

  async getSalesDetails(_businessId:number,range:ReportRange,_payment:"TODOS"|"EFECTIVO"|"TARJETA",token:string,branchId?:number):Promise<ReportSale[]>{
    const dates=rangeDates(range);const rows=await this.incomeRows(dates.from,dates.to,token,branchId);
    return rows.filter(row=>row.Order_Id||row.Command_Id).map(row=>new ReportSale(
      String(row.Order_Id??row.Command_Id??row.Id??0),row.Command_Id?"COMMAND":"ORDER",String(row.Date??""),"OTROS",String(row.MoneyTipe??"MXN"),Number(row.Amount??0),row.Command_Id?"Venta restaurante":"Venta POS","Sin dirección",1,"Entregado",
    )).sort((a,b)=>new Date(b.date).getTime()-new Date(a.date).getTime());
  }

  async getSalesTicketsByDateRange(_businessId:number,from:string,to:string,_timezone:string,page:number,pageSize:number,token:string,branchId?:number):Promise<SalesTicketsPage>{
    const rows=(await this.incomeRows(from,to,token,branchId)).filter(row=>row.Order_Id||row.Command_Id).sort((a,b)=>new Date(String(b.Date??"")).getTime()-new Date(String(a.Date??"")).getTime());
    const safePage=Math.max(1,page);const safeSize=Math.max(1,pageSize);const start=(safePage-1)*safeSize;const selected=rows.slice(start,start+safeSize);
    return{items:selected.map(row=>({id:Number(row.Order_Id??row.Command_Id??row.Id??0),type:row.Command_Id?"COMMAND":"ORDER",date:String(row.Date??""),paymentMethod:"OTROS",currency:String(row.MoneyTipe??"MXN"),customerName:null,employeeName:null,total:Number(row.Amount??0),discountApplied:0,taxesApplied:0,products:[]})),pagination:{page:safePage,pageSize:safeSize,totalItems:rows.length,totalPages:rows.length?Math.ceil(rows.length/safeSize):0}};
  }

  async getProductsLeaderboard(_businessId:number,range:ReportRange,token:string,branchId?:number):Promise<ReportProductItem[]>{
    const dates=rangeDates(range);const response=await this.httpClient.request<ListWrapper<TopItemRow>|TopItemRow[]>({method:"GET",path:"reports/branch/top-items",token,branchId,query:{...dates,limit:20}});
    return unwrap(response).map(row=>new ReportProductItem(Number(row.itemId??row.productId??0),[row.productName,row.variantDescription].filter(Boolean).join(" · "),Number(row.quantity??0),Number(row.revenue??0),Number(row.estimatedProfit??0)));
  }

  async getEmployeesLeaderboard(_businessId:number,range:ReportRange,token:string,branchId?:number):Promise<ReportLeaderboardItem[]>{
    const dates=rangeDates(range);const response=await this.httpClient.request<ListWrapper<EmployeeRow>|EmployeeRow[]>({method:"GET",path:"reports/branch/employees",token,branchId,query:dates});
    return unwrap(response).map(row=>new ReportLeaderboardItem(Number(row.employeeId??0),String(row.name??"Empleado"),Number(row.total??0),Number(row.transactions??0)));
  }

  async getCustomersLeaderboard(_businessId:number,_range:ReportRange,_token:string,_branchId?:number):Promise<ReportLeaderboardItem[]>{
    // El backend multi-sucursal aún no expone leaderboard por cliente. Evitamos mezclar datos globales legacy.
    return[];
  }

  private async summary(range:ReportRange,token:string,branchId?:number):Promise<SalesSummary>{
    const dates=rangeDates(range);
    const [overview,payments]=await Promise.all([
      this.httpClient.request<OverviewResponse>({method:"GET",path:"reports/branch/overview",token,branchId,query:dates}),
      this.httpClient.request<ListWrapper<PaymentRow>|PaymentRow[]>({method:"GET",path:"reports/branch/payment-methods",token,branchId,query:dates}),
    ]);
    const data="data" in overview?(overview.data??{}):overview;const row=currencyRow(data.byCurrency??[]);const paymentRows=unwrap(payments).filter(item=>String(item.MoneyTipe??"MXN").toUpperCase()===String(row.MoneyTipe??"MXN").toUpperCase());
    const tx=Math.max(0,Number(row.transactions??0));const cash=paymentRows.filter(item=>String(item.paymentMethod??"").toUpperCase()==="EFECTIVO").reduce((n,item)=>n+Number(item.transactions??0),0);const card=paymentRows.filter(item=>String(item.paymentMethod??"").toUpperCase().includes("TARJETA")).reduce((n,item)=>n+Number(item.transactions??0),0);
    return new SalesSummary(Number(row.estimatedGrossProfit??0),Number(row.sales??0),Number(row.estimatedGrossProfit??0),Number(row.averageTicket??0),tx,tx?cash/tx*100:0,tx?card/tx*100:0,"Sin datos","Sin datos");
  }

  private async incomeRows(from:string,to:string,token:string,branchId?:number):Promise<IncomeRow[]>{
    const response=await this.httpClient.request<ListWrapper<IncomeRow>|IncomeRow[]>({method:"GET",path:"finances/branch/income",token,branchId,query:{from,to}});return unwrap(response);
  }
}
