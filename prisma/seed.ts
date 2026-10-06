// Loads the starting categories and products into the database.
// Safe to run on every deploy: products are only loaded when the products table is empty,
// so admin edits, stock changes and deleted products are never undone.
// Run with:  npm run db:seed
import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../src/generated/prisma/client";
import { databaseConfig } from "../src/lib/db-config";
import categories from "../src/data/categories.json";
import products from "../src/data/products.seed.json";

const prisma = new PrismaClient({ adapter: new PrismaMariaDb(databaseConfig()) });

async function main() {
  for (const [i, c] of categories.entries()) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, description: c.description, image: c.image, sortOrder: i },
      create: { slug: c.slug, name: c.name, description: c.description, image: c.image, sortOrder: i },
    });
  }

  const existing = await prisma.product.count();
  if (existing > 0) {
    console.log(`Seeded ${categories.length} categories. Products already loaded (${existing}), skipped.`);
    return;
  }

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

  console.log(`Seeded ${categories.length} categories and ${products.length} products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
