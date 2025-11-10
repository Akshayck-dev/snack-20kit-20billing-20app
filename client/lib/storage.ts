import { Bakery, Item, Sale, Admin } from "./types";

const STORAGE_KEYS = {
  BAKERIES: "snack_kit_bakeries",
  ITEMS: "snack_kit_items",
  SALES: "snack_kit_sales",
  ADMIN: "snack_kit_admin",
};

// Bakeries
export function getBakeries(): Bakery[] {
  const data = localStorage.getItem(STORAGE_KEYS.BAKERIES);
  return data ? JSON.parse(data) : [];
}

export function saveBakeries(bakeries: Bakery[]): void {
  localStorage.setItem(STORAGE_KEYS.BAKERIES, JSON.stringify(bakeries));
}

export function addBakery(bakery: Bakery): void {
  const bakeries = getBakeries();
  bakeries.push(bakery);
  saveBakeries(bakeries);
}

export function updateBakery(id: string, updates: Partial<Bakery>): void {
  const bakeries = getBakeries();
  const index = bakeries.findIndex((b) => b.id === id);
  if (index !== -1) {
    bakeries[index] = { ...bakeries[index], ...updates };
    saveBakeries(bakeries);
  }
}

export function deleteBakery(id: string): void {
  const bakeries = getBakeries();
  saveBakeries(bakeries.filter((b) => b.id !== id));
}

// Items
export function getItems(): Item[] {
  const data = localStorage.getItem(STORAGE_KEYS.ITEMS);
  return data ? JSON.parse(data) : [];
}

export function saveItems(items: Item[]): void {
  localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
}

export function addItem(item: Item): void {
  const items = getItems();
  items.push(item);
  saveItems(items);
}

export function updateItem(id: string, updates: Partial<Item>): void {
  const items = getItems();
  const index = items.findIndex((i) => i.id === id);
  if (index !== -1) {
    items[index] = { ...items[index], ...updates };
    saveItems(items);
  }
}

export function deleteItem(id: string): void {
  const items = getItems();
  saveItems(items.filter((i) => i.id !== id));
}

// Sales
export function getSales(): Sale[] {
  const data = localStorage.getItem(STORAGE_KEYS.SALES);
  return data ? JSON.parse(data) : [];
}

export function saveSales(sales: Sale[]): void {
  localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
}

export function addSale(sale: Sale): void {
  const sales = getSales();
  sales.push(sale);
  saveSales(sales);
}

export function updateSale(id: string, updates: Partial<Sale>): void {
  const sales = getSales();
  const index = sales.findIndex((s) => s.id === id);
  if (index !== -1) {
    sales[index] = { ...sales[index], ...updates };
    saveSales(sales);
  }
}

// Admin
export function getAdmin(): Admin | null {
  const data = localStorage.getItem(STORAGE_KEYS.ADMIN);
  return data ? JSON.parse(data) : null;
}

export function saveAdmin(admin: Admin): void {
  localStorage.setItem(STORAGE_KEYS.ADMIN, JSON.stringify(admin));
}

// Utility functions
export function getTodaySales(): Sale[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTime = today.getTime();

  return getSales().filter((sale) => {
    const saleDate = new Date(sale.createdAt);
    saleDate.setHours(0, 0, 0, 0);
    return saleDate.getTime() === todayTime;
  });
}

export function getTodayStats() {
  const todaySales = getTodaySales();
  const totalRevenue = todaySales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const totalQty = todaySales.reduce(
    (sum, sale) => sum + sale.items.reduce((itemSum, item) => itemSum + item.qty, 0),
    0
  );
  const uniqueBakeries = new Set(todaySales.map((s) => s.bakeryId)).size;

  return {
    totalRevenue,
    totalQty,
    uniqueBakeries,
  };
}

export function getTopItemsToday(): { name: string; qty: number }[] {
  const todaySales = getTodaySales();
  const itemMap = new Map<string, number>();

  todaySales.forEach((sale) => {
    sale.items.forEach((item) => {
      itemMap.set(item.name, (itemMap.get(item.name) || 0) + item.qty);
    });
  });

  return Array.from(itemMap.entries())
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);
}

export function getRecentlyUsedBakeries(limit = 5): Bakery[] {
  return getBakeries()
    .sort((a, b) => b.lastUsedAt - a.lastUsedAt)
    .slice(0, limit);
}
