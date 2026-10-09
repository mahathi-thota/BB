# BorrowBuddy – Borrow Instead of Buy

A college-only peer-to-peer borrowing demo. Students list items, request a loan, agree on a meeting point, return items and rate each other. Payments are simulated in a ledger; no money is moved.

## Requirements and setup

Node.js 18+, npm, and a running MongoDB instance are required. Copy `.env.example` to `.env` and set `MONGO_URI`, a strong `JWT_SECRET`, `CLIENT_URL`, and `MAX_BORROW_DAYS` (default 7). Borrowing is free; deposits are refundable security deposits.

From the repository root:

```sh
npm install
npm --prefix server install
npm --prefix client install
npm run seed
npm run dev
```

The API runs on port 5000 and Vite on port 5173. Registration collects date of birth (age is calculated from it), gender, college, branch, and residence type; hostellers must enter hostel block and room number. After signup, students sign in separately. Demo accounts use password `Password@123`; seeded college IDs range from `100000000001` upward. Run `npm test` for backend rule tests.

The interface adapts to phone, tablet, and laptop widths. For an app-style install on a phone or laptop, run `npm --prefix client run build` and `npm --prefix client run preview`, then use the browser's **Install app** / **Add to Home Screen** option. The production build includes a web app manifest, icon, and offline shell cache; sign-in and borrowing still require the API and MongoDB connection.

## API summary

| Area | Routes |
| --- | --- |
| Auth | `POST /api/auth/register`, `/login`, `/logout`; `GET /api/auth/me` |
| Items | `GET /api/items`, `/mine`, `/:id`; `POST /api/items`; `PATCH/DELETE /api/items/:id` |
| Borrowing | `POST /api/borrowings`; `GET /api/borrowings/mine`; `PATCH /api/borrowings/:id/{accept,decline,cancel,collect,return,confirm-return}` |
| Account | `GET /api/users/me/stats`, `/transactions`; `POST /api/borrowings/:id/rate` |
| Notifications/reports | `GET /api/notifications`; `POST /api/reports` |
| Metadata | `GET /api/meta/config` |

## Demo script

Sign in as a student other than the owner, search for a calculator, open its details, then request a pickup/return date and meeting place. Sign in as the listed owner in a second browser profile and accept. The borrower confirms collection and requests return; the owner confirms it. The borrower may then rate the owner. The simulated ledger holds the security deposit and refunds the full deposit after the owner confirms return.

Uploads are stored locally under `server/uploads`; replace `storage.js` with a Cloudinary adapter for hosted files. Seeded/new demo distances are random; replace the marked `distanceKm` assignment in the item service with a geolocation provider. ID-format verification is a demo hook, not real identity verification.
