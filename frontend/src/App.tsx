import { FormEvent, ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import {
  Activity, ArrowDownRight, ArrowUpRight, Bell, BriefcaseBusiness, CalendarClock,
  Check, CheckCircle2, ChevronDown, CircleHelp, ClipboardList, FileText, LayoutDashboard,
  Menu, Plus, RefreshCw, Search, ShieldCheck, Trash2, Users, WalletCards, X, Pencil,
  AlertCircle, LogOut, Settings, MoreHorizontal
} from 'lucide-react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
type Customer = { id:number; fullName:string; email:string; phone?:string; status:string; createdAt:string }
type Application = { id:number; applicantName:string; product:string; status:string; premium:number; submittedAt:string }
type Policy = { id:number; policyNumber:string; holder:string; product:string; status:string; annualPremium:number; startDate?:string; expiryDate?:string }
type Page = 'Overview' | 'Customers' | 'Applications' | 'Policies' | 'Renewals' | 'Documents'
type CustomerForm = { fullName:string; email:string; phone:string; status:string }
type PolicyForm = { policyNumber:string; holder:string; product:string; status:string; annualPremium:string; startDate:string; expiryDate:string }
type ApplicationForm = { applicantName:string; product:string; premium:string }

const emptyCustomer:CustomerForm = {fullName:'',email:'',phone:'',status:'ACTIVE'}
const emptyPolicy:PolicyForm = {policyNumber:'',holder:'',product:'',status:'ACTIVE',annualPremium:'',startDate:'',expiryDate:''}
const emptyApplication:ApplicationForm = {applicantName:'',product:'',premium:''}
const money = (n:number) => new Intl.NumberFormat('en-IE',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(n || 0)
const date = (value?:string) => value ? new Date(value).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}) : '—'

async function request<T>(path:string, options:RequestInit = {}):Promise<T> {
  const auth = sessionStorage.getItem('insureflow.auth')
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers:{ ...(options.body ? {'Content-Type':'application/json'} : {}), ...(auth ? { Authorization: `Basic ${auth}` } : {}), ...(options.headers || {}) }
  })
  if (!response.ok) {
    const body = await response.json().catch(()=>null)
    throw new Error(body?.message || body?.detail || `Request failed (${response.status})`)
  }
  if (response.status === 204) return undefined as T
  return response.json()
}

