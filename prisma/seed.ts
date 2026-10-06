// Loads the starting categories and products into the database.
// Safe to run on every deploy: it only runs once per database (see SEEDED_KEY),
// so anything edited or deleted in the admin is never undone.
// Run with:  npm run db:seed
import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../src/generated/prisma/client";
import { databaseConfig } from "../src/lib/db-config";
import categories from "../src/data/categories.json";
import products from "../src/data/products.seed.json";

const prisma = new PrismaClient({ adapter: new PrismaMariaDb(databaseConfig()) });

const SEEDED_KEY = "seeded";

async function main() {
  // Seed only once per database. After that, everything is managed from the admin —
  // even if every product or category is deleted, the samples never come back.
  if (await prisma.setting.findUnique({ where: { key: SEEDED_KEY } })) {
    console.log("Database already set up, nothing to seed.");
    return;
  }

  if ((await prisma.category.count()) === 0) {
    await prisma.category.createMany({
      data: categories.map((c, i) => ({ slug: c.slug, name: c.name, description: c.description, image: c.image, sortOrder: i })),
    });
    console.log(`Seeded ${categories.length} categories.`);
  }

  if ((await prisma.product.count()) === 0) {
    for (const p of products as Array<(typeof products)[number] & { sizes?: string[]; compareAtPrice?: number }>) {
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
    }
    console.log(`Seeded ${products.length} products.`);
  }

  await prisma.setting.create({ data: { key: SEEDED_KEY, value: { at: new Date().toISOString() } } });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
