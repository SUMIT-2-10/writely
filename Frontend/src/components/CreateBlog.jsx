import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { request } from './api'

function CreateBlog() {
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const submit = async (event) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    try {
      const blog = await request('/api/blogs', { method: 'POST', body: formData })
      navigate(`/blog/${blog._id}`)
    } catch (err) {
      setError(err.message)
    }
  }

  return <main className="form-page"><form className="blog-form" onSubmit={submit}><span className="section-kicker">New blog post</span><h1>Publish your idea</h1><label>Cover image<input name="coverImage" type="file" accept="image/*" /></label><label>Title<input name="title" placeholder="Give your blog a title" required /></label><label>Content<textarea name="content" placeholder="Write your blog here..." required /></label>{error && <div className="form-error">{error}</div>}<button className="primary-button" type="submit">Publish blog <span>↗</span></button></form></main>
}

export default CreateBlog
