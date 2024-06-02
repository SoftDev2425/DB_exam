import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import axios from "axios";
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import { LogOut, ShoppingBasketIcon } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import BasketContent from "./BasketContent";

const Header = () => {
  const { setAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    const confirmation = window.confirm("Are you sure you want to logout?");

    if (!confirmation) {
      return;
    }

    const res = await axios.post("http://localhost:3000/api/auth/logout", {}, { withCredentials: true });

    if (res.status === 200) {
      setAuthenticated(false);
      navigate("/login");
    }
  };

  return (
    <div className="flex items-center bg-primary text-white text-center px-8 w-full h-[80px] bg-indigo-400 justify-between sticky top-0 z-[9998]">
      <h1
        className="text-3xl font-bold hover:scale-110 duration-100 ease-in-out cursor-pointer"
        onClick={() => navigate("/")}
      >
        EcoBooks
      </h1>

      <div className="flex items-center gap-1">
        {/* home */}
        <Button variant="ghost" className="mr-2" onClick={() => navigate("/")}>
          Home
        </Button>

        {/* search */}
        <Button variant="ghost" className="mr-2" onClick={() => navigate("/search")}>
          Search
        </Button>

        {/* order history */}
        <Button variant="ghost" className="mr-2" onClick={() => navigate("/orders")}>
          Orders
        </Button>

        {/* User preferences */}
        <Button variant="ghost" className="mr-2" onClick={() => navigate("/profile")}>
          Profile
        </Button>

        <Sheet>
          <SheetTrigger>
            <Button variant="ghost" className="mr-2">
              <ShoppingBasketIcon size={30} />
            </Button>
          </SheetTrigger>
          <SheetContent className="z-[9999]">
            <BasketContent />
          </SheetContent>
        </Sheet>

        <Button variant="ghost" className="mr-2" onClick={handleLogout}>
          <LogOut size={24} />
        </Button>
      </div>
    </div>
  );
};

export default Header;
