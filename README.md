# SceneIt UI

Angular frontend for SceneIt. The app currently provides a landing page, a movie-library management screen, and an OMDb import workflow that talks to the backend API.

## Routes

- `/`: landing page with navigation into the library
- `/movies`: movie library management
- `/imports`: OMDb import queue and run history

## Current Functionality

### App shell

- Shared header and footer wrap the routed pages.
- The header links to `Movies` and `OMDb Imports`.
- Several other header items are presentational only right now and do not route anywhere yet.

### Movie library

- Load the current movie library from the backend.
- Display movies in a sortable table.
- Sort by `title`, `genre`, `year`, and `rated`.
- Multi-select movies for bulk actions.
- Soft delete selected movies.
- Hard delete selected movies after browser confirmation.
- Automatically prune stale selected IDs after the movie list refreshes.
- Open a movie details modal from the table.
- Show extended metadata in the details modal when values exist.
- Add a movie through the add-movie modal.
- Debounce OMDb-backed search in the add-movie modal while the user types.
- Route OMDb search and lookup through the backend so the browser does not call OMDb directly.
- Surface duplicate-add conflicts as `already in your library`.
- Show success and error feedback for load, add, search, lookup, and delete flows.

### Imports screen

- Queue one or more IMDb IDs for later import.
- Search OMDb per queue row and select a returned result to fill the row.
- Look up a specific IMDb ID per queue row.
- Submit queued items to the backend through `POST /api/Imports/queue`.
- Show duplicate-skip feedback after queue submission.
- Trigger a manual import run with a configurable max-count value.
- Trigger a quick `Run now` action that uses the current automation form `maxCountPerRun` value.
- Display current queue state including status, attempts, last-attempt time, imported time, and error message.
- Display recent import runs with attempted, imported, duplicate, and failed counts.
- Keep automation settings in browser memory only for the current session.
- The automation form does not persist to the backend yet.

## Tech Stack

- Angular 21
- Standalone components
- Angular signals
- Reactive Forms
- RxJS
- HttpClient
- Vitest

## Project Structure

- `src/app/app.routes.ts`: route map for `/`, `/movies`, and `/imports`
- `src/app/features/home/`: landing page
- `src/app/features/movies/`: movie library UI, add flow, table, and details modal
- `src/app/features/imports/`: import queue, run history, and session-only automation form
- `src/app/shared/`: header and footer
- `src/environments/`: API base URL configuration

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

## Environment Configuration

The UI builds against these API base URLs:

- Development: `https://localhost:44383/api`
- Default / production build: `/api`

Environment files:

- `src/environments/environment.development.ts`
- `src/environments/environment.ts`

## Backend Dependency

The frontend expects the SceneIt API to be available for all movie-library and import flows.

Movies endpoints used by the UI:

- `GET /api/Movies`
- `GET /api/Movies/{id}`
- `POST /api/Movies/add`
- `PATCH /api/Movies/{id}/soft-delete`
- `DELETE /api/Movies/{id}`
- `GET /api/Movies/search?query=...`
- `GET /api/Movies/lookup/{imdbId}`

Imports endpoints used by the UI:

- `POST /api/Imports/queue`
- `GET /api/Imports/queue`
- `POST /api/Imports/run`
- `GET /api/Imports/runs`

## Scripts

- `npm start`: run the Angular dev server
- `npm run build`: create a production build
- `npm run watch`: build continuously in development mode
- `npm test -- --watch=false`: run the test suite once

## Testing

The committed frontend specs currently cover 17 test cases across:

- movie page load and feedback flows
- soft delete and hard delete flows
- details modal state handling
- movie table multi-select and event emission
- stale selection pruning after the movie list changes
- imports page queue/runs initialization
- IMDb lookup row patching
- debounced row-search wiring after queue reset
- row-state reindexing after queue row removal
- session-only automation feedback messaging

## Current Limitations

- The imports automation form is UI-only; there is no backend endpoint that persists those settings yet.
- The non-movie header items are placeholders today.
- The frontend assumes the backend is already running and reachable at the configured API base URL.
