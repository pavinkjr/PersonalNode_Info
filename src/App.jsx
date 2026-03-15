import { Routes, Route, Link, NavLink } from 'react-router-dom'
import './App.css'
import HomePage from './pages/HomePage'
import SpecPage from './pages/SpecPage'

function App() {
  return (
    <>
      <nav className="nav">
        <div className="nav-inner">
          <Link to="/" className="nav-logo">PersonalNode</Link>
          <ul className="nav-links">
            <li><NavLink to="/" end><span className="nav-label">Overview</span><span className="nav-icon" title="Overview"><svg width="18" height="18" viewBox="0 0 24 24"><path d="M4 13h6c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v8c0 .55.45 1 1 1zm0 8h6c.55 0 1-.45 1-1v-4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1zm10 0h6c.55 0 1-.45 1-1v-8c0-.55-.45-1-1-1h-6c-.55 0-1 .45-1 1v8c0 .55.45 1 1 1zM13 4v4c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1h-6c-.55 0-1 .45-1 1z"/></svg></span></NavLink></li>
            <li><NavLink to="/spec"><span className="nav-label">Full Specification</span><span className="nav-icon" title="Full Specification"><svg width="18" height="18" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13zM6 20V4h5v7h7v9H6z"/></svg></span></NavLink></li>
          </ul>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/spec" element={<SpecPage />} />
      </Routes>

      <footer className="footer">
        PersonalNode Protocol &mdash; Specification v0.3 (Draft)
      </footer>
    </>
  )
}

export default App
