# Bazaar Panun — Fabric & Suits E-Commerce

A full-featured e-commerce website for **Bazaar Panun**, a Kashmir based online store selling
unstitched & stitched suits, bridal wear, brocade fabric, pashmina shawls and clutches.

Built with Next.js (App Router), TypeScript and Tailwind CSS.

## Features

- **Storefront**: hero, category grid, featured/new-arrival rails, testimonials
- **Shop page**: category filter, price filter, search, sorting, responsive grid
- **Product pages**: image gallery, size/colour selection, quantity, related products
- **Cart & Wishlist**: persisted client-side with Zustand, free-shipping threshold logic
- **Checkout**: address form, Cash on Delivery or WhatsApp-confirmed orders, order confirmation page
- **Admin dashboard** (`/admin`): manage orders, products and photos, categories, contact messages,
  store settings, homepage content and the About/Contact pages
- **WhatsApp & Instagram integration**: floating chat button, WhatsApp order deep-links
- Fully responsive, mobile-first UI

## Getting Started (on your computer)

You need **Node.js 20+** and **MySQL** (MySQL Workbench / MySQL Server 8) running locally.

1. **Create the database.** In MySQL Workbench, connect to your local server and run:

   ```sql
   CREATE DATABASE bazaar_panun CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. **Set up your settings.** Copy `.env.example` to `.env` and fill in:
   - `DATABASE_URL` — e.g. `mysql://root:YOUR_MYSQL_PASSWORD@localhost:3306/bazaar_panun`
   - `ADMIN_PASSWORD` — the password for `/admin`
   - `ADMIN_SESSION_SECRET` — a long random string (the file shows how to generate one)

3. **Install, create the tables, and load the starting products:**

   ```bash
   npm install
   npm run db:migrate     # creates the tables
   npm run db:seed        # loads the 6 categories and 25 sample products
   npm run dev
   ```

Visit http://localhost:3000. You can browse the tables in MySQL Workbench (schema `bazaar_panun`)
or with `npm run db:studio`.

## Admin Access

Go to `/admin` and log in with the `ADMIN_PASSWORD` from your settings. The password is checked on the
server and the login is kept in a secure cookie for 12 hours (10 wrong attempts locks login for 15 minutes).

The admin has these tabs:

| Tab                | What you can do                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| **Orders**         | See orders with customer details, filter by status, change status (cancelling returns the stock)   |
| **Products**       | Add, edit, delete products; upload and reorder photos; price, stock, sizes, colours, labels        |
| **Categories**     | Add, edit, delete and reorder categories (used in the menu, footer, shop filters and homepage)     |
| **Messages**       | Read messages sent from the Contact page                                                          |
| **Store Settings** | Store name, logo, announcement bar, WhatsApp, Instagram, email, address, shipping fee, payment options, footer, SEO |
| **Homepage**       | Hero banner (image, text, buttons), highlights, section headings, show/hide sections, customer reviews |
| **Pages**          | About Us and Contact page text and images                                                          |

Changes are live on the website as soon as you save.

## Data

All data lives in MySQL:

| Table         | What it holds                                                         |
| ------------- | --------------------------------------------------------------------- |
| `categories`  | Shop categories                                                       |
| `products`    | Products, prices, stock, photos, sizes, colours                       |
| `orders`      | Customer details, totals, payment method, status                      |
| `order_items` | Items in each order (name and price saved as they were when ordered)  |
| `settings`    | Everything set in Store Settings, Homepage and Pages                  |
| `images`      | Uploaded photos (resized in the browser before upload, served from `/api/images/...`) |
| `messages`    | Contact form messages                                                 |

- The table layout is defined in `prisma/schema.prisma`. After changing it, run
  `npm run db:migrate -- --name what-changed` to create a migration in `prisma/migrations/`.
