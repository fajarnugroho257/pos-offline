import { toast } from "react-toastify";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Setting = () => {
  //
  const nowPrintSelected = localStorage.getItem("printSelected");
  const [selected, setSelected] = useState(nowPrintSelected);
  const handleSelected = (val) => {
    if (val === "kabel") {
      window.location.reload();
      setSelected(val);
      localStorage.setItem("printSelected", val);
    } else if (val === "bluethoot") {
      selectPrinter(val);
    }

    // console.log("Perangkat ditemukan ya:", device.name);
  };

  // bluetooth.js
  async function selectPrinter(val) {
    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: ["000018f0-0000-1000-8000-00805f9b34fb"],
    });

    localStorage.setItem("printerDeviceId", device.id);
    localStorage.setItem("printerName", device.name);
    setSelected(val);
    localStorage.setItem("printSelected", val);
    //
  }

  return (
    <div className="">
      <div className="h-full overflow-auto px-4 py-12 md:py-14 md:px-10">
        <div className="flex justify-end">
          <div className="flex justify-end mb-3">
            <Link
              to={"/dashboard"}
              className="font-poppins rounded-sm bg-colorPrimary text-white px-2 py-1 text-xs md:text-sm"
            >
              <i className="fa fa-arrow-left"></i> Home
            </Link>
          </div>
        </div>
        <table className="w-full md:w-1/2 md:mx-auto border-collapse border border-gray-200 shadow-md rounded-lg text-xs md:text-base font-poppins">
          <thead>
            <tr className="bg-gray-100 text-gray-700 uppercase text-sm font-semibold text-center">
              <th className="px-1 py-3 border border-gray-200">No</th>
              <th className="px-1 py-3 border border-gray-200">Nama</th>
              <th className="px-1 py-3 border border-gray-200">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr key="11" className="border border-gray-200 hover:bg-gray-50">
              <td className="px-6 py-3 border border-gray-200 text-center">
                1
              </td>
              <td className="px-6 py-3 border border-gray-200 text-center">
                Printer
              </td>
              <td className="px-6 py-3 border border-gray-200 text-center">
                <div className="flex gap-2 items-center">
                  <input
                    checked={selected === "bluethoot"}
                    onChange={() => handleSelected("bluethoot")}
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  Bluetooth
                </div>
                <div className="flex gap-2 items-center">
                  <input
                    checked={selected === "kabel"}
                    onChange={() => handleSelected("kabel")}
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  Kabel
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Setting;
