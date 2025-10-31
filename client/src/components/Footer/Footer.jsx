import './Footer.css'


const Footer = () => {
    return (
        <div className='footer'>
            <footer className="py-3 my-4">
                    <ul className="nav justify-content-center pb-3 mb-3">
                        <li className="nav-item"><a href="#" className="nav-link px-2 custom-text-body-secondary">Home</a></li>
                        <li className="nav-item"><a href="#" className="nav-link px-2 custom-text-body-secondary">Scanner</a></li>
                        <li className="nav-item"><a href="#" className="nav-link px-2 custom-text-body-secondary">Login</a></li>
                        <li className="nav-item"><a href="#" className="nav-link px-2 custom-text-body-secondary">Register</a></li>
                    </ul>
                           <p className="text-center custom-text-body-secondary">GreenLens © 2025 - Amy, Teh, Edgardo, Nia</p>
            </footer>
        </div>
    )
}


export default Footer