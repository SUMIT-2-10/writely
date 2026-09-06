import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { request } from './api'

function Home() {
  const [blogs, setBlogs] = useState([])
  const [activeCategory, setActiveCategory] = useState('All posts')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    request('/api/blogs').then(setBlogs).catch((err) => setError(err.message)).finally(() => setLoading(false))
  }, [])

  const categories = useMemo(() => ['All posts', ...new Set(blogs.map((blog) => blog.category).filter(Boolean))], [blogs])
  const normalizedQuery = query.trim().toLowerCase()
  const filteredBlogs = blogs.filter((blog) => {
    const matchesCategory = activeCategory === 'All posts' || blog.category === activeCategory
    const searchableText = `${blog.title} ${blog.content} ${blog.createdBy?.fullname || ''}`.toLowerCase()
    return matchesCategory && searchableText.includes(normalizedQuery)
  })

  return (
    <main>
      <section className="intro"><div className="eyebrow"><span /> A community blog</div><h1>Read. Write.<br /><em>Share.</em></h1><p className="intro-copy">A place to discover real perspectives and publish your own ideas.</p><Link className="text-link" to="/blog/create">Write a blog <span>↓</span></Link></section>
      <section className="posts" id="posts">
        <div className="section-heading"><div><span className="section-kicker">Community writing</span><h2>Latest posts</h2></div>{!loading && <span className="story-count">{filteredBlogs.length} posts</span>}</div>
        <div className="toolbar"><div className="category-tabs">{categories.map((category) => <button className={activeCategory === category ? 'selected' : ''} type="button" onClick={() => setActiveCategory(category)} key={category}>{category}</button>)}</div><label className="search"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search posts" aria-label="Search posts" /></label></div>
        {loading && <div className="empty-state">Loading posts...</div>}
        {error && <div className="empty-state error-state">{error}</div>}
        {!loading && !error && filteredBlogs.length === 0 && <div className="empty-state"><strong>{blogs.length === 0 ? 'No posts yet.' : 'No matching posts.'}</strong><span>{blogs.length === 0 ? 'Sign in and publish the first blog.' : 'Try a different title, author, or keyword.'}</span>{blogs.length === 0 ? <Link className="primary-button" to="/user/signin">Sign in</Link> : <button className="primary-button" type="button" onClick={() => setQuery('')}>Show all posts</button>}</div>}
        {!loading && !error && filteredBlogs.length > 0 && <div className="article-grid">{filteredBlogs.map((blog) => <article className="article-card" key={blog._id}><Link to={`/blog/${blog._id}`} className="card-art">{blog.coverImageURL ? <img src={blog.coverImageURL} alt="" /> : <span className="no-cover">No cover image</span>}</Link><div className="card-body"><div className="article-meta"><span>{blog.createdBy?.fullname || 'Member'}</span><span>·</span><span>{new Date(blog.createdAt).toLocaleDateString()}</span></div><h3>{blog.title}</h3><p>{blog.content}</p><Link className="card-read-link" to={`/blog/${blog._id}`}>Read post <span>→</span></Link></div></article>)}</div>}
      </section>
      <section className="write-banner"><div><span className="section-kicker">Your voice belongs here</span><h2>Have an idea?<br />Publish your blog.</h2></div><Link className="primary-button" to="/blog/create">Add blog <span>↗</span></Link></section>
    </main>
  )
}

export default Home
