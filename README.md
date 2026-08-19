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
- **Admin dashboard** (`/admin`): password-gated product CRUD and order management
- **WhatsApp & Instagram integration**: floating chat button, WhatsApp order deep-links
- Fully responsive, mobile-first UI

## Getting Started

```bash
npm install
npm run dev
```

Visit http://localhost:3000.

## Admin Access

Go to `/admin` and log in with the password `bazaarpanun2024`
(override via `NEXT_PUBLIC_ADMIN_PASSWORD` env variable).

## Data

Products and orders are stored as JSON files under `src/data/` and served through Next.js
API routes (`/api/products`, `/api/orders`) — no external database required. Regenerate
seed data and placeholder imagery with:

```bash
node scripts/gen-products.js
node scripts/gen-images.js
```

## Tech Stack

- Next.js 16 (App Router, Turbopack)
- TypeScript
- Tailwind CSS v4
- Zustand (cart/wishlist state)
- lucide-react (icons)
