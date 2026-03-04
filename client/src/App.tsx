import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import OSForm from "./pages/OSForm";
import OSList from "./pages/OSList";
import OSDetail from "./pages/OSDetail";
import ClientList from "./pages/ClientList";
import ClientForm from "./pages/ClientForm";
import ProductList from "./pages/ProductList";
import ProductForm from "./pages/ProductForm";
import ServiceList from "./pages/ServiceList";
import ServiceForm from "./pages/ServiceForm";
import QuotationList from "./pages/QuotationList";
import QuotationForm from "./pages/QuotationForm";
import SalesList from "./pages/SalesList";
import SalesForm from "./pages/SalesForm";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/os/new"} component={OSForm} />
      <Route path={"/os/edit/:id"} component={OSForm} />
      <Route path={"/os/list"} component={OSList} />
      <Route path={"/os/:id"} component={OSDetail} />
      <Route path={"/clients"} component={ClientList} />
      <Route path={"/clients/new"} component={ClientForm} />
      <Route path={"/clients/edit/:id"} component={ClientForm} />
      <Route path={"/clients/:id"} component={ClientList} />
      <Route path={"/products"} component={ProductList} />
      <Route path={"/products/new"} component={ProductForm} />
      <Route path={"/products/edit/:id"} component={ProductForm} />
       <Route path={"products/:id"} component={ProductList} />
      <Route path={"services"} component={ServiceList} />
      <Route path={"services/new"} component={ServiceForm} />
      <Route path={"services/edit/:id"} component={ServiceForm} />
      <Route path={"services/:id"} component={ServiceList} />
      <Route path={"quotations"} component={QuotationList} />
      <Route path={"quotations/new"} component={QuotationForm} />
      <Route path={"quotations/edit/:id"} component={QuotationForm} />
      <Route path={"quotations/:id"} component={QuotationList} />
      <Route path={"sales"} component={SalesList} />
      <Route path={"sales/new"} component={SalesForm} />
      <Route path={"sales/edit/:id"} component={SalesForm} />
      <Route path={"sales/:id"} component={SalesList} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        // switchable
      >
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
