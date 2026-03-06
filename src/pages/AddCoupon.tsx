import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { createOrUpdateCoupon } from "@/lib/couponApi";
import { CalendarDays, CheckCircle, Eye, Globe, Info } from "lucide-react";

export default function AddCoupon() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState("fixed_cart");
  const [amount, setAmount] = useState("10");
  const [expiry, setExpiry] = useState("");
  const [freeShipping, setFreeShipping] = useState(false);
  const [individualUse, setIndividualUse] = useState(false);
  const [excludeSaleItems, setExcludeSaleItems] = useState(false);
  const [minSpend, setMinSpend] = useState("");
  const [maxSpend, setMaxSpend] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [limitPerUser, setLimitPerUser] = useState("");
  const [limitItems, setLimitItems] = useState("");
  const [emailRestrictions, setEmailRestrictions] = useState("");
  const [onlineVisible, setOnlineVisible] = useState(true);
  const [posVisible, setPosVisible] = useState(false);
  const [mobileVisible, setMobileVisible] = useState(true);

  const validateAndSave = async (redirect: boolean) => {
    const normalizedCode = code.trim().toUpperCase();
    const numericAmount = Number(amount);

    if (!normalizedCode) {
      toast({ title: "Coupon code is required", variant: "destructive" });
      return;
    }

    if (!/^[-A-Z0-9]{3,24}$/.test(normalizedCode)) {
      toast({ title: "Use 3-24 letters, numbers, or dashes", variant: "destructive" });
      return;
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      toast({ title: "Enter a valid amount", description: "Amount should be greater than zero.", variant: "destructive" });
      return;
    }

    const normalizedType = discountType === "fixed_product" || discountType === "fixed_cart" ? "fixed" : "percentage";
    const normalizedValue = normalizedType === "percentage"
      ? Math.min(Math.max(Math.round(numericAmount), 1), 100)
      : Math.max(Math.round(numericAmount), 1);

    try {
      await createOrUpdateCoupon({
        code: normalizedCode,
        description: description.trim(),
        discountType: normalizedType,
        value: normalizedValue,
        minOrderAmount: minSpend ? Number(minSpend) : null,
        maxOrderAmount: maxSpend ? Number(maxSpend) : null,
        usageLimit: usageLimit ? Number(usageLimit) : null,
        expiresAt: expiry ? new Date(`${expiry}T23:59:59`).toISOString() : null,
        isActive: onlineVisible || mobileVisible || posVisible,
      });
    } catch (error) {
      toast({
        title: "Could not save coupon",
        description: error instanceof Error ? error.message : "Please ensure local-sync-server is running.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Coupon saved",
      description: normalizedType === "percentage"
        ? `${normalizedCode} saved as ${normalizedValue}% off.`
        : `${normalizedCode} saved as Rs ${normalizedValue} off.`,
    });

    if (redirect) {
      navigate("/crm");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-3xl font-normal leading-tight">Add new coupon</h1>
          <p className="text-sm text-muted-foreground">Create a promotion code and control how it can be used.</p>
        </div>
        <div className="text-[11px] text-muted-foreground">Screen Options | Help</div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-4">
        <div className="space-y-4">
          <Card className="bg-card border-border">
            <CardContent className="space-y-4 p-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wide">Coupon code</Label>
                <Input
                  placeholder="e.g. SPRING25"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="bg-secondary border-none"
                />
                <p className="text-[11px] text-muted-foreground">Customers will enter this code at checkout.</p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wide">Description</Label>
                <Textarea
                  placeholder="Optional description for your reference."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-secondary border-none min-h-[90px]"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="border-b border-border p-4">
              <CardTitle className="text-lg font-semibold">Coupon data</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid grid-cols-3 w-full rounded-none border-b border-border bg-muted/40 h-11">
                  <TabsTrigger value="general" className="rounded-none">General</TabsTrigger>
                  <TabsTrigger value="restrictions" className="rounded-none">Usage restriction</TabsTrigger>
                  <TabsTrigger value="limits" className="rounded-none">Usage limits</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="p-4 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Discount type</Label>
                      <Select value={discountType} onValueChange={setDiscountType}>
                        <SelectTrigger className="bg-secondary border-none">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fixed_cart">Fixed cart discount</SelectItem>
                          <SelectItem value="percent">Percentage discount</SelectItem>
                          <SelectItem value="fixed_product">Fixed product discount</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Coupon amount</Label>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="bg-secondary border-none"
                      />
                      <p className="text-[11px] text-muted-foreground">Applied as a percentage at checkout today.</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Coupon expiry date</Label>
                      <div className="relative">
                        <Input
                          type="date"
                          value={expiry}
                          onChange={(e) => setExpiry(e.target.value)}
                          className="bg-secondary border-none pr-10"
                        />
                        <CalendarDays className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                    <div className="flex items-start justify-between gap-3 rounded-md border border-border/60 p-3">
                      <div>
                        <p className="text-sm font-medium">Allow free shipping</p>
                        <p className="text-[11px] text-muted-foreground">Requires a free shipping method in your zones.</p>
                      </div>
                      <Switch checked={freeShipping} onCheckedChange={setFreeShipping} />
                    </div>
                  </div>
                  <div className="flex items-start gap-2 rounded-md bg-muted/30 border border-border/70 p-3 text-[11px] text-muted-foreground">
                    <Info className="w-4 h-4 mt-0.5" />
                    <p>Other discount types are shown here for familiarity, but checkout currently redeems this coupon as a percentage off.</p>
                  </div>
                </TabsContent>

                <TabsContent value="restrictions" className="p-4 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Minimum spend</Label>
                      <Input type="number" min="0" value={minSpend} onChange={(e) => setMinSpend(e.target.value)} className="bg-secondary border-none" />
                    </div>
                    <div className="space-y-2">
                      <Label>Maximum spend</Label>
                      <Input type="number" min="0" value={maxSpend} onChange={(e) => setMaxSpend(e.target.value)} className="bg-secondary border-none" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-md border border-border/60 p-3">
                      <div>
                        <p className="text-sm font-medium">Individual use only</p>
                        <p className="text-[11px] text-muted-foreground">Prevent combining with other coupons.</p>
                      </div>
                      <Switch checked={individualUse} onCheckedChange={setIndividualUse} />
                    </div>
                    <div className="flex items-center justify-between rounded-md border border-border/60 p-3">
                      <div>
                        <p className="text-sm font-medium">Exclude sale items</p>
                        <p className="text-[11px] text-muted-foreground">Ignore products that are already discounted.</p>
                      </div>
                      <Switch checked={excludeSaleItems} onCheckedChange={setExcludeSaleItems} />
                    </div>
                    <div className="space-y-2">
                      <Label>Email restrictions</Label>
                      <Textarea
                        placeholder="Comma separated emails allowed to redeem"
                        value={emailRestrictions}
                        onChange={(e) => setEmailRestrictions(e.target.value)}
                        className="bg-secondary border-none min-h-[80px]"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="limits" className="p-4 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Usage limit per coupon</Label>
                      <Input type="number" min="0" value={usageLimit} onChange={(e) => setUsageLimit(e.target.value)} className="bg-secondary border-none" />
                    </div>
                    <div className="space-y-2">
                      <Label>Limit usage to X items</Label>
                      <Input type="number" min="0" value={limitItems} onChange={(e) => setLimitItems(e.target.value)} className="bg-secondary border-none" />
                    </div>
                    <div className="space-y-2">
                      <Label>Usage limit per user</Label>
                      <Input type="number" min="0" value={limitPerUser} onChange={(e) => setLimitPerUser(e.target.value)} className="bg-secondary border-none" />
                    </div>
                  </div>
                  <div className="flex items-start gap-2 rounded-md bg-muted/30 border border-border/70 p-3 text-[11px] text-muted-foreground">
                    <Info className="w-4 h-4 mt-0.5" />
                    <p>Limits are saved with the coupon for tracking, even if redemption logic is simplified in this demo.</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base font-semibold">Publish</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Status:</span>
                <span className="text-foreground">Draft</span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Visibility:</span>
                <span className="text-foreground">Public</span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Publish:</span>
                <span className="flex items-center gap-1 text-foreground">
                  <CalendarDays className="w-3.5 h-3.5" />
                  {expiry || "Immediately"}
                </span>
              </div>
              <Separator />
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="h-8" onClick={() => validateAndSave(false)}>
                  Save draft
                </Button>
                <Button size="sm" className="h-8 bg-primary text-primary-foreground" onClick={() => validateAndSave(true)}>
                  Publish
                </Button>
              </div>
              <div className="flex items-start gap-2 rounded-md bg-muted/40 p-3 text-[11px] text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-primary mt-0.5" />
                <p>Publishing saves the coupon and returns you to the coupon list.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base font-semibold">Channel visibility</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center justify-between rounded-md border border-border/60 p-3">
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="w-4 h-4" />
                  <span>Online store</span>
                </div>
                <Switch checked={onlineVisible} onCheckedChange={setOnlineVisible} />
              </div>
              <div className="flex items-center justify-between rounded-md border border-border/60 p-3">
                <div className="flex items-center gap-2 text-sm">
                  <Eye className="w-4 h-4" />
                  <span>POS / in-person</span>
                </div>
                <Switch checked={posVisible} onCheckedChange={setPosVisible} />
              </div>
              <div className="flex items-center justify-between rounded-md border border-border/60 p-3">
                <div className="flex items-center gap-2 text-sm">
                  <CalendarDays className="w-4 h-4" />
                  <span>Mobile app</span>
                </div>
                <Switch checked={mobileVisible} onCheckedChange={setMobileVisible} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base font-semibold">Notes</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              <Textarea
                placeholder="Internal notes about when to use this coupon."
                className="bg-secondary border-none min-h-[80px]"
              />
              <p className="text-[11px] text-muted-foreground">Notes are not shown to customers.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
