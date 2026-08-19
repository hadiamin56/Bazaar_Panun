import fs from "fs";
import path from "path";
import type { Order } from "./types";

const ordersFile = path.join(process.cwd(), "src", "data", "orders.json");

export function readOrders(): Order[] {
  if (!fs.existsSync(ordersFile)) return [];
  return JSON.parse(fs.readFileSync(ordersFile, "utf8"));
}

export function writeOrders(orders: Order[]) {
  fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
}
