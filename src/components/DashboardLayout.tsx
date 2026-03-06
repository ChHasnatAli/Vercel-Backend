import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, ShoppingCart, Users,
  Package, Bell, Settings,
  Search, Plus, Moon, HelpCircle, PanelLeftClose, PanelLeft,
  Zap, Menu, X, Globe, LineChart, Store, ChevronDown, FileDown
} from "lucide-react";
import { useState, useEffect, useMemo, useRef } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import { useProfile } from "@/contexts/ProfileContext";
import { allProducts } from "@/data/products";
import { useTheme } from "next-themes";
import { fetchSharedOrders } from "@/lib/orderApi";
import { fetchStoreUsers } from "@/lib/userApi";
import { fetchDeletedProductIds, fetchStoreProducts } from "@/lib/storeProductApi";

interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
  badge?: string;
  children?: { title: string; url: string; badge?: string }[];
}

type ActivitySnapshot = {
  ordersCount: number;
  usersCount: number;
  productsCount: number;
  deletedCount: number;
  latestOrderAt: string;
  latestUserAt: string;
  latestProductAt: string;
  ordersSignature: string;
  usersSignature: string;
  productsSignature: string;
};

type NotificationEntry = {
  key: string;
  title: string;
  detail: string;
  href: string;
  icon: React.ElementType;
};

