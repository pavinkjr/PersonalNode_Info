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
            <li><NavLink to="/" end>Overview</NavLink></li>
            <li><NavLink to="/spec">Full Specification</NavLink></li>
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
