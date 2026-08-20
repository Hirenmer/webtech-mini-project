# Web Technology Mini Project - Vercel Version

This version converts the uploaded PHP/MySQL backend to Vercel-compatible Node.js serverless API routes.

## What changed

- `index.php` -> `index.html`
- `db.php` -> `api/_db.js`
- PHP database queries -> Node.js `mysql2`
- `api/students.js` loads students
- `api/projects.js` validates and stores project submissions
- Student 1 is removed from Student 2 dropdown dynamically
- Student 1/2 duplicate and already-registered checks are enforced server-side
- Group number is generated automatically because the uploaded PHP form currently comments out the Group No. field.

## Database

Import `database.sql` into your MySQL-compatible cloud database.

Your existing `students` records can be retained. Do NOT reinsert them if they already exist.

## Vercel deployment

1. Create a GitHub repository and upload all files.
2. Import the repository into Vercel.
3. Add environment variable:
   `DATABASE_URL`
4. `DATABASE_URL` must be a MySQL connection URI, for example:
   `mysql://USERNAME:PASSWORD@HOST:3306/webtech_projects`
5. Deploy.
6. Open the Vercel URL.

## Important

Vercel does not provide a local WAMP-style MySQL server. Your database must be reachable from the internet and support MySQL connections. Use a managed MySQL-compatible provider.

The browser only calls `/api/students` and `/api/projects`; database credentials never appear in the frontend.

## Local test

Install Node.js and Vercel CLI, then:

npm install
npm run dev

Set `DATABASE_URL` in your local environment before running.
