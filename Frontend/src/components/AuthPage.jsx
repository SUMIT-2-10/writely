import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { request } from './api'

function AuthPage({ mode, setUser }) {
  const isSignup = mode === 'signup'
  const navigate = useNavigate()
  const [form, setForm] = useState({ fullname: '', email: '', password: '' })
  const [error, setError] = useState('')

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    try {
      const data = await request(`/api/auth/${mode}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      setUser(isSignup ? data.user : (await request('/api/me')).user)
      navigate('/')
    } catch (err) {
      setError(err.message)
    }
  }

  return <main className="form-page"><form className="auth-card" onSubmit={submit}><span className="section-kicker">Writely account</span><h1>{isSignup ? 'Create your account' : 'Welcome back'}</h1><p>{isSignup ? 'Join the community and publish your own blogs.' : 'Sign in to publish a blog and join the conversation.'}</p>{isSignup && <label>Full name<input value={form.fullname} onChange={(event) => setForm({ ...form, fullname: event.target.value })} required /></label>}<label>Email address<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></label><label>Password<input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required /></label>{error && <div className="form-error">{error}</div>}<button className="primary-button" type="submit">{isSignup ? 'Create account' : 'Sign in'}</button><span className="form-switch">{isSignup ? 'Already have an account?' : 'New to Writely?'} <Link to={isSignup ? '/user/signin' : '/user/signup'}>{isSignup ? 'Sign in' : 'Create account'}</Link></span></form></main>
}

export default AuthPage
