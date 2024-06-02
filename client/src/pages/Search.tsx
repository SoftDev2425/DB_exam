import Header from "@/components/Header";
import Search from "@/components/Search";

const SearchPage = () => {
  return (
    <>
      <div className="h-full w-full items-center justify-center mx-auto">
        <Header />
        <div className="my-4">
          <Search />
        </div>
      </div>
    </>
  );
};

export default SearchPage;
