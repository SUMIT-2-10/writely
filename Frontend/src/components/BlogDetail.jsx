import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { request } from './api'

function BlogDetail({ user }) {
  const { blogId } = useParams()
  const [data, setData] = useState(null)
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')
  const load = useCallback(() => request(`/api/blogs/${blogId}`).then(setData).catch((err) => setError(err.message)), [blogId])

  useEffect(() => { load() }, [load])

  const submitComment = async (event) => {
    event.preventDefault()
    try {
      await request(`/api/blogs/${blogId}/comments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: comment }) })
      setComment('')
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  const isOwner = user && data && String(user._id) === String(data.blog.createdBy?._id)

  const deleteBlog = async () => {
    if (!window.confirm('Delete this blog permanently?')) return
    try {
      await request(`/api/blogs/${blogId}`, { method: 'DELETE' })
      window.location.href = '/'
    } catch (err) {
      setError(err.message)
    }
  }

  if (error) return <main className="form-page"><div className="empty-state error-state">{error}</div></main>
  if (!data) return <main className="form-page"><div className="empty-state">Loading post...</div></main>
  return <main className="detail-page"><article className="detail-card">{data.blog.coverImageURL && <img className="detail-cover" src={data.blog.coverImageURL} alt="" />}<span className="section-kicker">Blog post</span><h1>{data.blog.title}</h1><div className="detail-meta">By {data.blog.createdBy?.fullname || 'Member'} · {new Date(data.blog.createdAt).toLocaleDateString()}</div>{isOwner && <div className="blog-actions"><Link className="text-link" to={`/blog/${blogId}/edit`}>Edit post</Link><button className="text-link danger-link" type="button" onClick={deleteBlog}>Delete post</button></div>}<p className="detail-content">{data.blog.content}</p></article><section className="comments-card"><h2>Comments ({data.comments.length})</h2>{data.comments.length === 0 && <p className="muted">No comments yet. Be the first to comment.</p>}{data.comments.map((item) => <div className="comment" key={item._id}><strong>{item.createdBy?.fullname || 'Member'}</strong><small>{new Date(item.createdAt).toLocaleDateString()}</small><p>{item.content}</p></div>)}{user ? <form onSubmit={submitComment} className="comment-form"><textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Write a comment..." required /><button className="primary-button" type="submit">Add comment</button></form> : <Link to="/user/signin" className="text-link">Sign in to comment</Link>}</section></main>
}

export default BlogDetail