export default function App() {
  const [auth,setAuth] = useState<string>(()=>sessionStorage.getItem('insureflow.auth') || '')
  const [page,setPage] = useState<Page>('Overview')
  const [customers,setCustomers] = useState<Customer[]>([])
  const [applications,setApplications] = useState<Application[]>([])
  const [policies,setPolicies] = useState<Policy[]>([])
  const [health,setHealth] = useState('Checking')
  const [search,setSearch] = useState('')
  const [customerModal,setCustomerModal] = useState(false)
  const [policyModal,setPolicyModal] = useState(false)
  const [applicationModal,setApplicationModal] = useState(false)
  const [editingCustomer,setEditingCustomer] = useState<Customer|null>(null)
  const [editingPolicy,setEditingPolicy] = useState<Policy|null>(null)
  const [customerForm,setCustomerForm] = useState<CustomerForm>(emptyCustomer)
  const [policyForm,setPolicyForm] = useState<PolicyForm>(emptyPolicy)
  const [applicationForm,setApplicationForm] = useState<ApplicationForm>(emptyApplication)
  const [busy,setBusy] = useState(false)
  const [notice,setNotice] = useState<{text:string;kind:'success'|'error'}|null>(null)
  const [mobileNav,setMobileNav] = useState(false)

  const load = useCallback(async () => {
    const results = await Promise.allSettled([
      request<{status:string}>('/health'),
      request<Customer[]>('/customers'),
      request<Application[]>('/applications'),
      request<Policy[]>('/policies')
    ])
    const [h,c,a,p] = results
    setHealth(h.status==='fulfilled' && h.value.status==='UP' ? 'Connected' : 'Offline')
    if (c.status==='fulfilled') setCustomers(c.value)
    if (a.status==='fulfilled') setApplications(a.value)
    if (p.status==='fulfilled') setPolicies(p.value)
    const failures = [c,a,p].filter(x=>x.status==='rejected').length
    if (failures) setNotice({text:`Some data could not be loaded (${failures} API request${failures===1?'':'s'} failed). Check that the backend is running.`,kind:'error'})
  },[])
  useEffect(()=>{if(auth) void load()},[load,auth])

  async function signIn(username:string,password:string) {
    const encoded = btoa(`${username}:${password}`)
    const response = await fetch(`${API}/auth/session`, { headers: { Authorization: `Basic ${encoded}` } })
    if (!response.ok) throw new Error(response.status === 401 ? 'Incorrect username or password.' : 'Unable to sign in. Check that the backend is running.')
    sessionStorage.setItem('insureflow.auth', encoded)
    setAuth(encoded)
  }
  function signOut() { sessionStorage.removeItem('insureflow.auth'); setAuth(''); setCustomers([]); setApplications([]); setPolicies([]); setPage('Overview') }

  const filteredCustomers = useMemo(()=>customers.filter(c=>`${c.fullName} ${c.email} ${c.phone||''} ${c.status}`.toLowerCase().includes(search.toLowerCase())),[customers,search])
  const filteredApplications = useMemo(()=>applications.filter(a=>`${a.applicantName} ${a.product} ${a.status}`.toLowerCase().includes(search.toLowerCase())),[applications,search])
  const filteredPolicies = useMemo(()=>policies.filter(p=>`${p.policyNumber} ${p.holder} ${p.product} ${p.status}`.toLowerCase().includes(search.toLowerCase())),[policies,search])
  const activePolicies = policies.filter(p=>p.status==='ACTIVE')
  const pendingApplications = applications.filter(a=>a.status==='SUBMITTED'||a.status==='IN_REVIEW')
  const renewals = policies.filter(p=>p.expiryDate && p.status==='ACTIVE' && (new Date(p.expiryDate).getTime()-Date.now())/(1000*60*60*24)<=60 && new Date(p.expiryDate).getTime()>=Date.now()).sort((a,b)=>(a.expiryDate||'').localeCompare(b.expiryDate||''))
  const notify = (text:string,kind:'success'|'error'='success')=>setNotice({text,kind})

  function openCreateCustomer(){setEditingCustomer(null);setCustomerForm(emptyCustomer);setCustomerModal(true)}
  function openEditCustomer(c:Customer){setEditingCustomer(c);setCustomerForm({fullName:c.fullName,email:c.email,phone:c.phone||'',status:c.status});setCustomerModal(true)}
  function openCreatePolicy(){setEditingPolicy(null);setPolicyForm(emptyPolicy);setPolicyModal(true)}
  function openEditPolicy(p:Policy){setEditingPolicy(p);setPolicyForm({policyNumber:p.policyNumber,holder:p.holder,product:p.product,status:p.status,annualPremium:String(p.annualPremium),startDate:p.startDate||'',expiryDate:p.expiryDate||''});setPolicyModal(true)}

  async function submitCustomer(e:FormEvent<HTMLFormElement>){
    e.preventDefault();setBusy(true)
    try {
      const payload={...customerForm,fullName:customerForm.fullName.trim(),email:customerForm.email.trim(),phone:customerForm.phone.trim()}
      await request<Customer>(editingCustomer?`/customers/${editingCustomer.id}`:'/customers',{method:editingCustomer?'PUT':'POST',body:JSON.stringify(payload)})
      setCustomerModal(false);notify(editingCustomer?'Customer updated successfully.':'Customer created successfully.');await load()
    } catch(err){notify(err instanceof Error?err.message:'Unable to save customer.','error')}
    finally{setBusy(false)}
  }
  async function deleteCustomer(c:Customer){
    if(!window.confirm(`Delete customer ${c.fullName}? This cannot be undone.`))return
    try{await request<void>(`/customers/${c.id}`,{method:'DELETE'});notify('Customer deleted.');await load()}
    catch(err){notify(err instanceof Error?err.message:'Unable to delete customer.','error')}
  }
  async function submitPolicy(e:FormEvent<HTMLFormElement>){
    e.preventDefault();setBusy(true)
    try{
      const payload={...policyForm,policyNumber:policyForm.policyNumber.trim(),holder:policyForm.holder.trim(),product:policyForm.product.trim(),annualPremium:Number(policyForm.annualPremium),startDate:policyForm.startDate||null,expiryDate:policyForm.expiryDate||null}
      await request<Policy>(editingPolicy?`/policies/${editingPolicy.id}`:'/policies',{method:editingPolicy?'PUT':'POST',body:JSON.stringify(payload)})
      setPolicyModal(false);notify(editingPolicy?'Policy updated successfully.':'Policy created successfully.');await load()
    }catch(err){notify(err instanceof Error?err.message:'Unable to save policy.','error')}
    finally{setBusy(false)}
  }
  async function deletePolicy(p:Policy){
    if(!window.confirm(`Delete policy ${p.policyNumber}? This cannot be undone.`))return
    try{await request<void>(`/policies/${p.id}`,{method:'DELETE'});notify('Policy deleted.');await load()}
    catch(err){notify(err instanceof Error?err.message:'Unable to delete policy.','error')}
  }
  async function submitApplication(e:FormEvent<HTMLFormElement>){
    e.preventDefault();setBusy(true)
    try{await request<Application>('/applications',{method:'POST',body:JSON.stringify({...applicationForm,premium:Number(applicationForm.premium)})});setApplicationModal(false);setApplicationForm(emptyApplication);notify('Application submitted.');await load()}
    catch(err){notify(err instanceof Error?err.message:'Unable to create application.','error')}
    finally{setBusy(false)}
  }
  async function changeStatus(id:number,status:string){
    try{await request<Application>(`/applications/${id}/status`,{method:'PATCH',body:JSON.stringify({status})});notify('Application status updated.');await load()}
    catch(err){notify(err instanceof Error?err.message:'Could not update application.','error')}
  }

  const nav:{name:Page;icon:typeof LayoutDashboard;count?:number}[]=[
    {name:'Overview',icon:LayoutDashboard},{name:'Customers',icon:Users,count:customers.length},
    {name:'Applications',icon:ClipboardList,count:pendingApplications.length},{name:'Policies',icon:ShieldCheck},
    {name:'Renewals',icon:CalendarClock,count:renewals.length},{name:'Documents',icon:FileText}
  ]
  const heading = page==='Overview'?'Good evening':page
  if (!auth) return <LoginScreen onSignIn={signIn} />

  return <div className="app-shell">
    {mobileNav&&<button className="mobile-scrim" aria-label="Close navigation" onClick={()=>setMobileNav(false)}/>}
    <aside className={`sidebar ${mobileNav?'sidebar-open':''}`}>
      <div className="brand"><div className="brand-mark"><ShieldCheck size={21}/></div><div className="brand-copy"><b>insureflow</b><small>INSURANCE OPERATIONS</small></div><button className="mobile-close" onClick={()=>setMobileNav(false)} aria-label="Close menu"><X size={18}/></button></div>
      <div className="workspace"><div className="workspace-icon">IF</div><div className="workspace-copy"><b>InsureFlow Europe</b><small>Operations workspace</small></div><ChevronDown size={15}/></div>
      <p className="nav-label">WORKSPACE</p>
      <nav>{nav.map(item=>{const Icon=item.icon;return <button key={item.name} className={`nav-item ${page===item.name?'active':''}`} onClick={()=>{setPage(item.name);setMobileNav(false)}}><Icon size={18}/><span>{item.name}</span>{item.count!==undefined&&item.count>0&&<em>{item.count}</em>}</button>})}</nav>
      <div className="sidebar-bottom"><div className="help"><CircleHelp size={17}/><span>Help & support</span></div><div className="profile"><div className="avatar">DA</div><div className="profile-copy"><b>Portfolio Admin</b><small>Authenticated demo session</small></div><button className="logout-btn" title="Sign out" aria-label="Sign out" onClick={signOut}><LogOut size={16}/></button></div><div className="env"><span className={`dot ${health==='Connected'?'online':''}`}></span> API {health}</div></div>
    </aside>
    <main className="main">
      <header className="topbar"><div className="topbar-left"><button className="mobile-menu" onClick={()=>setMobileNav(true)} aria-label="Open navigation"><Menu size={20}/></button><div className="crumb"><span>Workspace</span><span className="slash">/</span><b>{page}</b></div></div><div className="top-actions"><label className="searchbox"><Search size={16}/><input aria-label="Search current records" placeholder={`Search ${page.toLowerCase()}...`} value={search} onChange={e=>setSearch(e.target.value)}/>{search&&<button className="clear-search" onClick={()=>setSearch('')} aria-label="Clear search"><X size={14}/></button>}</label><button className="icon-btn" aria-label="Refresh data" title="Refresh data" onClick={()=>void load()}><RefreshCw size={17}/></button><button className="icon-btn" aria-label="Notifications" title="Notifications"><Bell size={18}/><i/></button><div className="top-avatar">DA</div></div></header>
      <div className="content">
        <div className="page-heading"><div><div className="eyebrow">{new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).toUpperCase()}</div><h1>{page==='Overview'?`${heading}, Daniel`:`${page} overview`}</h1><p>{page==='Overview'?'A clear view of your insurance operations and outstanding work.':page==='Renewals'?'Monitor policies approaching expiry and prioritize follow-up.':`Review and manage ${page.toLowerCase()} from one workspace.`}</p></div><div className="heading-actions"><button className="btn secondary" onClick={()=>void load()}><Activity size={16}/> Refresh</button>{page==='Customers'?<button className="btn primary" onClick={openCreateCustomer}><Plus size={17}/> New customer</button>:page==='Policies'?<button className="btn primary" onClick={openCreatePolicy}><Plus size={17}/> New policy</button>:page==='Applications'?<button className="btn primary" onClick={()=>setApplicationModal(true)}><Plus size={17}/> New application</button>:null}</div></div>
        {notice&&<div className={`notice ${notice.kind==='error'?'notice-error':''}`} role="status"><span>{notice.kind==='error'?<AlertCircle size={16}/>:<CheckCircle2 size={16}/>} {notice.text}</span><button onClick={()=>setNotice(null)} aria-label="Dismiss"><X size={15}/></button></div>}
        {page==='Overview'&&<>
          <div className="stats-grid">
            <Stat title="Total customers" value={String(customers.length)} sub="Records in the customer directory" icon={<Users/>} tone="blue"/>
            <Stat title="Pending applications" value={String(pendingApplications.length)} sub={`${applications.length} total submissions`} icon={<ClipboardList/>} tone="amber"/>
            <Stat title="Active policies" value={String(activePolicies.length)} sub={`${policies.length} total policies`} icon={<ShieldCheck/>} tone="green"/>
            <Stat title="Annual premiums" value={money(activePolicies.reduce((sum,p)=>sum+p.annualPremium,0))} sub="Active policy portfolio" icon={<WalletCards/>} tone="violet"/>
          </div>
          <div className="overview-grid">
            <section className="panel"><PanelHead title="Application pipeline" subtitle="Review submissions and underwriting progress" action={<button className="text-btn" onClick={()=>setPage('Applications')}>View all <ArrowUpRight size={15}/></button>}/><ApplicationsTable items={filteredApplications.slice(0,5)} changeStatus={changeStatus}/>{filteredApplications.length===0&&<Empty title="No applications found" text="New submissions will appear here when added through the application workflow."/>}</section>
            <section className="panel activity-panel"><PanelHead title="Service health" subtitle="Live API connectivity" action={<span className={`status-pill ${health==='Connected'?'good':'bad'}`}><span className="dot"/>{health}</span>}/><div className="service-row"><div className="service-icon"><Activity size={17}/></div><div><b>Spring Boot REST API</b><small>{API}</small></div><span className={`status-pill ${health==='Connected'?'good':'bad'}`}>{health}</span></div><div className="service-row"><div className="service-icon"><WalletCards size={17}/></div><div><b>Database connection</b><small>Managed by the backend configuration</small></div><span className="status-pill neutral">Backend</span></div><div className="callout"><CheckCircle2 size={18}/><div><b>Operational overview</b><p>Metrics are calculated from the data returned by the connected APIs. Authentication and production hardening should be completed before deployment.</p></div></div></section>
          </div>
          <div className="overview-grid lower-grid"><section className="panel"><PanelHead title="Recent customers" subtitle="Latest customer records" action={<button className="text-btn" onClick={()=>setPage('Customers')}>View all <ArrowUpRight size={15}/></button>}/><CustomersTable items={filteredCustomers.slice(0,5)} onEdit={openEditCustomer} onDelete={deleteCustomer}/>{filteredCustomers.length===0&&<Empty title="No customers found" text="Add a customer to populate this table."/>}</section><section className="panel"><PanelHead title="Renewals coming up" subtitle="Active policies expiring within 60 days" action={<button className="text-btn" onClick={()=>setPage('Renewals')}>View renewals <ArrowUpRight size={15}/></button>}/>{renewals.slice(0,4).map(p=><div className="renewal-row" key={p.id}><div className="renewal-icon"><CalendarClock size={17}/></div><div className="renewal-copy"><b>{p.holder}</b><small>{p.policyNumber} · {p.product}</small></div><div className="renewal-date"><b>{date(p.expiryDate)}</b><small>Expiry date</small></div></div>)}{renewals.length===0&&<Empty title="No upcoming renewals" text="Policies expiring in the next 60 days will appear here when expiry dates are recorded."/>}</section></div>
        </>}
        {page==='Customers'&&<section className="panel full-panel"><PanelHead title="Customer directory" subtitle={`${filteredCustomers.length} records · Data from the Spring Boot API`} action={<button className="btn primary" onClick={openCreateCustomer}><Plus size={16}/> New customer</button>}/><CustomersTable items={filteredCustomers} onEdit={openEditCustomer} onDelete={deleteCustomer}/>{filteredCustomers.length===0&&<Empty title="No customers found" text="Create a customer or adjust your search."/>}</section>}
        {page==='Applications'&&<section className="panel full-panel"><PanelHead title="Application pipeline" subtitle="Review submissions and update their status" action={<button className="btn primary" onClick={()=>setApplicationModal(true)}><Plus size={16}/> New application</button>}/><div className="table-toolbar"><span className="count-tag">{filteredApplications.length} applications</span><span className="helper-text">Status changes are saved through the API.</span></div><ApplicationsTable items={filteredApplications} changeStatus={changeStatus}/>{filteredApplications.length===0&&<Empty title="No applications yet" text="Create an application to start building your pipeline."/>}</section>}
        {page==='Policies'&&<section className="panel full-panel"><PanelHead title="Policy portfolio" subtitle="Manage persistent policy records" action={<button className="btn primary" onClick={openCreatePolicy}><Plus size={16}/> New policy</button>}/><PoliciesTable items={filteredPolicies} onEdit={openEditPolicy} onDelete={deletePolicy}/>{filteredPolicies.length===0&&<Empty title="No policies found" text="Create a policy to populate your portfolio."/>}</section>}
        {page==='Renewals'&&<section className="panel full-panel"><PanelHead title="Upcoming renewals" subtitle="Active policies expiring within the next 60 days" action={<span className="count-tag">{renewals.length} upcoming</span>}/>{renewals.length>0?<PoliciesTable items={renewals} onEdit={openEditPolicy} onDelete={deletePolicy}/>:<Empty title="No upcoming renewals" text="Add expiry dates to active policies. Policies expiring in the next 60 days will appear here."/>}</section>}
        {page==='Documents'&&<section className="panel full-panel"><div className="document-placeholder"><div className="doc-icon"><FileText size={28}/></div><h3>Document center</h3><p>Document templates, PDF generation, secure document storage, and application attachments are planned enhancements. This module is not yet implemented.</p><span className="status-pill pending">Planned module</span></div></section>}
        <footer><span><b>InsureFlow</b> <span className="muted">· Insurance operations portfolio project</span></span><span>React · TypeScript · Spring Boot <span className="muted">· Development environment</span></span></footer>
      </div>
    </main>
    {customerModal&&<Modal title={editingCustomer?'Edit customer':'Add customer'} subtitle="Customer records are saved through the InsureFlow API." onClose={()=>setCustomerModal(false)}><form onSubmit={submitCustomer} className="form-stack"><Field label="Full name"><input value={customerForm.fullName} onChange={e=>setCustomerForm({...customerForm,fullName:e.target.value})} required minLength={2} placeholder="e.g. Alex Morgan"/></Field><Field label="Email address"><input type="email" value={customerForm.email} onChange={e=>setCustomerForm({...customerForm,email:e.target.value})} required placeholder="alex@example.com"/></Field><Field label="Phone number"><input value={customerForm.phone} onChange={e=>setCustomerForm({...customerForm,phone:e.target.value})} placeholder="+34 600 000 000"/></Field>{editingCustomer&&<Field label="Status"><select value={customerForm.status} onChange={e=>setCustomerForm({...customerForm,status:e.target.value})}><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select></Field>}<ModalActions busy={busy} submitLabel={editingCustomer?'Save changes':'Create customer'} onCancel={()=>setCustomerModal(false)}/></form></Modal>}
    {policyModal&&<Modal title={editingPolicy?'Edit policy':'Create policy'} subtitle="Policy data is stored by the backend." onClose={()=>setPolicyModal(false)}><form onSubmit={submitPolicy} className="form-stack"><Field label="Policy number"><input value={policyForm.policyNumber} onChange={e=>setPolicyForm({...policyForm,policyNumber:e.target.value})} required placeholder="POL-2026-0001"/></Field><Field label="Policy holder"><input value={policyForm.holder} onChange={e=>setPolicyForm({...policyForm,holder:e.target.value})} required placeholder="Customer full name"/></Field><Field label="Insurance product"><input value={policyForm.product} onChange={e=>setPolicyForm({...policyForm,product:e.target.value})} required placeholder="Life Protect"/></Field><div className="form-row"><Field label="Annual premium (€)"><input type="number" min="0" step="0.01" value={policyForm.annualPremium} onChange={e=>setPolicyForm({...policyForm,annualPremium:e.target.value})} required/></Field><Field label="Status"><select value={policyForm.status} onChange={e=>setPolicyForm({...policyForm,status:e.target.value})}><option value="ACTIVE">Active</option><option value="PENDING">Pending</option><option value="EXPIRED">Expired</option><option value="CANCELLED">Cancelled</option></select></Field></div><div className="form-row"><Field label="Start date"><input type="date" value={policyForm.startDate} onChange={e=>setPolicyForm({...policyForm,startDate:e.target.value})}/></Field><Field label="Expiry date"><input type="date" value={policyForm.expiryDate} onChange={e=>setPolicyForm({...policyForm,expiryDate:e.target.value})}/></Field></div><ModalActions busy={busy} submitLabel={editingPolicy?'Save changes':'Create policy'} onCancel={()=>setPolicyModal(false)}/></form></Modal>}
    {applicationModal&&<Modal title="New application" subtitle="Create an application for the review pipeline." onClose={()=>setApplicationModal(false)}><form onSubmit={submitApplication} className="form-stack"><Field label="Applicant name"><input value={applicationForm.applicantName} onChange={e=>setApplicationForm({...applicationForm,applicantName:e.target.value})} required placeholder="Customer full name"/></Field><Field label="Insurance product"><input value={applicationForm.product} onChange={e=>setApplicationForm({...applicationForm,product:e.target.value})} required placeholder="Home Secure"/></Field><Field label="Proposed premium (€)"><input type="number" min="0" step="0.01" value={applicationForm.premium} onChange={e=>setApplicationForm({...applicationForm,premium:e.target.value})} required/></Field><ModalActions busy={busy} submitLabel="Submit application" onCancel={()=>setApplicationModal(false)}/></form></Modal>}
  </div>
}

