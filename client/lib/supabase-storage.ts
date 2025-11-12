import { supabase } from "./supabase";
import { Bakery, Item, Sale, Admin } from "./types";

// Invoice Counter
export async function generateInvoiceNumber(): Promise<string> {
  try {
    const { data, error } = await supabase
      .from("invoice_counter")
      .select("*")
      .single();

    if (error && error.code !== "PGRST116") throw error;

    let nextNumber = data ? data.counter + 1 : 1001;

    if (data) {
      await supabase
        .from("invoice_counter")
        .update({ counter: nextNumber })
        .eq("id", data.id);
    } else {
      await supabase.from("invoice_counter").insert({ counter: nextNumber });
    }

    return `INV-${nextNumber}`;
  } catch (error: any) {
    console.error("Error generating invoice number:", error?.message || error);
    throw error;
  }
}

// Bakeries
export async function getBakeries(): Promise<Bakery[]> {
  try {
    const { data, error } = await supabase
      .from("bakeries")
      .select("*")
      .order("lastusedat", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error("Error fetching bakeries:", error?.message || error);
    throw error;
  }
}

export async function addBakery(bakery: Bakery): Promise<void> {
  try {
    const { error } = await supabase.from("bakeries").insert([bakery]);
    if (error) throw error;
  } catch (error: any) {
    console.error("Error adding bakery:", error?.message || error);
    throw error;
  }
}

export async function updateBakery(
  id: string,
  updates: Partial<Bakery>
): Promise<void> {
  try {
    const { error } = await supabase
      .from("bakeries")
      .update(updates)
      .eq("id", id);
    if (error) throw error;
  } catch (error: any) {
    console.error("Error updating bakery:", error?.message || error);
    throw error;
  }
}

export async function deleteBakery(id: string): Promise<void> {
  try {
    const { error } = await supabase.from("bakeries").delete().eq("id", id);
    if (error) throw error;
  } catch (error: any) {
    console.error("Error deleting bakery:", error?.message || error);
    throw error;
  }
}

// Items
export async function getItems(): Promise<Item[]> {
  try {
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .order("createdat", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error("Error fetching items:", error?.message || error);
    throw error;
  }
}

export async function addItem(item: Item): Promise<void> {
  try {
    const { error } = await supabase.from("items").insert([item]);
    if (error) throw error;
  } catch (error: any) {
    console.error("Error adding item:", error?.message || error);
    throw error;
  }
}

export async function updateItem(
  id: string,
  updates: Partial<Item>
): Promise<void> {
  try {
    const { error } = await supabase
      .from("items")
      .update(updates)
      .eq("id", id);
    if (error) throw error;
  } catch (error: any) {
    console.error("Error updating item:", error?.message || error);
    throw error;
  }
}

export async function deleteItem(id: string): Promise<void> {
  try {
    const { error } = await supabase.from("items").delete().eq("id", id);
    if (error) throw error;
  } catch (error: any) {
    console.error("Error deleting item:", error?.message || error);
    throw error;
  }
}

// Sales
export async function getSales(): Promise<Sale[]> {
  try {
    const { data, error } = await supabase
      .from("sales")
      .select("*")
      .order("createdat", { ascending: false });

    if (error) throw error;

    return (data || []).map((sale: any) => ({
      id: sale.id,
      bakeryId: sale.bakeryid,
      bakerySnapshot: sale.bakerysnapshot || {},
      items: sale.items || [],
      totalAmount: sale.totalamount,
      createdAt: sale.createdat,
      status: sale.status,
      invoiceId: sale.invoiceid,
      invoiceNumber: sale.invoicenumber,
    }));
  } catch (error: any) {
    console.error("Error fetching sales:", error?.message || error);
    throw error;
  }
}

export async function addSale(sale: Sale): Promise<void> {
  try {
    const { error } = await supabase.from("sales").insert([sale]);
    if (error) throw error;
  } catch (error: any) {
    console.error("Error adding sale:", error?.message || error);
    throw error;
  }
}

export async function updateSale(
  id: string,
  updates: Partial<Sale>
): Promise<void> {
  try {
    const { error } = await supabase
      .from("sales")
      .update(updates)
      .eq("id", id);
    if (error) throw error;
  } catch (error: any) {
    console.error("Error updating sale:", error?.message || error);
    throw error;
  }
}

// Admin
export async function getAdmin(): Promise<Admin | null> {
  try {
    const { data, error } = await supabase.from("admin").select("*").single();

    if (error && error.code !== "PGRST116") throw error;
    return data || null;
  } catch (error: any) {
    console.error("Error fetching admin:", error?.message || error);
    throw error;
  }
}

export async function saveAdmin(admin: Admin): Promise<void> {
  try {
    const existing = await getAdmin();

    if (existing) {
      const { error } = await supabase
        .from("admin")
        .update(admin)
        .eq("id", admin.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("admin").insert([admin]);
      if (error) throw error;
    }
  } catch (error: any) {
    console.error("Error saving admin:", error?.message || error);
    throw error;
  }
}

// Utility functions
export async function getTodaySales(): Promise<Sale[]> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();

    const allSales = await getSales();

    return allSales.filter((sale) => {
      const saleDate = new Date(sale.createdAt);
      saleDate.setHours(0, 0, 0, 0);
      return saleDate.getTime() === todayTime;
    });
  } catch (error: any) {
    console.error("Error fetching today's sales:", error?.message || error);
    throw error;
  }
}

export async function getTodayStats() {
  try {
    const todaySales = await getTodaySales();
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
  } catch (error: any) {
    console.error("Error fetching today's stats:", error?.message || error);
    throw error;
  }
}

export async function getTopItemsToday(): Promise<{ name: string; qty: number }[]> {
  try {
    const todaySales = await getTodaySales();
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
  } catch (error: any) {
    console.error("Error fetching top items:", error?.message || error);
    throw error;
  }
}

export async function getRecentlyUsedBakeries(limit = 5): Promise<Bakery[]> {
  try {
    const bakeries = await getBakeries();
    return bakeries.slice(0, limit);
  } catch (error: any) {
    console.error("Error fetching recently used bakeries:", error?.message || error);
    throw error;
  }
}
