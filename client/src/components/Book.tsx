import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { Bookmark } from "lucide-react";

interface BookProps {
  book: {
    _id: string;
    title: string;
    isbn: string;
    authors: string[];
    publishedDate: string;
    genres: string[];
    format: string;
    pageCount: number;
    publisher: string;
    weight?: number;
    shortDescription: string;
    longDescription: string;
    thumbnailUrl: string;
    ratings: {
      averageRating: number;
      totalReviews: number;
    };
    language: string;
    price: number;
    stockQuantity: number;
  };
}

const Book = ({ book }: BookProps) => {
  const navigate = useNavigate();

  const handleAddToCart = async () => {
    try {
      const response = await axios.post(
        `http://localhost:3000/basket/add`,
        { isbn: book.isbn, quantity: 1 },
        { withCredentials: true }
      );

      if (response.status !== 201) {
        console.log("Error adding book to cart");
        return;
      }

      toast.success(`${book.title} has been added to your cart`);
    } catch (error: AxiosError | unknown) {
      console.error("Error adding book to cart", error);
      if (error instanceof AxiosError) {
        console.error("Error adding book to cart", error.response?.data);
        toast.error(error.response?.data.message);
      }
    }
  };

  const handleAddToWishList = async () => {
    const response = await axios.post(
      `http://localhost:3000/books/${book.isbn}/wishlist`,
      {},
      { withCredentials: true }
    );

    if (response.status !== 201) {
      console.log("Error adding book to wishlist");
      return;
    }

    toast.success(`${book.title} has been added to your wishlist`);
  };

  return (
    <div className="bg-white rounded-md overflow-hidden shadow-md hover:shadow-lg flex flex-col hover:scale-105 duration-100 ease-in-out">
      <div className="relative">
        <img src={book.thumbnailUrl} alt={book.title} className="w-full h-48 object-cover" />
        <div
          className="absolute right-1 bottom-1 cursor-pointer hover:scale-110 duration-100 ease-in-out bg-white bg-opacity-60 rounded-full p-1"
          onClick={handleAddToWishList}
        >
          <Bookmark size={18} />
        </div>
      </div>
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-2">{book.title}</h2>
        <p className="text-gray-700 mb-2">{book.shortDescription}</p>
        <div className="flex flex-col justify-between items-center mt-4 space-y-4">
          <p className="text-sm text-gray-500">
            <span className="font-semibold">Authors:</span> {book.authors.join(", ")}
          </p>
          {/* isbn */}

          <p className="text-sm text-gray-500">
            <span className="font-semibold">ISBN:</span> {book.isbn}
          </p>

          <p className="text-sm text-gray-500">
            <span className="font-semibold">Published Date:</span> {new Date(book.publishedDate).toLocaleDateString()}
          </p>
          <p>
            <span className="font-semibold">Price:</span> {book.price} kr.
          </p>

          <p>
            <span className="font-semibold">Stock:</span> {book.stockQuantity}
          </p>

          <p>
            <span className="font-semibold">Rating:</span> {book.ratings.averageRating} ({book.ratings.totalReviews}{" "}
            reviews)
          </p>
        </div>

        <div className="mt-4 text-center">
          <Button className="mr-2" onClick={() => navigate(`/book/${book.isbn}`)}>
            Details
          </Button>
          <Button className="bg-blue-500 hover:bg-blue-600" onClick={handleAddToCart}>
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Book;
