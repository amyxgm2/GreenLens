import './Navbar.css'
import { Link } from 'react-router-dom'
import { useState } from 'react'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="navbar">
      {/* LEFT SIDE: Logo + Nav Links */}
      <div className="nav-left">
        <div className="logo">
          <Link to="/">
            <img src="/GreenLens-Logo.svg" alt="GreenLens logo" />
          </Link>
        </div>

        {/* Hamburger (visible only on mobile) */}
        <button
          className="menu-toggle"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation"
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>
      </div>

      {/* NAV MENU (includes all links) */}
      <ul className={`nav-menu ${isOpen ? 'open' : ''}`}>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/scanner">Scanner</Link></li>

        {/* These appear inside the hamburger menu on mobile */}
        <li className="mobile-login"><Link to="/login">Login</Link></li>
        <li className="mobile-register"><Link to="/register">Register</Link></li>
      </ul>

      {/* RIGHT SIDE (desktop only) */}
      <div className="nav-login">
        <Link to="/login"><button>Login</button></Link>
        <Link to="/register"><button>Register</button></Link>
      </div>
    </nav>
  )
}

export default Navbar



