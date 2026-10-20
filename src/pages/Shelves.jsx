import { useState } from 'react';
import BookCard from '../components/BookCard.jsx';
import StateMessage from '../components/StateMessage.jsx';
import { shelfNames, useShelves } from '../context/ShelfContext.jsx';

function Shelves() {
  const { shelves } = useShelves();
  const [activeShelf, setActiveShelf] = useState('Want to Read');

  const books = shelves[activeShelf];

  return (
    <section className="content-section">
      <div className="page-intro">
        <div className="eyebrow">Your reading space</div>
        <h1>My shelves</h1>
        <p>
          Keep track of books you want to read, books you started, and stories
          you finished.
        </p>
      </div>

      <div className="shelf-tabs" role="tablist">
        {shelfNames.map((name) => (
          <button
            key={name}
            className={activeShelf === name ? 'active' : ''}
            onClick={() => setActiveShelf(name)}
          >
            {name}
            <span>{shelves[name].length}</span>
          </button>
        ))}
      </div>

      {books.length === 0 ? (
        <StateMessage
          title="This shelf is empty"
          text="Search for a book and add it here when you are ready."
        />
      ) : (
        <div className="book-grid">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </section>
  );
}

export default Shelves;
