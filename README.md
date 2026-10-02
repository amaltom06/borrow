# Borrow

Borrow is a mobile-first React and Node.js MVP for lending useful things inside trusted communities: hostels, buildings, and neighborhoods. It intentionally focuses on community scoping and a clear lending lifecycle rather than payments or chat.

## Stack

- **Client:** React 18 + Vite, plain responsive CSS (mobile first)
- **API:** Node.js, Express, JWT and Mongoose
- **Database:** MongoDB

## Project structure

```
borrow/
  client/                 React single-page application
  server/src/models/      Mongoose domain models
  server/src/routes/      REST resources and transaction actions
  server/src/middleware/  JWT authentication
```

## Models

| Model | Purpose |
| --- | --- |
| `User` | Identity, password hash, profile, joined community IDs and lightweight activity counters. Email and phone both support authentication; one is required. |
| `Community` | Community hierarchy through optional `parent`, invite code, and embedded member roles. |
| `Item` | Owner-owned listing, availability, price snapshot source, and the communities in which it is visible. |
| `Request` | A text-based community ask, independent of a particular item. |
| `BorrowTransaction` | Immutable parties/item/price plus guarded lifecycle timestamps. |
| `Notification` | Small in-app notification record generated on borrowing actions. |

All visibility is community scoped. The item feed uses an aggregation pipeline that matches the caller's community IDs before it joins owner data, then sorts and limits results. This makes it straightforward to extend with cursors, category filters, and projection changes without leaking cross-community listings.

## Lifecycle

```
requested -- lender --> accepted -- borrower --> in_use -- borrower --> returned
     |                         |
     +----- either party ------+-----> cancelled
```

The API validates each state transition and updates the listing availability when a request is accepted or closes.

## Run locally

Prerequisites: Node.js 20+ and MongoDB (local server or Atlas).

1. Copy `server/.env.example` to `server/.env` and set `MONGODB_URI` and a long `JWT_SECRET`.
2. Install dependencies from the repository root:

   ```bash
   npm install
   ```

3. Start the API and client together:

   ```bash
   npm run dev
   ```

4. Open `http://localhost:5173`.

Or start each workspace with `npm run server` and `npm run client`.

## REST API

Authenticated routes require `Authorization: Bearer <jwt>`.

| Resource | Endpoints |
| --- | --- |
| Auth | `POST /api/auth/signup`, `POST /api/auth/login`, `GET /api/auth/me` |
| Communities | `GET/POST /api/communities`, `POST /api/communities/join`, `GET /api/communities/:id` |
| Items | `GET /api/items/feed`, `GET /api/items/mine`, `POST /api/items`, `GET/PATCH /api/items/:id` |
| Requests | `GET/POST /api/requests`, `PATCH /api/requests/:id` |
| Borrowing | `GET/POST /api/borrows`, `PATCH /api/borrows/:id/status` |
| Profiles | `GET /api/users/:id` |
| Notifications | `GET /api/notifications`, `PATCH /api/notifications/:id/read` |

`POST /api/items` accepts a `photoUrl`, which keeps the MVP storage-agnostic. A production deployment can replace it with an upload endpoint backed by S3/Cloudinary without changing the Item model.

## Deliberately excluded

Payments/escrow, push notifications, real-time chat, rating/review flow, location matching, and commercial rental integrations are deliberately not part of this MVP.
