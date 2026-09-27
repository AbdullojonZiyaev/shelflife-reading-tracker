# ShelfLife

ShelfLife is a frontend-only React + Vite reading tracker for the ISTE 340 group project. It searches the Open Library API, shows book details, lets a user move books between three shelves, and keeps saved books in `localStorage`.

There is no backend, SQL database, or server-side code in this project. API requests are made directly from the browser, and shelf data is stored locally in the browser.

## Run locally

```bash
npm install
npm run dev
```

The application uses React Router for navigation, Context for shared shelf state, async/await for API requests, and responsive CSS for laptop and phone layouts. The `public/api-evidence.html` page is a static frontend evidence page for the Open Library request.
