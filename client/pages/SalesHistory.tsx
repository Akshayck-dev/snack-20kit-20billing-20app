import { useState, useMemo } from "react";
import { getSales } from "@/lib/storage";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function SalesHistoryPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterDate, setFilterDate] = useState<string>("");
  const [filterBakery, setFilterBakery] = useState<string>("");

  const sales = useMemo(() => {
    return getSales().sort((a, b) => b.createdAt - a.createdAt);
  }, []);

  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      const saleDate = new Date(sale.createdAt).toLocaleDateString("en-IN");
      if (filterDate && saleDate !== filterDate) return false;
      if (filterBakery && !sale.bakerySnapshot.name.toLowerCase().includes(filterBakery.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [sales, filterDate, filterBakery]);

  const uniqueBakeries = Array.from(new Set(sales.map((s) => s.bakerySnapshot.name))).sort();

  const generateInvoiceText = (sale: any) => {
    const date = new Date(sale.createdAt).toLocaleDateString("en-IN");
    let message = `*Snack Kit Invoice*\n`;
    message += `Invoice #: ${sale.invoiceNumber}\n`;
    message += `Date: ${date}\n`;
    message += `Bakery: ${sale.bakerySnapshot.name}\n\n`;
    message += `*Items:*\n`;
    sale.items.forEach((item: any) => {
      message += `${item.name}\n  Qty: ${item.qty} × ₹${item.unitPrice} = ₹${item.amount.toFixed(2)}\n`;
    });
    message += `\n*Total: ₹${sale.totalAmount.toFixed(2)}*`;
    return message;
  };

  const handleResendWhatsApp = (sale: any) => {
    const invoiceMessage = generateInvoiceText(sale);
    const whatsappLink = `https://wa.me/${sale.bakerySnapshot.phone.replace(/\D/g, "")}?text=${encodeURIComponent(invoiceMessage)}`;
    window.open(whatsappLink, "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 to-accent/10 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Sales History</h1>
          <p className="text-muted-foreground">View and manage your past sales and invoices.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white text-foreground"
          />
          <select
            value={filterBakery}
            onChange={(e) => setFilterBakery(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white text-foreground"
          >
            <option value="">All Bakeries</option>
            {uniqueBakeries.map((bakery) => (
              <option key={bakery} value={bakery}>
                {bakery}
              </option>
            ))}
          </select>
        </div>

        {/* Sales List */}
        <div className="space-y-4">
          {filteredSales.length > 0 ? (
            filteredSales.map((sale) => (
              <div key={sale.id} className="bg-white rounded-lg border border-border shadow-sm overflow-hidden">
                <button
                  onClick={() => setExpandedId(expandedId === sale.id ? null : sale.id)}
                  className="w-full p-6 flex items-center justify-between hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-foreground text-lg">{sale.bakerySnapshot.name}</h3>
                      <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-1 rounded">
                        {sale.invoiceNumber}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>{new Date(sale.createdAt).toLocaleDateString("en-IN")}</span>
                      <span>{sale.items.length} items</span>
                      <span className="font-semibold text-primary">₹{sale.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    {expandedId === sale.id ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {expandedId === sale.id && (
                  <div className="border-t border-border bg-secondary/10 p-6">
                    <div className="space-y-3 mb-6">
                      {sale.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-foreground">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.qty} × ₹{item.unitPrice}
                            </p>
                          </div>
                          <p className="font-semibold text-foreground">₹{item.amount.toFixed(2)}</p>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-border pt-4 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">Total Amount</span>
                        <span className="text-2xl font-bold text-primary">₹{sale.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleResendWhatsApp(sale)}
                        className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                      >
                        Resend to WhatsApp
                      </button>
                      <button
                        onClick={() => {
                          const invoiceText = generateInvoiceText(sale);
                          navigator.clipboard.writeText(invoiceText);
                          alert("Invoice copied to clipboard");
                        }}
                        className="flex-1 px-4 py-2 bg-secondary text-foreground rounded-lg font-semibold hover:bg-secondary/80 transition-colors"
                      >
                        Copy Invoice
                      </button>
                    </div>

                    <div className="mt-3 p-3 bg-white rounded-lg border border-border">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Status</p>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            sale.status === "sent" ? "bg-green-500" : "bg-yellow-500"
                          }`}
                        />
                        <span className="text-sm font-medium text-foreground capitalize">{sale.status}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-border">
              <p className="text-muted-foreground">No sales found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
