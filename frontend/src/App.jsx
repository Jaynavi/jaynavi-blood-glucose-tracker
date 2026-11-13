
import { useState } from 'react'
import './App.css'

// Get today's date in local time
function getLocalDate() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function App() {
  const [page, setPage] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState('')
  const [readings, setReadings] = useState([])
  const [date, setDate] = useState(getLocalDate())
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

  const today = getLocalDate()

  // Normalize database date values
  const getReadingDate = (reading) => {
    return String(reading.date).slice(0, 10)
  }

  // Reports for selected date
  const todayReadings = readings.filter(
    r => getReadingDate(r) === date
  )

  // Month-to-date: first day of selected month to selected date
  const monthReadings = readings.filter(r => {
    const readingDate = getReadingDate(r)
    const firstDay = `${date.slice(0, 7)}-01`

    return readingDate >= firstDay && readingDate <= date
  })

  // Complete previous month
  const selectedDate = new Date(`${date}T00:00:00`)
  const previousMonthDate = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth() - 1,
    1
  )

  const previousMonth = `${previousMonthDate.getFullYear()}-${String(
    previousMonthDate.getMonth() + 1
  ).padStart(2, '0')}`

  const previousMonthReadings = readings.filter(r => {
    return getReadingDate(r).slice(0, 7) === previousMonth
  })

  // Actual dashboard today's readings
  const dashboardTodayReadings = readings.filter(
    r => getReadingDate(r) === today
  )

  const currentMonthReadings = readings.filter(r => {
    return getReadingDate(r).slice(0, 7) === today.slice(0, 7)
  })

  const average = list => list.length
    ? (
        list.reduce((sum, r) => sum + Number(r.value), 0) /
        list.length
      ).toFixed(1)
    : '0.0'

  async function handleAuth(e) {
    e.preventDefault()

    if (!email || !password) {
      setMessage('Please enter email and password')
      return
    }

    if (page === 'signup' && !name) {
      setMessage('Please enter your name')
      return
    }

    try {
      const endpoint = page === 'signup' ? 'signup' : 'login'

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
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong')
      }

      localStorage.setItem('token', data.token)

      const readingResponse = await fetch(
        'http://localhost:5000/api/readings',
        {
          headers: {
            Authorization: `Bearer ${data.token}`
          }
        }
      )

      const readingData = await readingResponse.json()

      if (!readingResponse.ok) {
        throw new Error(
          readingData.message || 'Could not load readings'
        )
      }

      setReadings(readingData)
      setUser(data.user.name)
      setDate(getLocalDate())
      setMessage('Login successful!')
      setPage('dashboard')

    } catch (error) {
      setMessage(error.message)
    }
  }

  async function addReading(e) {
    e.preventDefault()

    const number = Number(value)

    if (!date || value === '' || !Number.isInteger(number) ||
        number < 40 || number > 600) {
      setMessage('Value must be between 40 and 600 mg/dl.')
      return
    }

    if (date > getLocalDate()) {
      setMessage('Date cannot be in the future.')
      return
    }

    try {
      const method = isEditing ? 'PUT' : 'POST'

      const url = isEditing
        ? `http://localhost:5000/api/readings/${editId}`
        : 'http://localhost:5000/api/readings'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
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
        date: String(data.reading.reading_date).slice(0, 10),
        slot: data.reading.time_slot,
        value: Number(data.reading.glucose_value)
      }

      if (isEditing) {
        setReadings(previous =>
          previous.map(r =>
            r.id === editId ? updatedReading : r
          )
        )
      } else {
        setReadings(previous => [...previous, updatedReading])
      }

      setValue('')
      setIsEditing(false)
      setEditId(null)
      setMessage(
        isEditing
          ? 'Reading updated successfully!'
          : 'Reading added successfully!'
      )
      setPage('history')

    } catch (error) {
      setMessage(error.message)
    }
  }

  function startEdit(reading) {
    setEditId(reading.id)
    setDate(getReadingDate(reading))
    setSlot(reading.slot)
    setValue(String(reading.value))
    setIsEditing(true)
    setMessage('')
    setPage('add')
  }

  async function deleteReading(id) {
    try {
      const response = await fetch(
        `http://localhost:5000/api/readings/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Could not delete reading')
      }

      setReadings(previous => previous.filter(r => r.id !== id))
      setMessage('Reading deleted successfully!')

    } catch (error) {
      setMessage(error.message)
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
    setDate(getLocalDate())
    setPage('login')
  }

  // Login and signup page
  if (page === 'login' || page === 'signup') {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="brand-icon">♥</div>
          <h1>Sweety</h1>
          <p className="subtitle">
            Your personal blood glucose tracker
          </p>

          <h2>
            {page === 'login' ? 'Welcome back!' : 'Create your account'}
          </h2>

          <form onSubmit={handleAuth}>
            {page === 'signup' && (
              <input
                placeholder="Your name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            )}

            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />

            <button className="primary-btn" type="submit">
              {page === 'login' ? 'Login' : 'Create account'}
            </button>
          </form>

          {message && <p className="message">{message}</p>}

          <p className="switch-text">
            {page === 'login'
              ? "Don't have an account? "
              : 'Already have an account? '}

            <span
              onClick={() => {
                setPage(page === 'login' ? 'signup' : 'login')
                setMessage('')
              }}
            >
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
        <h2>♥ Sweety</h2>
        <p className="side-user">Hello, {user}</p>

        <button onClick={() => {
          setMessage('')
          setPage('dashboard')
        }}>
          Dashboard
        </button>

        <button onClick={() => {
          setMessage('')
          setIsEditing(false)
          setEditId(null)
          setValue('')
          setDate(getLocalDate())
          setPage('add')
        }}>
          Add Reading
        </button>

        <button onClick={() => {
          setMessage('')
          setPage('history')
        }}>
          Reading History
        </button>

        <button onClick={() => {
          setMessage('')
          setDate(getLocalDate())
          setPage('reports')
        }}>
          Reports
        </button>

        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </aside>

      <main className="main-content">
        <header>
          <div>
            <h1>
              {page === 'dashboard'
                ? 'Dashboard'
                : page === 'add'
                  ? 'Add Reading'
                  : page === 'history'
                    ? 'Reading History'
                    : 'Reports'}
            </h1>
            <p>Track your blood glucose readings with ease.</p>
          </div>

          <span className="user-badge">{user}</span>
        </header>

        {message && <p className="message">{message}</p>}

        {/* DASHBOARD */}
        {page === 'dashboard' && (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <p>Today's readings</p>
                <h2>{dashboardTodayReadings.length}</h2>
              </div>

              <div className="stat-card">
                <p>Today's average</p>
                <h2>{average(dashboardTodayReadings)}</h2>
                <small>mg/dL</small>
              </div>

              <div className="stat-card">
                <p>Monthly readings</p>
                <h2>{currentMonthReadings.length}</h2>
              </div>
            </div>

            <div className="content-card">
              <h2>Welcome to Sweety!</h2>
              <p>
                Add your daily glucose readings and check your reports here.
              </p>

              <button
                className="primary-btn"
                onClick={() => {
                  setMessage('')
                  setIsEditing(false)
                  setEditId(null)
                  setValue('')
                  setDate(getLocalDate())
                  setPage('add')
                }}
              >
                + Add new reading
              </button>
            </div>
          </>
        )}

        {/* ADD AND EDIT READING */}
        {page === 'add' && (
          <div className="content-card form-card">
            <h2>
              {isEditing
                ? 'Update your glucose reading'
                : 'Enter your glucose reading'}
            </h2>

            <form onSubmit={addReading}>
              <label>Date</label>
              <input
                type="date"
                value={date}
                max={getLocalDate()}
                onChange={e => setDate(e.target.value)}
                required
              />

              <label>Time slot</label>
              <select
                value={slot}
                onChange={e => setSlot(e.target.value)}
              >
                {slots.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              <label>Glucose value (mg/dL)</label>
              <input
                type="number"
                min="40"
                max="600"
                step="1"
                placeholder="Example: 110"
                value={value}
                onChange={e => setValue(e.target.value)}
                required
              />

              <button className="primary-btn" type="submit">
                {isEditing ? 'Update reading' : 'Save reading'}
              </button>

              {isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false)
                    setEditId(null)
                    setValue('')
                    setMessage('')
                    setDate(getLocalDate())
                  }}
                >
                  Cancel edit
                </button>
              )}
            </form>
          </div>
        )}

        {/* READING HISTORY */}
        {page === 'history' && (
          <div className="content-card">
            <h2>All readings</h2>

            {readings.length === 0 ? (
              <p>No readings added yet.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Time slot</th>
                    <th>Value (mg/dL)</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {readings.map(r => (
                    <tr key={r.id}>
                      <td>
                        {new Date(`${getReadingDate(r)}T00:00:00`)
                          .toLocaleDateString('en-IN')}
                      </td>
                      <td>{r.slot}</td>
                      <td>{r.value}</td>
                      <td>
                        <button onClick={() => startEdit(r)}>
                          Edit
                        </button>

                        <button
                          className="delete-btn"
                          onClick={() => deleteReading(r.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* REPORTS */}
        {page === 'reports' && (
          <div className="content-card">
            <h2>Glucose reports</h2>

            <label>Select date</label>
            <input
              type="date"
              value={date}
              max={getLocalDate()}
              onChange={e => setDate(e.target.value)}
            />

            {/* DAILY REPORT */}
            <div className="report-box">
              <h3>Daily report</h3>

              {todayReadings.length === 0 ? (
                <p>No readings available.</p>
              ) : (
                <>
                  <p>
                    Count: {todayReadings.length} |
                    Highest: {Math.max(
                      ...todayReadings.map(r => Number(r.value))
                    )} |
                    Lowest: {Math.min(
                      ...todayReadings.map(r => Number(r.value))
                    )} |
                    Average: {average(todayReadings)} mg/dL
                  </p>

                  <h4>Daily readings</h4>

                  {todayReadings.map(r => (
                    <p key={r.id}>
                      {r.slot}: {r.value} mg/dL
                    </p>
                  ))}
                </>
              )}
            </div>

            {/* MONTH-TO-DATE REPORT */}
            <div className="report-box">
              <h3>Month-to-date report</h3>

              {monthReadings.length === 0 ? (
                <p>No readings available.</p>
              ) : (
                <p>
                  Count: {monthReadings.length} |
                  Highest: {Math.max(
                    ...monthReadings.map(r => Number(r.value))
                  )} |
                  Lowest: {Math.min(
                    ...monthReadings.map(r => Number(r.value))
                  )} |
                  Average: {average(monthReadings)} mg/dL
                </p>
              )}
            </div>

            {/* PREVIOUS MONTH REPORT */}
            <div className="report-box">
              <h3>Previous month report</h3>

              {previousMonthReadings.length === 0 ? (
                <p>No readings available.</p>
              ) : (
                <p>
                  Count: {previousMonthReadings.length} |
                  Highest: {Math.max(
                    ...previousMonthReadings.map(r => Number(r.value))
                  )} |
                  Lowest: {Math.min(
                    ...previousMonthReadings.map(r => Number(r.value))
                  )} |
                  Average: {average(previousMonthReadings)} mg/dL
                </p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
