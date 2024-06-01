import { SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import axios from "axios";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";

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

const BasketContent = () => {
  const [basketData, setBasketData] = useState<BasketContentProps | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3000/basket/get", { withCredentials: true });
        if (response.status === 200) {
          setBasketData(response.data);
        } else {
          console.log("Error fetching books");
          toast({
            title: "Error fetching books",
            description: "An error occurred while fetching books.",
          });
        }
      } catch (error) {
        console.log("Error fetching books", error);
      }
    };

    fetchData();
  }, [toast]);

  const handleClearBasket = async () => {
    const confirmation = window.confirm("Are you sure you want to clear your basket?");

    if (confirmation) {
      try {
        const response = await axios.delete("http://localhost:3000/basket", { withCredentials: true });
        if (response.status === 200) {
          setBasketData({ msg: "Basket cleared", basket: { books: [] } });
        } else {
          console.log("Error clearing basket");
        }
      } catch (error) {
        console.log("Error clearing basket", error);
      }
    }
  };

  return (
    <SheetHeader>
      <SheetTitle>Basket</SheetTitle>
      <SheetDescription>
        {basketData?.basket.books.length ? (
          basketData.basket.books.map((book) => (
            <div key={book.isbn} className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-4">
                <img src={book.thumbnailUrl} alt={book.title} className="w-12 h-12 object-cover" />
                <div>
                  <h3 className="text-lg font-semibold">{book.title}</h3>
                  <p className="text-sm text-gray-500">{book.authors.join(", ")}</p>
                </div>
              </div>
              <div>
                <p>
                  {book.quantity} x {book.price} kr
                </p>
              </div>
            </div>
          ))
        ) : (
          <p>Your basket is empty.</p>
        )}

        <div className="flex justify-between items-center mt-4">
          <p>Total:</p>
          <p>{basketData?.basket.books.reduce((acc, book) => acc + book.quantity * book.price, 0)} kr</p>
        </div>

        <div className="flex gap-2">
          <Button className="p-2 rounded-md mt-4 w-full" variant={"secondary"} onClick={handleClearBasket}>
            Clear basket
          </Button>
          <Button className="p-2 rounded-md mt-4 w-full">Checkout</Button>
        </div>
      </SheetDescription>
    </SheetHeader>
  );
};

export default BasketContent;
