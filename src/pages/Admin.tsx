import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminProducts } from "@/components/admin/AdminProducts";
import { AdminOrders } from "@/components/admin/AdminOrders";
import { AdminUsers } from "@/components/admin/AdminUsers";
import { AdminAnalytics } from "@/components/admin/AdminAnalytics";
import { useToast } from "@/hooks/use-toast";

export default function Admin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        toast({
          title: "Access denied",
          description: "Please sign in to access the admin panel",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      const { data: hasAdminRole, error } = await supabase.rpc("has_role", {
        _user_id: session.user.id,
        _role: "admin",
      });

      if (error) throw error;

      if (!hasAdminRole) {
        toast({
          title: "Access denied",
          description: "You don't have permission to access this page",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify admin access",
        variant: "destructive",
      });
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage your LuxInnovate Interiors platform
          </p>
        </div>

        <Tabs defaultValue="analytics" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics">
            <AdminAnalytics />
          </TabsContent>

          <TabsContent value="products">
            <AdminProducts />
          </TabsContent>

          <TabsContent value="orders">
            <AdminOrders />
          </TabsContent>

          <TabsContent value="users">
            <AdminUsers />
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
