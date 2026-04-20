import React, { useState } from "react";
import { Link } from "react-router-dom";
// import quick from "../assets/img/calculator_6655639.png";
// import { useNavigate } from "react-router-dom";
import User from "./User";
import { useLocation } from "react-router-dom";

function Header(status) {
  const [isOpen, setIsOpen] = useState(false);
  const cabang_nama = localStorage.getItem("cabang_nama");
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // set active
  const [pageName, setPageName] = useState("Pembelian");
  // list header
  const header = [
    { name: "Dashboard", url: "/dashboard" },
    { name: "Pos", url: "/pos" },
    { name: "Penjualan", url: "/penjualan" },
    { name: "Barang", url: "/barang" },
    { name: "Settings", url: "/settings" },
  ];
  //
  const handleClick = (name) => {
    setPageName(name);
    setIsOpen(!isOpen);
  };
  const location = useLocation();
  let uri = location.pathname;
  if (
    uri === "/tambah-pembelian" ||
    uri === "/tambah-pengiriman" ||
    uri === "/tambah-karyawan"
  ) {
    uri = "/tambah-pembelian";
  }
  // const navigate = useNavigate();
  if (status.status === "hidden") {
    return <></>;
  } else {
    return (
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="h-[40px] flex justify-between bg-colorPrimary items-center text-colorGray px-5">
          <i
            onClick={toggleSidebar}
            className="fa fa-bars cursor-pointer md:hidden"
          ></i>
          <div className="flex gap-3 items-center">
            <i className="fa fa-cash-register"></i>
            <h3 className="md:text-xl font-semibold text-base mdtext-4xl font-poppins">
              {cabang_nama}
            </h3>
          </div>
          <div className="hidden font-poppins font-normal text-color text-md md:flex gap-16">
            {header.map((val, key) => (
              <Link
                key={key}
                to={val.url}
                className="cursor-pointer"
                onClick={() => handleClick(val.name)}
              >
                <h3 className={val.url === uri ? "active" : ""}>{val.name}</h3>
                <div className={val.url === uri ? "header-active" : ""}></div>
              </Link>
            ))}
          </div>
          <User />
        </div>
        <div
          className={`fixed top-[40px] left-0 h-[calc(100vh-60px)] bg-colorPrimary md:hidden transition-transform transform  ${isOpen ? "translate-x-0 shadow-lg shadow-black" : "-translate-x-full"}  w-64`}
        >
          <div className="pt-4 px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-colorGray text-[12px] font-poppins"></div>
            </div>
            <div>
              <i
                onClick={toggleSidebar}
                className="fa fa-times text-md text-colorGray cursor-pointer"
              ></i>
            </div>
          </div>
          <ul className="p-4">
            {header.map((val, key) => (
              <Link
                key={"head" + key}
                to={val.url}
                className="cursor-pointer font-poppins"
                onClick={() => handleClick(val.name)}
              >
                <h3
                  className={
                    val.name === pageName
                      ? "text-colorGray font-semibold py-2 px-1 my-2 md:active underline"
                      : "py-2 px-1 my-2 text-colorGray"
                  }
                >
                  {val.name}
                </h3>
                <div
                  className={val.name === pageName ? "md:header-active" : ""}
                ></div>
              </Link>
            ))}
          </ul>
        </div>
      </div>
    );
  }
}

export default Header;
