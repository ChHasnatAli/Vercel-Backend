import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, SlidersHorizontal, Download, Package, ShoppingCart, Trash2, Pencil, Check, X } from "lucide-react";
import { allProducts } from "@/data/products";
import { useCart } from "@/contexts/CartContext";
import { fetchProductStockMap, updateProductOutOfStock } from "@/lib/productStockApi";
import { toast } from "@/hooks/use-toast";
import { createStoreProduct, deleteStoreProduct, fetchDeletedProductIds, fetchStoreProducts } from "@/lib/storeProductApi";

export default function Products() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [catalogProducts, setCatalogProducts] = useState(allProducts);
  const [stockMap, setStockMap] = useState<Record<string, boolean>>({});
  const [savingStockId, setSavingStockId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [savingEditId, setSavingEditId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    let isMounted = true;

    const loadStock = async () => {
      try {
        const data = await fetchProductStockMap();
        if (!isMounted) {
          return;
        }
        setStockMap(data);
      } catch {
        if (isMounted) {
          setStockMap({});
        }
      }
    };

    void loadStock();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadRemoteProducts = async () => {
      try {
        const [remoteProducts, deletedProductIds] = await Promise.all([
          fetchStoreProducts(),
          fetchDeletedProductIds(),
        ]);
        if (!isMounted) {
          return;
        }

        const mappedRemote = remoteProducts.map((product) => ({
          id: product.id,
          name: product.name,
          desc: product.description ?? "",
          category: product.category,
          status: "active" as const,
          stock: Number.isFinite(product.stock) ? Math.max(0, Number(product.stock)) : 1,
          price: product.price,
          priceFormatted: `PKR ${Number(product.price).toLocaleString("en-PK")}`,
          created: "Recently added",
          image: product.image,
        }));

        const merged = [...mappedRemote, ...allProducts]
          .filter((product) => !deletedProductIds.includes(product.id))
          .filter(
          (product, index, list) => index === list.findIndex((item) => item.id === product.id)
          );
        setCatalogProducts(merged);
      } catch {
        if (isMounted) {
          setCatalogProducts(allProducts);
        }
      }
    };

    void loadRemoteProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const isOutOfStock = (productId: string, stock: number) => Boolean(stockMap[productId]) || stock <= 0;
  const handleToggleStock = async (productId: string, nextOutOfStock: boolean) => {
    try {
      setSavingStockId(productId);
      await updateProductOutOfStock(productId, nextOutOfStock);
      setStockMap((prev) => ({
        ...prev,
        [productId]: nextOutOfStock,
      }));
      toast({
        title: "Stock updated",
        description: `Product marked as ${nextOutOfStock ? "out of stock" : "in stock"}.`,
      });
    } catch {
      toast({
        title: "Error",
        description: "Could not update product stock status.",
        variant: "destructive",
      });
    } finally {
      setSavingStockId(null);
    }
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    try {
      setDeletingId(productId);
      await deleteStoreProduct(productId);
      setCatalogProducts((prev) => prev.filter((item) => item.id !== productId));
      setStockMap((prev) => {
        if (!Object.prototype.hasOwnProperty.call(prev, productId)) {
          return prev;
        }
        const next = { ...prev };
        delete next[productId];
        return next;
      });
      toast({
        title: "Product deleted",
        description: `${productName} was removed from dashboard and store.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Could not delete product.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const openDeleteDialog = (productId: string, productName: string) => {
    setPendingDelete({ id: productId, name: productName });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) {
      return;
    }
    await handleDeleteProduct(pendingDelete.id, pendingDelete.name);
    setDeleteDialogOpen(false);
    setPendingDelete(null);
  };

  const startEdit = (product: (typeof allProducts)[number]) => {
    setEditingId(product.id);
    setEditDraft({
      name: product.name,
      category: product.category,
      price: String(product.price),
      stock: String(product.stock),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setSavingEditId(null);
    setEditDraft({ name: "", category: "", price: "", stock: "" });
  };

  const saveEdit = async (product: (typeof allProducts)[number]) => {
    const price = Number(editDraft.price);
    const stock = Number(editDraft.stock);

    if (!editDraft.name.trim()) {
      toast({ title: "Error", description: "Name is required.", variant: "destructive" });
      return;
    }
    if (!editDraft.category.trim()) {
      toast({ title: "Error", description: "Category is required.", variant: "destructive" });
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      toast({ title: "Error", description: "Price must be greater than 0.", variant: "destructive" });
      return;
    }
    if (!Number.isFinite(stock) || stock < 0) {
      toast({ title: "Error", description: "Stock must be 0 or greater.", variant: "destructive" });
      return;
    }

    try {
      setSavingEditId(product.id);

      const saved = await createStoreProduct({
        id: product.id,
        name: editDraft.name.trim(),
        description: product.desc ?? "",
        category: editDraft.category.trim(),
        price,
        stock,
        image: product.image,
      });

      await updateProductOutOfStock(product.id, stock <= 0);

      setCatalogProducts((prev) => prev.map((item) => {
        if (item.id !== product.id) {
          return item;
        }
        return {
          ...item,
          name: saved.name,
          category: saved.category,
          price: Number(saved.price),
          stock: Number.isFinite(saved.stock) ? Number(saved.stock) : stock,
          priceFormatted: `PKR ${Number(saved.price).toLocaleString("en-PK")}`,
        };
      }));

      setStockMap((prev) => ({
        ...prev,
        [product.id]: stock <= 0,
      }));

      toast({ title: "Saved", description: `${saved.name} updated successfully.` });
      cancelEdit();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Could not update product.",
        variant: "destructive",
      });
      setSavingEditId(null);
    }
  };

  const filtered = useMemo(() => {
    return catalogProducts
      .filter((p) => filter === "all" || p.status === filter)
      .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
  }, [catalogProducts, filter, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Dashboard &gt; Products</p>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-muted-foreground text-sm mt-1">Browse and manage your product catalog.</p>
        </div>
        <Link to="/products/new">
          <Button className="bg-primary text-primary-foreground gap-1">
            <Plus className="w-4 h-4" /> Add Product
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="all" onValueChange={setFilter}>
        <TabsList className="bg-secondary h-9 flex-wrap">
          <TabsTrigger value="all" className="text-xs px-4">All</TabsTrigger>
          <TabsTrigger value="active" className="text-xs px-4">Active</TabsTrigger>
          <TabsTrigger value="draft" className="text-xs px-4">Draft</TabsTrigger>
          <TabsTrigger value="archived" className="text-xs px-4">Archived</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 bg-secondary border-none" />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1 text-xs">
            <SlidersHorizontal className="w-3 h-3" /> Columns
          </Button>
          <Button variant="outline" size="sm" className="gap-1 text-xs">
            <Download className="w-3 h-3" /> Export
          </Button>
        </div>
      </div>

      <Card className="bg-card border-border overflow-x-auto">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead>Product</TableHead>
                <TableHead className="hidden sm:table-cell">Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Stock</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="hidden md:table-cell">Created</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((product) => (
                <TableRow key={product.id} className="border-border">
                  <TableCell>
                    <Link to={`/products/${product.id}`} className="flex items-center gap-3 hover:text-primary">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-9 h-9 rounded-lg object-cover flex-shrink-0 border border-border"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                          <Package className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                      <div className="min-w-0">
                        {editingId === product.id ? (
                          <Input
                            value={editDraft.name}
                            onChange={(e) => setEditDraft((prev) => ({ ...prev, name: e.target.value }))}
                            className="h-7 text-xs"
                          />
                        ) : (
                          <p className="text-sm font-medium truncate">{product.name}</p>
                        )}
                        <p className="text-xs text-muted-foreground max-w-xs truncate hidden sm:block">{product.desc}</p>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {editingId === product.id ? (
                      <Input
                        value={editDraft.category}
                        onChange={(e) => setEditDraft((prev) => ({ ...prev, category: e.target.value }))}
                        className="h-7 text-xs"
                      />
                    ) : (
                      <Badge variant="outline" className="text-xs">{product.category}</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-[10px] px-2 capitalize ${product.status === "active" ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"}`}>
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {editingId === product.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={0}
                          value={editDraft.stock}
                          onChange={(e) => setEditDraft((prev) => ({ ...prev, stock: e.target.value }))}
                          className="h-7 text-xs w-24"
                        />
                        <span className="text-xs text-muted-foreground">units</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Badge className={`text-[10px] px-2 uppercase ${isOutOfStock(product.id, product.stock) ? "bg-destructive text-destructive-foreground" : "bg-success text-success-foreground"}`}>
                          {isOutOfStock(product.id, product.stock) ? "Out of stock" : "In stock"}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-[10px] px-2"
                          onClick={() => void handleToggleStock(product.id, !isOutOfStock(product.id, product.stock))}
                          disabled={savingStockId === product.id}
                        >
                          {savingStockId === product.id ? "Saving..." : isOutOfStock(product.id, product.stock) ? "Mark in stock" : "Mark out"}
                        </Button>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-sm font-medium">
                    {editingId === product.id ? (
                      <Input
                        type="number"
                        min={0}
                        value={editDraft.price}
                        onChange={(e) => setEditDraft((prev) => ({ ...prev, price: e.target.value }))}
                        className="h-7 text-xs w-28 ml-auto"
                      />
                    ) : (
                      product.priceFormatted
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground hidden md:table-cell">{product.created}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {editingId === product.id ? (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            disabled={savingEditId === product.id}
                            onClick={() => void saveEdit(product)}
                            title="Save"
                          >
                            <Check className="w-4 h-4 text-muted-foreground" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            disabled={savingEditId === product.id}
                            onClick={cancelEdit}
                            title="Cancel"
                          >
                            <X className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => startEdit(product)}
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => addToCart({ id: product.id, name: product.name, price: product.price, category: product.category })}>
                        <ShoppingCart className="w-4 h-4 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        disabled={deletingId === product.id}
                        onClick={() => openDeleteDialog(product.id, product.name)}
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
        <span>Showing {filtered.length} of {catalogProducts.length} results</span>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" disabled>Previous</Button>
          <Button size="sm" className="bg-primary text-primary-foreground h-8 w-8 p-0">1</Button>
          <Button variant="outline" size="sm">Next</Button>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete
                ? `This will remove ${pendingDelete.name} from dashboard and store.`
                : "This will remove this product from dashboard and store."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void confirmDelete()}>
              {pendingDelete && deletingId === pendingDelete.id ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
