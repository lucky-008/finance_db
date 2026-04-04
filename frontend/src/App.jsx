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
  const [isError, setIsError] = useState(false)
  const [activeTab, setActiveTab] = useState('records')

  const [authPage, setAuthPage] = useState('login')
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
    const { name, email, password } = registerForm
    if (!name.trim() || name.trim().length < 2) { setIsError(true); return setMessage('Name must be at least 2 characters') }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setIsError(true); return setMessage('Enter a valid email address') }
    if (password.length < 7) { setIsError(true); return setMessage('Password must be greater than 6 characters') }
    if (!/[A-Z]/.test(password)) { setIsError(true); return setMessage('Password must contain at least one uppercase letter') }
    if (!/[a-z]/.test(password)) { setIsError(true); return setMessage('Password must contain at least one lowercase letter') }
    if (!/[0-9]/.test(password)) { setIsError(true); return setMessage('Password must contain at least one digit') }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) { setIsError(true); return setMessage('Password must contain at least one special character') }
    if (password.toLowerCase().includes(name.trim().toLowerCase())) { setIsError(true); return setMessage('Password must not be similar to your name') }
    try {
      await registerUser(registerForm)
      setIsError(false)
      setMessage('Registered successfully. Please login.')
      setRegisterForm({ name: '', email: '', password: '', role: 'viewer' })
      setAuthPage('login')
    } catch (error) {
      setIsError(true)
      setMessage(error.response?.data?.message || 'Registration failed. Please try again.')
    }
  }

  const onLogin = async (event) => {
    event.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginForm.email)) { setIsError(true); return setMessage('Enter a valid email address') }
    if (!loginForm.password) { setIsError(true); return setMessage('Password is required') }
    try {
      const data = await loginUser(loginForm)
      setToken(data.token)
      setRole(data.role)
      localStorage.setItem('token', data.token)
      localStorage.setItem('role', data.role)
      setIsError(false)
      setMessage('Logged in successfully')
      setLoginForm({ email: '', password: '' })
    } catch (error) {
      setIsError(true)
      setMessage(error.response?.data?.message || 'Login failed. Please try again.')
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
    if (!recordForm.amount || isNaN(recordForm.amount) || Number(recordForm.amount) <= 0)
      { setIsError(true); return setMessage('Amount must be a positive number') }
    if (!recordForm.category.trim()) { setIsError(true); return setMessage('Category is required') }
    try {
      if (editRecordId) {
        await updateRecord(token, editRecordId, {
          ...recordForm,
          amount: Number(recordForm.amount),
        })
        setIsError(false)
        setMessage('Record updated')
      } else {
        await createRecord(token, {
          ...recordForm,
          amount: Number(recordForm.amount),
        })
        setIsError(false)
        setMessage('Record created')
      }
      setEditRecordId('')
      setRecordForm({ amount: '', type: 'income', category: '', note: '' })
      await loadRecords()
    } catch (error) {
      setIsError(true)
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
      <header className="app-header">
        <h1>Finance Dashboard</h1>
        <p>Manage your income, expenses & analytics</p>
      </header>

      <p className={`message ${isError ? 'message-error' : ''}`}>{message}</p>

      {!token ? (
        <div className="auth-wrapper">
          {authPage === 'login' ? (
            <form className="card auth-card" onSubmit={onLogin}>
              <h2><span className="icon">🔐</span> Sign In</h2>
              <label>Email</label>
              <input type="email" placeholder="john@example.com" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} required />
              <label>Password</label>
              <input type="password" placeholder="••••••" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} required />
              <button type="submit">Sign In</button>
              <p className="auth-switch">Don't have an account? <span onClick={() => { setAuthPage('register'); setMessage(''); }}>Create one</span></p>
            </form>
          ) : (
            <form className="card auth-card" onSubmit={onRegister}>
              <h2><span className="icon">📝</span> Create Account</h2>
              <label>Full Name</label>
              <input placeholder="John Doe" value={registerForm.name} onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })} required />
              <label>Email</label>
              <input type="email" placeholder="john@example.com" value={registerForm.email} onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })} required />
              <label>Password</label>
              <input type="password" placeholder="••••••" value={registerForm.password} onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })} required />
              <label>Role</label>
              <select value={registerForm.role} onChange={(e) => setRegisterForm({ ...registerForm, role: e.target.value })}>
                <option value="viewer">Viewer</option>
                <option value="analyst">Analyst</option>
                <option value="admin">Admin</option>
              </select>
              <button type="submit">Create Account</button>
              <p className="auth-switch">Already have an account? <span onClick={() => { setAuthPage('login'); setMessage(''); }}>Sign in</span></p>
            </form>
          )}
        </div>
      ) : (
        <>
          <section className="top-bar">
            <div className="user-info">
              <div className="avatar">{role[0]?.toUpperCase()}</div>
              <div>
                <strong>Welcome back!</strong>
                <span className="role-badge">{role}</span>
              </div>
            </div>
            <button className="btn-logout" onClick={onLogout}>Logout</button>
          </section>

          <section className="tabs">
            <button className={activeTab === 'records' ? 'active' : ''} onClick={() => setActiveTab('records')}>📋 Records</button>
            {(isAnalyst || isAdmin) && (
              <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>📊 Dashboard</button>
            )}
            {isAdmin && (
              <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>👥 Users</button>
            )}
          </section>

          {activeTab === 'records' && (
            <section className="grid two-col">
              <div className="card">
                <h2><span className="icon">🔍</span> Filter Records</h2>
                <label>Type</label>
                <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
                  <option value="">All Types</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
                <label>Category</label>
                <input placeholder="e.g. Salary, Food, Rent" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} />
                <button className="btn-secondary" onClick={loadRecords}>Apply Filters</button>
              </div>

              {isAdmin && (
                <form className="card" onSubmit={onRecordSubmit}>
                  <h2><span className="icon">{editRecordId ? '✏️' : '➕'}</span> {editRecordId ? 'Update Record' : 'New Record'}</h2>
                  <label>Amount</label>
                  <input type="number" placeholder="0.00" value={recordForm.amount} onChange={(e) => setRecordForm({ ...recordForm, amount: e.target.value })} required />
                  <label>Type</label>
                  <select value={recordForm.type} onChange={(e) => setRecordForm({ ...recordForm, type: e.target.value })}>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                  <label>Category</label>
                  <input placeholder="e.g. Salary" value={recordForm.category} onChange={(e) => setRecordForm({ ...recordForm, category: e.target.value })} required />
                  <label>Note</label>
                  <input placeholder="Optional description" value={recordForm.note} onChange={(e) => setRecordForm({ ...recordForm, note: e.target.value })} />
                  <button type="submit">{editRecordId ? 'Save Changes' : 'Add Record'}</button>
                </form>
              )}

              <div className="card full-width">
                <h2><span className="icon">📄</span> Records ({records.length})</h2>
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
                          <td className={`amount amount-${record.type}`}>
                            {record.type === 'income' ? '+' : '-'}{record.amount}
                          </td>
                          <td><span className={`badge badge-${record.type}`}>{record.type}</span></td>
                          <td>{record.category}</td>
                          <td>{record.note || '—'}</td>
                          {isAdmin && (
                            <td>
                              <div className="btn-group">
                                <button className="btn-edit" onClick={() => onEditRecord(record)}>Edit</button>
                                <button className="btn-delete" onClick={() => onDeleteRecord(record._id)}>Delete</button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                      {!records.length && (
                        <tr className="empty-row">
                          <td colSpan={isAdmin ? 5 : 4}>No records found. {isAdmin ? 'Create one above!' : ''}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'dashboard' && (isAnalyst || isAdmin) && (
            <section>
              <div className="card" style={{ marginBottom: 20 }}>
                <h2><span className="icon">📊</span> Financial Summary</h2>
                <button onClick={loadDashboard} style={{ marginBottom: 16 }}>Load Dashboard</button>
                {summary && (
                  <div className="stats-grid">
                    <div className="stat-card income">
                      <div className="stat-label">Total Income</div>
                      <div className="stat-value">+{summary.totalIncome}</div>
                    </div>
                    <div className="stat-card expense">
                      <div className="stat-label">Total Expense</div>
                      <div className="stat-value">-{summary.totalExpense}</div>
                    </div>
                    <div className="stat-card balance">
                      <div className="stat-label">Net Balance</div>
                      <div className="stat-value">{summary.netBalance}</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="card">
                <h2><span className="icon">🏷️</span> Category Breakdown</h2>
                {categoryData.length ? (
                  <ul className="category-list">
                    {categoryData.map((item) => (
                      <li className="category-item" key={item._id}>
                        <span className="category-name">{item._id}</span>
                        <span className="category-total">{item.total}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ color: '#94a3b8', fontSize: 14 }}>Click "Load Dashboard" to view data</p>
                )}
              </div>
            </section>
          )}

          {activeTab === 'users' && isAdmin && (
            <section className="card">
              <h2><span className="icon">👥</span> All Users</h2>
              <button onClick={loadUsers} style={{ marginBottom: 16 }}>Load Users</button>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td><strong>{user.name}</strong></td>
                        <td>{user.email}</td>
                        <td><span className="badge badge-income">{user.role}</span></td>
                        <td><span className={user.isActive ? 'status-active' : 'status-inactive'}>{user.isActive ? '● Active' : '● Inactive'}</span></td>
                      </tr>
                    ))}
                    {!users.length && (
                      <tr className="empty-row">
                        <td colSpan={4}>Click "Load Users" to view data</td>
                      </tr>
                    )}
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
