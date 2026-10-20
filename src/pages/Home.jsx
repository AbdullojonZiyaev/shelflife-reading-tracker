import { useEffect, useState } from 'react';
import BookGrid from '../components/BookGrid.jsx';
import StateMessage from '../components/StateMessage.jsx';
import { searchBooks } from '../services/openLibrary.js';

function Home() {
  const [query, setQuery] = useState('javascript');
  const [field, setField] = useState('title');
  const [books, setBooks] = useState([]);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  async function runSearch(event) {
    event?.preventDefault();

    const cleanQuery = query.trim();
    if (!cleanQuery) {
      setStatus('error');
      setError('Please enter a title, author, or subject to search.');
      return;
    }

    setStatus('loading');
    setError('');
    try {
      setBooks(await searchBooks(field, cleanQuery));
      setStatus('success');
    } catch (requestError) {
      setStatus('error');
      setError(requestError.message || 'Something went wrong while loading books.');
    }
  }

  // Run one search on first load so the page is not empty.
  useEffect(() => {
    runSearch();
  }, []);

  return (
    <>
      <section className="hero">
        <div className="eyebrow">A calmer way to choose your next book</div>
        <h1>Find a book.<br /><em>Keep the story going.</em></h1>
        <p className="hero-copy">
          Search millions of books, save the ones that interest you, and keep
          your reading life in one simple place.
        </p>

        <form className="search-bar" onSubmit={runSearch}>
          <label className="sr-only" htmlFor="search">Search Open Library</label>
          <span className="search-icon">⌕</span>
          <input
            id="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by title, author, or subject"
          />
          <select
            value={field}
            onChange={(event) => setField(event.target.value)}
            aria-label="Search field"
          >
            <option value="title">Title</option>
            <option value="author">Author</option>
            <option value="subject">Subject</option>
          </select>
          <button className="primary-button" type="submit">Search</button>
        </form>
      </section>

      <section className="section-heading">
        <div>
          <div className="eyebrow">Open Library results</div>
          <h2>{status === 'success' ? `Books about ${query}` : 'Start exploring'}</h2>
        </div>
        <span className="result-count">{books.length} results</span>
      </section>

      {status === 'loading' && (
        <StateMessage
          title="Looking through the shelves…"
          text="We are getting the latest results from Open Library."
        />
      )}

      {status === 'error' && (
        <StateMessage
          title="We could not load those books"
          text={error}
          tone="error"
        />
      )}

      {status === 'success' && books.length === 0 && (
        <StateMessage
          title="No books found"
          text="Try a wider title, author, or subject search."
        />
      )}

      {status === 'success' && books.length > 0 && <BookGrid books={books} />}
    </>
  );
}

export default Home;
