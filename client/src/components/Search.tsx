import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import axios from "axios";

const Search = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get(
        `http://localhost:3000/books/search?query=${searchTerm}&page=${page}&limit=${limit}`
      );
      console.log(response.data);
    };
    fetchData();
  }, [searchTerm, limit, page]);

  return (
    <div className="w-[400px] flex space-x-2">
      {/* INPUTFIELD */}
      <Input placeholder="Search for books" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      <Button>Search</Button>
    </div>
  );
};

export default Search;
