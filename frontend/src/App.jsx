import { useEffect, useMemo, useState } from 'react'
import {
  createRecord,
  getDashboardCategory,
  getDashboardSummary,
  getRecords,
  getUsers,
  loginUser,
  registerUser,
  updateRecord,
  deleteRecord,
} from './api'

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [role, setRole] = useState(localStorage.getItem('role') || '')
  const [message, setMessage] = useState('')
  const [activeTab, setActiveTab] = useState('records')

  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', role: 'viewer' })
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })

  const [records, setRecords] = useState([])
  const [recordForm, setRecordForm] = useState({ amount: '', type: 'income', category: '', note: '' })
  const [editRecordId, setEditRecordId] = useState('')
  const [filters, setFilters] = useState({ type: '', category: '' })

  const [users, setUsers] = useState([])
  const [summary, setSummary] = useState(null)
  const [categoryData, setCategoryData] = useState([])

  const isAdmin = role === 'admin'
  const isAnalyst = role === 'analyst'

  const netLabel = useMemo(() => {
    if (!summary) return ''
    return summary.netBalance >= 0 ? 'Positive' : 'Negative'
  }, [summary])

  const onRegister = async (event) => {
    event.preventDefault()
    try {
      await registerUser(registerForm)
      setMessage('Registered successfully. Please login.')
      setRegisterForm({ name: '', email: '', password: '', role: 'viewer' })
    } catch (error) {
      setMessage(error.response?.data?.message || 'Register failed')
    }
  }

  const onLogin = async (event) => {
    event.preventDefault()
    try {
      const data = await loginUser(loginForm)
      setToken(data.token)
      setRole(data.role)
      localStorage.setItem('token', data.token)
      localStorage.setItem('role', data.role)
      setMessage('Logged in successfully')
      setLoginForm({ email: '', password: '' })
    } catch (error) {
      setMessage(error.response?.data?.message || 'Login failed')
    }
  }

  const onLogout = () => {
    setToken('')
    setRole('')
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    setRecords([])
    setUsers([])
    setSummary(null)
    setCategoryData([])
    setMessage('Logged out')
  }

  const loadRecords = async () => {
    try {
      const data = await getRecords(token, filters)
      setRecords(data)
      setMessage('Records loaded')
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to load records')
    }
  }

  const onRecordSubmit = async (event) => {
    event.preventDefault()
    try {
      if (editRecordId) {
        await updateRecord(token, editRecordId, {
          ...recordForm,
          amount: Number(recordForm.amount),
        })
        setMessage('Record updated')
      } else {
        await createRecord(token, {
          ...recordForm,
          amount: Number(recordForm.amount),
        })
        setMessage('Record created')
      }
      setEditRecordId('')
      setRecordForm({ amount: '', type: 'income', category: '', note: '' })
      await loadRecords()
    } catch (error) {
      setMessage(error.response?.data?.message || 'Record action failed')
    }
  }

  const onEditRecord = (record) => {
    setEditRecordId(record._id)
    setRecordForm({
      amount: record.amount,
      type: record.type,
      category: record.category,
      note: record.note || '',
    })
  }

  const onDeleteRecord = async (id) => {
    try {
      await deleteRecord(token, id)
      setMessage('Record deleted')
      await loadRecords()
    } catch (error) {
      setMessage(error.response?.data?.message || 'Delete failed')
    }
  }

  const loadUsers = async () => {
    try {
      const data = await getUsers(token)
      setUsers(data)
      setMessage('Users loaded')
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to load users')
    }
  }

  const loadDashboard = async () => {
    try {
      const [summaryData, categoryStats] = await Promise.all([
        getDashboardSummary(token),
        getDashboardCategory(token),
      ])
      setSummary(summaryData)
      setCategoryData(categoryStats)
      setMessage('Dashboard loaded')
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to load dashboard')
    }
  }

  useEffect(() => {
    if (token) {
      loadRecords()
    }
  }, [token])

  return (
    <main className="container">
      <h1>Finance Dashboard UI</h1>

      <p className="message">{message}</p>

      {!token ? (
        <section className="grid two-col">
          <form className="card" onSubmit={onRegister}>
            <h2>Register</h2>
            <input placeholder="Name" value={registerForm.name} onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })} required />
            <input type="email" placeholder="Email" value={registerForm.email} onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })} required />
            <input type="password" placeholder="Password" value={registerForm.password} onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })} required />
            <select value={registerForm.role} onChange={(e) => setRegisterForm({ ...registerForm, role: e.target.value })}>
              <option value="viewer">viewer</option>
              <option value="analyst">analyst</option>
              <option value="admin">admin</option>
            </select>
            <button type="submit">Register</button>
          </form>

          <form className="card" onSubmit={onLogin}>
            <h2>Login</h2>
            <input type="email" placeholder="Email" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} required />
            <input type="password" placeholder="Password" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} required />
            <button type="submit">Login</button>
          </form>
        </section>
      ) : (
        <>
          <section className="card top-row">
            <p><strong>Role:</strong> {role}</p>
            <button onClick={onLogout}>Logout</button>
          </section>

          <section className="tabs">
            <button className={activeTab === 'records' ? 'active' : ''} onClick={() => setActiveTab('records')}>Records</button>
            {(isAnalyst || isAdmin) && (
              <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>Dashboard</button>
            )}
            {isAdmin && (
              <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>Users</button>
            )}
          </section>

          {activeTab === 'records' && (
            <section className="grid two-col">
              <div className="card">
                <h2>Record Filters</h2>
                <input placeholder="Type (income/expense)" value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })} />
                <input placeholder="Category" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} />
                <button onClick={loadRecords}>Load Records</button>
              </div>

              {isAdmin && (
                <form className="card" onSubmit={onRecordSubmit}>
                  <h2>{editRecordId ? 'Update Record' : 'Create Record'}</h2>
                  <input type="number" placeholder="Amount" value={recordForm.amount} onChange={(e) => setRecordForm({ ...recordForm, amount: e.target.value })} required />
                  <select value={recordForm.type} onChange={(e) => setRecordForm({ ...recordForm, type: e.target.value })}>
                    <option value="income">income</option>
                    <option value="expense">expense</option>
                  </select>
                  <input placeholder="Category" value={recordForm.category} onChange={(e) => setRecordForm({ ...recordForm, category: e.target.value })} required />
                  <input placeholder="Note" value={recordForm.note} onChange={(e) => setRecordForm({ ...recordForm, note: e.target.value })} />
                  <button type="submit">{editRecordId ? 'Save Changes' : 'Create'}</button>
                </form>
              )}

              <div className="card full-width">
                <h2>Records</h2>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Amount</th>
                        <th>Type</th>
                        <th>Category</th>
                        <th>Note</th>
                        {isAdmin && <th>Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((record) => (
                        <tr key={record._id}>
                          <td>{record.amount}</td>
                          <td>{record.type}</td>
                          <td>{record.category}</td>
                          <td>{record.note}</td>
                          {isAdmin && (
                            <td>
                              <button onClick={() => onEditRecord(record)}>Edit</button>
                              <button onClick={() => onDeleteRecord(record._id)}>Delete</button>
                            </td>
                          )}
                        </tr>
                      ))}
                      {!records.length && (
                        <tr>
                          <td colSpan={isAdmin ? 5 : 4}>No records found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'dashboard' && (isAnalyst || isAdmin) && (
            <section className="grid two-col">
              <div className="card">
                <h2>Summary</h2>
                <button onClick={loadDashboard}>Load Dashboard</button>
                {summary && (
                  <ul>
                    <li>Total Income: {summary.totalIncome}</li>
                    <li>Total Expense: {summary.totalExpense}</li>
                    <li>Net Balance: {summary.netBalance} ({netLabel})</li>
                  </ul>
                )}
              </div>

              <div className="card">
                <h2>Category Totals</h2>
                <ul>
                  {categoryData.map((item) => (
                    <li key={item._id}>{item._id}: {item.total}</li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {activeTab === 'users' && isAdmin && (
            <section className="card">
              <h2>Users (Admin)</h2>
              <button onClick={loadUsers}>Load Users</button>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.role}</td>
                        <td>{user.isActive ? 'Yes' : 'No'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}
    </main>
  )
}

export default App
