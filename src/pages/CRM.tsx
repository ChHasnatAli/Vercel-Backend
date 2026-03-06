import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle } from "lucide-react";
import { fetchCoupons, type SharedCoupon } from "@/lib/couponApi";

export default function CRM() {
  const [coupons, setCoupons] = useState<SharedCoupon[]>([]);
  const [searchText, setSearchText] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadCoupons = async () => {
      try {
        const data = await fetchCoupons();
        if (!isMounted) {
          return;
        }
        setCoupons(data);
        setError(null);
      } catch {
        if (isMounted) {
          setError("Could not load coupons. Please start local-sync-server.");
        }
      }
    };

    void loadCoupons();
    const intervalId = window.setInterval(() => {
      void loadCoupons();
    }, 5000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const filteredCoupons = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    if (!query) {
      return coupons;
    }

    return coupons.filter((coupon) => {
      return coupon.code.toLowerCase().includes(query) || coupon.description.toLowerCase().includes(query);
    });
  }, [coupons, searchText]);

  const toCouponTypeLabel = (discountType: SharedCoupon["discountType"]) => {
    return discountType === "fixed" ? "Fixed cart discount" : "Percentage discount";
  };

  const toAmountLabel = (coupon: SharedCoupon) => {
    return coupon.discountType === "fixed" ? `Rs ${coupon.value}` : `${coupon.value}%`;
  };

  const toUsageLabel = (coupon: SharedCoupon) => {
    const limitLabel = coupon.usageLimit === null ? "∞" : String(coupon.usageLimit);
    return `${coupon.usedCount} / ${limitLabel}`;
  };

  const toExpiryLabel = (coupon: SharedCoupon) => {
    if (!coupon.expiresAt) {
      return "—";
    }
    const date = new Date(coupon.expiresAt);
    if (Number.isNaN(date.getTime())) {
      return "—";
    }
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-normal leading-none">Coupons</h1>
          <Link to="/crm/new">
            <Button variant="outline" size="sm" className="h-7 text-xs">Add new coupon</Button>
          </Link>
        </div>
        <div className="text-[11px] text-muted-foreground">Screen Options | Help</div>
      </div>

      <div className="border border-border bg-card px-3 py-2 text-[11px] text-muted-foreground">
        Awesome, you&apos;ve been using WooCommerce Advanced Product Labels Plugin for more than 1 week. May we ask you to give it a 5-star rating on WordPress?
      </div>

      <div className="border border-border bg-card">
        <div className="grid grid-cols-[52px_1fr]">
          <div className="border-r border-border bg-muted/60 flex items-start justify-center py-4">
            <div className="h-5 w-5 rounded-full bg-destructive/15 text-destructive flex items-center justify-center mt-1">
              <AlertCircle className="h-3 w-3" />
            </div>
          </div>
          <div className="p-4 space-y-2">
            <p className="text-base font-semibold">Your License Is Inactive</p>
            <p className="text-xs text-muted-foreground">
              Your license key has been cancelled (most likely due to a refund request). Please consider acquiring a new license.
            </p>
            <Button size="sm" className="h-7 text-xs">Activate License</Button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <a className="text-primary">All ({filteredCoupons.length})</a>
          <span>|</span>
          <a className="text-primary">Published ({filteredCoupons.filter((coupon) => coupon.isActive).length})</a>
          <span>|</span>
          <a>Manually Published ({filteredCoupons.length})</a>
        </div>
        <div className="text-muted-foreground">{filteredCoupons.length} items</div>
      </div>

      <Card>
        <CardContent className="p-3 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" className="h-7 text-xs font-normal">Bulk actions</Button>
              <Button variant="outline" size="sm" className="h-7 text-xs">Apply</Button>
              <Button variant="outline" size="sm" className="h-7 text-xs font-normal">Show all types</Button>
              <Button variant="outline" size="sm" className="h-7 text-xs">Filter</Button>
            </div>
            <div className="flex items-center gap-2">
              <Input
                className="h-7 w-48 text-xs"
                placeholder="Search by code"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
              />
              <Button variant="outline" size="sm" className="h-7 text-xs">Search coupons</Button>
            </div>
          </div>

          {error ? <p className="text-xs text-destructive">{error}</p> : null}

          <div className="rounded-sm border border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-8" />
                  <TableHead className="text-xs">Code</TableHead>
                  <TableHead className="text-xs">Coupon type</TableHead>
                  <TableHead className="text-xs">Coupon amount</TableHead>
                  <TableHead className="text-xs">Description</TableHead>
                  <TableHead className="text-xs">Product IDs</TableHead>
                  <TableHead className="text-xs">Usage / Limit</TableHead>
                  <TableHead className="text-xs">Expiry date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCoupons.map((coupon) => (
                  <TableRow key={coupon.code} className="text-xs">
                    <TableCell>
                      <input type="checkbox" className="h-3.5 w-3.5" />
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-primary">{coupon.code.toLowerCase()}</div>
                      <div className="text-[11px] text-muted-foreground">Edit | API-backed coupon</div>
                    </TableCell>
                    <TableCell>{toCouponTypeLabel(coupon.discountType)}</TableCell>
                    <TableCell>{toAmountLabel(coupon)}</TableCell>
                    <TableCell>{coupon.description || "—"}</TableCell>
                    <TableCell>—</TableCell>
                    <TableCell>{toUsageLabel(coupon)}</TableCell>
                    <TableCell>{toExpiryLabel(coupon)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-7 text-xs font-normal">Bulk actions</Button>
              <Button variant="outline" size="sm" className="h-7 text-xs">Apply</Button>
            </div>
            <div className="text-muted-foreground">{filteredCoupons.length} items</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-border bg-muted/20">
            <h3 className="text-2xl font-normal">WooCommerce knowledge base</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Learn the ins and outs of successful coupon marketing from the experts at WooCommerce.
            </p>
          </div>
          <div className="p-8 text-center">
            <p className="text-xl">No posts yet</p>
            <p className="text-xs text-muted-foreground mt-2">Read the WooCommerce blog for more tips on marketing your store</p>
          </div>
        </CardContent>
      </Card>

      <div className="h-2" />
    </div>
  );
}
