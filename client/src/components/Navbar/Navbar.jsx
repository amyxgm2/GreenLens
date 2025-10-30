import './Navbar.css'
import { Link } from 'react-router-dom'

const Navbar = () => {

    return (
        <div className="navbar">
            <div className="logo">
                <img src="#"></img>
            </div>
            <ul className="nav-menu">
                <li><Link to='/'>Home</Link></li>
                <li><Link to='/scanner'>Scanner</Link></li>
                <li><Link to='/history'>History</Link></li>
            </ul>
            <div className='nav-login'>               
                <Link to='/login'><button>Login</button></Link>
            </div>
        </div>
    )
}

export default Navbar