import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { Download, LoaderCircle, Pencil, Plus, RefreshCw, Search, Trash2, X } from 'lucide-react';
import { api } from '../../lib/api';
import { displayValue, editablePayload, listResource, recordTitle, resourceFields, resources, type ApiRecord, type FieldMeta, type RecordValue, type ResourceKey } from '../../lib/resources';

type View=ResourceKey|'analytics'|'settings';

function errorMessage(error:unknown){return error instanceof Error?error.message:'Something went wrong.'}
function usefulColumns(rows:ApiRecord[],fields:Record<string,FieldMeta>){
  const keys=Object.keys(fields).length?Object.keys(fields):Object.keys(rows[0]||{});
  return keys.filter(key=>key!=='id'&&!fields[key]?.read_only).slice(0,7);
}

function RecordModal({resource,fields,record,onClose,onSaved}:{resource:ResourceKey;fields:Record<string,FieldMeta>;record:ApiRecord|null;onClose:()=>void;onSaved:()=>void}){
  const [values,setValues]=useState<Record<string,RecordValue>>(()=>Object.fromEntries(Object.keys(fields).map(key=>[key,record?.[key]??''])));
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState('');
  const visible=Object.entries(fields).filter(([,field])=>!field.read_only);
  const submit=async(e:FormEvent)=>{
    e.preventDefault();setSaving(true);setError('');
    try{
      const endpoint=record?.id?`${resources[resource].endpoint}${record.id}/`:resources[resource].endpoint;
      await api(endpoint,{method:record?.id?'PATCH':'POST',body:JSON.stringify(editablePayload(values,fields))});
      onSaved();
    }catch(err){setError(errorMessage(err));}finally{setSaving(false)}
  };
  return <div className="crud-overlay" role="presentation" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><form className="crud-modal" onSubmit={submit}>
    <div className="crud-modal-head"><div><h2>{record?'Edit':'Create'} {resources[resource].label}</h2><p>Fields are provided by the live database API.</p></div><button type="button" onClick={onClose}><X/></button></div>
    <div className="crud-form-grid">{visible.map(([name,field])=><label key={name} className={field.type==='string'&&name.includes('description')?'wide':''}><span>{field.label||name.replaceAll('_',' ')}</span>{field.choices?.length?<select required={field.required} value={String(values[name]??'')} onChange={e=>setValues({...values,[name]:e.target.value})}><option value="">Select…</option>{field.choices.map(choice=><option key={String(choice.value)} value={String(choice.value)}>{choice.display_name}</option>)}</select>:field.type==='boolean'?<input type="checkbox" checked={Boolean(values[name])} onChange={e=>setValues({...values,[name]:e.target.checked})}/>:<input type={field.type==='integer'||field.type==='float'||field.type==='decimal'?'number':name.includes('email')?'email':name.includes('date')||name.includes('deadline')?'date':'text'} step={field.type==='decimal'||field.type==='float'?'any':undefined} required={field.required} value={String(values[name]??'')} onChange={e=>setValues({...values,[name]:e.target.value})} placeholder={field.help_text}/>}</label>)}</div>
    {error&&<p className="crud-error" role="alert">{error}</p>}
    <div className="crud-actions"><button type="button" onClick={onClose}>Cancel</button><button className="primary-button" disabled={saving}>{saving?<LoaderCircle className="spin" size={17}/>:null}{record?'Save changes':`Create ${resources[resource].label.toLowerCase()}`}</button></div>
  </form></div>;
}

