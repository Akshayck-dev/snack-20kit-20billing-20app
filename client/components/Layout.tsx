import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingCart, BarChart3, Package, Boxes, FileText, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "./AuthContext";
import { signOut } from "@/lib/auth";
import { toast } from "sonner";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error: any) {
      toast.error(error?.message || "Logout failed");
    }
  };

  const navItems = [
    { href: "/", label: "Dashboard", icon: ShoppingCart },
    { href: "/sell", label: "Sell Items", icon: Package },
    { href: "/bakeries", label: "Bakeries", icon: Boxes },
    { href: "/items", label: "Items", icon: Settings },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/history", label: "History", icon: FileText },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border md:hidden z-40">
        <div className="flex justify-around items-stretch max-w-2xl mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center py-2 px-1 text-xs font-medium transition-colors border-t-2",
                  isActive(item.href)
                    ? "border-primary text-primary bg-primary bg-opacity-5"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="line-clamp-1">{item.label}</span>
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className={cn(
              "flex-1 flex flex-col items-center justify-center py-2 px-1 text-xs font-medium transition-colors border-t-2 border-transparent text-muted-foreground hover:text-foreground"
            )}
            title="Logout"
          >
            <LogOut className="h-5 w-5 mb-1" />
            <span className="line-clamp-1">Logout</span>
          </button>
        </div>
      </nav>

      {/* Desktop Navigation */}
      <nav className="hidden md:block bg-white border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg text-foreground">Snack Kit</span>
            </Link>
            <div className="flex gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors",
                      isActive(item.href)
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-secondary"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 text-foreground hover:bg-secondary transition-colors"
                title={`Logged in as ${user?.email || 'User'}`}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pb-20 md:pb-0">
        {children}
      </main>
    </div>
  );
}
