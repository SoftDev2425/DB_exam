import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import axios from "axios";
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import { ShoppingBasketIcon } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import BasketContent from "./BasketContent";

const Header = () => {
  const { setAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    const res = await axios.post("http://localhost:3000/api/auth/logout", {}, { withCredentials: true });

    if (res.status === 200) {
      setAuthenticated(false);
      navigate("/login");
    }
  };

  return (
    <div className="flex items-center bg-primary text-white text-center p-3 w-full h-[80px] bg-indigo-400 justify-between">
      <h1 className="text-3xl font-bold hover:scale-105 duration-100 ease-in-out cursor-default">EcoBooks</h1>

      <div className="flex items-center">
        <Sheet>
          <SheetTrigger>
            <Button variant="ghost" className="mr-2">
              <ShoppingBasketIcon size={24} />
              Basket
            </Button>
          </SheetTrigger>
          <SheetContent>
            <BasketContent />
          </SheetContent>
        </Sheet>

        <Button variant="secondary" className="mr-2" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Header;