function LoginScreen({onSignIn}:{onSignIn:(username:string,password:string)=>Promise<void>}) {
  const [username,setUsername] = useState('portfolio-admin')
  const [password,setPassword] = useState('')
  const [busy,setBusy] = useState(false)
  const [error,setError] = useState('')
  async function submit(e:FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setError('')
    try { await onSignIn(username.trim(),password) } catch (err) { setError(err instanceof Error ? err.message : 'Sign-in failed.') } finally { setBusy(false) }
  }
  return <main className="login-screen"><section className="login-card"><div className="login-brand"><div className="brand-mark"><ShieldCheck size={22}/></div><div><b>insureflow</b><small>INSURANCE OPERATIONS</small></div></div><p className="login-eyebrow">SECURE WORKSPACE</p><h1>Welcome back</h1><p className="login-intro">Sign in to manage customers, policies, applications, and renewals.</p><form onSubmit={submit} className="form-stack"><Field label="Username"><input autoComplete="username" value={username} onChange={e=>setUsername(e.target.value)} required/></Field><Field label="Password"><input type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required/></Field>{error&&<p className="login-error" role="alert">{error}</p>}<button className="btn primary login-submit" disabled={busy}>{busy?'Signing in…':'Sign in securely'}</button></form><p className="login-demo">Local portfolio demo · Change the default credentials before deploying.</p></section></main>
}

