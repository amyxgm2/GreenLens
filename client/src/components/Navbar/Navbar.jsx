import './Navbar.css'
import { Link } from 'react-router-dom'
import { useState } from 'react'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)

  // Close menu when any link is clicked
  const handleLinkClick = () => setIsOpen(false)

  return (
    <nav className="navbar">
      {/* LEFT SIDE: Logo + Nav Links */}
      <div className="nav-left">
        <div className="logo">
          <Link to="/" onClick={handleLinkClick}>
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

        {/* Nav menu (Home, Scanner, and mobile Login/Register) */}
        <ul className={`nav-menu ${isOpen ? 'open' : ''}`}>
          <li><Link to="/" onClick={handleLinkClick}>Home</Link></li>
          <li><Link to="/analyzer" onClick={handleLinkClick}>Analyzer</Link></li>
          <li className="mobile-only"><Link to="/login" onClick={handleLinkClick}>Login</Link></li>
          <li className="mobile-only"><Link to="/register" onClick={handleLinkClick}>Register</Link></li>
        </ul>
      </div>

      {/* RIGHT SIDE (Desktop only) */}
      <div className="nav-login desktop-only">
        <Link to="/login"><button>Login</button></Link>
        <Link to="/register"><button>Register</button></Link>
      </div>
    </nav>
  )
}

export default Navbar