- Prices and totals are always calculated on the server from the database, never taken from the browser.
- Stock goes down when an order is placed, and comes back if the order is cancelled in the admin.
- Cart and wishlist are kept in the shopper's browser until checkout.
- Photos are stored in the database, so they survive redeploys on any host (no extra storage service needed).
- `npm run db:seed` loads the sample categories and products from `src/data/` **once** per database.
  After that it does nothing, so products or categories you delete in the admin never come back.
- Default texts for the website (used until you change them in the admin) are in `src/lib/settings-defaults.ts`.

## Deploying to Render (free, for testing)

Render runs the website; the database is a free hosted MySQL from [Aiven](https://aiven.io)
(Render only offers Postgres). The settings for Render are in `render.yaml`.

1. **Create the database on Aiven.** Sign up → Create service → **MySQL** → **Free plan** → pick a region
   close to your Render region. When it is running, open it and copy the **Service URI**. It looks like
   `mysql://avnadmin:PASSWORD@mysql-xxxx.aivencloud.com:12345/defaultdb?ssl-mode=REQUIRED`.
2. **Turn it into `DATABASE_URL`:** replace `?ssl-mode=REQUIRED` with `?sslaccept=accept_invalid_certs`:
   `mysql://avnadmin:PASSWORD@mysql-xxxx.aivencloud.com:12345/defaultdb?sslaccept=accept_invalid_certs`
   (the connection is encrypted). To also verify Aiven's certificate, use `?sslaccept=strict` instead and
   paste Aiven's **CA certificate** (Download CA cert on the service page) into `DATABASE_CA_CERT`.
3. **Create the site on Render.** Push this code to GitHub, then in Render: **New → Blueprint**, connect
   the repository and pick this branch. Render reads `render.yaml` and asks for:
   - `DATABASE_URL` — from step 2
   - `ADMIN_PASSWORD` — your admin password
   - `DATABASE_CA_CERT` — leave empty unless you chose `strict` in step 2
   (`ADMIN_SESSION_SECRET` is generated for you.)
   If you created the service by hand as a **Docker** web service instead, that works too: Render uses
   the `Dockerfile`, which sets up the tables when the site starts. Add the same environment variables
   (including `ADMIN_SESSION_SECRET`, a random string of 32+ characters) under **Environment**.
4. **Deploy.** Each deploy creates or updates the tables and, the first time only, loads the sample
   categories and products. Your site will be at `https://bazaar-panun.onrender.com` (or similar).

Free plan notes: the site sleeps after 15 minutes without visitors, so the first visit after that takes
up to a minute. Uploaded photos are stored in the database, so they are kept across deploys.

## Deploying to Hostinger

Hostinger provides MySQL/MariaDB with its hosting, which this site works with directly.

1. **Pick a plan that runs Node.js apps.** This is a Next.js app, so it needs Node.js hosting
   (check the plan lists Node.js support, e.g. Business/Cloud web hosting or a VPS). Plans that
   only support PHP/HTML will not run the shop or admin.
2. **Create the database** in hPanel → Databases → MySQL Databases. Note the database name,
   user, password and host.
3. **Set environment variables** in the Node.js app settings:
   `DATABASE_URL=mysql://USER:PASSWORD@HOST:3306/DATABASE`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`.
   If the password contains special characters such as `@ : / # ?`, URL-encode them (e.g. `@` → `%40`).
4. **Build and start:** install with `npm install`, build with `npm run build`, start with `npm start`.
5. **Create the tables and load products once** (from the app's terminal/SSH):
   `npm run db:deploy` then `npm run db:seed`. Run `npm run db:deploy` again after future updates
   that add migrations.
6. Turn on SSL for your domain (free in hPanel) — admin login cookies are only sent over HTTPS.

## Tech Stack

- Next.js 16 (App Router, Turbopack)
- TypeScript
- Tailwind CSS v4
- MySQL / MariaDB with Prisma ORM
- Zustand (cart/wishlist state)
- lucide-react (icons)