const navItems: NavItem[] = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Site Kit", url: "#", icon: Globe },
  {
    title: "Infusion Store",
    url: "/orders",
    icon: Store,
    children: [
      // { title: "Home", url: "#", badge: "1" },
      { title: "Orders", url: "/orders", badge: "16" },
      { title: "Customers", url: "/customers" },
      { title: "Coupons", url: "/crm" },
    ],
  },
  { title: "Products", url: "/products", icon: Package },
  { title: "Analytics", url: "/analytics", icon: LineChart },
  { title: "Reports", url: "/reports", icon: FileDown },
  { title: "Users", url: "/users", icon: Users },
  { title: "Settings", url: "/settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const DASHBOARD_ACTIVITY_SNAPSHOT_KEY = "dashboard_activity_snapshot";
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [woocommerceOpen, setWoocommerceOpen] = useState(true);
  const { theme, setTheme } = useTheme();

  // ensure html class matches current theme
  useEffect(() => {
    if (typeof document !== "undefined") {
      if (theme === "dark") document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
    }
  }, [theme]);
  // fallback manual toggle when theme provider doesn't add class
  const toggleDark = () => {
    const root = document.documentElement;
    if (root.classList.contains("dark")) {
      root.classList.remove("dark");
      setTheme("light");
    } else {
      root.classList.add("dark");
      setTheme("dark");
    }
  };
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<typeof allProducts>([]);
  const [focused, setFocused] = useState(false);
  const { totalItems } = useCart();
  const { fullName, initials, profile } = useProfile();
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [latestActivitySnapshot, setLatestActivitySnapshot] = useState<ActivitySnapshot | null>(null);
  const [lastSeenSnapshot, setLastSeenSnapshot] = useState<ActivitySnapshot | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement | null>(null);

  const serializeSnapshot = (snapshot: ActivitySnapshot) => JSON.stringify(snapshot);

  const parseSnapshot = (raw: string | null): ActivitySnapshot | null => {
    if (!raw) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw) as Partial<ActivitySnapshot>;
      return {
        ordersCount: Number(parsed.ordersCount ?? 0),
        usersCount: Number(parsed.usersCount ?? 0),
        productsCount: Number(parsed.productsCount ?? 0),
        deletedCount: Number(parsed.deletedCount ?? 0),
        latestOrderAt: String(parsed.latestOrderAt ?? ""),
        latestUserAt: String(parsed.latestUserAt ?? ""),
        latestProductAt: String(parsed.latestProductAt ?? ""),
        ordersSignature: String(parsed.ordersSignature ?? ""),
        usersSignature: String(parsed.usersSignature ?? ""),
        productsSignature: String(parsed.productsSignature ?? ""),
      };
    } catch {
      return null;
    }
  };

  const formatRelativeTime = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "just now";
    }

    const diffMs = Date.now() - date.getTime();
    const diffMin = Math.floor(diffMs / (1000 * 60));
    if (diffMin < 1) return "just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  useEffect(() => {
    let isMounted = true;

    const collectSnapshot = async () => {
      try {
        const [ordersResult, usersResult, productsResult, deletedResult] = await Promise.allSettled([
          fetchSharedOrders(),
          fetchStoreUsers(),
          fetchStoreProducts(),
          fetchDeletedProductIds(),
        ]);

        const orders = ordersResult.status === "fulfilled" ? ordersResult.value : [];
        const users = usersResult.status === "fulfilled" ? usersResult.value : [];
        const remoteProducts = productsResult.status === "fulfilled" ? productsResult.value : [];
        const deletedProductIds = deletedResult.status === "fulfilled" ? deletedResult.value : [];

        if (!isMounted) {
          return;
        }

        const latestOrderAt = orders.reduce((latest, order) => {
          const value = order.createdAt || "";
          return value > latest ? value : latest;
        }, "");

        const latestUserAt = users.reduce((latest, user) => {
          const value = user.lastLoginAt || user.createdAt || "";
          return value > latest ? value : latest;
        }, "");

        const latestProductAt = remoteProducts.reduce((latest, product) => {
          const candidate = String((product as { updatedAt?: string; createdAt?: string }).updatedAt ?? (product as { createdAt?: string }).createdAt ?? "");
          return candidate > latest ? candidate : latest;
        }, "");

        const ordersSignature = orders
          .slice(0, 20)
          .map((order) => `${order.id}:${order.status}:${order.totalAmount}:${order.createdAt}`)
          .join("|");
        const usersSignature = users
          .slice(0, 20)
          .map((user) => `${user.id}:${user.lastLoginAt || user.createdAt}`)
          .join("|");
        const productsSignature = remoteProducts
          .slice(0, 20)
          .map((product) => `${product.id}:${String((product as { updatedAt?: string; createdAt?: string }).updatedAt ?? (product as { createdAt?: string }).createdAt ?? "")}`)
          .join("|");

        const snapshot: ActivitySnapshot = {
          ordersCount: orders.length,
          usersCount: users.length,
          productsCount: remoteProducts.length,
          deletedCount: deletedProductIds.length,
          latestOrderAt,
          latestUserAt,
          latestProductAt,
          ordersSignature,
          usersSignature,
          productsSignature,
        };

        setLatestActivitySnapshot(snapshot);

        const rawLastSeen = window.localStorage.getItem(DASHBOARD_ACTIVITY_SNAPSHOT_KEY);
        const parsedLastSeen = parseSnapshot(rawLastSeen);

        if (!parsedLastSeen) {
          window.localStorage.setItem(DASHBOARD_ACTIVITY_SNAPSHOT_KEY, serializeSnapshot(snapshot));
          setLastSeenSnapshot(snapshot);
          setHasUnreadNotifications(false);
          return;
        }

        setLastSeenSnapshot(parsedLastSeen);
        setHasUnreadNotifications(serializeSnapshot(parsedLastSeen) !== serializeSnapshot(snapshot));
      } catch {
        // Keep last known notification state if polling fails temporarily.
      }
    };

    void collectSnapshot();
    const intervalId = window.setInterval(() => {
      void collectSnapshot();
    }, 10000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const handleSearch = (text: string) => {
    setSearchTerm(text);
    if (text.trim().length === 0) {
      setSuggestions([]);
      return;
    }
    const lower = text.toLowerCase();
    setSuggestions(
      allProducts.filter((p) => p.name.toLowerCase().includes(lower)).slice(0, 5)
    );
  };

  const isActive = (url: string) => {
    if (url === "/") return location.pathname === "/";
    return location.pathname.startsWith(url);
  };

  const handleBellClick = () => {
    if (latestActivitySnapshot) {
      window.localStorage.setItem(DASHBOARD_ACTIVITY_SNAPSHOT_KEY, serializeSnapshot(latestActivitySnapshot));
      setLastSeenSnapshot(latestActivitySnapshot);
    }
    setHasUnreadNotifications(false);
    setNotificationsOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!notificationsRef.current) {
        return;
      }
      if (notificationsRef.current.contains(event.target as Node)) {
        return;
      }
      setNotificationsOpen(false);
    };

    if (notificationsOpen) {
      window.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      window.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [notificationsOpen]);

  const notificationEntries = useMemo(() => {
    const current = latestActivitySnapshot;
    const seen = lastSeenSnapshot;
    if (!current || !seen) {
      return [] as NotificationEntry[];
    }

    const entries: NotificationEntry[] = [];
    const orderDiff = current.ordersCount - seen.ordersCount;
    const userDiff = current.usersCount - seen.usersCount;
    const productDiff = current.productsCount - seen.productsCount;
    const deletedDiff = current.deletedCount - seen.deletedCount;

    if (orderDiff > 0) {
      entries.push({
        key: "orders-new",
        title: `${orderDiff} new order${orderDiff > 1 ? "s" : ""}`,
        detail: `Latest ${formatRelativeTime(current.latestOrderAt)}`,
        href: "/orders",
        icon: ShoppingCart,
      });
    } else if (current.latestOrderAt && current.latestOrderAt !== seen.latestOrderAt) {
      entries.push({
        key: "orders-updated",
        title: "Order activity updated",
        detail: `Latest ${formatRelativeTime(current.latestOrderAt)}`,
        href: "/orders",
        icon: ShoppingCart,
      });
    }

    if (userDiff > 0) {
      entries.push({
        key: "users-new",
        title: `${userDiff} new user${userDiff > 1 ? "s" : ""}`,
        detail: `Latest ${formatRelativeTime(current.latestUserAt)}`,
        href: "/users",
        icon: Users,
      });
    } else if (current.latestUserAt && current.latestUserAt !== seen.latestUserAt) {
      entries.push({
        key: "users-updated",
        title: "User activity updated",
        detail: `Latest ${formatRelativeTime(current.latestUserAt)}`,
        href: "/users",
        icon: Users,
      });
    }

    if (productDiff > 0) {
      entries.push({
        key: "products-new",
        title: `${productDiff} product${productDiff > 1 ? "s" : ""} added`,
        detail: `Latest ${formatRelativeTime(current.latestProductAt)}`,
        href: "/products",
        icon: Package,
      });
    }

    if (deletedDiff > 0) {
      entries.push({
        key: "products-deleted",
        title: `${deletedDiff} product${deletedDiff > 1 ? "s" : ""} deleted`,
        detail: "Removed from dashboard and store",
        href: "/products",
        icon: Package,
      });
    }

    return entries;
  }, [lastSeenSnapshot, latestActivitySnapshot]);

  const sidebarContent = (
    <>
      <div className="h-14 flex items-center gap-2 px-4 border-b border-sidebar-border flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
          <Zap className="w-4 h-4 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div>
            <span className="font-bold text-sidebar-accent-foreground text-sm">Infusions Pakistan</span>
            <span className="text-[10px] text-sidebar-muted block -mt-1">ADMIN PANEL</span>
          </div>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const active = isActive(item.url);
            const isWooCommerce = item.title === "Infusion Store";
            const showChildren = !collapsed && isWooCommerce && woocommerceOpen;

            return (
              <li key={item.title}>
                <div
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
                >
                  <Link to={item.url} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 min-w-0 flex-1">
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    {!collapsed && <span className="truncate">{item.title}</span>}
                  </Link>
                  {!collapsed && isWooCommerce && item.children && (
                    <button
                      type="button"
                      onClick={() => setWoocommerceOpen((prev) => !prev)}
                      className="h-5 w-5 inline-flex items-center justify-center text-sidebar-muted hover:text-sidebar-accent-foreground"
                      aria-label="Toggle Infusion Store menu"
                    >
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform ${woocommerceOpen ? "rotate-0" : "-rotate-90"}`} />
                    </button>
                  )}
                  {!collapsed && item.badge && (
                    <Badge className="ml-auto bg-destructive text-destructive-foreground text-[10px] h-5 min-w-5 flex items-center justify-center rounded-full px-1.5">
                      {item.badge}
                    </Badge>
                  )}
                </div>

                {showChildren && item.children && (
                  <div className={`ml-6 mt-1 mb-1 rounded-md ${isWooCommerce ? "bg-sidebar-accent/70" : ""}`}>
                    {item.children.map((child) => {
                      const childActive = location.pathname === child.url;

                      return (
                        <Link
                          key={`${item.title}-${child.title}`}
                          to={child.url}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded-md ${
                            childActive
                              ? "text-sidebar-accent-foreground bg-sidebar-accent"
                              : "text-sidebar-muted hover:text-sidebar-accent-foreground"
                          }`}
                        >
                          <span className="truncate">{child.title}</span>
                          {child.badge && (
                            <span className="ml-auto text-[10px] leading-none rounded-full bg-destructive text-destructive-foreground min-w-4 h-4 px-1.5 flex items-center justify-center">
                              {child.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-3 border-t border-sidebar-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8 bg-primary flex-shrink-0">
            <AvatarFallback className="text-xs bg-primary text-primary-foreground">{initials}</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-xs font-medium text-sidebar-accent-foreground truncate">{fullName}</p>
              <p className="text-[10px] text-sidebar-muted">{profile.role}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen w-full">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar - mobile */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-56 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-200 md:hidden ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <Button variant="ghost" size="icon" className="absolute top-3 right-3 h-7 w-7 text-sidebar-foreground" onClick={() => setMobileOpen(false)}>
          <X className="w-4 h-4" />
        </Button>
        {sidebarContent}
      </aside>

      {/* Sidebar - desktop */}
      <aside className={`${collapsed ? "w-16" : "w-56"} flex-shrink-0 bg-sidebar border-r border-sidebar-border flex-col transition-all duration-200 overflow-hidden hidden md:flex`}>
        {sidebarContent}
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 bg-background">
        <header className="h-14 border-b border-border flex items-center justify-between px-3 sm:px-4 flex-shrink-0 bg-card">
          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground md:hidden" onClick={() => setMobileOpen(true)}>
              <Menu className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hidden md:flex" onClick={() => setCollapsed(!collapsed)}>
              {collapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </Button>
            <div className="relative hidden sm:block" onBlur={() => setSuggestions([])}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search anything..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setTimeout(() => setSuggestions([]), 100)}
                className="pl-9 w-48 lg:w-64 h-8 bg-secondary border-none text-sm text-foreground caret-foreground"
              />
              <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded hidden lg:inline">⌘K</kbd>
              {suggestions.length > 0 && (
                <div className="absolute mt-1 w-full bg-card border border-border rounded-md z-50 max-h-48 overflow-auto">
                  {suggestions.map((prod) => (
                    <div
                      key={prod.id}
                      className="px-3 py-2 hover:bg-secondary cursor-pointer text-foreground text-sm"
                      onMouseDown={() => window.open(`/products/${prod.id}`, "_blank")}
                    >
                      {prod.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Link to="/orders/new">
              <Button size="sm" className="bg-primary text-primary-foreground h-8 text-xs gap-1 hidden sm:flex">
                <Plus className="w-3 h-3" /> New Order
              </Button>
            </Link>
            <Link to="/cart" className="relative">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                <ShoppingCart className="w-4 h-4" />
              </Button>
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary rounded-full text-[9px] flex items-center justify-center text-primary-foreground">
                  {totalItems}
                </span>
              )}
            </Link>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hidden sm:flex" onClick={() => toggleDark()}>
              <Moon className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hidden sm:flex">
              <HelpCircle className="w-4 h-4" />
            </Button>
            <div className="relative" ref={notificationsRef}>
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 ${hasUnreadNotifications ? "text-primary" : "text-muted-foreground"}`}
                onClick={handleBellClick}
              >
                <Bell className="w-4 h-4" />
              </Button>
              {hasUnreadNotifications ? (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-destructive rounded-full" />
              ) : null}

              {notificationsOpen ? (
                <div className="absolute right-0 mt-2 w-72 rounded-lg border border-border bg-card shadow-lg z-50">
                  <div className="px-3 py-2 border-b border-border flex items-center justify-between">
                    <p className="text-sm font-semibold">Notifications</p>
                    <span className="text-[11px] text-muted-foreground">
                      {notificationEntries.length > 0 ? `${notificationEntries.length} new` : "All caught up"}
                    </span>
                  </div>
                  <div className="max-h-72 overflow-auto">
                    {notificationEntries.length > 0 ? (
                      notificationEntries.map((entry) => (
                        <button
                          key={entry.key}
                          type="button"
                          className="w-full text-left px-3 py-2 border-b border-border last:border-b-0 hover:bg-secondary"
                          onClick={() => {
                            setNotificationsOpen(false);
                            navigate(entry.href);
                          }}
                        >
                          <div className="flex items-start gap-2">
                            <span className="mt-0.5 text-muted-foreground">
                              <entry.icon className="w-3.5 h-3.5" />
                            </span>
                            <div>
                              <p className="text-xs font-medium text-foreground">{entry.title}</p>
                              <p className="text-[11px] text-muted-foreground mt-0.5">{entry.detail}</p>
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <p className="px-3 py-4 text-xs text-muted-foreground">No new activity right now.</p>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
            <Avatar className="h-8 w-8 bg-primary">
              <AvatarFallback className="text-xs bg-primary text-primary-foreground">HA</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
