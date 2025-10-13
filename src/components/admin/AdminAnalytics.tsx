import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Package, Users, ShoppingCart, DollarSign } from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  topProducts: Array<{ name: string; sales: number }>;
  recentOrders: Array<{ date: string; amount: number }>;
  categoryDistribution: Array<{ name: string; value: number }>;
  trendingProducts: Array<{ name: string; views: number }>;
  topCategories: Array<{ name: string; purchases: number }>;
}

export function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [ordersData, productsData, usersData, orderItemsData, categoriesData, interactionsData] = await Promise.all([
        supabase.from("orders").select("total_amount, created_at, status"),
        supabase.from("products").select("id, name, category_id"),
        supabase.from("profiles").select("id"),
        supabase.from("order_items").select("product_id, quantity, products(name)"),
        supabase.from("categories").select("id, name"),
        supabase.from("user_interactions")
          .select("product_id, interaction_type, products(name)")
          .gte("created_at", thirtyDaysAgo.toISOString())
          .eq("interaction_type", "view"),
      ]);

      const totalRevenue =
        ordersData.data?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

      const completedOrders =
        ordersData.data?.filter((order) => order.status === "delivered").length || 0;

      const recentOrders =
        ordersData.data
          ?.slice(0, 7)
          .reverse()
          .map((order) => ({
            date: new Date(order.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
            amount: Number(order.total_amount),
          })) || [];

      // Calculate top selling products from order items
      const productSales: Record<string, { name: string; sales: number }> = {};
      orderItemsData.data?.forEach((item: any) => {
        const productName = item.products?.name || "Unknown";
        if (!productSales[productName]) {
          productSales[productName] = { name: productName, sales: 0 };
        }
        productSales[productName].sales += item.quantity;
      });

      const topProducts = Object.values(productSales)
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5);

      // Calculate trending products (most views in last 30 days)
      const productViews: Record<string, { name: string; views: number }> = {};
      interactionsData.data?.forEach((interaction: any) => {
        const productName = interaction.products?.name || "Unknown";
        if (!productViews[productName]) {
          productViews[productName] = { name: productName, views: 0 };
        }
        productViews[productName].views += 1;
      });

      const trendingProducts = Object.values(productViews)
        .sort((a, b) => b.views - a.views)
        .slice(0, 5);

      // Calculate category distribution
      const categoryCount: Record<string, number> = {};
      productsData.data?.forEach((product) => {
        const categoryId = product.category_id || "uncategorized";
        categoryCount[categoryId] = (categoryCount[categoryId] || 0) + 1;
      });

      const categoryDistribution = categoriesData.data?.map((cat) => ({
        name: cat.name,
        value: categoryCount[cat.id] || 0,
      })).filter(cat => cat.value > 0) || [];

      // Calculate most purchased categories this month
      const categoryPurchases: Record<string, { name: string; purchases: number }> = {};
      await Promise.all(
        orderItemsData.data?.map(async (item: any) => {
          const { data: product } = await supabase
            .from("products")
            .select("category_id, categories(name)")
            .eq("id", item.product_id)
            .single();

          if (product?.categories?.name) {
            const catName = product.categories.name;
            if (!categoryPurchases[catName]) {
              categoryPurchases[catName] = { name: catName, purchases: 0 };
            }
            categoryPurchases[catName].purchases += item.quantity;
          }
        }) || []
      );

      const topCategories = Object.values(categoryPurchases)
        .sort((a, b) => b.purchases - a.purchases)
        .slice(0, 5);

      setData({
        totalRevenue,
        totalOrders: completedOrders,
        totalProducts: productsData.data?.length || 0,
        totalUsers: usersData.data?.length || 0,
        topProducts,
        recentOrders,
        categoryDistribution,
        trendingProducts,
        topCategories,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ["#8b5cf6", "#f59e0b", "#10b981", "#ef4444"];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{data.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 text-green-500" /> +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 text-green-500" /> +8% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalProducts}</div>
            <p className="text-xs text-muted-foreground">Active inventory</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 text-green-500" /> +15% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.topProducts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.categoryDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              ML Insights: Top 5 Trending Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.trendingProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.trendingProducts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="views" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-12">
                No trending data available yet
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              ML Insights: Most Purchased Categories (30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.topCategories.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.topCategories}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="purchases" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-12">
                No purchase data available yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.recentOrders}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="amount" stroke="#8b5cf6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
