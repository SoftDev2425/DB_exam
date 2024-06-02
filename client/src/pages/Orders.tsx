import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
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

interface OrdersResponse {
  orders: Order[];
}

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [sortedOrders, setSortedOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState("desc");
  const [sortBy, setSortBy] = useState("date");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get<OrdersResponse>("http://localhost:3000/orders", {
          withCredentials: true,
        });

        if (response.status === 200) {
          setOrders(response.data.orders);
        } else {
          setError("Failed to fetch orders.");
        }
      } catch (error) {
        if (error instanceof AxiosError) {
          setError(error.response?.data.message);
          setOrders([]);
        }

        setError("An error occurred while fetching orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    const sortOrders = () => {
      if (orders.length === 0) return setSortedOrders([]);

      const sortedOrders = [...orders].sort((a, b) => {
        if (sortBy === "date") {
          const dateA = new Date(a.orderDate).getTime();
          const dateB = new Date(b.orderDate).getTime();
          return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
        } else if (sortBy === "status") {
          const statusA = a.status.toLowerCase();
          const statusB = b.status.toLowerCase();
          return sortOrder === "asc" ? statusA.localeCompare(statusB) : statusB.localeCompare(statusA);
        } else if (sortBy === "total") {
          const totalA = a.orderLines.reduce((acc, line) => acc + line.quantity * line.unitPrice, 0);
          const totalB = b.orderLines.reduce((acc, line) => acc + line.quantity * line.unitPrice, 0);
          return sortOrder === "asc" ? totalA - totalB : totalB - totalA;
        }
        return 0;
      });
      setSortedOrders(sortedOrders);
    };

    sortOrders();
  }, [sortOrder, sortBy, orders]);

  const handleSortOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(e.target.value);
  };

  const handleSortByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  };

  if (loading) {
    return <p className="text-center text-gray-700">Loading...</p>;
  }


  return (
    <>
      <Header />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Orders</h1>
        {/* sort orders */}
        <div className="flex justify-end gap-4 mb-6">
          <select
            className="border border-gray-200 rounded-lg px-4 py-2"
            value={sortOrder}
            onChange={handleSortOrderChange}
          >
            <option value="desc">Latest</option>
            <option value="asc">Oldest</option>
          </select>
          <select className="border border-gray-200 rounded-lg px-4 py-2" value={sortBy} onChange={handleSortByChange}>
            <option value="total">Total</option>
            <option value="date">Order Date</option>
            <option value="status">Status</option>
          </select>
        </div>
        {sortedOrders.length === 0 ? (
          <p className="text-center text-gray-700">No orders found.</p>
        ) : (
          <div className="space-y-8">
            {sortedOrders.map((order) => (
              <div
                key={order.orderId}
                className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-lg ease-in-out duration-100 hover:cursor-pointer relative"
                onClick={() => navigate(`/orders/${order.orderId}`)}
              >
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Order ID: {order.orderId}</h2>
                  <p className="text-gray-600">
                    <span className="font-medium">Order Date:</span> {new Date(order.orderDate).toLocaleDateString()} (
                    <Moment fromNow>{order.orderDate}</Moment>)
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Shipping Address:</span> {order.shippingAddress}, {order.shippingCity}
                  </p>
                  <p className="text-gray-600 absolute right-0 top-0 bg-gray-200 px-4 py-2 rounded-tr-lg rounded-bl-lg">
                    <span className="font-medium">Status:</span> {order.status}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Order Lines:</h3>
                  <div className="space-y-4">
                    {order.orderLines.map((line) => (
                      <div
                        key={line.orderLineId}
                        className="flex justify-between items-center border-b border-gray-200 pb-4"
                      >
                        <div>
                          <h4 className="text-md font-semibold text-gray-800">{line.bookTitle}</h4>
                          <p className="text-sm text-gray-600">ISBN: {line.isbn}</p>
                          <p className="text-sm text-gray-600">Quantity: {line.quantity}</p>
                          <p className="text-sm text-gray-600">Unit Price: {line.unitPrice} kr</p>
                        </div>
                        <div className="text-md font-light text-gray-800">{line.quantity * line.unitPrice} kr</div>
                      </div>
                    ))}
                    {/* total price */}
                    <div className="flex justify-end items-center mt-4 gap-2">
                      <h4 className="text-md font-semibold text-gray-800">Total Price:</h4>
                      <div className="text-md font-semibold text-gray-800">
                        {order.orderLines.reduce((acc, line) => acc + line.quantity * line.unitPrice, 0)} kr
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Orders;
