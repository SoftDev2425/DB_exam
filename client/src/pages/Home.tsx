import Header from "@/components/Header";
import Search from "@/components/Search";

const Home = () => {
  return (
    <>
      <Header />
      <div className="flex flex-col space-y-4 text-center my-8">
        <div className="h-full w-full items-center justify-center mx-auto">
          <Search />
        </div>

        {/* TOP books */}
        <div>
          <h2 className="text-xl">Popular books</h2>
        </div>
      </div>
    </>
  );
};

export default Home;
