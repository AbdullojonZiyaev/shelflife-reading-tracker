// Everything that talks to the Open Library API lives here, so the
// components never build a URL or touch fetch() themselves.

const API_BASE = 'https://openlibrary.org';

// Open Library returns a search result in one shape and a work record in
// another, so we flatten a search result into the shape our components use.
export function normalizeBook(book) {
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

export function imageFor(book, size = 'M') {
  return book.coverId
    ? `https://covers.openlibrary.org/b/id/${book.coverId}-${size}.jpg`
    : 'https://placehold.co/240x360/eadfcf/4d4037?text=No+cover';
}

export async function searchBooks(field, query) {
  const response = await fetch(
    `${API_BASE}/search.json?${field}=${encodeURIComponent(query)}&limit=12`,
  );
  if (!response.ok) throw new Error('The Open Library request failed.');
  const data = await response.json();
  return data.docs.map(normalizeBook);
}

export async function fetchWork(workId) {
  const response = await fetch(`${API_BASE}/works/${workId}.json`);
  if (!response.ok) throw new Error('Book details are not available right now.');
  return response.json();
}
