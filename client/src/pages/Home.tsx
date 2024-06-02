import BookCarousel from "@/components/BookCarousel";
import Header from "@/components/Header";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Book {
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
}

const Home = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTop10Rated = async () => {
      try {
        const response = await axios.get("http://localhost:3000/books/top-rated", {
          withCredentials: true,
        });
        console.log(response.data);
        setBooks(response.data);
      } catch (error) {
        console.error("Error fetching books:", error);
        toast.error("Error fetching books");
      }
    };

    fetchTop10Rated();
  }, []);

  return (
    <>
      <Header />
      <div className="flex flex-col space-y-4 text-center my-8">
        {/* Recommended books */}
        <div>
          <h2 className="text-xl">Recommended books</h2>
          <BookCarousel />
        </div>

        {/* TOP rated books */}
        <div>
          <h2 className="text-xl">Top rated books</h2>
          <div className="flex overflow-x-auto space-x-4 mx-20">
            {books &&
              books.map((book) => (
                <div
                  key={book._id}
                  className="flex-shrink-0 w-48 p-4 bg-white shadow-md rounded-lg m-2 hover:scale-105 duration-100 ease-in-out cursor-pointer"
                  onClick={() => navigate(`/book/${book.isbn}`)}
                >
                  <img src={book.thumbnailUrl} alt={book.title} className="w-full h-48 object-cover" />
                  <h3 className="text-lg font-semibold mt-2">{book.title}</h3>
                  <p className="text-sm text-gray-600">{book.authors.join(", ")}</p>
                  <p className="text-sm text-gray-600">
                    {book.ratings.averageRating} ({book.ratings.totalReviews})
                  </p>
                  <p className="text-sm text-gray-600">${book.price}</p>

                  <div className="flex flex-col gap-2 justify-between mt-2">
                    <button className="bg-blue-500 text-white px-2 py-1 rounded-md">Add to cart</button>
                    <button className="bg-blue-500 text-white px-2 py-1 rounded-md">Add to wishlist</button>
                  </div>
                </div>
              ))}
          </div>

          {/* trending */}
          <div>
            <h2 className="text-xl">Trending</h2>
          </div>

          {/* New arrivals */}
          <div>
            <h2 className="text-xl">New arrivals</h2>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
