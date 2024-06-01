import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthContext } from "@/context/AuthContext";
import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
// import { useAuth } from "@/AuthContext";

const Login: React.FC = () => {
  const { authenticated, setAuthenticated } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = () => {
    // login(email, password);
    setAuthenticated(true);
    navigate("/");
  };

  return (
    <div className="px-2 flex flex-col space-y-2">
      <Input type="text" value={email} onChange={(e) => setEmail(e.target.value)} />
      <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <Button onClick={() => handleLogin()} variant="default">
        Login
      </Button>

      {/* or register here */}
      <Button onClick={() => navigate("/register")} variant="outline">
        Register
      </Button>
    </div>
  );
};

export default Login;
