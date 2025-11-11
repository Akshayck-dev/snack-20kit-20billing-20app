import { useState, useRef } from "react";
import { ArrowLeft, Plus, Trash2, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { getBakeries, getItems, addBakery, addSale, updateBakery, generateInvoiceNumber } from "@/lib/storage";
import { Bakery, Item, SaleItem } from "@/lib/types";

export default function SellItems() {
  const [bakeries, setBakeries] = useState<Bakery[]>(getBakeries());
  const [items, setItems] = useState<Item[]>(getItems());
  const [selectedBakery, setSelectedBakery] = useState<Bakery | null>(null);
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [bakerySearch, setBakerySearch] = useState("");
  const [itemSearch, setItemSearch] = useState("");
  const [showBakeryDropdown, setShowBakeryDropdown] = useState(false);
  const [showItemDropdown, setShowItemDropdown] = useState(false);
  const [newBakeryName, setNewBakeryName] = useState("");
  const [newBakeryPhone, setNewBakeryPhone] = useState("");
  const [newBakeryAddress, setNewBakeryAddress] = useState("");
  const [showAddBakery, setShowAddBakery] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const bakeryInputRef = useRef<HTMLInputElement>(null);

  const filteredBakeries = bakeries.filter((b) =>
    b.name.toLowerCase().includes(bakerySearch.toLowerCase()) ||
    b.phone.includes(bakerySearch)
  );

  const filteredItems = items.filter((i) =>
    i.name.toLowerCase().includes(itemSearch.toLowerCase())
  );

  const handleAddBakery = () => {
    if (!newBakeryName || !newBakeryPhone) return;

    const newBakery: Bakery = {
      id: Date.now().toString(),
      name: newBakeryName,
      phone: newBakeryPhone,
      address: newBakeryAddress,
      lastUsedAt: Date.now(),
      createdAt: Date.now(),
    };

    addBakery(newBakery);
    setBakeries([...bakeries, newBakery]);
    setSelectedBakery(newBakery);
    setNewBakeryName("");
    setNewBakeryPhone("");
    setNewBakeryAddress("");
    setShowAddBakery(false);
    setBakerySearch("");
    setShowBakeryDropdown(false);
  };

  const handleAddItem = () => {
    if (!selectedItem || quantity < 1) return;

    const existingIndex = saleItems.findIndex((si) => si.itemId === selectedItem.id);
    const newSaleItem: SaleItem = {
      itemId: selectedItem.id,
      name: selectedItem.name,
      qty: quantity,
      unitPrice: selectedItem.unitPrice,
      amount: selectedItem.unitPrice * quantity,
    };

    if (existingIndex !== -1) {
      const updated = [...saleItems];
      updated[existingIndex].qty += quantity;
      updated[existingIndex].amount = updated[existingIndex].unitPrice * updated[existingIndex].qty;
      setSaleItems(updated);
    } else {
      setSaleItems([...saleItems, newSaleItem]);
    }

    setSelectedItem(null);
    setQuantity(1);
    setItemSearch("");
    setShowItemDropdown(false);
  };

  const handleRemoveItem = (itemId: string) => {
    setSaleItems(saleItems.filter((si) => si.itemId !== itemId));
  };

  const totalAmount = saleItems.reduce((sum, item) => sum + item.amount, 0);
  const totalQty = saleItems.reduce((sum, item) => sum + item.qty, 0);

  const handleSubmit = async () => {
    if (!selectedBakery || saleItems.length === 0) return;

    setIsSubmitting(true);

    const invoiceNumber = generateInvoiceNumber();

    const sale = {
      id: Date.now().toString(),
      bakeryId: selectedBakery.id,
      bakerySnapshot: {
        name: selectedBakery.name,
        phone: selectedBakery.phone,
      },
      items: saleItems,
      totalAmount,
      createdAt: Date.now(),
      status: "pending" as const,
      invoiceNumber,
    };

    addSale(sale);
    updateBakery(selectedBakery.id, { lastUsedAt: Date.now() });

    const invoiceMessage = generateInvoiceMessage(sale);
    const whatsappLink = `https://wa.me/${selectedBakery.phone.replace(/\D/g, "")}?text=${encodeURIComponent(invoiceMessage)}`;

    window.open(whatsappLink, "_blank");

    setTimeout(() => {
      setSelectedBakery(null);
      setSaleItems([]);
      setSelectedItem(null);
      setQuantity(1);
      setBakerySearch("");
      setItemSearch("");
      setIsSubmitting(false);
    }, 500);
  };

  const generateInvoiceMessage = (sale: any) => {
    const date = new Date(sale.createdAt).toLocaleDateString("en-IN");
    let message = `*Snack Kit Invoice*\n`;
    message += `Invoice #: ${sale.invoiceNumber}\n`;
    message += `Date: ${date}\n`;
    message += `Bakery: ${sale.bakerySnapshot.name}\n\n`;
    message += `*Items:*\n`;
    sale.items.forEach((item: SaleItem) => {
      message += `${item.name}\n  Qty: ${item.qty} × ₹${item.unitPrice} = ₹${item.amount.toFixed(2)}\n`;
    });
    message += `\n*Total: ₹${sale.totalAmount.toFixed(2)}*`;
    return message;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 to-accent/10 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <div className="flex items-center gap-3 mb-4">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Add Sale</h1>
          </div>
          <p className="text-muted-foreground">Select a bakery, add items, and send invoice via WhatsApp</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Section */}
          <div className="lg:col-span-2">
            {/* Bakery Selection */}
            <div className="bg-white rounded-lg border border-border p-6 mb-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-foreground">Bakery</label>
                <button
                  onClick={() => {
                    setShowAddBakery(true);
                    setShowBakeryDropdown(false);
                  }}
                  className="px-3 py-1.5 text-sm font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-md transition-colors flex items-center gap-2"
                >
                  <Plus className="h-5 w-5" />
                  Add Bakery
                </button>
              </div>
              <div className="relative">
                <input
                  ref={bakeryInputRef}
                  type="text"
                  placeholder="Search or select bakery..."
                  value={selectedBakery ? selectedBakery.name : bakerySearch}
                  onChange={(e) => {
                    setBakerySearch(e.target.value);
                    setSelectedBakery(null);
                  }}
                  onFocus={() => setShowBakeryDropdown(true)}
                  onClick={() => setShowBakeryDropdown(true)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-input text-foreground"
                />
                {showBakeryDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                    {filteredBakeries.length > 0 ? (
                      <>
                        {filteredBakeries.map((bakery) => (
                          <button
                            key={bakery.id}
                            onClick={() => {
                              setSelectedBakery(bakery);
                              setBakerySearch("");
                              setShowBakeryDropdown(false);
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-secondary/50 border-b border-border last:border-b-0 transition-colors"
                          >
                            <p className="font-medium text-foreground">{bakery.name}</p>
                            <p className="text-xs text-muted-foreground">{bakery.phone}</p>
                          </button>
                        ))}
                      </>
                    ) : (
                      <button
                        onClick={() => setShowAddBakery(true)}
                        className="w-full text-left px-4 py-3 text-primary hover:bg-secondary/50 font-medium transition-colors flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add new bakery
                      </button>
                    )}
                  </div>
                )}
              </div>

              {showAddBakery && (
                <div className="mt-4 p-4 bg-secondary/30 rounded-lg border border-secondary">
                  <h3 className="font-semibold text-foreground mb-3">Add New Bakery</h3>
                  <input
                    type="text"
                    placeholder="Bakery name"
                    value={newBakeryName}
                    onChange={(e) => setNewBakeryName(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white text-foreground"
                  />
                  <input
                    type="tel"
                    placeholder="Phone (WhatsApp)"
                    value={newBakeryPhone}
                    onChange={(e) => setNewBakeryPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white text-foreground"
                  />
                  <input
                    type="text"
                    placeholder="Address (optional)"
                    value={newBakeryAddress}
                    onChange={(e) => setNewBakeryAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white text-foreground"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddBakery}
                      className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                    >
                      Add Bakery
                    </button>
                    <button
                      onClick={() => {
                        setShowAddBakery(false);
                        setNewBakeryName("");
                        setNewBakeryPhone("");
                        setNewBakeryAddress("");
                      }}
                      className="flex-1 bg-secondary text-foreground py-2 rounded-lg font-semibold hover:bg-secondary/80 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {selectedBakery && (
                <div className="mt-3 p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <p className="text-sm font-medium text-foreground">✓ {selectedBakery.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedBakery.phone}</p>
                </div>
              )}
            </div>

            {/* Items Selection */}
            {selectedBakery && (
              <div className="bg-white rounded-lg border border-border p-6 shadow-sm">
                <label className="block text-sm font-semibold text-foreground mb-3">Add Items</label>
                <div className="relative mb-4">
                  <input
                    type="text"
                    placeholder="Search items..."
                    value={itemSearch}
                    onChange={(e) => setItemSearch(e.target.value)}
                    onFocus={() => setShowItemDropdown(true)}
                    onClick={() => setShowItemDropdown(true)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-input text-foreground"
                  />
                  {showItemDropdown && filteredItems.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                      {filteredItems.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setSelectedItem(item);
                            setItemSearch("");
                            setShowItemDropdown(false);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-secondary/50 border-b border-border last:border-b-0 transition-colors"
                        >
                          <p className="font-medium text-foreground">{item.name}</p>
                          <p className="text-xs text-muted-foreground">��{item.unitPrice}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {selectedItem && (
                  <div className="flex gap-2 mb-4">
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white text-foreground"
                      placeholder="Qty"
                    />
                    <button
                      onClick={handleAddItem}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add
                    </button>
                  </div>
                )}

                {saleItems.length > 0 && (
                  <div className="space-y-2">
                    {saleItems.map((item) => (
                      <div key={item.itemId} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                        <div>
                          <p className="font-medium text-foreground">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.qty} × ₹{item.unitPrice} = ₹{item.amount.toFixed(2)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.itemId)}
                          className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Summary Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-border p-6 shadow-sm sticky top-20">
              <h3 className="text-lg font-bold text-foreground mb-4">Order Summary</h3>

              {saleItems.length > 0 ? (
                <>
                  <div className="space-y-2 mb-4 pb-4 border-b border-border">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Items:</span>
                      <span className="font-semibold text-foreground">{saleItems.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Qty:</span>
                      <span className="font-semibold text-foreground">{totalQty}</span>
                    </div>
                  </div>

                  <div className="bg-primary/5 rounded-lg p-4 mb-6">
                    <p className="text-xs text-muted-foreground mb-1">Total Amount</p>
                    <p className="text-3xl font-bold text-primary">₹{totalAmount.toFixed(2)}</p>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || saleItems.length === 0 || !selectedBakery}
                    className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Send className="h-5 w-5" />
                    Send to WhatsApp
                  </button>
                </>
              ) : (
                <p className="text-muted-foreground text-center text-sm py-8">
                  Select a bakery and add items to continue
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
