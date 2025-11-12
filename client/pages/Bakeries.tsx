import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { getBakeries, addBakery, deleteBakery, updateBakery } from "@/lib/storage";
import { Bakery } from "@/lib/types";

export default function BakeriesPage() {
  const [bakeries, setBakeries] = useState<Bakery[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", phone: "", address: "" });

  useEffect(() => {
    const loadBakeries = async () => {
      try {
        const data = await getBakeries();
        setBakeries(data);
      } catch (error) {
        console.error("Error loading bakeries:", error);
      }
    };

    loadBakeries();
  }, []);

  const handleAddBakery = async () => {
    if (!formData.name || !formData.phone) return;

    const newBakery: Bakery = {
      id: Date.now().toString(),
      name: formData.name,
      phone: formData.phone,
      address: formData.address,
      lastUsedAt: 0,
      createdAt: Date.now(),
    };

    try {
      await addBakery(newBakery);
      setBakeries([...bakeries, newBakery]);
      setFormData({ name: "", phone: "", address: "" });
      setShowAddForm(false);
    } catch (error) {
      console.error("Error adding bakery:", error);
    }
  };

  const handleUpdate = () => {
    if (!editingId || !formData.name || !formData.phone) return;

    updateBakery(editingId, {
      name: formData.name,
      phone: formData.phone,
      address: formData.address,
    });

    setBakeries(
      bakeries.map((b) =>
        b.id === editingId ? { ...b, name: formData.name, phone: formData.phone, address: formData.address } : b
      )
    );

    setFormData({ name: "", phone: "", address: "" });
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this bakery?")) {
      deleteBakery(id);
      setBakeries(bakeries.filter((b) => b.id !== id));
    }
  };

  const handleEdit = (bakery: Bakery) => {
    setFormData({ name: bakery.name, phone: bakery.phone, address: bakery.address || "" });
    setEditingId(bakery.id);
    setShowAddForm(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 to-accent/10 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Bakeries</h1>
          <p className="text-muted-foreground">Manage your bakery contacts and details.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Button */}
        <button
          onClick={() => {
            setShowAddForm(true);
            setEditingId(null);
            setFormData({ name: "", phone: "", address: "" });
          }}
          className="mb-6 inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add Bakery
        </button>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg border border-border p-6 mb-6 shadow-sm">
            <h2 className="text-lg font-bold text-foreground mb-4">
              {editingId ? "Edit Bakery" : "Add New Bakery"}
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Bakery name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white text-foreground"
              />
              <input
                type="tel"
                placeholder="Phone number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white text-foreground"
              />
              <input
                type="text"
                placeholder="Address (optional)"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white text-foreground"
              />
              <div className="flex gap-2">
                <button
                  onClick={editingId ? handleUpdate : handleAddBakery}
                  className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                >
                  {editingId ? "Update" : "Add"}
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingId(null);
                    setFormData({ name: "", phone: "", address: "" });
                  }}
                  className="flex-1 bg-secondary text-foreground py-2 rounded-lg font-semibold hover:bg-secondary/80 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bakeries List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bakeries.length > 0 ? (
            bakeries.map((bakery) => (
              <div key={bakery.id} className="bg-white rounded-lg border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-bold text-foreground mb-2">{bakery.name}</h3>
                <p className="text-sm text-muted-foreground mb-1">📱 {bakery.phone}</p>
                {bakery.address && <p className="text-sm text-muted-foreground mb-3">📍 {bakery.address}</p>}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleEdit(bakery)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors text-sm font-semibold"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(bakery.id)}
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
              <p className="text-muted-foreground mb-4">No bakeries added yet</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Add Your First Bakery
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