function Stat({title,value,sub,icon,tone}:{title:string;value:string;sub:string;icon:ReactNode;tone:string}){return <section className="stat-card"><div className="stat-top"><span>{title}</span><div className={`stat-icon ${tone}`}>{icon}</div></div><div className="stat-value">{value}</div><div className="stat-bottom"><span>{sub}</span><span className="trend"><ArrowUpRight size={13}/> Live</span></div></section>}
function PanelHead({title,subtitle,action}:{title:string;subtitle:string;action?:ReactNode}){return <div className="panel-head"><div><h2>{title}</h2><p>{subtitle}</p></div>{action}</div>}
function Empty({title,text}:{title:string;text:string}){return <div className="empty"><div className="empty-icon"><BriefcaseBusiness size={20}/></div><b>{title}</b><p>{text}</p></div>}
function Field({label,children}:{label:string;children:ReactNode}){return <label className="field"><span>{label}</span>{children}</label>}
function Modal({title,subtitle,onClose,children}:{title:string;subtitle:string;onClose:()=>void;children:ReactNode}){return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><section className="modal" role="dialog" aria-modal="true" aria-label={title}><div className="modal-head"><div><h2>{title}</h2><p>{subtitle}</p></div><button type="button" className="icon-btn" onClick={onClose} aria-label="Close dialog"><X size={18}/></button></div>{children}</section></div>}
function ModalActions({busy,submitLabel,onCancel}:{busy:boolean;submitLabel:string;onCancel:()=>void}){return <div className="modal-actions"><button type="button" className="btn secondary" onClick={onCancel}>Cancel</button><button className="btn primary" disabled={busy}>{busy?'Saving…':submitLabel}</button></div>}
function CustomersTable({items,onEdit,onDelete}:{items:Customer[];onEdit:(c:Customer)=>void;onDelete:(c:Customer)=>void}){return <div className="table-wrap"><table><thead><tr><th>CUSTOMER</th><th>EMAIL</th><th>PHONE</th><th>STATUS</th><th>CREATED</th><th>ACTIONS</th></tr></thead><tbody>{items.map(c=><tr key={c.id}><td className="person-cell"><div className="mini-avatar">{c.fullName.split(' ').map(x=>x[0]).slice(0,2).join('').toUpperCase()}</div><b>{c.fullName}</b></td><td>{c.email}</td><td>{c.phone||'—'}</td><td><span className={`status-pill ${c.status==='ACTIVE'?'good':'neutral'}`}>{c.status}</span></td><td>{date(c.createdAt)}</td><td><div className="row-actions"><button title="Edit customer" aria-label={`Edit ${c.fullName}`} onClick={()=>onEdit(c)}><Pencil size={14}/></button><button title="Delete customer" aria-label={`Delete ${c.fullName}`} onClick={()=>onDelete(c)}><Trash2 size={14}/></button></div></td></tr>)}</tbody></table></div>}
function PoliciesTable({items,onEdit,onDelete}:{items:Policy[];onEdit:(p:Policy)=>void;onDelete:(p:Policy)=>void}){return <div className="table-wrap"><table><thead><tr><th>POLICY NUMBER</th><th>POLICY HOLDER</th><th>PRODUCT</th><th>ANNUAL PREMIUM</th><th>START DATE</th><th>EXPIRY DATE</th><th>STATUS</th><th>ACTIONS</th></tr></thead><tbody>{items.map(p=><tr key={p.id}><td className="mono">{p.policyNumber}</td><td className="person-cell"><div className="mini-avatar">{p.holder.split(' ').map(x=>x[0]).slice(0,2).join('').toUpperCase()}</div><b>{p.holder}</b></td><td>{p.product}</td><td className="money">{money(p.annualPremium)}</td><td>{date(p.startDate)}</td><td>{date(p.expiryDate)}</td><td><span className={`status-pill ${p.status==='ACTIVE'?'good':p.status==='CANCELLED'?'bad':'pending'}`}>{p.status}</span></td><td><div className="row-actions"><button title="Edit policy" aria-label={`Edit ${p.policyNumber}`} onClick={()=>onEdit(p)}><Pencil size={14}/></button><button title="Delete policy" aria-label={`Delete ${p.policyNumber}`} onClick={()=>onDelete(p)}><Trash2 size={14}/></button></div></td></tr>)}</tbody></table></div>}
function ApplicationsTable({items,changeStatus}:{items:Application[];changeStatus:(id:number,status:string)=>void}){return <div className="table-wrap"><table><thead><tr><th>APPLICANT</th><th>PRODUCT</th><th>PREMIUM</th><th>SUBMITTED</th><th>STATUS</th><th>UPDATE STATUS</th></tr></thead><tbody>{items.map(a=><tr key={a.id}><td><b>{a.applicantName}</b><small className="subline">APP-{String(a.id).padStart(4,'0')}</small></td><td>{a.product}</td><td className="money">{money(a.premium)}</td><td>{date(a.submittedAt)}</td><td><span className={`status-pill ${a.status==='APPROVED'?'good':a.status==='DECLINED'?'bad':'pending'}`}>{a.status.replace('_',' ')}</span></td><td><select aria-label={`Update status for ${a.applicantName}`} value={a.status} onChange={e=>changeStatus(a.id,e.target.value)}>{['SUBMITTED','IN_REVIEW','APPROVED','DECLINED'].map(s=><option key={s} value={s}>{s.replace('_',' ')}</option>)}</select></td></tr>)}</tbody></table></div>}
