import { api } from './api';

export type RecordValue=string|number|boolean|null|undefined;
export type ApiRecord=Record<string,RecordValue> & {id?:number|string};
export type FieldMeta={type?:string;required?:boolean;read_only?:boolean;label?:string;help_text?:string;choices?:Array<{value:RecordValue;display_name:string}>};
export type ResourceMeta={actions?:{POST?:Record<string,FieldMeta>;PUT?:Record<string,FieldMeta>;PATCH?:Record<string,FieldMeta>}};

export const resources={
  orders:{endpoint:'/invoices/',label:'Order',plural:'Orders'},
  customers:{endpoint:'/leads/',label:'Customer',plural:'Customers'},
  inventory:{endpoint:'/products/',label:'Product',plural:'Inventory'},
  employees:{endpoint:'/employees/',label:'Employee',plural:'Employees'},
  vendors:{endpoint:'/vendors/',label:'Vendor',plural:'Vendors'},
  projects:{endpoint:'/projects/',label:'Project',plural:'Projects'},
} as const;

export type ResourceKey=keyof typeof resources;

export function recordsFrom<T=ApiRecord>(payload:T[]|{results?:T[]}):T[]{
  return Array.isArray(payload)?payload:payload.results||[];
}

export async function listResource(key:ResourceKey):Promise<ApiRecord[]>{
  const payload=await api<ApiRecord[]|{results?:ApiRecord[]}>(resources[key].endpoint);
  return recordsFrom(payload);
}

export async function resourceFields(key:ResourceKey):Promise<Record<string,FieldMeta>>{
  const meta=await api<ResourceMeta>(resources[key].endpoint,{method:'OPTIONS'});
  return meta.actions?.POST||{};
}

export function recordTitle(record:ApiRecord):string{
  return String(record.name||record.full_name||record.title||record.invoice_number||record.email||`#${record.id||''}`);
}

export function displayValue(value:RecordValue):string{
  if(value===null||value===undefined||value==='') return '—';
  if(typeof value==='boolean') return value?'Yes':'No';
  return String(value).replace('T',' ').replace(/\.000Z$/,'');
}

export function editablePayload(values:Record<string,RecordValue>,fields:Record<string,FieldMeta>):Record<string,RecordValue>{
  return Object.fromEntries(Object.entries(values).filter(([key])=>fields[key]&&!fields[key].read_only));
}
