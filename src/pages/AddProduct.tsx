import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { saveCoupon } from "@/lib/coupons";
import { allProducts } from "@/data/products";
import { updateProductOutOfStock } from "@/lib/productStockApi";
import { createStoreProduct } from "@/lib/storeProductApi";

export default function AddProduct() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("0.00");
  const [stock, setStock] = useState("1");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("draft");
  const [storeProductId, setStoreProductId] = useState("");
  const [isOutOfStock, setIsOutOfStock] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState("10");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [savingStock, setSavingStock] = useState(false);

  const saveAdminCoupon = () => {
    const normalizedCode = couponCode.trim().toUpperCase();
    const discountValue = Number(couponDiscount);

    if (!normalizedCode) {
      toast({ title: "Error", description: "Coupon code is required.", variant: "destructive" });
      return;
    }

    if (!/^\w{3,20}$/.test(normalizedCode)) {
      toast({ title: "Error", description: "Use 3-20 letters/numbers for coupon code.", variant: "destructive" });
      return;
    }

    if (!Number.isFinite(discountValue) || discountValue < 1 || discountValue > 100) {
      toast({ title: "Error", description: "Discount must be between 1 and 100.", variant: "destructive" });
      return;
    }

    saveCoupon(normalizedCode, discountValue);
    toast({ title: "Coupon saved", description: `${normalizedCode} is ready for customers (${discountValue}% off).` });
  };

  const fetchFromStoreByName = () => {
    const query = name.trim().toLowerCase();

    if (!query) {
      toast({ title: "Name required", description: "Write product name first.", variant: "destructive" });
      return;
    }

    const exact = allProducts.find((product) => product.name.toLowerCase() === query);
    const partial = allProducts.find((product) => product.name.toLowerCase().includes(query));
    const matched = exact ?? partial;

    if (!matched) {
      toast({ title: "Not found", description: "No matching product found in store catalog.", variant: "destructive" });
      return;
    }

    setStoreProductId(matched.id);
    setName(matched.name);
    setDescription(matched.desc);
    setCategory(matched.category);
    setPrice(String(matched.price));
    setStock(String(matched.stock));
    setStatus(matched.status);
    setImage(null);
    setImagePreview(matched.image);
    setIsOutOfStock(matched.stock <= 0);

    toast({ title: "Store product loaded", description: `Image and details fetched for ${matched.name}.` });
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast({ title: "Error", description: "Product name is required.", variant: "destructive" });
      return;
    }

    if (!description.trim()) {
      toast({ title: "Error", description: "Product description is required.", variant: "destructive" });
      return;
    }

    const parsedPrice = Number(price);
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      toast({ title: "Error", description: "Enter a valid price greater than 0.", variant: "destructive" });
      return;
    }

    if (!category.trim()) {
      toast({ title: "Error", description: "Product category is required.", variant: "destructive" });
      return;
    }

    if (!imagePreview) {
      toast({ title: "Error", description: "Product image is required.", variant: "destructive" });
      return;
    }

    const normalizedName = name.trim().toLowerCase();
    const linkedProduct = storeProductId
      ? allProducts.find((product) => product.id === storeProductId)
      : allProducts.find((product) => product.name.toLowerCase() === normalizedName);

    try {
      setSavingStock(true);
      const stockValue = Number(stock);
      const shouldMarkOutOfStock = isOutOfStock || (!Number.isNaN(stockValue) && stockValue <= 0);

      let targetProductId = linkedProduct?.id ?? "";

      if (!targetProductId) {
        const createdProduct = await createStoreProduct({
          name: name.trim(),
          description: description.trim(),
          price: parsedPrice,
          stock: !Number.isNaN(stockValue) ? Math.max(0, Math.trunc(stockValue)) : 1,
          category: category.trim(),
          image: imagePreview,
          concerns: [],
          rating: 0,
          reviews: 0,
        });
        targetProductId = createdProduct.id;
      }

      await updateProductOutOfStock(targetProductId, shouldMarkOutOfStock);
      toast({
        title: "Product synced",
        description: `${name.trim()} is now ${shouldMarkOutOfStock ? "out of stock" : "in stock"} and visible in store cards.`,
      });
    } catch {
      toast({ title: "Error", description: "Could not save product to store.", variant: "destructive" });
      return;
    } finally {
      setSavingStock(false);
    }

    toast({ title: "Product saved", description: `"${name}" has been updated in dashboard.` });
    navigate("/products");
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Dashboard &gt; Products &gt; New Product</p>
        <h1 className="text-2xl font-bold">New Product</h1>
        <p className="text-muted-foreground text-sm mt-1">Add a new product to the catalog.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base">Product Information</CardTitle>
              <CardDescription>Enter the basic details for the new product.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>Image</Label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setImage(file);
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        setImagePreview(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    } else {
                      setImagePreview("");
                    }
                  }}
                  className="w-full text-sm text-white"
                />
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" className="mt-2 h-24 w-24 object-cover rounded" />
                )}
              </div>
              <div className="space-y-2">
                <Label>Name</Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input placeholder="Product name" value={name} onChange={(e) => setName(e.target.value)} className="bg-secondary border-none" />
                  <Button type="button" variant="outline" onClick={fetchFromStoreByName}>Fetch from store</Button>
                </div>
                <p className="text-xs text-muted-foreground">Type product name and click Fetch from store to auto-load image/details from Infusion store.</p>
              </div>
              <div className="space-y-2">
                <Label> Short Description</Label>
                <Textarea placeholder="Product Short description" value={description} onChange={(e) => setDescription(e.target.value)} className="bg-secondary border-none min-h-[100px]" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="Product description" value={description} onChange={(e) => setDescription(e.target.value)} className="bg-secondary border-none min-h-[100px]" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price (PKR)</Label>
                  <Input type="number" placeholder="0.00" value={price} onChange={(e) => setPrice(e.target.value)} className="bg-secondary border-none" />
                </div>
                <div className="space-y-2">
                  <Label>Stock</Label>
                  <Input type="number" placeholder="0" value={stock} onChange={(e) => setStock(e.target.value)} className="bg-secondary border-none" />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-md border border-border p-3">
                <div>
                  <p className="text-sm font-medium">Out of stock</p>
                  <p className="text-xs text-muted-foreground">Show this product as out of stock in Infusion store.</p>
                </div>
                <Switch checked={isOutOfStock} onCheckedChange={setIsOutOfStock} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base">Organization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="bg-secondary border-none">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Herb">Herb</SelectItem>
                    <SelectItem value="Oils">Oils</SelectItem>
                    <SelectItem value="Teas">Teas</SelectItem>
                    <SelectItem value="Remedies">Remedies</SelectItem>
                    <SelectItem value="Capsules">Capsules</SelectItem>
                    <SelectItem value="Fresh">Fresh</SelectItem>
                    <SelectItem value="Spices">Spices</SelectItem>
                    <SelectItem value="Salts">Salts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="bg-secondary border-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base">Create Coupon (Admin)</CardTitle>
              <CardDescription>Share this code with followers so they get discounted price at checkout.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Coupon Code</Label>
                <Input
                  placeholder="e.g. 2597"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="bg-secondary border-none"
                />
              </div>
              <div className="space-y-2">
                <Label>Discount (%)</Label>
                <Input
                  type="number"
                  placeholder="10"
                  value={couponDiscount}
                  onChange={(e) => setCouponDiscount(e.target.value)}
                  className="bg-secondary border-none"
                />
              </div>
              <Button type="button" variant="outline" className="w-full" onClick={saveAdminCoupon}>
                Save Coupon
              </Button>
            </CardContent>
          </Card>

          <Button onClick={() => void handleSubmit()} className="w-full bg-primary text-primary-foreground" disabled={savingStock}>
            {savingStock ? "Saving..." : "Create Product"}
          </Button>
          <Button variant="outline" className="w-full" onClick={() => navigate("/products")}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}
