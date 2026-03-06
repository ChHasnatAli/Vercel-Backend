import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { toast } from "@/hooks/use-toast";
import { Coupon, findActiveCoupon } from "@/lib/coupons";
import { CheckCircle } from "lucide-react";

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [placed, setPlaced] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  const subtotal = totalPrice;
  const discountAmount = appliedCoupon ? (subtotal * appliedCoupon.discountPercent) / 100 : 0;
  const discountedSubtotal = Math.max(subtotal - discountAmount, 0);
  const taxAmount = discountedSubtotal * 0.1;
  const totalWithTax = discountedSubtotal + taxAmount;

  if (items.length === 0 && !placed) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <p className="text-muted-foreground">Your cart is empty.</p>
        <Link to="/products"><Button className="bg-primary text-primary-foreground">Browse Products</Button></Link>
      </div>
    );
  }

  if (placed) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <CheckCircle className="w-16 h-16 text-success" />
        <h2 className="text-2xl font-bold">Order Placed!</h2>
        <p className="text-muted-foreground text-sm">Thank you for your purchase.</p>
        <Link to="/orders"><Button className="bg-primary text-primary-foreground">View Orders</Button></Link>
      </div>
    );
  }

  const handlePlace = () => {
    clearCart();
    setAppliedCoupon(null);
    setCouponInput("");
    setPlaced(true);
    toast({ title: "Order placed successfully!" });
  };

  const handleApplyCoupon = () => {
    const code = couponInput.trim();
    if (!code) {
      setAppliedCoupon(null);
      toast({ title: "Coupon removed", description: "No coupon code applied." });
      return;
    }

    const coupon = findActiveCoupon(code);
    if (!coupon) {
      setAppliedCoupon(null);
      toast({ title: "Invalid coupon", description: "This coupon code is invalid or inactive.", variant: "destructive" });
      return;
    }

    setAppliedCoupon(coupon);
    setCouponInput(coupon.code);
    toast({ title: "Coupon applied", description: `${coupon.code} gives ${coupon.discountPercent}% off.` });
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Dashboard &gt; Cart &gt; Checkout</p>
        <h1 className="text-2xl font-bold">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-card border-border">
            <CardHeader><CardTitle className="text-base">Billing Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>First Name</Label><Input placeholder="John" className="bg-secondary border-none" /></div>
                <div className="space-y-2"><Label>Last Name</Label><Input placeholder="Doe" className="bg-secondary border-none" /></div>
              </div>
              <div className="space-y-2"><Label>Email</Label><Input type="email" placeholder="john@example.com" className="bg-secondary border-none" /></div>
              <div className="space-y-2"><Label>Card Number</Label><Input placeholder="4242 4242 4242 4242" className="bg-secondary border-none" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Expiry</Label><Input placeholder="MM/YY" className="bg-secondary border-none" /></div>
                <div className="space-y-2"><Label>CVC</Label><Input placeholder="123" className="bg-secondary border-none" /></div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card border-border h-fit">
          <CardHeader><CardTitle className="text-base">Summary</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{item.name} × {item.quantity}</span>
                <span>PKR {(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t border-border pt-3 space-y-2">
              <Label>Coupon Code</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter coupon code"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="bg-secondary border-none"
                />
                <Button type="button" variant="outline" onClick={handleApplyCoupon}>Apply</Button>
              </div>
            </div>
            <div className="border-t border-border pt-3 flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>PKR {subtotal.toFixed(2)}</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Coupon ({appliedCoupon.code} - {appliedCoupon.discountPercent}%)</span>
                <span className="text-success">-PKR {discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t border-border pt-3 flex justify-between text-sm">
              <span className="text-muted-foreground">Tax (10%)</span>
              <span>PKR {taxAmount.toFixed(2)}</span>
            </div>
            <div className="border-t border-border pt-3 flex justify-between text-base font-bold">
              <span>Total</span>
              <span>PKR {totalWithTax.toFixed(2)}</span>
            </div>
            <Button className="w-full bg-primary text-primary-foreground mt-2" onClick={handlePlace}>Place Order</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
