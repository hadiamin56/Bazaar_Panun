// Loads the starting categories and products into the database.
// Safe to run more than once: existing products are left as they are (so admin edits and stock aren't overwritten).
// Run with:  npm run db:seed
import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../src/generated/prisma/client";
import categories from "../src/data/categories.json";
import products from "../src/data/products.seed.json";

const url = new URL(process.env.DATABASE_URL ?? "");
const prisma = new PrismaClient({
  adapter: new PrismaMariaDb({
    host: url.hostname,
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
    allowPublicKeyRetrieval: true,
  }),
});

async function main() {
  for (const [i, c] of categories.entries()) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, description: c.description, image: c.image, sortOrder: i },
      create: { slug: c.slug, name: c.name, description: c.description, image: c.image, sortOrder: i },
    });
  }

  let added = 0;
  for (const p of products as Array<(typeof products)[number] & { sizes?: string[]; compareAtPrice?: number }>) {
    const exists = await prisma.product.findUnique({ where: { id: p.id } });
    if (exists) continue;
    await prisma.product.create({
      data: {
        id: p.id,
        slug: p.slug,
        name: p.name,
        categorySlug: p.category,
        price: p.price,
        compareAtPrice: p.compareAtPrice ?? null,
        images: p.images,
        description: p.description,
        fabric: p.fabric ?? null,
        sizes: p.sizes ?? [],
        colors: p.colors ?? [],
        tags: p.tags ?? [],
        stock: p.stock,
        rating: p.rating,
        reviewCount: p.reviewCount,
        isNew: p.isNew ?? false,
        isFeatured: p.isFeatured ?? false,
        createdAt: new Date(p.createdAt),
      },
    });
    added++;
  }

  console.log(`Seeded ${categories.length} categories and ${added} new products (${products.length - added} already existed).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
