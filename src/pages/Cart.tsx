import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { Trash2, Plus, Minus, ShoppingCart } from "lucide-react";

export default function Cart() {
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <ShoppingCart className="w-16 h-16 text-muted-foreground" />
        <h2 className="text-xl font-bold">Your Cart is Empty</h2>
        <p className="text-muted-foreground text-sm">Browse products and add items to your cart.</p>
        <Link to="/products"><Button className="bg-primary text-primary-foreground">Browse Products</Button></Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Dashboard &gt; Cart</p>
        <h1 className="text-2xl font-bold">Shopping Cart</h1>
        <p className="text-muted-foreground text-sm mt-1">{items.length} item(s) in your cart.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <Card key={item.id} className="bg-card border-border">
              <CardContent className="p-4 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${item.id}`} className="text-sm font-medium hover:text-primary">{item.name}</Link>
                  <p className="text-xs text-muted-foreground">{item.category}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
                <p className="text-sm font-bold w-24 text-right">PKR {(item.price * item.quantity).toFixed(2)}</p>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeFromCart(item.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-card border-border h-fit">
          <CardHeader><CardTitle className="text-base">Order Summary</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">PKR {totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax (10%)</span>
              <span className="font-medium">PKR {(totalPrice * 0.1).toFixed(2)}</span>
            </div>
            <div className="border-t border-border pt-3 flex justify-between text-base font-bold">
              <span>Total</span>
              <span>PKR {(totalPrice * 1.1).toFixed(2)}</span>
            </div>
            <Link to="/checkout">
              <Button className="w-full bg-primary text-primary-foreground mt-2">Proceed to Checkout</Button>
            </Link>
            <Button variant="outline" className="w-full" onClick={clearCart}>Clear Cart</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
