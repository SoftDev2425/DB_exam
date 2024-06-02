import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthContext } from "@/context/AuthContext";
import axios from "axios";
import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// import { useAuth } from "@/AuthContext";

const Login: React.FC = () => {
  const { authenticated, setAuthenticated } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {
    const res = await axios.post(
      "http://localhost:3000/api/auth/login",
      {
        email: email,
        password: password,
      },
      { withCredentials: true }
    );

    console.log(res);

    if (res.status !== 200) {
      return;
    }

    setAuthenticated(true);
    navigate("/");
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-r from-blue-500 to-purple-500">
      <div className="bg-white rounded-lg shadow-lg p-8 space-y-4">
        <div className="mb-4">
          <Input
            type="text"
            value={email}
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="mb-6">
          <Input
            type="password"
            value={password}
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            className="w-full"
          />
        </div>
        <Button onClick={handleLogin} variant="default" className="w-full">
          Login
        </Button>
        <div>
          <p className="text-sm">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-500">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
