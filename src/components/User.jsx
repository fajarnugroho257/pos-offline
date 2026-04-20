import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Logout from "../utilities/Logount";

function User() {
  const [isOpen, setIsOpen] = useState(false);
  const name = localStorage.getItem("name");
  const dropdownRef = useRef(null); // Ref untuk komponen dropdown

  const toggleUser = () => {
    setIsOpen(!isOpen);
  };

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

  return (
    <div>
      <div className="relative" ref={dropdownRef}>
        <div onClick={toggleUser} className="cursor-pointer font-poppins text-sm md:text-base">
          <i className="fa fa-user"></i> {name}
        </div>
        <div
          className={`absolute transition-transform transform ${
            isOpen ? "block" : "hidden"
          } bg-white border border-colorPrimary text-colorPrimary font-poppins w-36 rounded-md -right-4`}
        >
          <div className="px-3 py-4 text-sm">
            <Logout />
          </div>
        </div>
      </div>
    </div>
  );
}

export default User;
