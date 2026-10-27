import { HttpClient } from "../../../../../core/api/HttpClient";
import { EmployeeSummary, ICashClosingRepository } from "../interface/ICashClosingRepository";
import { CashClosing, CashClosingPreview, CreateCashClosingDto } from "../model/CashClosing";
import { readPosCurrency } from "../../../shared/config/posCurrency";

type EmployeeResponse={Id:number;Name:string;LastName?:string};
type CashClosingResponse={Id:number;Employee_Id?:number;Employees_Id?:number;Branch_Id?:number;Total?:number;Date?:string;Employee_Name?:string};
type PreviewData={employeeId?:number;byCurrency?:Array<{currency?:string;total?:number}>};
type PreviewResponse={data?:PreviewData}|PreviewData;
type ListResponse={data?:CashClosingResponse[]}|CashClosingResponse[];

export class PosCashClosingApi implements ICashClosingRepository{
  constructor(private readonly httpClient:HttpClient){}

  async listEmployeesByBusiness(businessId:number,token:string):Promise<EmployeeSummary[]>{
    const response=await this.httpClient.request<EmployeeResponse[]>({method:"GET",path:`employee/business/${businessId}`,token});
    return response.map(employee=>({id:employee.Id,fullName:`${employee.Name} ${employee.LastName??""}`.trim()}));
  }

  async listByEmployee(employeeId:number,token:string):Promise<CashClosing[]>{
    this.validateEmployee(employeeId);
    const response=await this.httpClient.request<ListResponse>({method:"GET",path:"finances/branch/cash-closing",token,query:{employeeId,limit:50}});
    const rows=Array.isArray(response)?response:response.data??[];
    return rows.filter(row=>Number(row.Employee_Id??row.Employees_Id??0)===employeeId).map(row=>this.toDomain(row));
  }

  async getCurrentPreviewByEmployee(employeeId:number,token:string):Promise<CashClosingPreview>{
    this.validateEmployee(employeeId);
    const response=await this.httpClient.request<PreviewResponse>({method:"GET",path:"finances/branch/cash-closing/preview",token,query:{employeeId}});
    const data="data" in response?(response.data??{}):response as PreviewData;
    const rows=data.byCurrency??[];
    const active=rows.filter(row=>Number(row.total)!==0);
    if(active.length>1)throw new Error("El corte contiene ventas en más de una moneda y no puede consolidarse en un solo total.");
    const total=Number(active[0]?.total??0);
    if(!Number.isFinite(total))throw new Error("El total del corte no es válido.");
    return {total,currency:active[0]?.currency||readPosCurrency().code};
  }

  async create(payload:CreateCashClosingDto,token:string):Promise<void>{
    this.validateEmployee(payload.employeeId);
    await this.httpClient.request<unknown>({method:"POST",path:"finances/branch/cash-closing",token,body:{Employee_Id:payload.employeeId}});
  }

  private validateEmployee(id:number){
    if(!Number.isSafeInteger(id)||id<1)throw new Error("Selecciona un empleado válido.");
  }

  private toDomain(response:CashClosingResponse):CashClosing{
    return new CashClosing(response.Id,Number(response.Employee_Id??response.Employees_Id??0),Number(response.Total??0),response.Date??"",response.Employee_Name??"");
  }
}
