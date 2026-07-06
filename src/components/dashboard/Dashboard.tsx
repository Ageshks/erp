import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Boxes, BriefcaseBusiness, ChevronDown, CircleDollarSign, LayoutDashboard, LoaderCircle, Menu, Package, Search, Settings, ShoppingCart, TrendingUp, Users, Warehouse, X } from 'lucide-react';
import './Dashboard.css';
import BusinessPage from './BusinessPages';
import { displayValue, listResource, recordTitle, type ApiRecord, type ResourceKey } from '../../lib/resources';

const navItems=[
  {label:'Overview',icon:LayoutDashboard,path:'/dashboard'},
  {label:'Orders',icon:ShoppingCart,path:'/orders'},
  {label:'Customers',icon:Users,path:'/customers'},
  {label:'Inventory',icon:Package,path:'/inventory'},
  {label:'Reports',icon:TrendingUp,path:'/analytics'},
  {label:'Employees',icon:Users,path:'/employees'},
  {label:'Vendors',icon:Warehouse,path:'/vendors'},
  {label:'Projects',icon:BriefcaseBusiness,path:'/projects'},
];

function valueOf(row:ApiRecord){return Number(row.total||row.amount||row.value||row.price||0)}
function LiveOverview({query}:{query:string}){
  const [data,setData]=useState<Record<string,ApiRecord[]>>({});const [loading,setLoading]=useState(true);const [error,setError]=useState('');const navigate=useNavigate();
  useEffect(()=>{Promise.all((['orders','customers','inventory','employees','vendors','projects'] as ResourceKey[]).map(async key=>[key,await listResource(key)] as const)).then(entries=>setData(Object.fromEntries(entries))).catch(err=>setError(err instanceof Error?err.message:'Unable to load dashboard')).finally(()=>setLoading(false))},[]);
  const orders=data.orders||[];const products=data.inventory||[];const total=orders.reduce((sum,row)=>sum+valueOf(row),0);
  const lowStock=products.filter(row=>Number(row.stock??row.quantity??row.stock_quantity??0)<=Number(row.reorder_level??row.minimum_stock??0)).length;
  const recent=useMemo(()=>orders.filter(row=>JSON.stringify(row).toLowerCase().includes(query.toLowerCase())).slice(0,7),[orders,query]);
  if(loading)return <div className="loading-state page-loading"><LoaderCircle className="spin"/>Loading your live dashboard…</div>;
  return <>{error&&<p className="page-error" role="alert">{error}</p>}<section className="page-heading"><div><p className="eyebrow">Live workspace</p><h1>Business overview</h1><p>Current data from your ERP database.</p></div><button className="primary-button" onClick={()=>navigate('/orders')}>Manage orders</button></section>
    <section className="metric-grid"><article className="metric-card"><span className="metric-icon purple"><CircleDollarSign/></span><div className="metric-top"><span>Recorded sales</span></div><strong>{total.toLocaleString()}</strong><p>Across {orders.length} invoices</p></article><article className="metric-card"><span className="metric-icon orange"><ShoppingCart/></span><div className="metric-top"><span>Total orders</span></div><strong>{orders.length}</strong><p>Live sales records</p></article><article className="metric-card"><span className="metric-icon green"><Users/></span><div className="metric-top"><span>Customers</span></div><strong>{data.customers?.length||0}</strong><p>Lead and customer records</p></article><article className="metric-card"><span className="metric-icon blue"><Package/></span><div className="metric-top"><span>Low stock</span></div><strong>{lowStock}</strong><p>of {products.length} products</p></article></section>
    <section className="analytics-grid"><article className="panel module-summary"><div className="panel-heading"><div><h2>Workspace modules</h2><p>Live record totals</p></div></div><div className="module-counts">{[['Products',products.length,'/inventory'],['Employees',data.employees?.length||0,'/employees'],['Vendors',data.vendors?.length||0,'/vendors'],['Projects',data.projects?.length||0,'/projects']].map(([label,count,path])=><button key={label} onClick={()=>navigate(String(path))}><span>{label}</span><strong>{count}</strong></button>)}</div></article><article className="panel stock-panel"><div className="panel-heading"><div><h2>Inventory health</h2><p>Database stock records</p></div></div><div className="donut" style={{'--value':`${products.length?Math.max(0,100-lowStock/products.length*100):0}%`} as React.CSSProperties}><div><strong>{products.length}</strong><span>Products</span></div></div><button className="secondary-button" onClick={()=>navigate('/inventory')}>Manage inventory</button></article></section>
    <section className="panel orders-panel"><div className="panel-heading"><div><h2>Recent orders</h2><p>Latest invoice records</p></div></div>{!recent.length?<div className="empty-state">No order records found.</div>:<div className="table-scroll"><table><thead><tr><th>Order</th><th>Status</th><th>Amount</th><th>Date</th></tr></thead><tbody>{recent.map((row,index)=><tr key={String(row.id??index)}><td><strong>{recordTitle(row)}</strong></td><td>{displayValue(row.status)}</td><td>{displayValue(row.total||row.amount||row.value)}</td><td>{displayValue(row.created_at||row.date||row.issue_date)}</td></tr>)}</tbody></table></div>}</section></>;
}

export default function Dashboard(){
  const location=useLocation();const navigate=useNavigate();const [sidebarOpen,setSidebarOpen]=useState(false);const [query,setQuery]=useState('');const [notice,setNotice]=useState(false);
  const view=location.pathname.slice(1) as ResourceKey|'analytics'|'settings';
  const signOut=()=>{localStorage.removeItem('northstar-token');localStorage.removeItem('northstar-refresh-token');sessionStorage.removeItem('northstar-demo-user');navigate('/login')};
  return <div className="dashboard-shell"><aside className={`sidebar ${sidebarOpen?'open':''}`}><div className="brand"><span className="brand-mark"><Boxes size={22}/></span><span>Northstar</span></div><button className="close-sidebar" onClick={()=>setSidebarOpen(false)} aria-label="Close menu"><X/></button><nav className="main-nav" aria-label="Main navigation"><p className="nav-label">Workspace</p>{navItems.map(({label,icon:Icon,path})=><button key={label} className={`nav-item ${location.pathname===path?'active':''}`} onClick={()=>{navigate(path);setSidebarOpen(false)}}><Icon size={19}/><span>{label}</span></button>)}</nav><div className="sidebar-bottom"><button className={`nav-item ${location.pathname==='/settings'?'active':''}`} onClick={()=>navigate('/settings')}><Settings size={19}/><span>Team settings</span></button><button className="user-card" onClick={signOut} title="Sign out"><span className="avatar dark">U</span><span><strong>ERP User</strong><small>Signed in · Sign out</small></span><ChevronDown size={17}/></button></div></aside>{sidebarOpen&&<button className="sidebar-scrim" onClick={()=>setSidebarOpen(false)} aria-label="Close menu"/>}<main className="dashboard-main"><header className="topbar"><button className="menu-button" onClick={()=>setSidebarOpen(true)} aria-label="Open menu"><Menu/></button><div className="search"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search current records..."/></div><div className="top-actions"><button className="icon-button" onClick={()=>setNotice(!notice)} aria-label="Notifications"><Bell size={20}/></button><span className="top-avatar">U</span></div>{notice&&<div className="notification-popover"><strong>Workspace connected</strong><span>Your data is loaded from Railway.</span></div>}</header><div className="content">{location.pathname==='/dashboard'?<LiveOverview query={query}/>:<BusinessPage view={view}/>}</div></main></div>;
}
