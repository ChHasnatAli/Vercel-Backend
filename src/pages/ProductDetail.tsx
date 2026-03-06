import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Package, ShoppingCart, ArrowLeft, Trash2 } from "lucide-react";
import { allProducts } from "@/data/products";
import { useCart } from "@/contexts/CartContext";
import { fetchProductStockMap, updateProductOutOfStock } from "@/lib/productStockApi";
import { toast } from "@/hooks/use-toast";
import { createStoreProduct, deleteStoreProduct, fetchDeletedProductIds, fetchStoreProducts } from "@/lib/storeProductApi";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [remoteProduct, setRemoteProduct] = useState<(typeof allProducts)[number] | null>(null);
  const [isDeleted, setIsDeleted] = useState(false);
  const product = remoteProduct ?? allProducts.find((p) => p.id === id);
  const { addToCart } = useCart();
  const [isOutOfStock, setIsOutOfStock] = useState(false);
  const [savingStock, setSavingStock] = useState(false);
  const [savingDetails, setSavingDetails] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    desc: "",
    category: "",
    price: "",
    stock: "",
    image: "",
  });

  useEffect(() => {
    let isMounted = true;

    const loadRemoteProduct = async () => {
      if (!id) {
        return;
      }

      try {
        const [remoteProducts, deletedProductIds] = await Promise.all([
          fetchStoreProducts(),
          fetchDeletedProductIds(),
        ]);
        if (!isMounted) {
          return;
        }
        if (id && deletedProductIds.includes(id)) {
          setIsDeleted(true);
          return;
        }
        const matched = remoteProducts.find((item) => item.id === id);
        if (!matched) {
          return;
        }

        setRemoteProduct({
          id: matched.id,
          name: matched.name,
          desc: matched.description ?? "",
          category: matched.category,
          status: "active",
          stock: Number.isFinite(matched.stock) ? Math.max(0, Number(matched.stock)) : 1,
          price: matched.price,
          priceFormatted: `PKR ${Number(matched.price).toLocaleString("en-PK")}`,
          created: "Recently added",
          image: matched.image,
        });
      } catch {
        if (isMounted) {
          setRemoteProduct(null);
        }
      }
    };

    void loadRemoteProduct();

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (!product) {
      return;
    }

    setEditForm({
      name: product.name ?? "",
      desc: product.desc ?? "",
      category: product.category ?? "",
      price: String(product.price ?? ""),
      stock: String(product.stock ?? ""),
      image: product.image ?? "",
    });
  }, [product]);

  useEffect(() => {
    let isMounted = true;

    const loadStock = async () => {
      if (!product) {
        return;
      }

      try {
        const stockMap = await fetchProductStockMap();
        if (!isMounted) {
          return;
        }
        setIsOutOfStock(Boolean(stockMap[product.id]) || product.stock <= 0);
      } catch {
        if (isMounted) {
          setIsOutOfStock(product.stock <= 0);
        }
      }
    };

    void loadStock();

    return () => {
      isMounted = false;
    };
  }, [product]);

  const handleToggleStock = async () => {
    if (!product) {
      return;
    }

    try {
      setSavingStock(true);
      const nextOutOfStock = !isOutOfStock;
      await updateProductOutOfStock(product.id, nextOutOfStock);
      setIsOutOfStock(nextOutOfStock);
      toast({
        title: "Stock updated",
        description: `${product.name} marked as ${nextOutOfStock ? "out of stock" : "in stock"}.`,
      });
    } catch {
      toast({
        title: "Error",
        description: "Could not update product stock status.",
        variant: "destructive",
      });
    } finally {
      setSavingStock(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!product) {
      return;
    }

    try {
      setDeleting(true);
      await deleteStoreProduct(product.id);
      toast({
        title: "Product deleted",
        description: `${product.name} was removed from dashboard and store.`,
      });
      navigate("/products");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Could not delete product.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleSaveDetails = async () => {
    if (!product) {
      return;
    }

    const price = Number(editForm.price);
    const stock = Number(editForm.stock);

    if (!editForm.name.trim()) {
      toast({ title: "Error", description: "Product name is required.", variant: "destructive" });
      return;
    }
    if (!editForm.category.trim()) {
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
    if (!editForm.image.trim()) {
      toast({ title: "Error", description: "Image URL is required.", variant: "destructive" });
      return;
    }

    try {
      setSavingDetails(true);

      const saved = await createStoreProduct({
        id: product.id,
        name: editForm.name.trim(),
        description: editForm.desc.trim(),
        category: editForm.category.trim(),
        price,
        stock,
        image: editForm.image.trim(),
      });

      await updateProductOutOfStock(product.id, stock <= 0);

      const updated = {
        id: saved.id,
        name: saved.name,
        desc: saved.description ?? "",
        category: saved.category,
        status: "active" as const,
        stock: Number.isFinite(saved.stock) ? Math.max(0, Number(saved.stock)) : stock,
        price: Number(saved.price),
        priceFormatted: `PKR ${Number(saved.price).toLocaleString("en-PK")}`,
        created: "Recently updated",
        image: saved.image,
      };

      setRemoteProduct(updated);
      setIsOutOfStock(stock <= 0);
      toast({ title: "Saved", description: "Product details updated successfully." });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Could not save product details.",
        variant: "destructive",
      });
    } finally {
      setSavingDetails(false);
    }
  };

  if (!product || isDeleted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Package className="w-16 h-16 text-muted-foreground" />
        <h2 className="text-xl font-bold">Product Not Found</h2>
        <Link to="/products"><Button variant="outline">Back to Products</Button></Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">Dashboard</Link> &gt;{" "}
          <Link to="/products" className="hover:text-primary">Products</Link> &gt; {product.name}
        </p>
      </div>

      <Link to="/products" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="w-4 h-4" /> Back to Products
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-20 h-20 rounded-xl object-cover border border-border flex-shrink-0"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                    <Package className="w-10 h-10 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl font-bold">{product.name}</h1>
                    <Badge className={`text-xs capitalize ${product.status === "active" ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"}`}>
                      {product.status}
                    </Badge>
                    <Badge className={`text-xs uppercase ${isOutOfStock ? "bg-destructive text-destructive-foreground" : "bg-success text-success-foreground"}`}>
                      {isOutOfStock ? "Out of stock" : "In stock"}
                    </Badge>
                  </div>
                  <Badge variant="outline" className="mt-2 text-xs">{product.category}</Badge>
                  <p className="text-muted-foreground mt-3 text-sm">{product.desc}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader><CardTitle className="text-base">Product Details</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <p className="text-xs text-muted-foreground mb-1">Name</p>
                  <Input value={editForm.name} onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Price</p>
                  <Input type="number" min={0} value={editForm.price} onChange={(e) => setEditForm((prev) => ({ ...prev, price: e.target.value }))} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Stock</p>
                  <Input type="number" min={0} value={editForm.stock} onChange={(e) => setEditForm((prev) => ({ ...prev, stock: e.target.value }))} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Category</p>
                  <Input value={editForm.category} onChange={(e) => setEditForm((prev) => ({ ...prev, category: e.target.value }))} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Created</p>
                  <p className="text-sm font-medium pt-2">{product.created}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs text-muted-foreground mb-1">Image URL</p>
                  <Input value={editForm.image} onChange={(e) => setEditForm((prev) => ({ ...prev, image: e.target.value }))} />
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs text-muted-foreground mb-1">Description</p>
                  <Textarea rows={4} value={editForm.desc} onChange={(e) => setEditForm((prev) => ({ ...prev, desc: e.target.value }))} />
                </div>
                <div className="sm:col-span-2">
                  <Button onClick={() => void handleSaveDetails()} disabled={savingDetails}>
                    {savingDetails ? "Saving..." : "Save Product Details"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="bg-card border-border">
            <CardContent className="p-6 space-y-4">
              <p className="text-3xl font-bold">{product.priceFormatted}</p>
              <p className="text-xs text-muted-foreground">In stock: {isOutOfStock ? 0 : product.stock} units</p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => void handleToggleStock()}
                disabled={savingStock}
              >
                {savingStock ? "Saving..." : isOutOfStock ? "Mark in stock" : "Mark out of stock"}
              </Button>
              <Button
                className="w-full bg-primary text-primary-foreground gap-2"
                disabled={isOutOfStock}
                onClick={() => addToCart({ id: product.id, name: product.name, price: product.price, category: product.category })}
              >
                <ShoppingCart className="w-4 h-4" /> Add to Cart
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="w-full gap-2"
                    disabled={deleting}
                  >
                    <Trash2 className="w-4 h-4" /> {deleting ? "Deleting..." : "Delete Product"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete product?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will remove {product.name} from dashboard and store.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => void handleDeleteProduct()}>
                      {deleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
