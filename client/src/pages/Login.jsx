import './Login.css'


const Login = () => {
    return (
        <div className="login">
            <div className="form-content">
                <div className="form-img">
                    <img src="#" alt="image" />
                </div>
                <div className="form-signin">                   
                    <h2>Hello!</h2>
                    <p>Sign in to access your gallery</p>
                    <label className="username">
                        <input type="text" id="username" placeholder="Username" />
                    </label>
                    <label className="password">
                        <input type="password" id="password" placeholder="Password" />
                    </label>
                    <button className="login-button">Login</button>
                    <li className="create-acc">Create Account</li>
                </div>
            </div>
        </div>
    )
}

export default Login 