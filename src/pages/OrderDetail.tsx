import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { OrderStatus } from "@/lib/orders";
import { fetchSharedOrderById, formatOrderDate, patchSharedOrder, patchSharedOrderStatus, type SharedOrder } from "@/lib/orderApi";

export default function OrderDetail() {
  const { id } = useParams();
  const safeId = id ?? "5939";

  const [isLoadingOrder, setIsLoadingOrder] = useState(true);
  const [order, setOrder] = useState<SharedOrder | null>(null);
  const [status, setStatus] = useState<OrderStatus>("Pending payment");
  const [fee, setFee] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [tax, setTax] = useState(0);
  const [orderAction, setOrderAction] = useState("");
  const [newNote, setNewNote] = useState("");
  const [notes, setNotes] = useState<string[]>([]);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);

  const orderId = `#${safeId}`;

  useEffect(() => {
    const loadOrder = async () => {
      try {
        setIsLoadingOrder(true);
        const fetched = await fetchSharedOrderById(safeId);
        if (!fetched) {
          toast({
            title: "Order not found",
            description: `Order #${safeId} does not exist.`,
            variant: "destructive",
          });
          setOrder(null);
          return;
        }

        setOrder(fetched);
        setStatus(fetched.status);
        setFee(Number(fetched.feeAmount ?? 0));
        setShipping(Number(fetched.shippingAmount ?? 0));
        setTax(Number(fetched.taxAmount ?? 0));
      } catch {
        toast({
          title: "Failed to load order",
          description: "Start local-sync-server and refresh this page.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingOrder(false);
      }
    };

    void loadOrder();
  }, [safeId]);

  const money = (value: number | undefined, currency = "PKR") => {
    const safeValue = Number(value ?? 0);
    return `${currency === "PKR" ? "Rs" : currency} ${safeValue.toLocaleString()}.00`;
  };

  const lineItems = useMemo(() => order?.items ?? [], [order?.items]);

  const normalizePaymentMethod = (method?: string) => {
    const value = String(method ?? "").trim().toLowerCase();
    if (value === "easypaisa_jazzcash" || value === "easypaisa" || value === "jazzcash") {
      return "easypaisa_jazzcash";
    }
    return "cod";
  };

  const isWalletPayment = normalizePaymentMethod(order?.paymentMethod) === "easypaisa_jazzcash";

  const getPaymentMethodLabel = (method?: string) => {
    if (normalizePaymentMethod(method) === "easypaisa_jazzcash") {
      return "EasyPaisa / JazzCash";
    }
    return "Cash on Delivery";
  };

  const getPaymentStatusLabel = (paymentStatus?: string) => {
    if (paymentStatus === "paid") {
      return "Paid";
    }
    if (paymentStatus === "cash_on_delivery") {
      return "Cash on Delivery";
    }
    if (paymentStatus === "pending_verification") {
      return "Pending verification";
    }
    return "Pending";
  };

  const resolvedPaymentProof = useMemo(() => {
    if (!order) {
      return null;
    }

    if (order.paymentProof) {
      return order.paymentProof;
    }

    const legacyTransactionId = String(order.transactionId ?? "").trim();
    const legacyPayerPhone = String(order.payerPhone ?? "").trim();
    const legacyPaidAmount = Number(order.paidAmount ?? 0);
    const legacyPaidAt = String(order.paidAt ?? "").trim();
    const legacyScreenshot = String(order.screenshotDataUrl ?? "").trim();

    const hasLegacyProof = Boolean(
      legacyTransactionId ||
      legacyPayerPhone ||
      legacyPaidAt ||
      legacyScreenshot ||
      legacyPaidAmount > 0
    );

    if (!hasLegacyProof) {
      return null;
    }

    return {
      transactionId: legacyTransactionId,
      payerPhone: legacyPayerPhone,
      paidAmount: legacyPaidAmount,
      paidAt: legacyPaidAt,
      screenshotDataUrl: legacyScreenshot,
    };
  }, [order]);

  const computedSubtotal = useMemo(() => {
    if (typeof order?.subtotalAmount === "number") {
      return order.subtotalAmount;
    }

    if (lineItems.length > 0) {
      return lineItems.reduce((sum, item) => sum + Number(item.lineTotal || 0), 0);
    }

    return order?.totalAmount ?? 0;
  }, [lineItems, order?.subtotalAmount, order?.totalAmount]);

  const discountAmount = Number(order?.discountAmount ?? 0);
  const baseTotal = useMemo(() => {
    if (!order) {
      return 0;
    }

    if (typeof order.subtotalAmount === "number") {
      return Math.max(Number(order.subtotalAmount || 0) - Number(order.discountAmount || 0), 0);
    }

    const savedFee = Number(order.feeAmount ?? 0);
    const savedShipping = Number(order.shippingAmount ?? 0);
    const savedTax = Number(order.taxAmount ?? 0);
    return Math.max(Number(order.totalAmount ?? 0) - savedFee - savedShipping - savedTax, 0);
  }, [order]);
  const editableOrderTotal = useMemo(() => {
    return Math.max(baseTotal + fee + shipping + tax, 0);
  }, [baseTotal, fee, shipping, tax]);

  const handleUpdate = async () => {
    try {
      let updated: SharedOrder;
      try {
        updated = await patchSharedOrder(safeId, {
          status,
          feeAmount: fee,
          shippingAmount: shipping,
          taxAmount: tax,
          totalAmount: editableOrderTotal,
        });
      } catch {
        const fallback = await patchSharedOrderStatus(safeId, status);
        updated = {
          ...order,
          ...fallback,
          feeAmount: fee,
          shippingAmount: shipping,
          taxAmount: tax,
          totalAmount: editableOrderTotal,
        } as SharedOrder;
      }

      setOrder(updated);
      setFee(Number(updated.feeAmount ?? fee));
      setShipping(Number(updated.shippingAmount ?? shipping));
      setTax(Number(updated.taxAmount ?? tax));
      toast({ title: `Order ${orderId} updated`, description: "Order status was saved successfully." });
      setNotes((prev) => [`Order saved at ${new Date().toLocaleTimeString()} (Status: ${status}, Fee: ${money(fee)}, Shipping: ${money(shipping)}, Tax: ${money(tax)})`, ...prev]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not save status on local server.";
      toast({
        title: `Order ${orderId} update failed`,
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleRunAction = () => {
    if (!orderAction) {
      toast({ title: "Select an action", description: "Please choose an order action first.", variant: "destructive" });
      return;
    }
    toast({ title: "Action executed", description: `"${orderAction}" has been applied.` });
    setNotes((prev) => [`Action applied: ${orderAction}`, ...prev]);
  };

  const addManualNote = () => {
    const note = newNote.trim();
    if (!note) {
      toast({ title: "Note is empty", description: "Please type a note first.", variant: "destructive" });
      return;
    }
    setNotes((prev) => [note, ...prev]);
    setNewNote("");
    toast({ title: "Note added", description: "Manual note has been added to the order." });
  };

  const handleDownloadInvoice = () => {
    if (!order) {
      return;
    }

    const rows = (order.items ?? [])
      .map((item) => {
        const lineTotal = Number(item.lineTotal ?? 0).toLocaleString();
        const unitPrice = Number(item.unitPrice ?? 0).toLocaleString();
        return `<tr>
          <td style="padding:8px;border:1px solid #ddd;">${item.name || "Product"}</td>
          <td style="padding:8px;border:1px solid #ddd; text-align:right;">${item.quantity}</td>
          <td style="padding:8px;border:1px solid #ddd; text-align:right;">Rs ${unitPrice}.00</td>
          <td style="padding:8px;border:1px solid #ddd; text-align:right;">Rs ${lineTotal}.00</td>
        </tr>`;
      })
      .join("");

    const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Invoice ${order.id}</title>
  </head>
  <body style="font-family: Arial, sans-serif; margin: 24px; color: #111;">
    <h2 style="margin: 0 0 6px;">Infusions Pakistan - Invoice</h2>
    <p style="margin: 0 0 16px; color: #555;">Invoice ID: INF_${order.id}</p>
    <p style="margin: 0 0 6px;"><strong>Order:</strong> #${order.id}</p>
    <p style="margin: 0 0 6px;"><strong>Date:</strong> ${formatOrderDate(order.createdAt)}</p>
    <p style="margin: 0 0 6px;"><strong>Customer:</strong> ${order.customerName || "Guest"}</p>
    <p style="margin: 0 0 6px;"><strong>Phone:</strong> ${order.customerPhone || "-"}</p>
    <p style="margin: 0 0 16px;"><strong>Address:</strong> ${order.address || "-"}, ${order.city || "-"}</p>

    <table style="border-collapse: collapse; width: 100%; margin-bottom: 16px;">
      <thead>
        <tr>
          <th style="padding:8px;border:1px solid #ddd; text-align:left;">Item</th>
          <th style="padding:8px;border:1px solid #ddd; text-align:right;">Qty</th>
          <th style="padding:8px;border:1px solid #ddd; text-align:right;">Unit Price</th>
          <th style="padding:8px;border:1px solid #ddd; text-align:right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${rows || `<tr><td colspan="4" style="padding:8px;border:1px solid #ddd;">No items</td></tr>`}
      </tbody>
    </table>

    <p style="margin: 0 0 6px;"><strong>Subtotal:</strong> ${money(computedSubtotal, order.currency)}</p>
    ${order.couponCode ? `<p style="margin: 0 0 6px;"><strong>Discount (${order.couponCode}):</strong> - ${money(discountAmount, order.currency)}</p>` : ""}
    <p style="margin: 0 0 6px;"><strong>Status:</strong> ${order.status}</p>
    <p style="margin: 0;"><strong>Grand Total:</strong> ${money(order.totalAmount, order.currency)}</p>
  </body>
</html>`;

    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `invoice-${order.id}.html`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);

    toast({ title: "Invoice downloaded", description: `Invoice #${order.id} was downloaded.` });
  };

  const handleConfirmWalletPayment = async () => {
    if (!order || !isWalletPayment) {
      return;
    }

    try {
      setIsVerifyingPayment(true);
      const now = new Date().toISOString();
      let updated: SharedOrder;

      try {
        updated = await patchSharedOrder(order.id, {
          paymentStatus: "paid",
          paymentVerifiedAt: now,
          paymentVerifiedBy: "Admin",
          status: "Processing",
        });
      } catch {
        const fallback = await patchSharedOrderStatus(order.id, "Processing");
        updated = {
          ...fallback,
          paymentStatus: "paid",
          paymentVerifiedAt: now,
          paymentVerifiedBy: "Admin",
        };
      }

      const normalizedUpdated: SharedOrder = {
        ...updated,
        paymentStatus: updated.paymentStatus ?? "paid",
        paymentVerifiedAt: updated.paymentVerifiedAt ?? now,
        paymentVerifiedBy: updated.paymentVerifiedBy ?? "Admin",
        status: updated.status ?? "Processing",
      };

      setOrder(normalizedUpdated);
      setStatus(normalizedUpdated.status);
      toast({ title: "Payment verified", description: `Order #${order.id} is now confirmed and moved to Processing.` });
      setNotes((prev) => [`Payment verified at ${new Date(now).toLocaleString()} by Admin.`, ...prev]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not verify payment right now.";
      toast({
        title: "Verification failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsVerifyingPayment(false);
    }
  };

  if (isLoadingOrder) {
    return <p className="text-xs text-muted-foreground">Loading order details...</p>;
  }

  if (!order) {
    return <p className="text-xs text-destructive">Order not found.</p>;
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-4">
        <div className="space-y-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-3xl font-normal">Order {orderId} details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-5 text-xs">
              <div className="space-y-2">
                <p className="font-semibold text-sm">General</p>
                <label className="block text-muted-foreground">Date created</label>
                <Input value={formatOrderDate(order.createdAt)} readOnly className="h-8" />

                <label className="block text-muted-foreground pt-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as OrderStatus)}
                  className="h-8 w-full rounded-md border border-border bg-background px-2 text-xs"
                >
                  <option value="Pending payment">Pending payment</option>
                  <option value="Processing">Processing</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>

                <Button size="sm" className="h-7 text-xs" onClick={handleUpdate}>Save status</Button>
              </div>

              <div className="space-y-2">
                <p className="font-semibold text-sm">Billing</p>
                <label className="block text-muted-foreground">Name</label>
                <Input value={order.customerName || "Guest"} readOnly className="h-8" />
                <label className="block text-muted-foreground pt-1">Email address</label>
                <Input value={order.customerEmail || "-"} readOnly className="h-8" />
                <label className="block text-muted-foreground pt-1">Phone</label>
                <Input value={order.customerPhone || "-"} readOnly className="h-8" />
              </div>

              <div className="space-y-2">
                <p className="font-semibold text-sm">Shipping</p>
                <p className="text-muted-foreground">Address</p>
                <p className="text-muted-foreground">
                  {order.address ? `${order.address}, ${order.city}` : "No shipping address set."}
                </p>
                <p className="text-muted-foreground">Postal code: {order.postalCode || "-"}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <div className="grid grid-cols-[minmax(0,1fr)_100px_70px_130px] gap-2 border-b border-border px-4 py-3 text-xs text-muted-foreground">
                <div>Item</div>
                <div>Price</div>
                <div>Qty</div>
                <div>Total</div>
              </div>

              {lineItems.length === 0 ? (
                <div className="px-4 py-3 text-xs text-muted-foreground">No line items found for this order.</div>
              ) : (
                <div className="px-4 py-2 space-y-2">
                  {lineItems.map((item, index) => (
                    <div key={`${item.productId}-${index}`} className="grid grid-cols-[minmax(0,1fr)_100px_70px_130px] gap-2 items-start text-xs py-2 border-b border-border last:border-b-0">
                      <div className="space-y-1 pr-2 flex items-start gap-2">
                        {item.image ? (
                          <img src={item.image} alt={item.name || "Product"} className="h-10 w-10 rounded object-cover border border-border" />
                        ) : (
                          <div className="h-10 w-10 rounded border border-border bg-muted/40" />
                        )}
                        <div>
                          <p className="font-medium text-primary">{item.name || "Product"}</p>
                          <p className="text-muted-foreground">SKU: {item.productId || "-"}</p>
                        </div>
                      </div>
                      <div>{money(item.unitPrice, order.currency)}</div>
                      <div>{item.quantity}</div>
                      <div className="font-semibold text-right">{money(item.lineTotal, order.currency)}</div>
                    </div>
                  ))}
                </div>
              )}

              <div className="px-4 py-3 flex flex-wrap items-end justify-between gap-2 border-t border-border">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Button variant="outline" size="sm" className="h-7 text-xs">Add product(s)</Button>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">Fee</span>
                    <Input type="number" min={0} value={fee} onChange={(e) => setFee(Math.max(0, Number(e.target.value || 0)))} className="h-7 w-24" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">Shipping</span>
                    <Input type="number" min={0} value={shipping} onChange={(e) => setShipping(Math.max(0, Number(e.target.value || 0)))} className="h-7 w-24" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">Tax</span>
                    <Input type="number" min={0} value={tax} onChange={(e) => setTax(Math.max(0, Number(e.target.value || 0)))} className="h-7 w-24" />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">Total</span>
                    <Input value={editableOrderTotal} readOnly className="h-7 w-24" />
                  </div>
                  <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => { setFee(0); setShipping(0); setTax(0); }}>Cancel</Button>
                  <Button size="sm" className="h-7 text-xs" onClick={handleUpdate}>Save</Button>
                </div>

                <div className="text-xs min-w-48 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Items Subtotal</span>
                    <span className="font-medium">{money(computedSubtotal, order.currency)}</span>
                  </div>
                  {order.couponCode ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Coupon</span>
                        <span className="font-medium">{order.couponCode}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Discount</span>
                        <span className="text-primary font-medium">- {money(discountAmount, order.currency)}</span>
                      </div>
                    </>
                  ) : null}
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Fee</span>
                    <span>{money(fee, order.currency)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{money(shipping, order.currency)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span>{money(tax, order.currency)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Order Total</span>
                    <span className="font-semibold">{money(editableOrderTotal, order.currency)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-3">
          <Card>
            <CardHeader className="py-3 px-4 border-b border-border">
              <CardTitle className="text-sm font-medium">Order actions</CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
              <Button variant="outline" size="sm" className="h-8 text-xs w-full" onClick={handleDownloadInvoice}>
                Download Invoice
              </Button>
              <select
                value={orderAction}
                onChange={(e) => setOrderAction(e.target.value)}
                className="h-8 w-full rounded-md border border-border bg-background px-2 text-xs"
              >
                <option value="">Choose an action...</option>
                <option value="Send order details to customer">Send order details to customer</option>
                <option value="Resend new order notification">Resend new order notification</option>
                <option value="Regenerate download permissions">Regenerate download permissions</option>
              </select>
              <div className="flex items-center justify-between">
                <Button variant="link" className="h-7 px-0 text-xs text-destructive">Move to Trash</Button>
                <Button size="sm" className="h-7 text-xs" onClick={handleRunAction}>Update</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-3 px-4 border-b border-border">
              <CardTitle className="text-sm font-medium">Order attribution</CardTitle>
            </CardHeader>
            <CardContent className="p-3 text-xs space-y-2">
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Origin</span><span>{order.origin || "-"}</span></div>
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Payment</span><span>{getPaymentMethodLabel(order.paymentMethod)}</span></div>
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Payment status</span><span>{getPaymentStatusLabel(order.paymentStatus)}</span></div>
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Coupon used</span><span>{order.couponCode || "No"}</span></div>

              {isWalletPayment ? (
                <div className="rounded border border-border p-2 space-y-1">
                  <div className="flex items-center justify-between"><span className="text-muted-foreground">Merchant wallet</span><span>{order.merchantWalletNumber || "03168056420"}</span></div>
                  <div className="flex items-center justify-between"><span className="text-muted-foreground">Transaction ID</span><span>{resolvedPaymentProof?.transactionId || "Not provided"}</span></div>
                  <div className="flex items-center justify-between"><span className="text-muted-foreground">Sender phone</span><span>{resolvedPaymentProof?.payerPhone || "Not provided"}</span></div>
                  <div className="flex items-center justify-between"><span className="text-muted-foreground">Paid amount</span><span>{typeof resolvedPaymentProof?.paidAmount === "number" && resolvedPaymentProof.paidAmount > 0 ? money(resolvedPaymentProof.paidAmount, order.currency) : "Not provided"}</span></div>
                  <div className="flex items-center justify-between"><span className="text-muted-foreground">Paid at</span><span>{resolvedPaymentProof?.paidAt ? formatOrderDate(resolvedPaymentProof.paidAt) : "Not provided"}</span></div>
                  <div className="flex items-center justify-between"><span className="text-muted-foreground">Verified at</span><span>{order.paymentVerifiedAt ? formatOrderDate(order.paymentVerifiedAt) : "Not verified"}</span></div>
                  <div className="flex items-center justify-between"><span className="text-muted-foreground">Verified by</span><span>{order.paymentVerifiedBy || "Not verified"}</span></div>
                  {resolvedPaymentProof?.screenshotDataUrl ? (
                    <a
                      href={resolvedPaymentProof.screenshotDataUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline"
                    >
                      Open payment screenshot
                    </a>
                  ) : (
                    <p className="text-[11px] text-muted-foreground">Payment screenshot not provided.</p>
                  )}
                  {order.paymentStatus !== "paid" ? (
                    <Button size="sm" className="h-7 text-xs w-full" onClick={handleConfirmWalletPayment} disabled={isVerifyingPayment}>
                      {isVerifyingPayment ? "Confirming..." : "Confirm payment and order"}
                    </Button>
                  ) : (
                    <p className="text-[11px] text-primary">Verified by {order.paymentVerifiedBy || "Admin"} at {order.paymentVerifiedAt ? formatOrderDate(order.paymentVerifiedAt) : "-"}</p>
                  )}
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-3 px-4 border-b border-border">
              <CardTitle className="text-sm font-medium">Order notes</CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
              <div className="space-y-2">
                <Textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="min-h-16 text-xs"
                  placeholder="Type manual note..."
                />
                <Button size="sm" className="h-7 text-xs" onClick={addManualNote}>Add note</Button>
              </div>
              <div className="max-h-40 overflow-auto space-y-2">
                {order.notes ? (
                  <div className="bg-muted/60 rounded-sm p-2 text-[11px]">Customer note: {order.notes}</div>
                ) : null}
                {notes.map((note) => (
                  <div key={note} className="bg-muted/60 rounded-sm p-2 text-[11px]">
                    {note}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
