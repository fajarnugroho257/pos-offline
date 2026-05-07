import { Navigate, useNavigate } from "react-router-dom";
import React, { useState, useRef, useEffect } from "react";
import iconPos from "../assets/img/pos.png";
import iconLogout from "../assets/img/logout.png";
import iconReport from "../assets/img/report.png";
import iconDatabase from "../assets/img/database.png";
import iconSettings from "../assets/img/settings.png";
import Logout from "../utilities/Logount";
import api from "../utilities/axiosInterceptor";
import Pos from "./Pos";
import { getToken } from "../utilities/Auth";
import { ToastContainer } from "react-toastify";
import { swalSuccess, swalError, swalConfirm } from "../utilities/Swal";

function Pembayaran() {
  const cabang_nama = localStorage.getItem("cabang_nama");
  const name = localStorage.getItem("name");
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Tutup dropdown jika klik di luar elemen dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false); // Tutup dropdown
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  useEffect(() => {
    const token = getToken();
    async function checkToken() {
      try {
        const hasil = await api.get("/api-cek-token", {
          headers: {
            Authorization: `Bearer ${token}`, // Sisipkan token di header
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });
        // console.log(hasil.data.message);
        if (hasil.data.message !== "Token is valid") {
          navigate("/login");
          // alert("aa");
        }
      } catch (error) {
        console.error("Terjadi kesalahan:", error);
      }
    }
    checkToken();
  }, []);

  const handleSubmit = (event) => {
    navigate(`/${event}`);
  };

  const [isOpen, setIsOpen] = useState(false);

  const handleModalTambah = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    const result = await swalConfirm("Yakin?", "Anda akan keluar");
    if (result.isConfirmed) {
      const token = localStorage.getItem("token");
      const response = await api.get("/logout", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      if (response.status === 200) {
        // Hapus token dari local storage (atau session storage)
        localStorage.removeItem("token");
        // Arahkan ke halaman login
        navigate("/login");
      }
    }
  };

  return (
    <div className="px-5 py-3 h-[86%]">
      <ToastContainer />
      <div className="flex items-center">
        <div className="w-full h-fit">
          <h3 className="text-center mt-11 font-poppins text-xl md:text-3xl font-semibold text-gray-800 w-full md:w-1/2 mx-auto mb-5 md:mb-10">
            Selamat Datang {name} <br /> {cabang_nama} <br />
          </h3>
          <div className="flex items-center justify-center">
            <div className="md:w-[75%] xl:w-3/5 grid grid-cols-2 gap-8 md:gap-1 md:grid-cols-4 items-center justify-center">
              <div onClick={() => handleSubmit("pos")}>
                <div className="mx-auto w-24 h-[110px] md:w-28 md:h-40 lg:w-44 lg:h-56 bg-colorPrimary rounded-lg shadow-lg flex justify-center items-center cursor-pointer hover:bg-colorPrimaryHover">
                  <img src={iconPos} className="w-4/6" alt="iconPos" />
                </div>
                <h3 className="text-center mt-3 text-gray-800 font-poppins font-semibold text-sm md:text-lg lg:text-2xl">
                  POS
                </h3>
              </div>
              <div onClick={() => handleSubmit("penjualan")}>
                <div className="mx-auto w-24 h-[110px] md:w-28 md:h-40 lg:w-44 lg:h-56 bg-colorPrimary rounded-lg shadow-lg flex justify-center items-center cursor-pointer hover:bg-colorPrimaryHover">
                  <img src={iconReport} className="w-4/6" alt="iconReport" />
                </div>
                <h3 className="text-center mt-3 text-gray-800 font-poppins font-semibold text-sm md:text-lg lg:text-2xl">
                  Penjualan
                </h3>
              </div>
              <div onClick={() => handleSubmit("barang")}>
                <div className="mx-auto w-24 h-[110px] md:w-28 md:h-40 lg:w-44 lg:h-56 bg-colorPrimary rounded-lg shadow-lg flex justify-center items-center cursor-pointer hover:bg-colorPrimaryHover">
                  <img
                    src={iconDatabase}
                    className="w-[60px] md:w-[70px] lg:[80px] xl:w-[90px]"
                    alt="iconDatabase"
                  />
                </div>
                <h3 className="text-center mt-3 text-gray-800 font-poppins font-semibold text-sm md:text-lg lg:text-2xl">
                  Barang
                </h3>
              </div>
              <div onClick={() => handleSubmit("settings")}>
                <div className="mx-auto w-24 h-[110px] md:w-28 md:h-40 lg:w-44 lg:h-56 bg-colorPrimary rounded-lg shadow-lg flex justify-center items-center cursor-pointer hover:bg-colorPrimaryHover">
                  <img
                    src={iconSettings}
                    className="w-4/6"
                    alt="iconSettings"
                  />
                </div>
                <h3 className="text-center mt-3 text-gray-800 font-poppins font-semibold text-sm md:text-lg lg:text-2xl">
                  Settings
                </h3>
              </div>
              <div onClick={() => handleLogout()}>
                <div className="mx-auto w-24 h-[110px] md:w-28 md:h-40 lg:w-44 lg:h-56 bg-colorPrimary rounded-lg shadow-lg flex justify-center items-center cursor-pointer hover:bg-colorPrimaryHover">
                  <img src={iconLogout} className="w-4/6" alt="iconLogout" />
                </div>
                <h3 className="text-center mt-3 text-gray-800 font-poppins font-semibold text-sm md:text-lg lg:text-2xl">
                  Logout
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Pembayaran;
