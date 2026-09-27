import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';

const API_BASE = 'https://openlibrary.org';
const shelfNames = ['Want to Read', 'Reading', 'Finished'];
const ShelfContext = createContext(null);

const starterBooks = [
  {
    id: 'OL20915214W',
    title: 'Learning React',
    authors: ['Alex Banks', 'Eve Porcello'],
    year: 2018,
    coverId: 10282783,
    subjects: ['React', 'JavaScript', 'Web development'],
    description: 'A practical guide to building user interfaces with React and modern JavaScript.',
  },
  {
    id: 'OL19545984W',
    title: 'React and React Native',
    authors: ['Adam Boduch'],
    year: 2017,
    coverId: 8512119,
    subjects: ['React', 'React Native', 'Mobile applications'],
    description: 'A guide to creating reusable web and mobile interfaces with React and React Native.',
  },
];

function readShelves() {
  try {
    const saved = JSON.parse(localStorage.getItem('shelflife-shelves-v2'));
    return saved && typeof saved === 'object'
      ? saved
      : { 'Want to Read': starterBooks, Reading: [], Finished: [] };
  } catch {
    return { 'Want to Read': starterBooks, Reading: [], Finished: [] };
  }
}

function ShelfProvider({ children }) {
  const [shelves, setShelves] = useState(readShelves);

  useEffect(() => {
    localStorage.setItem('shelflife-shelves-v2', JSON.stringify(shelves));
  }, [shelves]);

  function moveBook(book, destination) {
    setShelves((current) => {
      const next = Object.fromEntries(
        shelfNames.map((name) => [
          name,
          current[name].filter((item) => item.id !== book.id),
        ]),
      );
      next[destination] = [...next[destination], book];
      return next;
    });
  }

  const allBooks = useMemo(() => shelfNames.flatMap((name) => shelves[name]), [shelves]);
  return (
    <ShelfContext.Provider value={{ shelves, allBooks, moveBook }}>
      {children}
    </ShelfContext.Provider>
  );
}

function useShelves() {
  return useContext(ShelfContext);
}

function imageFor(book, size = 'M') {
  return book.coverId
    ? `https://covers.openlibrary.org/b/id/${book.coverId}-${size}.jpg`
    : 'https://placehold.co/240x360/eadfcf/4d4037?text=No+cover';
}

function normalizeBook(book) {
  return {
    id: book.key?.replace('/works/', '') || book.id,
    title: book.title || 'Untitled book',
    authors: book.author_name || ['Unknown author'],
    year: book.first_publish_year || '—',
    coverId: book.cover_i || null,
    subjects: book.subject?.slice(0, 5) || [],
    description: book.first_sentence?.[0] || 'Description available on the book details page.',
  };
}

function App() {
  return (
    <ShelfProvider>
      <div className="app-shell">
        <Header />
        <main className="page-wrap">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shelves" element={<Shelves />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/book/:workId" element={<BookDetails />} />
          </Routes>
        </main>
        <footer className="footer">ShelfLife · built with React and Open Library</footer>
      </div>
    </ShelfProvider>
  );
}

function Header() {
  return (
    <header className="topbar">
      <Link className="brand" to="/">
        <span className="brand-mark">S</span>
        <span>ShelfLife</span>
      </Link>
      <nav className="nav-links" aria-label="Main navigation">
        <NavLink to="/" end>Discover</NavLink>
        <NavLink to="/shelves">My shelves</NavLink>
        <NavLink to="/stats">Stats</NavLink>
      </nav>
      <div className="reading-pill">{useShelves().allBooks.length} saved</div>
    </header>
  );
}

function Home() {
  const [query, setQuery] = useState('javascript');
  const [field, setField] = useState('title');
  const [books, setBooks] = useState([]);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  async function searchBooks(event) {
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
      const response = await fetch(`${API_BASE}/search.json?${field}=${encodeURIComponent(cleanQuery)}&limit=12`);
      if (!response.ok) throw new Error('The Open Library request failed.');
      const data = await response.json();
      setBooks(data.docs.map(normalizeBook));
      setStatus('success');
    } catch (requestError) {
      setStatus('error');
      setError(requestError.message || 'Something went wrong while loading books.');
    }
  }

  useEffect(() => {
    searchBooks();
  }, []);

  return (
    <>
      <section className="hero">
        <div className="eyebrow">A calmer way to choose your next book</div>
        <h1>Find a book.<br /><em>Keep the story going.</em></h1>
        <p className="hero-copy">Search millions of books, save the ones that interest you, and keep your reading life in one simple place.</p>
        <form className="search-bar" onSubmit={searchBooks}>
          <label className="sr-only" htmlFor="search">Search Open Library</label>
          <span className="search-icon">⌕</span>
          <input id="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by title, author, or subject" />
          <select value={field} onChange={(event) => setField(event.target.value)} aria-label="Search field">
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

      {status === 'loading' && <StateMessage title="Looking through the shelves…" text="We are getting the latest results from Open Library." />}
      {status === 'error' && <StateMessage title="We could not load those books" text={error} tone="error" />}
      {status === 'success' && books.length === 0 && <StateMessage title="No books found" text="Try a wider title, author, or subject search." />}
      {status === 'success' && books.length > 0 && <div className="book-grid">{books.map((book) => <BookCard key={book.id} book={book} />)}</div>}
    </>
  );
}

function StateMessage({ title, text, tone = '' }) {
  return <div className={`state-message ${tone}`}><span className="state-dot" /><div><strong>{title}</strong><p>{text}</p></div></div>;
}

