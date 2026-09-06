import { Link, useNavigate } from 'react-router-dom'
import { request } from './api'

function Layout({ user, setUser, darkMode, setDarkMode, children }) {
  const navigate = useNavigate()

  const logout = async () => {
    await request('/api/auth/logout', { method: 'POST' })
    setUser(null)
    navigate('/')
  }

  return (
    <div className={darkMode ? 'app dark' : 'app'} id="top">
      <header className="site-header">
        <Link className="brand" to="/" aria-label="Writely home"><span className="brand-mark">W</span><span>Writely</span></Link>
        <nav className="main-nav" aria-label="Primary navigation"><Link to="/">Home</Link><a href="/#posts">All posts</a></nav>
        <div className="header-actions">
          <button className="icon-button" type="button" onClick={() => setDarkMode(!darkMode)} aria-label="Toggle dark mode">{darkMode ? '☼' : '◐'}</button>
          {user ? <><Link className="write-link" to="/blog/create">Add blog <span>↗</span></Link><span className="user-name">{user.fullname}</span><button className="auth-link button-link" type="button" onClick={logout}>Log out</button></> : <><Link className="auth-link" to="/user/signin">Sign in</Link><Link className="auth-link auth-link-primary" to="/user/signup">Create account</Link></>}
        </div>
      </header>
      {children}
      <footer><span>© 2026 Writely</span><span>Posts are created by our members</span><a href="#top">Back to top ↑</a></footer>
    </div>
  )
}

export default Layout
