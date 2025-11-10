export interface Bakery {
  id: string;
  name: string;
  phone: string;
  address?: string;
  lastUsedAt: number;
  createdAt: number;
}

export interface Item {
  id: string;
  name: string;
  unitPrice: number;
  sku?: string;
  createdAt: number;
}

export interface SaleItem {
  itemId: string;
  name: string;
  qty: number;
  unitPrice: number;
  amount: number;
}

export interface Sale {
  id: string;
  bakeryId: string;
  bakerySnapshot: {
    name: string;
    phone: string;
  };
  items: SaleItem[];
  totalAmount: number;
  createdAt: number;
  status: "sent" | "pending" | "failed";
  invoiceId?: string;
}

export interface Admin {
  id: string;
  name: string;
  phone: string;
  email: string;
  createdAt: number;
}
