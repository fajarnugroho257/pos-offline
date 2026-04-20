import React from "react";
import { Outlet, Link } from "react-router-dom";
import quick from "./assets/img/calculator_6655639.png";

function Splash() {
  return (
    <>
      <div className="w-full h-screen flex items-center justify-center bg-colorPrimary relative">
        <div className="text-center" alt="quick">
          <img src={quick} alt="quick" className="w-40 mx-auto" />
          <div className="text-3xl font-thin font-opensans text-colorGray">
            <p className="pt-4 pb-1">Selamat Datang</p>
            <p>Aplikasi Point Of Sales</p>
          </div>
          <Link
            to="/login"
            className="bg-colorGray text-colorPrimary py-2 px-4 rounded-lg font-poppins font-normal mt-5 block w-fit mx-auto"
          >
            Next
          </Link>
          {/* <button to="/login" className='bg-colorGray text-colorPrimary py-2 px-4 rounded-lg font-poppins font-normal mt-5'>Next</button> */}
        </div>
        <div className="absolute bottom-2 right-3">
          <p className="text-colorGray font-poppins text-xs">Quick POS V.1</p>
        </div>
      </div>
      <Outlet />
    </>
  );
}

export default Splash;
