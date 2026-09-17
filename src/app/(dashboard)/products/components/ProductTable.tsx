"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Search,
  CheckCircle,
  Ban,
  Eye,
  SlidersHorizontal,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { PaginateTable, ColumnDef } from "@/components/ui/PaginateTable";
import { TableActions, TableActionButton } from "@/components/ui/TableActions";
import { formatCurrency } from "@/lib/utils";
import { Product } from "@/types/product";
import { ProductsSkeleton } from "./ProductsSkeleton";
import { toast } from "sonner";

const mockProducts: Product[] = [
  {
    id: "prod-1",
    name: "Apex Pro Mechanical Gaming Keyboard RGB",
    slug: "apex-pro-mechanical-keyboard",
    description: "Aircraft-grade aluminum frame, hot-swappable switches, PBT keycaps",
    basePrice: 169.99,
    stock: 45,
    salesCount: 184,
    status: "ACTIVE",
    categoryId: "cat-2",
    category: { id: "cat-2", name: "Computer Peripherals & Audio" },
    vendor: { id: "v-1", storeName: "Apex Gaming Gear" },
    images: [{ id: "img-1", url: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=200", isPrimary: true }],
    createdAt: "2026-02-10T00:00:00Z",
    updatedAt: "2026-09-12T00:00:00Z",
  },
  {
    id: "prod-2",
    name: "Nordic Solid Oak Standing Desk with Motorized Frame",
    slug: "nordic-solid-oak-standing-desk",
    description: "Dual motor memory controller, solid sustainably sourced European oak",
    basePrice: 599.0,
    stock: 12,
    salesCount: 65,
    status: "ACTIVE",
    categoryId: "cat-3",
    category: { id: "cat-3", name: "Home & Ergonomic Furniture" },
    vendor: { id: "v-2", storeName: "Nordic Living Co." },
    images: [{ id: "img-2", url: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=200", isPrimary: true }],
    createdAt: "2026-03-01T00:00:00Z",
    updatedAt: "2026-09-14T00:00:00Z",
  },
  {
    id: "prod-3",
    name: "Quantum Precision Studio Headset Reference Edition",
    slug: "quantum-precision-studio-headset",
    description: "Planar magnetic transducers for audiophile and mixing precision",
    basePrice: 289.5,
    stock: 0,
    salesCount: 12,
    status: "OUT_OF_STOCK",
    categoryId: "cat-2",
    category: { id: "cat-2", name: "Computer Peripherals & Audio" },
    vendor: { id: "v-3", storeName: "Quantum Soundworks" },
    images: [{ id: "img-3", url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200", isPrimary: true }],
    createdAt: "2026-09-10T00:00:00Z",
    updatedAt: "2026-09-16T00:00:00Z",
  },
  {
    id: "prod-4",
    name: "Heavyweight Boxy Fleece Hoodie Carbon Black",
    slug: "heavyweight-fleece-hoodie",
    description: "500 GSM French terry cotton with custom distressed wash",
    basePrice: 110.0,
    stock: 80,
    salesCount: 92,
    status: "ACTIVE",
    categoryId: "cat-4",
    category: { id: "cat-4", name: "Apparel & Streetwear" },
    vendor: { id: "v-4", storeName: "Velvet & Stone Studio" },
    images: [{ id: "img-4", url: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=200", isPrimary: true }],
    createdAt: "2026-04-12T00:00:00Z",
    updatedAt: "2026-09-02T00:00:00Z",
  },
];

export const ProductTable: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleBlock = (product: Product) => {
    const newStatus = product.status === "BLOCKED" ? "ACTIVE" : "BLOCKED";
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, status: newStatus } : p))
    );
    toast.success(
      `Product "${product.name}" is now ${newStatus === "BLOCKED" ? "Blocked from Catalog" : "Active"}`
    );
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.vendor?.storeName && p.vendor.storeName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesTab = activeTab === "ALL" || p.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const columns: ColumnDef<Product>[] = [
    {
      header: "SL",
      cell: (_, idx) => (
        <span className="font-semibold text-slate-500 text-xs">{idx + 1}</span>
      ),
    },
    {
      header: "Product & Vendor",
      cell: (p) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden relative shrink-0">
            {p.images?.[0]?.url ? (
              <Image src={p.images[0].url} alt={p.name} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-[10px]">No Img</div>
            )}
          </div>
          <div>
            <p className="font-bold text-primary">{p.name}</p>
            <p className="text-[11px] text-secondary font-medium">
              Sold by <strong className="text-primary">{p.vendor?.storeName}</strong>
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Category",
      cell: (p) => (
        <span className="font-medium text-primary">
          {typeof p.category === "object" ? p.category?.name : "General"}
        </span>
      ),
    },
    {
      header: "Price",
      cell: (p) => <span className="font-bold text-primary">{formatCurrency(p.basePrice)}</span>,
    },
    {
      header: "Stock",
      cell: (p) => (
        <span
          className={
            p.stock === 0
              ? "font-bold text-rose-600"
              : p.stock < 15
              ? "font-semibold text-amber-600"
              : "font-semibold text-primary"
          }
        >
          {p.stock} units
        </span>
      ),
    },
    {
      header: "Status",
      cell: (p) => {
        if (p.status === "ACTIVE") return <Badge variant="success">Active</Badge>;
        if (p.status === "OUT_OF_STOCK") return <Badge variant="danger">Out of Stock</Badge>;
        if (p.status === "BLOCKED") return <Badge variant="danger">Blocked</Badge>;
        return <Badge variant="warning">{p.status}</Badge>;
      },
    },
    {
      header: "Actions",
      align: "right",
      cell: (p) => (
        <TableActions>
          <TableActionButton onClick={() => setSelectedProduct(p)} title="Inspect Product">
            <Eye className="w-4 h-4" />
          </TableActionButton>
          {p.status === "BLOCKED" ? (
            <TableActionButton
              hoverVariant="emerald"
              onClick={() => handleToggleBlock(p)}
              title="Unblock Product"
            >
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </TableActionButton>
          ) : (
            <TableActionButton
              hoverVariant="danger"
              onClick={() => handleToggleBlock(p)}
              title="Block / Moderate Product"
            >
              <Ban className="w-4 h-4 text-rose-600" />
            </TableActionButton>
          )}
        </TableActions>
      ),
    },
  ];

  if (isLoading) {
    return <ProductsSkeleton />;
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 w-full space-y-4">
      <PaginateTable
        data={filteredProducts}
        columns={columns}
        keyExtractor={(p) => p.id}
        defaultPageSize={10}
        className="flex-1 min-h-0"
        headerContent={
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Status Tabs */}
            <div className="border-b border-slate-200/80 pb-2 flex items-center gap-6 overflow-x-auto">
              {["ALL", "ACTIVE", "OUT_OF_STOCK", "BLOCKED"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-xs font-bold transition-all border-b-2 pb-1.5 whitespace-nowrap cursor-pointer ${
                    activeTab === tab
                      ? "border-primary text-primary"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {tab === "ALL" ? "All Products" : tab.replace(/_/g, " ")}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search product title or vendor store..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary transition-all"
              />
            </div>
          </div>
        }
      />

      {/* Product Detail Modal */}
      {selectedProduct && (
        <Modal
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          title={`Product Details: ${selectedProduct.name}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <p className="text-secondary font-bold uppercase">Description</p>
              <p className="text-primary leading-relaxed">{selectedProduct.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-secondary font-bold uppercase">Base Price</p>
                <p className="text-primary font-bold text-sm">{formatCurrency(selectedProduct.basePrice)}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-secondary font-bold uppercase">Sales Count</p>
                <p className="text-primary font-bold text-sm">{selectedProduct.salesCount} sold</p>
              </div>
            </div>
            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setSelectedProduct(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
