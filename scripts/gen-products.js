const fs = require("fs");
const path = require("path");

const now = Date.now();
const days = (n) => new Date(now - n * 86400000).toISOString();

let idc = 0;
const nextId = () => `P${(++idc).toString().padStart(3, "0")}`;
const slugify = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function make({ name, category, price, compareAtPrice, fabric, sizes, colors, stock, rating, reviewCount, isNew, isFeatured, tags, day, desc, imgCount = 2 }) {
  const id = nextId();
  const slug = slugify(name) + "-" + id.toLowerCase();
  const images = Array.from({ length: imgCount }, (_, i) => `/products/${slug}-${i + 1}.svg`);
  return {
    id,
    slug,
    name,
    category,
    price,
    ...(compareAtPrice ? { compareAtPrice } : {}),
    images,
    description:
      desc ||
      `${name} — crafted with care using ${fabric || "premium fabric"}. A timeless piece from Bazaar Panun, blending traditional Kashmiri craftsmanship with contemporary design. Perfect for everyday elegance or special occasions.`,
    fabric,
    sizes,
    colors,
    stock,
    rating,
    reviewCount,
    isNew: !!isNew,
    isFeatured: !!isFeatured,
    tags: tags || [],
    createdAt: days(day),
  };
}

const products = [
  make({ name: "Trinity Brocade Suit Piece", category: "fabric", price: 4200, compareAtPrice: 5000, fabric: "Pure Brocade Silk", colors: ["Maroon", "Wine", "Emerald"], stock: 12, rating: 4.8, reviewCount: 34, isFeatured: true, day: 2, tags: ["bestseller"] }),
  make({ name: "Golden Zari Brocade", category: "fabric", price: 3800, fabric: "Brocade with Zari work", colors: ["Gold", "Black"], stock: 8, rating: 4.6, reviewCount: 21, day: 5 }),
  make({ name: "Royal Silk Brocade Yardage", category: "fabric", price: 5200, compareAtPrice: 6000, fabric: "Silk Brocade", colors: ["Royal Blue", "Purple"], stock: 6, rating: 4.9, reviewCount: 40, isNew: true, day: 1 }),
  make({ name: "Velvet Suit Fabric", category: "fabric", price: 3200, fabric: "Pure Velvet", colors: ["Black", "Maroon", "Bottle Green"], stock: 15, rating: 4.5, reviewCount: 18, day: 8 }),
  make({ name: "Cotton Silk Unstitched Piece", category: "fabric", price: 2100, fabric: "Cotton Silk", colors: ["Peach", "Mint"], stock: 20, rating: 4.3, reviewCount: 12, day: 12 }),

  make({ name: "Lawn Print Unstitched Suit", category: "unstitched", price: 1800, compareAtPrice: 2200, fabric: "Pure Lawn", sizes: ["Free Size"], colors: ["Yellow Floral", "Pink Floral"], stock: 25, rating: 4.4, reviewCount: 27, isFeatured: true, day: 3, imgCount: 3 }),
  make({ name: "Georgette Embroidered Suit", category: "unstitched", price: 2900, fabric: "Georgette", sizes: ["Free Size"], colors: ["Peacock Blue", "Rani Pink"], stock: 10, rating: 4.6, reviewCount: 22, isNew: true, day: 2 }),
  make({ name: "Cambric 3-Piece Unstitched", category: "unstitched", price: 2400, fabric: "Cambric Cotton", sizes: ["Free Size"], colors: ["Beige", "Grey"], stock: 18, rating: 4.2, reviewCount: 15, day: 10 }),
  make({ name: "Chiffon Dupatta Suit Set", category: "unstitched", price: 3100, fabric: "Chiffon", sizes: ["Free Size"], colors: ["Sky Blue", "Lavender"], stock: 9, rating: 4.7, reviewCount: 19, day: 6 }),

  make({ name: "Embroidered Anarkali Suit", category: "suits", price: 5600, compareAtPrice: 6800, fabric: "Georgette", sizes: ["S", "M", "L", "XL"], colors: ["Maroon", "Black"], stock: 7, rating: 4.8, reviewCount: 38, isFeatured: true, day: 1, imgCount: 3 }),
  make({ name: "Straight Cut Party Wear Suit", category: "suits", price: 4300, fabric: "Silk Blend", sizes: ["S", "M", "L", "XL"], colors: ["Emerald Green", "Navy"], stock: 11, rating: 4.5, reviewCount: 25, day: 4 }),
  make({ name: "Kashmiri Kurti Suit", category: "suits", price: 3600, fabric: "Cotton", sizes: ["S", "M", "L"], colors: ["Off White", "Rust"], stock: 14, rating: 4.4, reviewCount: 16, day: 9 }),
  make({ name: "Designer Palazzo Suit Set", category: "suits", price: 4900, fabric: "Muslin", sizes: ["S", "M", "L", "XL"], colors: ["Teal", "Coral"], stock: 8, rating: 4.6, reviewCount: 20, isNew: true, day: 2 }),
  make({ name: "Sharara Style Suit", category: "suits", price: 6200, compareAtPrice: 7200, fabric: "Net & Silk", sizes: ["S", "M", "L"], colors: ["Wine", "Gold"], stock: 5, rating: 4.9, reviewCount: 29, day: 3 }),

  make({ name: "Bridal Lehenga Suit", category: "bridal-wear", price: 18500, compareAtPrice: 22000, fabric: "Silk with Heavy Embroidery", sizes: ["S", "M", "L", "XL"], colors: ["Red", "Maroon"], stock: 3, rating: 5, reviewCount: 12, isFeatured: true, day: 1, imgCount: 3 }),
  make({ name: "Kashmiri Bridal Pheran", category: "bridal-wear", price: 15200, fabric: "Silk Brocade", sizes: ["S", "M", "L"], colors: ["Maroon Gold"], stock: 4, rating: 4.9, reviewCount: 9, isNew: true, day: 2 }),
  make({ name: "Heavy Zardozi Bridal Set", category: "bridal-wear", price: 24000, compareAtPrice: 27500, fabric: "Velvet with Zardozi", sizes: ["S", "M", "L", "XL"], colors: ["Deep Red"], stock: 2, rating: 5, reviewCount: 7, day: 5, imgCount: 3 }),
  make({ name: "Bridal Reception Gown Suit", category: "bridal-wear", price: 16800, fabric: "Net & Satin", sizes: ["S", "M", "L"], colors: ["Blush Pink", "Champagne"], stock: 4, rating: 4.7, reviewCount: 11, day: 7 }),

  make({ name: "Handwoven Pashmina Shawl", category: "shawls", price: 8500, compareAtPrice: 9500, fabric: "100% Pashmina Wool", colors: ["Beige", "Grey", "Maroon"], stock: 10, rating: 4.9, reviewCount: 45, isFeatured: true, day: 3 }),
  make({ name: "Sozni Embroidered Shawl", category: "shawls", price: 12500, fabric: "Pashmina with Sozni Work", colors: ["Black", "Ivory"], stock: 6, rating: 5, reviewCount: 17, isNew: true, day: 1 }),
  make({ name: "Kani Weave Shawl", category: "shawls", price: 14200, fabric: "Kani Pashmina", colors: ["Multicolor"], stock: 4, rating: 4.9, reviewCount: 13, day: 6 }),
  make({ name: "Plain Cashmere Wrap Shawl", category: "shawls", price: 6200, fabric: "Cashmere Wool", colors: ["Camel", "Charcoal"], stock: 16, rating: 4.5, reviewCount: 22, day: 11 }),

  make({ name: "Custom Embroidered Clutch", category: "clutches", price: 1400, compareAtPrice: 1700, fabric: "Velvet with Beadwork", colors: ["Gold", "Maroon", "Black"], stock: 22, rating: 4.6, reviewCount: 31, isFeatured: true, day: 2 }),
  make({ name: "Bridal Potli Bag", category: "clutches", price: 1100, fabric: "Silk with Zari", colors: ["Red", "Green"], stock: 18, rating: 4.5, reviewCount: 14, day: 8 }),
  make({ name: "Beaded Party Clutch", category: "clutches", price: 1650, fabric: "Satin with Beadwork", colors: ["Silver", "Rose Gold"], stock: 13, rating: 4.4, reviewCount: 10, isNew: true, day: 2 }),
];

fs.writeFileSync(
  path.join(__dirname, "..", "src", "data", "products.seed.json"),
  JSON.stringify(products, null, 2)
);
console.log(`Generated ${products.length} products. Run "npm run db:seed" to load them into the database.`);
