import React, { useState } from "react";
import { Link } from "react-router-dom";
import quick from "../assets/img/calculator_6655639.png";
import { useNavigate } from "react-router-dom";
import User from "./User";
import { useLocation } from "react-router-dom";

function HeaderCopy(status) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // set active
  const [pageName, setPageName] = useState("Pembelian");
  // list header
  const header = [
    // { name: "Dashboard", url: "/dashboard" },
    // { name: "Tambah Data", url: "/tambah-pembelian" },
    // { name: "Data Pembelian", url: "/pembelian" },
    // { name: "Data Pengiriman", url: "/pengiriman" },
    // { name: "Laporan", url: "/laporan" },
    // { name: "Nota Pembelian", url: "/nota" },
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
  const navigate = useNavigate();
  if (status.status === "hidden") {
    return <></>;
  } else {
    return (
      <header className="fixed top-0 left-0 right-0 bg-colorPrimary z-50 flex items-center justify-center text-white">
        POS Kasir
      </header>
    );
  }
}

export default HeaderCopy;
