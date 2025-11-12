import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { getItems, addItem, deleteItem, updateItem } from "@/lib/storage";
import { Item } from "@/lib/types";

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", unitPrice: "", sku: "" });

  useEffect(() => {
    const loadItems = async () => {
      try {
        const data = await getItems();
        setItems(data);
      } catch (error) {
        console.error("Error loading items:", error);
      }
    };

    loadItems();
  }, []);

  const handleAddItem = () => {
    if (!formData.name || !formData.unitPrice) return;

    const newItem: Item = {
      id: Date.now().toString(),
      name: formData.name,
      unitPrice: parseFloat(formData.unitPrice),
      sku: formData.sku,
      createdAt: Date.now(),
    };

    addItem(newItem);
    setItems([...items, newItem]);
    setFormData({ name: "", unitPrice: "", sku: "" });
    setShowAddForm(false);
  };

  const handleUpdate = () => {
    if (!editingId || !formData.name || !formData.unitPrice) return;

    updateItem(editingId, {
      name: formData.name,
      unitPrice: parseFloat(formData.unitPrice),
      sku: formData.sku,
    });

    setItems(
      items.map((i) =>
        i.id === editingId
          ? { ...i, name: formData.name, unitPrice: parseFloat(formData.unitPrice), sku: formData.sku }
          : i
      )
    );

    setFormData({ name: "", unitPrice: "", sku: "" });
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      deleteItem(id);
      setItems(items.filter((i) => i.id !== id));
    }
  };

  const handleEdit = (item: Item) => {
    setFormData({ name: item.name, unitPrice: item.unitPrice.toString(), sku: item.sku || "" });
    setEditingId(item.id);
    setShowAddForm(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 to-accent/10 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Items</h1>
          <p className="text-muted-foreground">Manage your product inventory and pricing.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Button */}
        <button
          onClick={() => {
            setShowAddForm(true);
            setEditingId(null);
            setFormData({ name: "", unitPrice: "", sku: "" });
          }}
          className="mb-6 inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add Item
        </button>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg border border-border p-6 mb-6 shadow-sm">
            <h2 className="text-lg font-bold text-foreground mb-4">
              {editingId ? "Edit Item" : "Add New Item"}
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Item name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white text-foreground"
              />
              <input
                type="number"
                placeholder="Unit price (₹)"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                step="0.01"
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white text-foreground"
              />
              <input
                type="text"
                placeholder="SKU (optional)"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white text-foreground"
              />
              <div className="flex gap-2">
                <button
                  onClick={editingId ? handleUpdate : handleAddItem}
                  className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                >
                  {editingId ? "Update" : "Add"}
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingId(null);
                    setFormData({ name: "", unitPrice: "", sku: "" });
                  }}
                  className="flex-1 bg-secondary text-foreground py-2 rounded-lg font-semibold hover:bg-secondary/80 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Items List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.length > 0 ? (
            items.map((item) => (
              <div key={item.id} className="bg-white rounded-lg border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-bold text-foreground mb-2">{item.name}</h3>
                <p className="text-2xl font-bold text-primary mb-2">₹{item.unitPrice.toFixed(2)}</p>
                {item.sku && <p className="text-xs text-muted-foreground mb-3">SKU: {item.sku}</p>}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleEdit(item)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors text-sm font-semibold"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors text-sm font-semibold"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground mb-4">No items added yet</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Add Your First Item
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
