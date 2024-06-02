import axios, { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";

interface Book {
  isbn: string;
  title: string;
  format: string;
  language: string;
  authors: string[];
  quantity: number;
  price: number;
  publisher: string;
  thumbnailUrl: string;
  latestStock: number;
}

interface Basket {
  books: Book[];
}

interface BasketContentProps {
  msg: string;
  basket: Basket;
}

const Checkout = () => {
  const [basketData, setBasketData] = useState<BasketContentProps | null>(null);
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [refetch, setRefetch] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3000/basket/get", { withCredentials: true });
        if (response.status === 200) {
          setBasketData(response.data);
        } else {
          console.log("Error fetching books");
          toast.error("Error fetching books");
        }
      } catch (error) {
        console.log("Error fetching books", error);
      }
    };

    fetchData();
  }, [refetch]);

  const handlePurchase = async () => {
    try {
      if (!shippingAddress || !shippingCity) {
        toast.error("Please fill in all fields");
        return;
      }

      const response = await axios.post(
        "http://localhost:3000/orders",
        {
          shippingAddress: shippingAddress,
          shippingCity: shippingCity,
        },
        { withCredentials: true }
      );
      if (response.status === 201) {
        toast.success("Order created", {
          description: "Your order has been created.",
        });
        setBasketData({ msg: "Basket cleared", basket: { books: [] } });
        navigate("/orders");
      } else {
        console.log("Error creating order");
        toast.error("Error creating order");
      }
    } catch (error: AxiosError | unknown) {
      console.log("Error creating order", error);
      if (error instanceof AxiosError) {
        console.log("Error creating order", error.response?.data);
        toast.error(error.response?.data.message);
      }
    }
  };

  return (
    <>
      <Header />
      <div className="flex flex-col md:flex-row justify-between p-6">
        <div className="w-full md:w-1/2 mb-4 md:mb-0 md:mr-4">
          <h2 className="text-2xl font-bold mb-4">Shipping Details</h2>
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" htmlFor="address">
                Address
              </label>
              <input
                id="address"
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" htmlFor="city">
                City
              </label>
              <input
                id="city"
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={shippingCity}
                onChange={(e) => setShippingCity(e.target.value)}
              />
            </div>
            <Button className="p-2 rounded-md w-full" onClick={handlePurchase}>
              Purchase
            </Button>
          </form>
        </div>
        <div className="w-full md:w-1/2">
          <h2 className="text-2xl font-bold mb-4">Basket</h2>
          {basketData && basketData?.basket.books.length ? (
            basketData.basket.books.map((book) => (
              <div key={book.isbn} className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-4">
                  <img src={book.thumbnailUrl} alt={book.title} className="w-12 h-12 object-cover" />
                  <div>
                    <h3 className="text-lg font-semibold">{book.title}</h3>
                    <p className="text-sm text-gray-500">{book.authors.join(", ")}</p>
                  </div>
                </div>
                <p>
                  {book.quantity} x {book.price} kr
                </p>
              </div>
            ))
          ) : (
            <p>Your basket is empty.</p>
          )}
          <div className="flex justify-between items-center mt-4">
            <p>Total:</p>
            <p>{basketData?.basket.books.reduce((acc, book) => acc + book.quantity * book.price, 0)} kr</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Checkout;
