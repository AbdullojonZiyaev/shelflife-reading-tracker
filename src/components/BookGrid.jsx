import BookCard from './BookCard.jsx';

// Discover and Shelves both show the same grid of cards, so the grid
// is one component that takes the list it should render as a prop.
function BookGrid({ books }) {
  return (
    <div className="book-grid">
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
}

export default BookGrid;
