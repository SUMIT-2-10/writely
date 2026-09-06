import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { request } from './components/api'
import AuthPage from './components/AuthPage'
import BlogDetail from './components/BlogDetail'
import CreateBlog from './components/CreateBlog'
import EditBlog from './components/EditBlog'
import Home from './components/Home'
import Layout from './components/Layout'

function App() {
  const [user, setUser] = useState(null)
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    request('/api/me').then((data) => setUser(data.user)).catch(() => {})
  }, [])

  return <BrowserRouter><Layout user={user} setUser={setUser} darkMode={darkMode} setDarkMode={setDarkMode}><Routes><Route path="/" element={<Home />} /><Route path="/user/signin" element={<AuthPage mode="signin" setUser={setUser} />} /><Route path="/user/signup" element={<AuthPage mode="signup" setUser={setUser} />} /><Route path="/blog/create" element={user ? <CreateBlog /> : <Navigate to="/user/signin" />} /><Route path="/blog/:blogId/edit" element={user ? <EditBlog /> : <Navigate to="/user/signin" />} /><Route path="/blog/:blogId" element={<BlogDetail user={user} />} /></Routes></Layout></BrowserRouter>
}

export default App
