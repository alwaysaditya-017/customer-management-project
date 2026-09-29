import { useEffect, useState } from 'react'
import { Link, Route, Routes, useNavigate, useParams, useLocation } from 'react-router-dom'
import api from './api'

const emptyForm = {name:'',email:'',phoneNumber:'',company:'',status:'ACTIVE'}

function Layout({children}) {
  return <div className="app">
    <header className="header">
      <Link to="/" className="brand">Customer Management</Link>
      <Link to="/customers/new" className="primary-btn">+ Add Customer</Link>
    </header>
    <main className="container">{children}</main>
  </div>
}

function CustomerList() {
  const navigate = useNavigate()
  const location = useLocation()
  const [data,setData] = useState({content:[],totalPages:0,totalElements:0,number:0})
  const [search,setSearch] = useState('')
  const [sortBy,setSortBy] = useState('createdDate')
  const [direction,setDirection] = useState('desc')
  const [page,setPage] = useState(0)
  const [loading,setLoading] = useState(true)
  const [error,setError] = useState('')
  const [message,setMessage] = useState(location.state?.message || '')

  useEffect(() => {
    if (location.state?.message) window.history.replaceState({}, document.title)
  }, [])

  const load = async () => {
    setLoading(true); setError('')
    try {
      const r = await api.get('/customers',{params:{search,page,size:8,sortBy,direction}})
      setData(r.data)
    } catch(e) {
      setError(e.response?.data?.message || 'Unable to load customers.')
    } finally { setLoading(false) }
  }

  useEffect(() => {
    const timer=setTimeout(load,250)
    return () => clearTimeout(timer)
  },[search,page,sortBy,direction])

  const remove = async id => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return
    try {
      await api.delete(`/customers/${id}`)
      setMessage('Customer deleted successfully.')
      if(data.content.length===1 && page>0) setPage(page-1)
      else load()
    } catch(e) { setError(e.response?.data?.message || 'Unable to delete customer.') }
  }

  const sort = field => {
    if(sortBy===field) setDirection(direction==='asc'?'desc':'asc')
    else {setSortBy(field);setDirection('asc')}
    setPage(0)
  }

  return <>
    <div className="page-title">
      <div><h1>Customers</h1><p>Manage customer information from one place.</p></div>
      <Link to="/customers/new" className="primary-btn">+ Add Customer</Link>
    </div>
    {message && <div className="alert success">{message}</div>}
    {error && <div className="alert error">{error}</div>}

    <div className="toolbar">
      <input value={search} onChange={e=>{setSearch(e.target.value);setPage(0)}} placeholder="Search name, email, phone or company..." />
      <button className="secondary-btn" onClick={()=>{setSearch('');setPage(0)}}>Clear</button>
    </div>

    <div className="card table-card">
      {loading ? <div className="loading">Loading customers...</div> :
       data.content.length===0 ? <div className="empty">No customers found.</div> :
       <div className="table-wrapper"><table><thead><tr>
         {[
           ['name','Name'],['email','Email'],['phoneNumber','Phone'],
           ['company','Company'],['status','Status'],['createdDate','Created Date']
         ].map(([f,l])=><th key={f} onClick={()=>sort(f)}>{l} <span className="sort">↕</span></th>)}
         <th>Actions</th>
       </tr></thead><tbody>
       {data.content.map(c=><tr key={c.id}>
         <td>{c.name}</td><td>{c.email}</td><td>{c.phoneNumber}</td><td>{c.company}</td>
         <td><span className={`status ${c.status.toLowerCase()}`}>{c.status}</span></td>
         <td>{new Date(c.createdDate).toLocaleString()}</td>
         <td className="actions">
           <button onClick={()=>navigate(`/customers/${c.id}`)}>View</button>
           <button onClick={()=>navigate(`/customers/${c.id}/edit`)}>Edit</button>
           <button className="danger-text" onClick={()=>remove(c.id)}>Delete</button>
         </td>
       </tr>)}
       </tbody></table></div>}
      <div className="pagination">
        <span>Showing {data.content.length} of {data.totalElements} customers</span>
        <div>
          <button disabled={data.number===0} onClick={()=>setPage(page-1)}>Previous</button>
          <span>Page {data.totalPages===0?0:data.number+1} of {data.totalPages}</span>
          <button disabled={data.number+1>=data.totalPages} onClick={()=>setPage(page+1)}>Next</button>
        </div>
      </div>
    </div>
  </>
}

