# SceneIt UI

Angular frontend for SceneIt. The app provides a landing page, sectioned library screens for movies, series, and video games, plus an IMDb/OMDb-backed import workflow that talks to the backend API.

## Routes

- `/`: landing page with navigation into the library
- `/movies`: movie library management
- `/series`: series library management
- `/video-games`: video game library management
- `/imports`: OMDb import queue and run history

## Current Functionality

### App shell

- Shared header and footer wrap the routed pages.
- The header links to `Movies`, `Series`, `Video Games`, and `OMDb Imports`.

### Media library

- Load section-specific library data from the backend using a `kind` filter.
- Display media items in a sortable table.
- Sort by `title`, `genre`, `year`, and `rated`.
- Multi-select media items for bulk actions.
- Soft delete selected media items.
- Hard delete selected media items after browser confirmation.
- Automatically prune stale selected IDs after the list refreshes.
- Open a details modal from the table.
- Show extended metadata in the details modal when values exist.
- Add a movie, series, or video game through the shared add-media-item modal.
- Debounce OMDb-backed search in the add-media-item modal while the user types.
- Require at least 2 characters before running OMDb-backed search.
- Route OMDb search and lookup through the backend so the browser does not call OMDb directly.
- Surface duplicate-add conflicts as `already in your library`.
- Normalize legacy poster values into valid absolute image URLs before rendering.
- Show success and error feedback for load, add, search, lookup, and delete flows.

Library section behavior:

- `/movies` shows only media items whose normalized type resolves to `movie`
- `/series` shows only media items whose normalized type resolves to `series`
- `/video-games` shows only media items whose normalized type resolves to `videoGame`

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

- `src/app/app.routes.ts`: route map for `/`, `/movies`, `/series`, `/video-games`, and `/imports`
- `src/app/features/home/`: landing page
- `src/app/features/library/`: shared media library service, page shell, add modal, table, and details modal
- `src/app/features/movies/`: thin wrapper page for the movies section
- `src/app/features/series/`: thin wrapper page for the series section
- `src/app/features/video-games/`: thin wrapper page for the video games section
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

The frontend expects the SceneIt API to be available for all library and import flows.

Media library endpoints used by the UI:

- `GET /api/MediaItems`
- `GET /api/MediaItems?kind=movie`
- `GET /api/MediaItems?kind=series`
- `GET /api/MediaItems?kind=videoGame`
- `GET /api/MediaItems/{id}`
- `POST /api/MediaItems`
- `PATCH /api/MediaItems/{id}/soft-delete`
- `DELETE /api/MediaItems/{id}`
- `GET /api/MediaItems/search?query=...`
- `GET /api/MediaItems/search?query=...&kind=series`
- `GET /api/MediaItems/lookup/{imdbId}`

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

Run tests:

```bash
npm test -- --watch=false
```

The committed frontend specs currently cover 19 test cases across:

- wrapper-page rendering for movies, series, and video games
- media-item table multi-select and event emission
- stale selection pruning after the media list changes
- section filtering and generic library-shell wiring
- imports page queue/runs initialization
- IMDb lookup row patching
- debounced row-search wiring after queue reset
- row-state reindexing after queue row removal
- session-only automation feedback messaging

## Current Limitations

- The imports automation form is UI-only; there is no backend endpoint that persists those settings yet.
- The frontend assumes the backend is already running and reachable at the configured API base URL.
- The shared media workflow has been generalized, but the `movies` feature folder still contains the movies-specific wrapper page for route organization.
