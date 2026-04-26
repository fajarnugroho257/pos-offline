import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { setToken } from "../utilities/Auth";
import quick from "../assets/img/calculator_6655639.png";
import { ToastContainer, toast } from "react-toastify";
import { dbPromise } from "../services/db";

function Login() {
  localStorage.setItem("page", "login");
  const [usermail, setUsermail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Tunggu...");
    // Data yang akan dikirim
    const data = {
      username: usermail,
      password: password,
    };

    const endPoint = "https://sameeramart.com/app-pos/api/login-api";
    // const endPoint = "http://127.0.0.1:8000/api/login-api";
    const response = await fetch(endPoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (response.ok) {
      const data = await response.json();
      // Simpan token JWT
      setToken(data);
      toast.update(toastId, {
        render: data.message,
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
      // Redirect ke dashboard
      navigate("/dashboard");
    } else {
      const data = await response.json();
      toast.update(toastId, {
        render: data.message,
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };
  const [showPassword, setShowPassword] = useState(false);
  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleLoginOffline = async () => {
    const db = await dbPromise;
    // Mengambil semua data dari object store "products"
    const datas = await db.getAll("products");
    console.log(datas);

    const toko_pusat = localStorage.getItem("toko_pusat");
    console.log(toko_pusat.length);
    if (toko_pusat.length === 0) {
      alert("Belum pernah login, harus online dulu ❌");
      return;
    }
    navigate("/dashboard");
  };

  return (
    <div className="grid md:grid-cols-2">
      <div className="hidden bg-colorPrimary md:block">
        <div className="h-screen flex items-center justify-center">
          <div>
            <img src={quick} alt="quick" className="w-56 mx-auto" />
            <h4 className="text-colorGray font-poppins text-4xl font-semibold text-center">
              Quick POS
            </h4>
            <h4 className="text-colorGray font-poppins text-3xl font-normal text-center">
              Cepat dan Efisien
            </h4>
          </div>
        </div>
      </div>
      <div className="h-screen bg-colorGray flex items-center justify-center">
        <form className="" onSubmit={handleLogin}>
          <h4 className="font-poppins text-4xl font-semibold text-colorPrimary text-center">
            Login
          </h4>
          <div className="mt-16">
            <input
              required
              type="text"
              placeholder="Username"
              onChange={(e) => setUsermail(e.target.value)}
              className="w-80 outline-none font-poppins font-normal border-b-2 border-colorPrimary bg-transparent py-2 text-colorPrimary"
            />
          </div>
          <div className="relative mt-12 mb-2">
            <input
              required
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              className="w-80 outline-none font-poppins font-normal border-b-2 border-colorPrimary bg-transparent py-2 text-colorPrimary"
            />
            <i
              onClick={handleShowPassword}
              className={`absolute right-0 bottom-2 ${
                showPassword ? "fa fa-eye" : "fa fa-eye-slash"
              } cursor-pointer`}
            ></i>
          </div>
          <Link
            to="/login"
            className="font-poppins text-sm italic text-colorPrimary"
          >
            {/* Lupa password ? */}
          </Link>
          <div className="flex gap-4 justify-center mt-12">
            <button
              type="submit"
              className="block bg-colorPrimary font-poppins text-colorGray font-semibold py-1 px-3 rounded-[5px] hover:bg-blue-950"
            >
              Login
            </button>

            <button
              onClick={handleLoginOffline}
              type="button"
              className="block bg-red-500 font-poppins text-colorGray font-semibold py-1 px-3 rounded-[5px] hover:bg-red-400"
            >
              Login Offline
            </button>
            {/* <Link className="block border-2 border-colorPrimary bg-colorGray font-poppins text-colorPrimary font-semibold py-1 px-3 rounded-[5px] hover:bg-gray-200">
              Sign In
            </Link> */}
          </div>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
}

export default Login;
