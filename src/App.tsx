import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { CartProvider } from "@/contexts/CartContext";
import { ProfileProvider } from "@/contexts/ProfileContext";
import DashboardLayout from "@/components/DashboardLayout";
import Index from "./pages/Index";
import Analytics from "./pages/Analytics";
import Ecommerce from "./pages/Ecommerce";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import NewOrder from "./pages/NewOrder";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import AddProduct from "./pages/AddProduct";
import Customers from "./pages/Customers";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Invoices from "./pages/Invoices";
import Calendar from "./pages/Calendar";
import Users from "./pages/Users";
import CRM from "./pages/CRM";
import AddCoupon from "./pages/AddCoupon";
import Settings from "./pages/Settings";
import Reports from "./pages/Reports";
import PlaceholderPage from "./pages/PlaceholderPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light">
    <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CartProvider>
        <ProfileProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<DashboardLayout><Index /></DashboardLayout>} />
            <Route path="/analytics" element={<DashboardLayout><Analytics /></DashboardLayout>} />
            <Route path="/ecommerce" element={<DashboardLayout><Ecommerce /></DashboardLayout>} />
            <Route path="/orders" element={<DashboardLayout><Orders /></DashboardLayout>} />
            <Route path="/orders/:id" element={<DashboardLayout><OrderDetail /></DashboardLayout>} />
            <Route path="/orders/new" element={<DashboardLayout><NewOrder /></DashboardLayout>} />
            <Route path="/products" element={<DashboardLayout><Products /></DashboardLayout>} />
            <Route path="/products/new" element={<DashboardLayout><AddProduct /></DashboardLayout>} />
            <Route path="/products/:id" element={<DashboardLayout><ProductDetail /></DashboardLayout>} />
            <Route path="/customers" element={<DashboardLayout><Customers /></DashboardLayout>} />
            <Route path="/cart" element={<DashboardLayout><Cart /></DashboardLayout>} />
            <Route path="/checkout" element={<DashboardLayout><Checkout /></DashboardLayout>} />
            <Route path="/crm" element={<DashboardLayout><CRM /></DashboardLayout>} />
            <Route path="/crm/new" element={<DashboardLayout><AddCoupon /></DashboardLayout>} />
            <Route path="/saas" element={<DashboardLayout><PlaceholderPage title="SaaS" description="SaaS metrics and subscription analytics." breadcrumb="Dashboard > SaaS" /></DashboardLayout>} />
            <Route path="/charts" element={<DashboardLayout><PlaceholderPage title="Charts" description="Chart components and visualizations." breadcrumb="Dashboard > Charts" /></DashboardLayout>} />
            <Route path="/invoices" element={<DashboardLayout><Invoices /></DashboardLayout>} />
            <Route path="/mail" element={<DashboardLayout><PlaceholderPage title="Mail" description="Your email inbox and communications." breadcrumb="Apps > Mail" /></DashboardLayout>} />
            <Route path="/chat" element={<DashboardLayout><PlaceholderPage title="Chat" description="Team messaging and conversations." breadcrumb="Apps > Chat" /></DashboardLayout>} />
            <Route path="/files" element={<DashboardLayout><PlaceholderPage title="Files" description="File manager and document storage." breadcrumb="Apps > Files" /></DashboardLayout>} />
            <Route path="/kanban" element={<DashboardLayout><PlaceholderPage title="Kanban" description="Project boards and task management." breadcrumb="Apps > Kanban" /></DashboardLayout>} />
            <Route path="/calendar" element={<DashboardLayout><Calendar /></DashboardLayout>} />
            <Route path="/wizard" element={<DashboardLayout><PlaceholderPage title="Wizard" description="Multi-step form wizards." breadcrumb="Apps > Wizard" /></DashboardLayout>} />
            <Route path="/forms" element={<DashboardLayout><PlaceholderPage title="Forms" description="Form components and validation examples." breadcrumb="Apps > Forms" /></DashboardLayout>} />
            <Route path="/billing" element={<DashboardLayout><PlaceholderPage title="Billing" description="Billing, subscriptions, and payment history." breadcrumb="Finance > Billing" /></DashboardLayout>} />
            <Route path="/users" element={<DashboardLayout><Users /></DashboardLayout>} />
            <Route path="/reports" element={<DashboardLayout><Reports /></DashboardLayout>} />
            <Route path="/notifications" element={<DashboardLayout><PlaceholderPage title="Notifications" description="System notifications and alerts." breadcrumb="System > Notifications" /></DashboardLayout>} />
            <Route path="/settings" element={<DashboardLayout><Settings /></DashboardLayout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </ProfileProvider>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
</ThemeProvider>
);

export default App;
