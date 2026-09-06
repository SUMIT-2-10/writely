import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { request } from './api'

function EditBlog() {
  const { blogId } = useParams()
  const navigate = useNavigate()
  const [blog, setBlog] = useState(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    request(`/api/blogs/${blogId}`)
      .then(({ blog: currentBlog }) => {
        setBlog(currentBlog)
        setTitle(currentBlog.title)
        setContent(currentBlog.content)
      })
      .catch((err) => setError(err.message))
  }, [blogId])

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    const formData = new FormData(event.currentTarget)
    try {
      const updatedBlog = await request(`/api/blogs/${blogId}`, { method: 'PATCH', body: formData })
      navigate(`/blog/${updatedBlog._id}`)
    } catch (err) {
      setError(err.message)
    }
  }

  if (error) return <main className="form-page"><div className="empty-state error-state">{error}</div></main>
  if (!blog) return <main className="form-page"><div className="empty-state">Loading post...</div></main>

  return <main className="form-page"><form className="blog-form" onSubmit={submit}><span className="section-kicker">Edit blog post</span><h1>Refine your idea</h1><label>Replace cover image<input name="coverImage" type="file" accept="image/*" /></label><label>Title<input name="title" value={title} onChange={(event) => setTitle(event.target.value)} required /></label><label>Content<textarea name="content" value={content} onChange={(event) => setContent(event.target.value)} required /></label>{error && <div className="form-error">{error}</div>}<button className="primary-button" type="submit">Save changes <span>↗</span></button></form></main>
}

export default EditBlog
