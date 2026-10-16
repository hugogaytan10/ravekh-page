// Fixture local: no envía solicitudes ni guarda cambios en cuentas reales.
import React from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter, Routes } from "react-router-dom";
import { POS_V2_APP_ROUTES } from "../../../../src/new/systems/pos/routing/PosV2AppRoutes";
import "../../../../src/index.css";

const params = new URLSearchParams(location.search);
const plan = params.get("plan") || "MAX";
const role = params.get("role") || "ADMINISTRADOR";
const values = new Map<string, string>();
const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, String(value)), removeItem: (key: string) => values.delete(key), clear: () => values.clear(), key: (index: number) => [...values.keys()][index], get length() { return values.size; } };
Object.defineProperty(window, "localStorage", { value: storage, configurable: true });
if(params.get("screen")!=="/login-punto-venta")storage.setItem("pos-v2-token", `fixture.${btoa(JSON.stringify({ id: 1, role }))}.fixture`);
storage.setItem("pos-v2-business-id", "1"); storage.setItem("pos-v2-employee-id", "1"); storage.setItem("plan", plan); storage.setItem("pos-v2-ui-theme", params.get("theme") || "light");
const business = { Id: 1, Name: "Tienda de prueba", Plan: plan, MoneyTipe: "MXN", PhoneNumber: "555 000 0000", Address: "Dirección de ejemplo", Features: { Pos: 1, Catalog: 1, Fidelity: 2 } };
const insight = { id: "low-stock", recordId: 10, category: "INVENTORY", severity: "WARNING", status: "ACTIVE", title: "Quedan pocas unidades de café", description: "La existencia actual alcanza para dos días de ventas.", recommendation: "Revisa tu inventario y prepara el siguiente pedido.", metrics: [{ label: "Unidades disponibles", value: 8, unit: "units" }], readAt: null };
let archived = false;