function BookCard({ book }) {
  const { shelves, moveBook } = useShelves();
  const shelf = shelfNames.find((name) => shelves[name].some((item) => item.id === book.id));
  return (
    <article className="book-card">
      <Link to={`/book/${book.id}`} state={{ book }} className="cover-link">
        <img className="book-cover" src={imageFor(book)} alt={`Cover of ${book.title}`} />
      </Link>
      <div className="book-card-body">
        <div className="book-year">{book.year}</div>
        <Link to={`/book/${book.id}`} state={{ book }}><h3>{book.title}</h3></Link>
        <p className="book-author">{book.authors.join(', ')}</p>
        <div className="card-actions">
          <select value={shelf || ''} onChange={(event) => event.target.value && moveBook(book, event.target.value)} aria-label={`Shelf for ${book.title}`}>
            <option value="">Add to shelf</option>
            {shelfNames.map((name) => <option key={name} value={name}>{name}</option>)}
          </select>
          {shelf && <span className="saved-label">Saved</span>}
        </div>
      </div>
    </article>
  );
}

function Shelves() {
  const { shelves } = useShelves();
  const [activeShelf, setActiveShelf] = useState('Want to Read');
  const books = shelves[activeShelf];
  return (
    <section className="content-section">
      <div className="page-intro"><div className="eyebrow">Your reading space</div><h1>My shelves</h1><p>Keep track of books you want to read, books you started, and stories you finished.</p></div>
      <div className="shelf-tabs" role="tablist">{shelfNames.map((name) => <button key={name} className={activeShelf === name ? 'active' : ''} onClick={() => setActiveShelf(name)}>{name}<span>{shelves[name].length}</span></button>)}</div>
      {books.length === 0 ? <StateMessage title="This shelf is empty" text="Search for a book and add it here when you are ready." /> : <div className="book-grid">{books.map((book) => <BookCard key={book.id} book={book} />)}</div>}
    </section>
  );
}

function Stats() {
  const { shelves, allBooks } = useShelves();
  const decades = allBooks.reduce((result, book) => {
    const year = Number(book.year);
    if (!Number.isFinite(year)) return result;
    const decade = `${Math.floor(year / 10) * 10}s`;
    result[decade] = (result[decade] || 0) + 1;
    return result;
  }, {});
  const maxDecade = Math.max(...Object.values(decades), 1);
  return (
    <section className="content-section">
      <div className="page-intro"><div className="eyebrow">A small look at your reading</div><h1>Reading stats</h1><p>These numbers are based on the books currently saved in your shelves.</p></div>
      <div className="stat-cards">{shelfNames.map((name) => <div className="stat-card" key={name}><span>{name}</span><strong>{shelves[name].length}</strong><small>books</small></div>)}</div>
      <div className="chart-panel"><div className="panel-heading"><div><div className="eyebrow">Publication years</div><h2>Books by decade</h2></div><span className="muted">{allBooks.length} total books</span></div>{Object.keys(decades).length === 0 ? <StateMessage title="No dates to show yet" text="Add a few books to see a simple decade breakdown." /> : <div className="bar-chart">{Object.entries(decades).sort().map(([decade, count]) => <div className="bar-row" key={decade}><span>{decade}</span><div className="bar-track"><div className="bar-fill" style={{ width: `${(count / maxDecade) * 100}%` }} /></div><strong>{count}</strong></div>)}</div>}</div>
    </section>
  );
}

function BookDetails() {
  const { workId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { shelves, moveBook } = useShelves();
  const passedBook = location.state?.book;
  const [book, setBook] = useState(passedBook || { id: workId, title: 'Loading book…', authors: [], year: '—', coverId: null, subjects: [] });
  const [status, setStatus] = useState(passedBook ? 'loading' : 'loading');
  const [description, setDescription] = useState(passedBook?.description || '');

  useEffect(() => {
    let cancelled = false;
    async function loadDetails() {
      try {
        const response = await fetch(`${API_BASE}/works/${workId}.json`);
        if (!response.ok) throw new Error('Book details are not available right now.');
        const data = await response.json();
        if (cancelled) return;
        const text = typeof data.description === 'string' ? data.description : data.description?.value;
        setBook((current) => ({ ...current, title: data.title || current.title, subjects: data.subjects?.slice(0, 8) || current.subjects }));
        setDescription(text || passedBook?.description || 'This book does not have a description in Open Library yet.');
        setStatus('success');
      } catch {
        setStatus('error');
      }
    }
    loadDetails();
    return () => { cancelled = true; };
  }, [workId]);

  const currentShelf = shelfNames.find((name) => shelves[name].some((item) => item.id === book.id));
  return (
    <section className="details-layout">
      <button className="back-link" onClick={() => navigate(-1)}>← Back to results</button>
      <div className="details-card">
        <img className="details-cover" src={imageFor(book, 'L')} alt={`Cover of ${book.title}`} />
        <div className="details-copy"><div className="eyebrow">Book details</div><h1>{book.title}</h1><p className="detail-author">{book.authors?.join(', ') || 'Open Library author record'}</p><div className="detail-meta"><span>{book.year}</span><span>{book.subjects?.length || 0} subjects</span><span>{status === 'success' ? 'Open Library' : 'Loading details'}</span></div><p className="description">{status === 'error' ? 'The basic book information loaded, but the full description could not be reached.' : description}</p><div className="shelf-picker"><span>My shelf</span><div>{shelfNames.map((name) => <button key={name} className={currentShelf === name ? 'selected' : ''} onClick={() => moveBook(book, name)}>{name}</button>)}</div></div></div>
      </div>
      <div className="subjects-panel"><div className="eyebrow">Subjects</div><div className="subject-list">{(book.subjects?.length ? book.subjects : ['No subjects listed']).map((subject) => <span key={subject}>{subject}</span>)}</div></div>
    </section>
  );
}

export default App;
