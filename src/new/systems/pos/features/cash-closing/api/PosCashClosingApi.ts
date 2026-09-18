import { HttpClient } from "../../../../core/api/HttpClient";
import { EmployeeSummary, ICashClosingRepository } from "../interface/ICashClosingRepository";
import { CashClosing, CreateCashClosingDto } from "../model/CashClosing";

type EmployeeResponse={Id:number;Name:string;LastName?:string};
type CashClosingResponse={Id:number;Employee_Id?:number;Employees_Id?:number;Branch_Id?:number;Total?:number;Date?:string;Employee_Name?:string};
type PreviewResponse={data?:{employeeId?:number;byCurrency?:Array<{MoneyTipe?:string;total?:number}>}}|{employeeId?:number;byCurrency?:Array<{MoneyTipe?:string;total?:number}>};
type ListResponse={data?:CashClosingResponse[]}|CashClosingResponse[];
const currentEmployeeId=()=>Number(window.localStorage.getItem("pos-v2-employee-id")??0);

export class PosCashClosingApi implements ICashClosingRepository{
  constructor(private readonly httpClient:HttpClient){}

  async listEmployeesByBusiness(businessId:number,token:string):Promise<EmployeeSummary[]>{
    const response=await this.httpClient.request<EmployeeResponse[]>({method:"GET",path:`employee/business/${businessId}`,token});
    const mine=currentEmployeeId();
    return response.filter(employee=>!mine||employee.Id===mine).map(employee=>({id:employee.Id,fullName:`${employee.Name} ${employee.LastName??""}`.trim()}));
  }

  async listByEmployee(employeeId:number,token:string):Promise<CashClosing[]>{
    const response=await this.httpClient.request<ListResponse>({method:"GET",path:"finances/branch/cash-closing",token,query:{limit:50}});
    const rows=Array.isArray(response)?response:response.data??[];
    return rows.filter(row=>Number(row.Employee_Id??row.Employees_Id??0)===employeeId).map(row=>this.toDomain(row));
  }

  async getCurrentTotalByEmployee(employeeId:number,token:string):Promise<number>{
    if(currentEmployeeId()&&employeeId!==currentEmployeeId())return 0;
    const response=await this.httpClient.request<PreviewResponse>({method:"GET",path:"finances/branch/cash-closing/preview",token});
    const data="data" in response?(response.data??{}):response;
    const rows=data.byCurrency??[];
    const mxn=rows.find(row=>String(row.MoneyTipe??"").toUpperCase()==="MXN")??rows[0];
    return Number(mxn?.total??0);
  }

  async create(payload:CreateCashClosingDto,token:string):Promise<void>{
    if(currentEmployeeId()&&payload.employeeId!==currentEmployeeId())throw new Error("El corte sólo puede registrarse para el empleado autenticado.");
    await this.httpClient.request<unknown>({method:"POST",path:"finances/branch/cash-closing",token});
  }

  private toDomain(response:CashClosingResponse):CashClosing{
    return new CashClosing(response.Id,Number(response.Employee_Id??response.Employees_Id??0),Number(response.Total??0),response.Date??"",response.Employee_Name??"");
  }
}
