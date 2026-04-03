# SceneIt UI

Angular frontend for SceneIt. The app currently focuses on browsing and managing the movie library exposed by the backend API.

## Current Functionality

- Browse the current movie library on the `/movies` route.
- View movie data in a sortable table.
- Multi-select movies for bulk actions.
- Soft delete selected movies.
- Hard delete selected movies with a confirmation prompt.
- Open a movie details modal from the `View Details` button.
- Add a movie through the search modal.
- Search and lookup for add-movie flows are routed through the backend, not directly from the browser to OMDb.
- Show success and error feedback for load, add, and delete flows.

## Project State Checkpoint

- Frontend repo: `/mnt/c/Users/Corne/source/repos/scene-it-ui`
- Movie table supports multi-select.
- Soft delete and hard delete are wired.
- Hard delete requires confirmation.
- Movie details modal exists with the current overlay UI.
- Details open from the `View Details` button in the table.
- OMDb-backed add/search flows now go through the backend API instead of exposing the OMDb key in the browser.
- Current verification status:
  - `npm run build` passes
  - `npm test -- --watch=false` passes with 12 tests
- Files of interest:
  - `src/app/features/movies/movie-details-modal/*`
  - `src/app/features/movies/movie-table/*`
  - `src/app/features/movies/movie-page/*`
- Likely next discussions:
  - admin UI for import queue and import runs
  - stronger import failure reporting and retry behavior in the UI
  - any future movie-library filters or management screens

## Tech Stack

- Angular 21
- RxJS
- Standalone components
- Vitest for unit tests

## Local Development

Install dependencies:

```bash
npm install
```

Start the frontend:

```bash
npm start
```

The Angular dev server runs at `http://localhost:4200/`.

## Backend Dependency

The UI expects the backend API to be available at:

- Development: `https://localhost:44383/api`
- Production/default build: `/api`

The development API base URL is configured in [src/environments/environment.development.ts](/mnt/c/Users/Corne/source/repos/scene-it-ui/src/environments/environment.development.ts).

Current movie management flows depend on these backend endpoints:

- `GET /api/Movies`
- `POST /api/Movies/add`
- `PATCH /api/Movies/{id}/soft-delete`
- `DELETE /api/Movies/{id}`
- `GET /api/Movies/search?query=...`
- `GET /api/Movies/lookup/{imdbId}`

## Scripts

- `npm start`: run the Angular dev server
- `npm run build`: create a production build
- `npm run watch`: build continuously in development mode
- `npm test -- --watch=false`: run the test suite once

## Testing

Run unit tests:

```bash
npm test -- --watch=false
```

Current frontend test coverage includes:

- movie page load and feedback flows
- soft delete and hard delete flows
- details modal state handling
- movie table selection and event emission
- stale selection pruning after the movie list changes

## Notes

- The frontend no longer stores the OMDb API key.
- OMDb-backed add/search flows now go through the backend so secrets stay server-side.
- After successful deletes, stale selected IDs are pruned automatically when the movie list refreshes.