function ResourcePage({resource}:{resource:ResourceKey}){
  const config=resources[resource];
  const [rows,setRows]=useState<ApiRecord[]>([]);const [fields,setFields]=useState<Record<string,FieldMeta>>({});
  const [loading,setLoading]=useState(true);const [error,setError]=useState('');const [query,setQuery]=useState('');const [editing,setEditing]=useState<ApiRecord|null|undefined>(undefined);
  const load=useCallback(async()=>{setLoading(true);setError('');try{const [data,meta]=await Promise.all([listResource(resource),resourceFields(resource)]);setRows(data);setFields(meta)}catch(err){setError(errorMessage(err))}finally{setLoading(false)}},[resource]);
  useEffect(()=>{void load()},[load]);
  const filtered=useMemo(()=>rows.filter(row=>JSON.stringify(row).toLowerCase().includes(query.toLowerCase())),[rows,query]);
  const columns=useMemo(()=>usefulColumns(rows,fields),[rows,fields]);
  const remove=async(row:ApiRecord)=>{if(!row.id||!window.confirm(`Delete ${recordTitle(row)}?`))return;try{await api(`${config.endpoint}${row.id}/`,{method:'DELETE'});void load()}catch(err){setError(errorMessage(err))}};
  const exportCsv=()=>{const csv=[columns.join(','),...filtered.map(row=>columns.map(key=>JSON.stringify(row[key]??'')).join(','))].join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download=`${resource}.csv`;a.click();URL.revokeObjectURL(a.href)};
  return <div className="business-page"><div className="workspace-heading"><div><p className="breadcrumb">Northstar / {config.plural}</p><h1>{config.plural}</h1><p>Live records from your ERP database.</p></div><button className="primary-button" onClick={()=>setEditing(null)} disabled={!Object.keys(fields).length}><Plus size={17}/> Add {config.label.toLowerCase()}</button></div>
    <section className="mini-metrics three"><div><span>Total records</span><strong>{rows.length}</strong><small>Live database count</small></div><div><span>Visible results</span><strong>{filtered.length}</strong><small>After search filters</small></div><div><span>Resource status</span><strong>{error?'Issue':'Connected'}</strong><small>{error?'Check the message below':'Synced with Railway'}</small></div></section>
    <section className="panel data-panel"><div className="data-toolbar"><div className="inline-search"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={`Search ${config.plural.toLowerCase()}...`}/></div><button onClick={()=>void load()}><RefreshCw size={15}/> Refresh</button><button className="export" onClick={exportCsv} disabled={!filtered.length}><Download size={15}/> Export</button></div>
      {error&&<p className="page-error" role="alert">{error}</p>}{loading?<div className="loading-state"><LoaderCircle className="spin"/>Loading {config.plural.toLowerCase()}…</div>:!filtered.length?<div className="empty-state">No {config.plural.toLowerCase()} found. Create the first one.</div>:<div className="table-scroll"><table><thead><tr><th>{config.label}</th>{columns.slice(1).map(key=><th key={key}>{fields[key]?.label||key.replaceAll('_',' ')}</th>)}<th>Actions</th></tr></thead><tbody>{filtered.map((row,index)=><tr key={String(row.id??index)}><td><strong>{recordTitle(row)}</strong></td>{columns.slice(1).map(key=><td key={key}>{displayValue(row[key])}</td>)}<td><div className="row-actions"><button title="Edit" onClick={()=>setEditing(row)}><Pencil size={15}/></button><button title="Delete" onClick={()=>void remove(row)}><Trash2 size={15}/></button></div></td></tr>)}</tbody></table></div>}
    </section>{editing!==undefined&&<RecordModal resource={resource} fields={fields} record={editing} onClose={()=>setEditing(undefined)} onSaved={()=>{setEditing(undefined);void load()}}/>}</div>;
}

function ReportsPage(){
  const [data,setData]=useState<Partial<Record<ResourceKey,ApiRecord[]>>>({});const [loading,setLoading]=useState(true);const [error,setError]=useState('');
  useEffect(()=>{Promise.all((Object.keys(resources) as ResourceKey[]).map(async key=>[key,await listResource(key)] as const)).then(entries=>setData(Object.fromEntries(entries))).catch(err=>setError(errorMessage(err))).finally(()=>setLoading(false))},[]);
  const money=(rows:ApiRecord[]|undefined)=>rows?.reduce((sum,row)=>sum+Number(row.total||row.amount||row.price||row.value||0),0)||0;
  if(loading)return <div className="loading-state page-loading"><LoaderCircle className="spin"/>Building live reports…</div>;
  return <div className="business-page"><div className="workspace-heading"><div><p className="breadcrumb">Northstar / Reports</p><h1>Reports</h1><p>Live operational summary across all database modules.</p></div></div>{error&&<p className="page-error">{error}</p>}<div className="mini-metrics"><div><span>Sales records</span><strong>{data.orders?.length||0}</strong><small>Invoices and orders</small></div><div><span>Recorded value</span><strong>{money(data.orders).toLocaleString()}</strong><small>Based on invoice totals</small></div><div><span>Products</span><strong>{data.inventory?.length||0}</strong><small>Inventory catalogue</small></div><div><span>Active projects</span><strong>{data.projects?.length||0}</strong><small>Project records</small></div></div><div className="report-grid">{(Object.keys(resources) as ResourceKey[]).map(key=><section className="panel report-summary" key={key}><h2>{resources[key].plural}</h2><strong>{data[key]?.length||0}</strong><p>records in the database</p></section>)}</div></div>;
}

export default function BusinessPage({view}:{view:View}){return view==='analytics'?<ReportsPage/>:view==='settings'?<ResourcePage resource="employees"/>:<ResourcePage resource={view}/>}