function CustomerForm() {
  const navigate=useNavigate(), {id}=useParams(), editing=Boolean(id)
  const [form,setForm]=useState(emptyForm), [loading,setLoading]=useState(editing)
  const [saving,setSaving]=useState(false), [error,setError]=useState(''), [fieldErrors,setFieldErrors]=useState({})

  useEffect(()=>{
    if(!editing)return
    api.get(`/customers/${id}`).then(r=>setForm({
      name:r.data.name,email:r.data.email,phoneNumber:r.data.phoneNumber,
      company:r.data.company,status:r.data.status
    })).catch(e=>setError(e.response?.data?.message||'Unable to load customer.'))
      .finally(()=>setLoading(false))
  },[id,editing])

  const update=(f,v)=>{setForm(p=>({...p,[f]:v}));setFieldErrors(p=>({...p,[f]:''}))}

  const submit=async e=>{
    e.preventDefault();setSaving(true);setError('');setFieldErrors({})
    try {
      if(editing) await api.put(`/customers/${id}`,form)
      else await api.post('/customers',form)
      navigate('/',{state:{message:`Customer ${editing?'updated':'created'} successfully.`}})
    } catch(e) {
      const b=e.response?.data;setError(b?.message||'Unable to save customer.')
      setFieldErrors(b?.validationErrors||{})
    } finally {setSaving(false)}
  }

  if(loading)return <div className="loading">Loading customer...</div>

  return <div className="form-page">
    <div className="page-title"><div><h1>{editing?'Edit Customer':'Add Customer'}</h1>
    <p>{editing?'Update customer information.':'Create a new customer record.'}</p></div></div>
    {error&&<div className="alert error">{error}</div>}
    <form className="card form-card" onSubmit={submit}>
      {[
        ['name','Name','text'],['email','Email','email'],
        ['phoneNumber','Phone Number','text'],['company','Company','text']
      ].map(([f,l,t])=><div className="form-group" key={f}>
        <label>{l}</label><input type={t} value={form[f]} onChange={e=>update(f,e.target.value)} required/>
        {fieldErrors[f]&&<small className="field-error">{fieldErrors[f]}</small>}
      </div>)}
      <div className="form-group"><label>Status</label>
        <select value={form.status} onChange={e=>update('status',e.target.value)}>
          <option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option>
        </select>
        {fieldErrors.status&&<small className="field-error">{fieldErrors.status}</small>}
      </div>
      <div className="form-actions">
        <button type="button" className="secondary-btn" onClick={()=>navigate('/')}>Cancel</button>
        <button className="primary-btn" disabled={saving}>{saving?'Saving...':editing?'Update Customer':'Create Customer'}</button>
      </div>
    </form>
  </div>
}

function CustomerDetails() {
  const {id}=useParams(),navigate=useNavigate()
  const [customer,setCustomer]=useState(null),[error,setError]=useState('')
  useEffect(()=>{api.get(`/customers/${id}`).then(r=>setCustomer(r.data))
    .catch(e=>setError(e.response?.data?.message||'Customer not found.'))},[id])
  if(error)return <div className="alert error">{error}</div>
  if(!customer)return <div className="loading">Loading customer...</div>
  return <div className="details-page">
    <div className="page-title"><div><h1>Customer Details</h1>
    <p>Complete information for customer #{customer.id}.</p></div>
    <button className="secondary-btn" onClick={()=>navigate('/')}>Back</button></div>
    <div className="card details-card">
      <Detail label="Name" value={customer.name}/><Detail label="Email" value={customer.email}/>
      <Detail label="Phone Number" value={customer.phoneNumber}/><Detail label="Company" value={customer.company}/>
      <Detail label="Status" value={customer.status}/>
      <Detail label="Created Date" value={new Date(customer.createdDate).toLocaleString()}/>
      <div className="form-actions"><button className="primary-btn" onClick={()=>navigate(`/customers/${customer.id}/edit`)}>Edit Customer</button></div>
    </div>
  </div>
}
function Detail({label,value}){return <div className="detail-row"><span>{label}</span><strong>{value}</strong></div>}

export default function App(){
  return <Layout><Routes>
    <Route path="/" element={<CustomerList/>}/>
    <Route path="/customers/new" element={<CustomerForm/>}/>
    <Route path="/customers/:id" element={<CustomerDetails/>}/>
    <Route path="/customers/:id/edit" element={<CustomerForm/>}/>
  </Routes></Layout>
}
