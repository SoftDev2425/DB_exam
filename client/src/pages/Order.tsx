import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import Moment from "react-moment";

interface OrderLine {
  orderLineId: string;
  isbn: string;
  quantity: number;
  unitPrice: number;
  bookTitle: string;
}

interface Order {
  orderId: string;
  orderDate: string;
  shippingAddress: string;
  shippingCity: string;
  status: string;
  orderCreatedAt: string;
  orderUpdatedAt: string;
  orderLines: OrderLine[];
}

interface OrderResponse {
  order: Order;
}

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await axios.get<OrderResponse>(`http://localhost:3000/orders/${id}`, {
          withCredentials: true,
        });

        if (response.status === 200) {
          setOrder(response.data.order);
        } else {
          setError("Failed to fetch order details.");
        }
      } catch (error) {
        setError("An error occurred while fetching order details.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return <p className="text-center text-gray-700">Loading...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  if (!order) {
    return <p className="text-center text-gray-700">Order not found.</p>;
  }

  return (
    <>
      <Header />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Order Details</h1>

        {/* print as pdf */}
        <div className="w-full flex justify-end">
          <Button className=" px-4 py-2 rounded-lg shadow-sm hover:bg-primary-dark my-2" onClick={() => window.print()}>
            <FileText size={24} />
          </Button>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Order ID: {order.orderId}</h2>
            <p className="text-gray-600">
              <span className="font-medium">Order Date:</span> {new Date(order.orderDate).toLocaleDateString()} (<Moment fromNow>{order.orderDate}</Moment>)
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Shipping Address:</span> {order.shippingAddress}, {order.shippingCity}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Status:</span> {order.status}
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Order Lines:</h3>
            <div className="space-y-4">
              {order.orderLines.map((line) => (
                <div key={line.orderLineId} className="flex justify-between items-center border-b border-gray-200 pb-4">
                  <div>
                    <h4 className="text-md font-semibold text-gray-800">{line.bookTitle}</h4>
                    <p className="text-sm text-gray-600">ISBN: {line.isbn}</p>
                    <p className="text-sm text-gray-600">Quantity: {line.quantity}</p>
                    <p className="text-sm text-gray-600">Unit Price: {line.unitPrice} kr</p>
                  </div>
                  <div className="text-md font-light text-gray-800">{line.quantity * line.unitPrice} kr</div>
                </div>
              ))}
            </div>
            {/* total */}
            <div className="text-right mt-4 font-semibold ">
              <p>Total price: {order.orderLines.reduce((acc, line) => acc + line.quantity * line.unitPrice, 0)} kr</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderDetail;
