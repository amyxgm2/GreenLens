import './Login.css'

const Login = () => {
  return (
    <main className="login-container">
      <form className="login-form">
        <img
          className="mb-4 login-logo"
          src="/GreenLens-Logo.svg"
          alt="GreenLens logo"
        />
        <h1 className="h3 mb-3 fw-normal">Please sign in</h1>

        <div className="form-floating">
          <input
            type="text"
            className="form-control"
            id="floatingInput"
            placeholder="username"
          />
          <label htmlFor="floatingInput">Username</label>
        </div>

        <div className="form-floating">
          <input
            type="password"
            className="form-control"
            id="floatingPassword"
            placeholder="Password"
          />
          <label htmlFor="floatingPassword">Password</label>
        </div>

        <div className="checkbox mb-3">
          <label>
            <input type="checkbox" value="remember-me" /> Remember me
          </label>
        </div>

        <button className="btn btn-success w-100 py-2" type="submit">
          Sign in
        </button>

        <p className="mt-3 mb-0 text-muted">
          Don’t have an account?{' '}
          <a href="/register" className="create-account-link">
            Create one
          </a>
        </p>

        <p className="mt-5 mb-3 text-muted small">© 2025 GreenLens</p>
      </form>
    </main>
  )
}

export default Login
