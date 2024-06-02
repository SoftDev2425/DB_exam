import Header from "@/components/Header";

const Home = () => {
  return (
    <>
      <Header />
      <div className="flex flex-col space-y-4 text-center my-8">
        {/* Recommended books */}
        <div>
          <h2 className="text-xl">Recommended books</h2>
        </div>

        {/* TOP rated books */}
        <div>
          <h2 className="text-xl">Top rated books</h2>
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
    </>
  );
};

export default Home;