const visualState = params.get("state") || "content";
const image = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="240" height="180"><rect width="240" height="180" fill="#ECDCFB"/><rect x="74" y="45" width="92" height="90" rx="12" fill="#9018FF"/><text x="120" y="99" text-anchor="middle" fill="white" font-size="16">RAVEKH</text></svg>');
const products = [
  { Id:101, Business_Id:1, Name:"Café de especialidad", Description:"Tueste medio, bolsa de 250 g", Category_Id:1, Category_Name:"Cafetería", Price:150, Cost:80, Stock:12, Available:1, ForSale:1, ShowInStore:1, Images:[image], Image:image, MinStock:3, OptStock:20, Barcode:"7501234567890" },
  { Id:102, Business_Id:1, Name:"Playera de algodón con variantes", Description:"Tallas y colores disponibles", Category_Id:2, Category_Name:"Ropa", Price:250, Cost:130, Stock:7, Available:1, ForSale:1, ShowInStore:1, Images:[image], Image:image, Variants:[{Id:201,Product_Id:102,Description:"Mediana / Azul",Price:250,Stock:7,Size:"M",Color:"Azul"}] },
];
const customers=[{Id:11,Business_Id:1,Name:"María Hernández López",PhoneNumber:"5551234567",Email:"cliente@example.test",Address:"Dirección de prueba",Reference:"Frente al parque",Notes:"Cliente frecuente",CanPayLater:1,Sex:"Femenino"}];
const employees=[{Id:1,Name:"Administración de prueba",Email:"admin@example.test",Role:"ADMINISTRADOR",Active:1},{Id:2,Name:"Vendedor de prueba",Email:"vendedor@example.test",Role:"AYUDANTE",Active:1}];
const branches=[{Id:1,Business_Id:1,Name:"Principal",Code:"MATRIZ",Slug:"",Address:"Av. Principal 123",Is_Main:1,Active:1,Catalog_Enabled:1},{Id:2,Business_Id:1,Name:"Sucursal Centro",Code:"CENTRO",Slug:"centro",Address:"Calle Centro 25",Is_Main:0,Active:1,Catalog_Enabled:1}];
const coupons=[{Id:31,Business_Id:1,QR:"QR-DEMO",Description:"10% en tu siguiente compra",LimitUsers:30,TotalUsers:6,Valid:"2026-12-31T23:59:00"}];
const visits=[{Id:1,Business_Id:1,User_Id:11,UserName:"María Hernández",Date:"2026-10-16T09:00:00",VisitCount:7,TotalVisits:7,MinVisits:10}];
const account={Order_Id:71,Customer_Id:11,Customer_Name:"María Hernández",Date:"2026-10-16T09:00:00",Status:"PENDIENTE",MoneyTipe:"MXN",Total:250,Paid:100,Balance:150,Payments:[{Id:1,Order_Id:71,Customer_Id:11,Payment:100,Date:"2026-10-16T09:00:00"}]};
const income=[{Id:1,Branch_Id:1,Name:"Venta #71",Amount:150,Date:"2026-10-16T09:00:00",MoneyTipe:"MXN",Source:"ORDER",Order_Id:71},{Id:2,Branch_Id:1,Name:"Ingreso adicional",Amount:200,Date:"2026-10-16T10:00:00",MoneyTipe:"MXN",Source:"MANUAL"}];
const expenses=[{Id:3,Branch_Id:1,Name:"Compra de insumos",Amount:80,Date:"2026-10-16T10:30:00",MoneyTipe:"MXN",Source:"MANUAL"}];
const tax={Id:1,Description:"IVA",Value:16,IsPercent:1,CanBeRemovedAtSale:1};
const shipping={ContactInformation:1,ShippingMetod:1,Street:1,ZipCode:1,City:1,State:1,References:1,PaymentMetod:1};
const list = <T,>(items:T[]) => visualState === "empty" ? [] : items;
window.fetch = async (input, options) => {
  const url=new URL(String(input),location.href), p=url.pathname.replace(/^\/api\//,""), method=options?.method||"GET";
  const branchId=Number(new Headers(options?.headers).get("X-Branch-Id") || url.searchParams.get("branchId") || "1");
  const isSetup=p.startsWith("business/")||p==="branches";
  if(!isSetup && visualState==="loading")return new Promise<Response>(()=>{});
  if(!isSetup && visualState==="error")return new Response(JSON.stringify({message:"No fue posible cargar los datos. Intenta nuevamente."}),{status:503,headers:{"Content-Type":"application/json"}});
  let body:unknown=[];
  if(p.startsWith("business/"))body={...business,Taxes:tax};
  else if(p==="branches")body=branches;
  else if(p==="table_zones/business/1")body=list([{Id:1,Name:"Salón principal",Business_Id:1}]);
  else if(p==="socialnetworks/business/1")body=[];
  else if(p==="configStripe")body={Enabled:0,PublishableKey:"",AccountId:null};
  else if(p==="questions")body=[{Id:1,Question:"¿Cuál es tu color favorito?"}];
  else if(p==="questions/user/1")body=[];
  else if(p.startsWith("report/products/"))body=products;
  else if(/^branches\/\d+\/employees$/.test(p))body=[];
  else if(/^branches\/\d+$/.test(p))body=branches.find(row=>row.Id===Number(p.split("/")[1]))||branches[0];
  else if(p==="monedas"){business.MoneyTipe=["","MXN","USD","BNY","EUR"][JSON.parse(String(options?.body)).Coin_Id];body={affectedRows:1};}
  else if(p==="intelligence"||p==="intelligence/history")body={generatedAt:"2026-10-16T09:00:00",plan,capabilities:{tier:plan,history:plan!=="GRATUITO"},lockedFeatures:[],summary:{total:archived?0:1,attention:archived?0:1,positive:0,unread:insight.readAt?0:1},items:list(archived&&p==="intelligence"?[]:[insight])};
  else if(p==="intelligence/10/read"){insight.readAt=new Date().toISOString() as any;body=insight;}
  else if(p==="intelligence/10/dismiss"){archived=true;insight.status="DISMISSED";return new Response(null,{status:204});}
  else if(p==="intelligence/10")body=insight;
  else if(p==="employee/business/1")body=list(employees);
  else if(/^employee\/\d+$/.test(p))body=method==="PUT"?{affectedRows:1}:employees.find(row=>row.Id===Number(p.split("/")[1]));
  else if(p==="customers/business/1")body=list(customers);
  else if(/^customers\/\d+$/.test(p))body=customers[0];
  else if(p.startsWith("pending-payments/business"))body=list([account]);
  else if(p.startsWith("pending-payments/order"))body=account;
  else if(p.startsWith("products/business/noavailable"))body={products:list([{...products[0],Available:0}]),pagination:{page:1,pageSize:20,total:1,totalPages:1}};
  else if(p.startsWith("products/business")||p.startsWith("products/really"))body={data:list(products),products:list(products),pagination:{page:1,pageSize:20,total:products.length,totalPages:1,categoryIds:[1,2]}};
  else if(/^products\/\d+$/.test(p))body=products.find(row=>row.Id===Number(p.split("/")[1]))||products[0];
  else if(p.startsWith("categories/business"))body=[{Id:1,Business_Id:1,Name:"Cafetería",Color:"#9018FF"},{Id:2,Business_Id:1,Name:"Ropa",Color:"#3A59F7"}];
  else if(p.startsWith("extras/product"))body=[];
  else if(p.startsWith("variants/product"))body=p.endsWith("/102")?products[1].Variants:[];
  else if(/catalog.*quota|quota.*catalog/i.test(p))body={maxFiles:50,remaining:50,used:0,limit:50};
  else if(p==="restaurant/branch/zones")body={data:[{Id:1,Name:"Salón",Active:1,Tables:2}]};
  else if(p.startsWith("tables/zone"))body=[{Id:1,Name:"Mesa 1",Seats:4,Zone_Id:1,Active:1,Occupied:0},{Id:2,Name:"Mesa 2",Seats:2,Zone_Id:1,Active:1,Occupied:1}];
  else if(p.includes("restaurant/branch/tables"))body={data:[]};
  else if(p==="finances/branch/cash-closing/preview")body={data:{byCurrency:[{currency:"MXN",total:350}]}};
  else if(p==="finances/branch/cash-closing")body={data:list([{Id:4,Employee_Id:Number(url.searchParams.get("employeeId")),Total:100,Date:"2026-10-16T09:00:00",Employee_Name:"Vendedor de prueba"}])};
  else if(p==="finances/branch/summary")body={data:{currencies:[{MoneyTipe:"MXN",income:350,expenses:80,net:270}]}};
  else if(p==="finances/branch/income")body={data:list(income.map(row=>({...row,Id:row.Id+(branchId-1)*1000,Branch_Id:branchId,Order_Id:row.Order_Id?row.Order_Id+(branchId-1)*1000:undefined})))};
  else if(p==="finances/branch/expenses")body={data:list(expenses.map(row=>({...row,Id:row.Id+(branchId-1)*1000,Branch_Id:branchId})))};
  else if(p==="reports/branch/overview")body={data:{byCurrency:[{MoneyTipe:"MXN",sales:350,transactions:2,items:3,cost:160,estimatedGrossProfit:190,averageTicket:175}]}};
  else if(p==="reports/branch/timeline")body={data:list([{day:"2026-10-14",MoneyTipe:"MXN",total:120},{day:"2026-10-15",MoneyTipe:"MXN",total:250},{day:"2026-10-16",MoneyTipe:"MXN",total:350}])};
  else if(p==="reports/branch/payment-methods")body={data:[{MoneyTipe:"MXN",paymentMethod:"EFECTIVO",transactions:2,total:350}]};
  else if(p==="reports/branch/top-items")body={data:list([{itemId:101,productName:"Café de especialidad",quantity:4,revenue:600,estimatedProfit:280}])};
  else if(p==="reports/branch/employees")body={data:list([{employeeId:2,name:"Vendedor de prueba",transactions:2,total:350}])};
  else if(p.startsWith("report2/"))body=[];
  else if(p==="ordersCatalog/1")body=list([{Id:71+(branchId-1)*1000,Branch_Id:branchId,Business_Id:1,Status:"PEDIDO",Name:"María Hernández",Total:150,Address:"Dirección de prueba",PaymentMethod:"EFECTIVO",PhoneNumber:"5551234567",Delivery:1}]);
  else if(p.startsWith("products/ordercatalog")||p.startsWith("products/order/"))body=[{Item_Id:101,Item_Name:"Café de especialidad",Item_Price:150,Item_Quantity:1,Item_PriceTaxes:150,Item_Image:image,Item_Type:"Product",Employee_Name:"Vendedor",Customer_Name:"María"}];
  else if(p==="coupons/business/1")body=list(coupons);
  else if(p==="coupons/31")body=coupons[0];
  else if(p==="visits/business/1")body=list(visits);
  else if(p==="visits/qr/dynamic/next")body={token:"fixture-only",qrUrl:"https://example.test/visita",refreshAfterSeconds:40};
  else if(p==="visits/qr/generate")body={tokens:[{token:"fixture-only",qrUrl:"https://example.test/visita"}]};
  else if(p.startsWith("shippingoptions/business"))body=shipping;
  else if(p.startsWith("taxes/")||p.startsWith("tax/"))body=tax;
  else if(p.startsWith("security-questions"))body=p==="security-questions"?[{Id:1,Question:"¿Cuál es tu color favorito?"}]:{hasQuestions:true,questions:[]};
  else if(p.includes("stripe/config"))body={enabled:true,publishableKey:"",accountId:null};
  else console.info("[visual-fixture] unmatched "+p);
  return new Response(JSON.stringify(body),{status:200,headers:{"Content-Type":"application/json"}});
};

createRoot(document.getElementById("root")!).render(<MemoryRouter initialEntries={[params.get("screen") || "/more"]}>
  <Routes>{POS_V2_APP_ROUTES}</Routes>
</MemoryRouter>);
