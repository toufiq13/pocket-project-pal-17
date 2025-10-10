import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Order {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("id, total_amount, status, created_at, profiles(full_name, email)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders((data as any) || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus as any })
        .eq("id", orderId);

      if (error) throw error;

      toast({
        title: "Order updated",
        description: "Order status has been changed",
      });
      fetchOrders();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      pending: "secondary",
      processing: "default",
      shipped: "default",
      delivered: "default",
      cancelled: "destructive",
      confirmed: "default",
    };

    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-mono text-xs">
                {order.id.substring(0, 8)}...
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{order.profiles?.full_name || "Unknown"}</p>
                  <p className="text-xs text-muted-foreground">{order.profiles?.email}</p>
                </div>
              </TableCell>
              <TableCell className="font-medium">
                ₹{Number(order.total_amount).toLocaleString()}
              </TableCell>
              <TableCell>{getStatusBadge(order.status)}</TableCell>
              <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
              <TableCell>
                <Select
                  value={order.status}
                  onValueChange={(value) => handleStatusChange(order.id, value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
