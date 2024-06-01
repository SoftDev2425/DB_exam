import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import axios from "axios";
import Book from "./Book";
import Pagination from "./Pagination";

interface SearchResult {
  searchTerm: string;
  total: number;
  totalPages: number;
  page: number;
  limit: number;
  books: {
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
  }[];
}

const Search = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [books, setBooks] = useState<SearchResult>({} as SearchResult);

  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get(
        `http://localhost:3000/books/search?query=${searchTerm}&page=${page}&limit=${limit}`,
        { withCredentials: true }
      );

      if (response.status !== 200) {
        console.log("Error fetching books");
        return;
      }

      console.log(response.data);
      setBooks(response.data);
    };

    fetchData();
  }, [searchTerm, limit, page]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  return (
    <div className="flex flex-col items-center justify-center ">
      <div className="flex space-x-2 mb-4">
        <Input
          placeholder="Search for books, authors,"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-96"
        />
        <Button onClick={() => setPage(1)}>Search</Button>
      </div>

      {/* Found books */}
      {books && books.books && books.books.length > 0 && (
        <div className="mb-4">
          <span>Found {books.total} books for "{searchTerm}"</span>
        </div>
      )}

      {/* change limit */}
      {books && books.books && books.books.length > 0 && (
        <div className="flex flex-col gap-2 space-x-2 mb-4 items-center">
          <span>Books per page:</span>
          <div className="flex gap-2">
            <Button onClick={() => setLimit(10)}>10</Button>
            <Button onClick={() => setLimit(20)}>20</Button>
            <Button onClick={() => setLimit(30)}>30</Button>
            <Button onClick={() => setLimit(40)}>40</Button>
            <Button onClick={() => setLimit(50)}>50</Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl">
        {books.books && books.books.map((book) => <Book key={book._id} book={book} />)}
      </div>
      {books.totalPages > 1 && (
        <Pagination currentPage={page} totalPages={books.totalPages} onPageChange={handlePageChange} />
      )}
    </div>
  );
};

export default Search;
