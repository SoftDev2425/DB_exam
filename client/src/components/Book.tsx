import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import axios from "axios";
import { useToast } from "./ui/use-toast";

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
  const { toast } = useToast();

  const handleAddToCart = async () => {
    const response = await axios.post(
      `http://localhost:3000/basket/add`,
      { isbn: book.isbn, quantity: 1 },
      { withCredentials: true }
    );

    if (response.status !== 201) {
      console.log("Error adding book to cart");
      return;
    }

    toast({
      title: "Book added to cart",
      description: `${book.title} has been added to your cart`,
    });
  };

  return (
    <div className="bg-white rounded-md overflow-hidden shadow-md hover:shadow-lg flex flex-col hover:scale-105 duration-100 ease-in-out">
      <img src={book.thumbnailUrl} alt={book.title} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-2">{book.title}</h2>
        <p className="text-gray-700 mb-2">{book.shortDescription}</p>
        <div className="flex flex-col justify-between items-center mt-4 space-y-4">
          <p className="text-sm text-gray-500">
            <span className="font-semibold">Authors:</span> {book.authors.join(", ")}
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

        <div className="mt-4 flex-1">
          <Button className="mr-2" onClick={() => navigate(`/book/${book._id}`)}>
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
