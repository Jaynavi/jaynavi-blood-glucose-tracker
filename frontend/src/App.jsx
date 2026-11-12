
import { useState } from 'react'
import './App.css'

function App() {
  const [page, setPage] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState('')
  const [readings, setReadings] = useState([])
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [slot, setSlot] = useState('Morning / fasting')
  const [value, setValue] = useState('')
  const [message, setMessage] = useState('')
  const [editId, setEditId] = useState(null)
const [isEditing, setIsEditing] = useState(false)

  const slots = [
    'Morning / fasting',
    'After breakfast',
    'After lunch',
    'After dinner'
  ]

  async function handleAuth(e) {
  e.preventDefault();

  if (!email || !password) {
    setMessage('Please enter email and password');
    return;
  }

  if (page === 'signup' && !name) {
    setMessage('Please enter your name');
    return;
  }

  try {
    const endpoint = page === 'signup' ? 'signup' : 'login';

    const response = await fetch(
      `http://localhost:5000/api/auth/${endpoint}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(
          page === 'signup'
            ? { name, email, password }
            : { email, password }
        )
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    localStorage.setItem('token', data.token);
    const readingResponse = await fetch('http://localhost:5000/api/readings', {
  headers: {
    'Authorization': `Bearer ${data.token}`
  }
});

const readingData = await readingResponse.json();

if (!readingResponse.ok) {
  throw new Error(readingData.message || 'Could not load readings');
}

setReadings(readingData);
    setUser(data.user.name);
    setMessage('Login successful!');
    setPage('dashboard');

  } catch (error) {
    setMessage(error.message);
  }
}
  
async function addReading(e) {
  e.preventDefault()
  const number = Number(value)

  if (!date || !value || !Number.isInteger(number) || number < 40 || number > 600) {
    setMessage('Enter a whole number between 40 and 600')
    return
  }

  if (date > new Date().toISOString().slice(0, 10)) {
    setMessage('Future dates are not allowed')
    return
  }

  try {
    const method = isEditing ? 'PUT' : 'POST'
const url = isEditing
  ? `http://localhost:5000/api/readings/${editId}`
  : 'http://localhost:5000/api/readings'
    const response = await fetch(url, {
  method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        reading_date: date,
        time_slot: slot,
        value: number
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Could not save reading')
    }

    
const updatedReading = {
  id: data.reading.id,
  date: data.reading.reading_date,
  slot: data.reading.time_slot,
  value: data.reading.glucose_value
}

if (isEditing) {
  setReadings(readings.map(r =>
    r.id === editId ? updatedReading : r
  ))
} else {
  setReadings([...readings, updatedReading])
}


    setValue('')
setIsEditing(false)
setEditId(null)
setMessage(isEditing ? 'Reading updated successfully!' : 'Reading added successfully!')
setPage('history')

  } catch (error) {
    setMessage(error.message)
  }
}


  const todayReadings = readings.filter(r => r.date === date)
  const monthReadings = readings.filter(r => r.date.slice(0, 7) === date.slice(0, 7))
  const average = list => list.length
    ? (list.reduce((sum, r) => sum + r.value, 0) / list.length).toFixed(1)
    : '0.0'
function startEdit(reading) {
  setEditId(reading.id)
  setDate(reading.date.slice(0, 10))
  setSlot(reading.slot)
  setValue(String(reading.value))
  setIsEditing(true)
  setMessage('')
  setPage('add')
}
      async function deleteReading(id) {
    try {
      const response = await fetch(`http://localhost:5000/api/readings/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Could not delete reading');
      }

      setReadings(readings.filter(r => r.id !== id));
      setMessage('Reading deleted successfully!');

    } catch (error) {
      setMessage(error.message);
    }
  }
  function logout() {
  localStorage.removeItem('token')
  setUser('')
  setReadings([])
  setPassword('')
  setIsEditing(false)
  setEditId(null)
  setMessage('')
  setPage('login')
}

  if (page === 'login' || page === 'signup') {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="brand-icon">♥</div>
          <h1>Jaynavi</h1>
          <p className="subtitle">Your personal blood glucose tracker</p>
          <h2>{page === 'login' ? 'Welcome back!' : 'Create your account'}</h2>
          <form onSubmit={handleAuth}>
            {page === 'signup' && (
              <input placeholder="Your name" value={name}
                onChange={e => setName(e.target.value)} required />
            )}
            <input type="email" placeholder="Email address" value={email}
              onChange={e => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" value={password}
              onChange={e => setPassword(e.target.value)} required />
            <button className="primary-btn" type="submit">
              {page === 'login' ? 'Login' : 'Create account'}
            </button>
          </form>
          {message && <p className="message">{message}</p>}
          <p className="switch-text">
            {page === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <span onClick={() => { setPage(page === 'login' ? 'signup' : 'login'); setMessage('') }}>
              {page === 'login' ? 'Sign up' : 'Login'}
            </span>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <h2>♥ Jaynavi</h2>
        <p className="side-user">Hello, {user}</p>
        <button onClick={() => setPage('dashboard')}>Dashboard</button>
        <button onClick={() => setPage('add')}>Add Reading</button>
        <button onClick={() => setPage('history')}>Reading History</button>
        <button onClick={() => setPage('reports')}>Reports</button>
        <button className="logout-btn" onClick={logout}>Logout</button>
      </aside>

      <main className="main-content">
        <header>
          <div>
            <h1>{page === 'dashboard' ? 'Dashboard' : page === 'add' ? 'Add Reading' : page === 'history' ? 'Reading History' : 'Reports'}</h1>
            <p>Track your blood glucose readings with ease.</p>
          </div>
          <span className="user-badge">{user}</span>
        </header>

        {message && <p className="message">{message}</p>}

        {page === 'dashboard' && (
          <>
            <div className="stats-grid">
              <div className="stat-card"><p>Today's readings</p><h2>{todayReadings.length}</h2></div>
              <div className="stat-card"><p>Today's average</p><h2>{average(todayReadings)}</h2><small>mg/dL</small></div>
              <div className="stat-card"><p>Monthly readings</p><h2>{monthReadings.length}</h2></div>
            </div>
            <div className="content-card">
              <h2>Welcome to Jaynavi!</h2>
              <p>Add your daily glucose readings and check your reports here.</p>
              <button className="primary-btn" onClick={() => { setMessage(''); setPage('add') }}>+ Add new reading</button>
            </div>
          </>
        )}

        {page === 'add' && (
          <div className="content-card form-card">
            <h2>Enter your glucose reading</h2>
            <form onSubmit={addReading}>
              <label>Date</label>
              <input type="date" value={date} max={new Date().toISOString().slice(0, 10)}
                onChange={e => setDate(e.target.value)} required />
              <label>Time slot</label>
              <select value={slot} onChange={e => setSlot(e.target.value)}>
                {slots.map(s => <option key={s}>{s}</option>)}
              </select>
              <label>Glucose value (mg/dL)</label>
              <input type="number" min="40" max="600" step="1" placeholder="Example: 110"
                value={value} onChange={e => setValue(e.target.value)} required />
              <button className="primary-btn" type="submit">
  {isEditing ? 'Update reading' : 'Save reading'}
</button>
            </form>
          </div>
        )}

        {page === 'history' && (
          <div className="content-card">
            <h2>All readings</h2>
            {readings.length === 0 ? <p>No readings added yet.</p> : (
              <table>
                <thead><tr><th>Date</th><th>Time slot</th><th>Value (mg/dL)</th><th>Action</th></tr></thead>
                <tbody>
                  {readings.map(r => (
                    <tr key={r.id}>
                      <td>{new Date(r.date).toLocaleDateString('en-IN')}</td><td>{r.slot}</td><td>{r.value}</td>
                      <td>
  <button onClick={() => startEdit(r)}>Edit</button>
  <button className="delete-btn" onClick={() => deleteReading(r.id)}>Delete</button>
</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {page === 'reports' && (
          <div className="content-card">
            <h2>Glucose reports</h2>
            <label>Select date</label>
            <input type="date" value={date} max={new Date().toISOString().slice(0, 10)}
              onChange={e => setDate(e.target.value)} />
            {[['Daily report', todayReadings], ['Month-to-date report', monthReadings],
              ['Previous month report', readings.filter(r => {
                const d = new Date(date + 'T00:00:00')
                d.setDate(1)
                d.setMonth(d.getMonth() - 1)
                return r.date.slice(0, 7) === d.toISOString().slice(0, 7)
              })]].map(([title, list]) => (
              <div className="report-box" key={title}>
                <h3>{title}</h3>
                {list.length === 0 ? <p>No readings available.</p> : (
                  <p>Count: {list.length} | Highest: {Math.max(...list.map(r => r.value))} | Lowest: {Math.min(...list.map(r => r.value))} | Average: {average(list)} mg/dL</p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default App
