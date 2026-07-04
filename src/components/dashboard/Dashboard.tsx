import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Bell, Boxes, ChevronDown, CircleDollarSign, LayoutDashboard, Menu,
  Package, Plus, Search, Settings, ShoppingCart, TrendingUp, Users, X,
  ArrowUpRight, ArrowDownRight, MoreHorizontal, CalendarDays
} from 'lucide-react';
import './Dashboard.css';
import BusinessPage from './BusinessPages';

const navItems = [
  { label: 'Overview', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Orders', icon: ShoppingCart, count: 8, path: '/orders' },
  { label: 'Customers', icon: Users, path: '/customers' },
  { label: 'Inventory', icon: Package, path: '/inventory' },
  { label: 'Analytics', icon: TrendingUp, path: '/analytics' },
];

const orders = [
  { id: '#ORD-1048', customer: 'Olivia Martin', initials: 'OM', product: 'Workspace Pro', date: 'Jul 4, 2026', amount: '$1,280.00', status: 'Completed', color: 'lilac' },
  { id: '#ORD-1047', customer: 'Jackson Lee', initials: 'JL', product: 'Ergo Chair', date: 'Jul 4, 2026', amount: '$860.00', status: 'Processing', color: 'blue' },
  { id: '#ORD-1046', customer: 'Sophia Brown', initials: 'SB', product: 'Studio Lamp', date: 'Jul 3, 2026', amount: '$320.00', status: 'Completed', color: 'peach' },
  { id: '#ORD-1045', customer: 'Noah Williams', initials: 'NW', product: 'Desk Organizer', date: 'Jul 3, 2026', amount: '$145.00', status: 'Pending', color: 'green' },
  { id: '#ORD-1044', customer: 'Emma Davis', initials: 'ED', product: 'Monitor Stand', date: 'Jul 2, 2026', amount: '$490.00', status: 'Completed', color: 'pink' },
];

const chartData: Record<string, number[]> = {
  '7 days': [28, 35, 32, 48, 41, 58, 64],
  '30 days': [18, 30, 25, 42, 36, 50, 45, 63, 57, 70, 68, 82],
  '12 months': [32, 38, 35, 47, 43, 58, 52, 67, 62, 75, 71, 88],
};

function makePoints(values: number[]) {
  const max = 100;
  return values.map((value, index) => `${(index / (values.length - 1)) * 620},${190 - (value / max) * 170}`).join(' ');
}

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [period, setPeriod] = useState('30 days');
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState(false);
  const filteredOrders = useMemo(() => orders.filter(order =>
    Object.values(order).some(value => value.toLowerCase().includes(query.toLowerCase()))
  ), [query]);
  const points = makePoints(chartData[period]);

  return (
    <div className="dashboard-shell">
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="brand"><span className="brand-mark"><Boxes size={22} /></span><span>Northstar</span></div>
        <button className="close-sidebar" onClick={() => setSidebarOpen(false)} aria-label="Close menu"><X /></button>
        <nav className="main-nav" aria-label="Main navigation">
          <p className="nav-label">Workspace</p>
          {navItems.map(({ label, icon: Icon, count, path }) => (
            <button key={label} className={`nav-item ${location.pathname === path || (path === '/dashboard' && location.pathname === '/') ? 'active' : ''}`} onClick={() => { navigate(path); setSidebarOpen(false); }}>
              <Icon size={19} /><span>{label}</span>{count && <b>{count}</b>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button className={`nav-item ${location.pathname === '/settings' ? 'active' : ''}`} onClick={() => { navigate('/settings'); setSidebarOpen(false); }}><Settings size={19} /><span>Settings</span></button>
          <div className="help-card"><span>Need some help?</span><p>Our support team is ready.</p><button>Get support</button></div>
          <button className="user-card" onClick={() => { sessionStorage.removeItem('northstar-demo-user'); navigate('/login'); }} title="Sign out"><span className="avatar dark">AR</span><span><strong>Alex Rivera</strong><small>Administrator · Sign out</small></span><ChevronDown size={17} /></button>
        </div>
      </aside>
      {sidebarOpen && <button className="sidebar-scrim" onClick={() => setSidebarOpen(false)} aria-label="Close menu" />}

      <main className="dashboard-main">
        <header className="topbar">
          <button className="menu-button" onClick={() => setSidebarOpen(true)} aria-label="Open menu"><Menu /></button>
          <div className="search"><Search size={18} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search orders, customers..." /><kbd>⌘ K</kbd></div>
          <div className="top-actions">
            <button className="icon-button" onClick={() => setNotice(!notice)} aria-label="Notifications"><Bell size={20} /><i /></button>
            <span className="top-avatar">AR</span>
          </div>
          {notice && <div className="notification-popover"><strong>You're all caught up</strong><span>No new notifications right now.</span></div>}
        </header>

        <div className="content">
          {!['/', '/dashboard'].includes(location.pathname) ? <BusinessPage view={location.pathname.slice(1) as 'orders' | 'customers' | 'inventory' | 'analytics' | 'settings'} /> : <>
          <section className="page-heading">
            <div><p className="eyebrow">Saturday, July 4</p><h1>Good morning, Alex.</h1><p>Here’s what’s happening with your business today.</p></div>
            <button className="primary-button" onClick={() => alert('New order form is ready to connect.')}><Plus size={18} /> New order</button>
          </section>

          <section className="metric-grid">
            <article className="metric-card"><span className="metric-icon purple"><CircleDollarSign /></span><div className="metric-top"><span>Total revenue</span><MoreHorizontal /></div><strong>$48,290</strong><p><em className="up"><ArrowUpRight /> 12.5%</em> from last month</p></article>
            <article className="metric-card"><span className="metric-icon orange"><ShoppingCart /></span><div className="metric-top"><span>Total orders</span><MoreHorizontal /></div><strong>1,284</strong><p><em className="up"><ArrowUpRight /> 8.2%</em> from last month</p></article>
            <article className="metric-card"><span className="metric-icon green"><Users /></span><div className="metric-top"><span>New customers</span><MoreHorizontal /></div><strong>246</strong><p><em className="up"><ArrowUpRight /> 4.6%</em> from last month</p></article>
            <article className="metric-card"><span className="metric-icon blue"><Package /></span><div className="metric-top"><span>Low stock items</span><MoreHorizontal /></div><strong>18</strong><p><em className="down"><ArrowDownRight /> 2.4%</em> needs attention</p></article>
          </section>

          <section className="analytics-grid">
            <article className="panel revenue-panel">
              <div className="panel-heading"><div><h2>Revenue overview</h2><p>Track your earnings over time</p></div><div className="period-tabs">{Object.keys(chartData).map(p => <button className={period === p ? 'active' : ''} onClick={() => setPeriod(p)} key={p}>{p}</button>)}</div></div>
              <div className="revenue-total"><strong>$48,290.00</strong><span><ArrowUpRight size={14} /> 12.5%</span></div>
              <div className="chart-wrap">
                <div className="y-labels"><span>$25k</span><span>$20k</span><span>$15k</span><span>$10k</span><span>$5k</span><span>$0</span></div>
                <svg viewBox="0 0 620 210" preserveAspectRatio="none" aria-label="Revenue line chart">
                  <defs><linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6c5ce7" stopOpacity=".25"/><stop offset="1" stopColor="#6c5ce7" stopOpacity="0"/></linearGradient></defs>
                  {[20,54,88,122,156,190].map(y => <line key={y} x1="0" y1={y} x2="620" y2={y} stroke="#ebeaf0" strokeWidth="1" />)}
                  <polygon points={`0,210 ${points} 620,210`} fill="url(#area)" />
                  <polyline points={points} fill="none" stroke="#6c5ce7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="x-labels"><span>Jun 5</span><span>Jun 10</span><span>Jun 15</span><span>Jun 20</span><span>Jun 25</span><span>Jul 4</span></div>
              </div>
            </article>
            <article className="panel stock-panel">
              <div className="panel-heading"><div><h2>Stock health</h2><p>Inventory distribution</p></div><button className="more-button"><MoreHorizontal /></button></div>
              <div className="donut" style={{'--value': '76%'} as React.CSSProperties}><div><strong>1,842</strong><span>Total items</span></div></div>
              <div className="stock-legend"><p><i className="in-stock" />In stock <strong>1,402 <span>76%</span></strong></p><p><i className="low-stock" />Low stock <strong>312 <span>17%</span></strong></p><p><i className="out-stock" />Out of stock <strong>128 <span>7%</span></strong></p></div>
              <button className="secondary-button">View inventory <ArrowUpRight size={16} /></button>
            </article>
          </section>

          <section className="panel orders-panel">
            <div className="panel-heading"><div><h2>Recent orders</h2><p>Latest activity across your store</p></div><button className="date-button"><CalendarDays size={16} /> Last 30 days <ChevronDown size={15} /></button></div>
            <div className="table-scroll"><table><thead><tr><th>Order</th><th>Customer</th><th>Product</th><th>Date</th><th>Amount</th><th>Status</th><th></th></tr></thead><tbody>
              {filteredOrders.map(order => <tr key={order.id}><td><strong>{order.id}</strong></td><td><div className="customer"><span className={`avatar ${order.color}`}>{order.initials}</span><strong>{order.customer}</strong></div></td><td>{order.product}</td><td>{order.date}</td><td><strong>{order.amount}</strong></td><td><span className={`status ${order.status.toLowerCase()}`}>{order.status}</span></td><td><button className="more-button"><MoreHorizontal size={18} /></button></td></tr>)}
              {!filteredOrders.length && <tr><td colSpan={7} className="empty-state">No orders match “{query}”</td></tr>}
            </tbody></table></div>
            <div className="table-footer"><span>Showing {filteredOrders.length} of 1,284 orders</span><button>View all orders <ArrowUpRight size={16} /></button></div>
          </section></>}
        </div>
      </main>
    </div>
  );
}
