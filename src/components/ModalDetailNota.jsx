import React, { useState, useEffect } from "react";
import { getToken } from "../utilities/Auth";
import { toast } from "react-toastify";
import api from "../utilities/axiosInterceptor";
import { QZTrayProvider, useQZTray } from "./QZTrayContext";
import PrintBluethoot from "../utilities/PrintBluethoot";
import RupiahFormat from "../utilities/RupiahFormat";
import PilihPrint from "../utilities/PilihPrint";

function ModalDetailNota({ isOpen, onClose, cartId }) {
  //
  const [notaData, setNotaData] = useState([]);
  const [trans, setTrans] = useState([]);
  //
  const detailNota = async () => {
    let params = { cart_id: cartId };
    try {
      const toastId = toast.loading("Getting data...");
      const token = getToken();
      const response = await api.post(`detail-nota`, params, {
        headers: {
          Authorization: `Bearer ${token}`, // Sisipkan token di header
        },
      });
      if (response.data.success) {
        toast.update(toastId, {
          render: "Berhasil mendapatkan data nota",
          type: "success",
          isLoading: false,
          autoClose: 1000,
        });
        setNotaData(response.data.data);
        setTrans(response.data.transaksiCart);
      }
        // console.log(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    detailNota();
  }, []);
  //
  let grandTotal = 0;
  const handlePrint = () => {
    PilihPrint(
      notaData,
      trans.trans_total,
      trans.trans_bayar,
      trans.trans_kembalian,
      trans.trans_pelanggan
    );
  };
  //
  if (!isOpen) return null;
  return (
    <>
    {notaData.length >= 1 && (
        <div className="fixed inset-0 flex items-center justify-center z-50 font-poppins p-4">
          {/* Overlay */}
          <div className="absolute inset-0 bg-gray-900 opacity-50" onClick={onClose}></div>
          
          {/* Modal Card */}
          <div className="bg-white w-[95%] md:w-[60%] h-[90%] p-6 rounded-lg shadow-lg relative z-10 flex flex-col">
            
            {/* Header: Tetap di atas */}
            <div className="flex-none">
              <h2 className="text-base md:text-lg font-bold mb-2 text-black">
                Detail Nota Pembelian
              </h2>
              <div className="h-[2px] w-full bg-colorPrimary mb-4"></div>
            </div>

            {/* Content: Bagian yang bisa di-scroll */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-200 shadow-sm rounded-lg text-xs md:text-sm">
                  <thead className="sticky top-0 bg-gray-100">
                    <tr className="bg-gray-100 text-gray-700 uppercase text-sm font-semibold text-center">
                      <th className="px-1 py-3 border border-gray-200">No</th>
                      <th className="px-1 py-3 border border-gray-200">
                        Nama Barang
                      </th>
                      <th className="px-1 py-3 border border-gray-200">
                        Harga
                      </th>
                      <th className="px-1 py-3 border border-gray-200">
                        Jumlah
                      </th>
                      <th className="px-1 py-3 border border-gray-200">
                        SubTotal
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {notaData.map((val, index) => {
                      grandTotal += parseInt(val.cart_subtotal);
                      return (
                        <tr
                          key={index}
                          className={` ${val.cart_diskon === "yes" ? "text-red-500" : ""} border border-gray-200 hover:bg-gray-50`}
                        >
                          <td className="px-6 py-3 border border-gray-200 text-center">
                            {index + 1}
                          </td>
                          <td className="px-6 py-3 border border-gray-200">
                            {val.cart_nama} {val.cart_diskon === 'yes' ? "(Grosir)" : ""}
                          </td>
                          <td className="px-6 py-3 border border-gray-200 text-center">
                            {RupiahFormat(val.cart_harga_jual)}
                          </td>
                          <td className="px-6 py-3 border border-gray-200 text-right">
                            {val.cart_qty}
                          </td>
                          <td className="px-6 py-3 border border-gray-200 text-right">
                            {RupiahFormat(val.cart_subtotal)}
                          </td>
                        </tr>
                      );
                    })}
                    <tr>
                      <td
                        colSpan="4"
                        className="px-6 py-3 border border-gray-200 text-right"
                      >
                        Grand Total
                      </td>
                      <td className="px-6 py-3 border border-gray-200 text-right">
                        {RupiahFormat(grandTotal)}
                      </td>
                    </tr>
                    <tr>
                      <td
                        colSpan="4"
                        className="px-6 py-3 border border-gray-200 text-right"
                      >
                        Cash
                      </td>
                      <td className="px-6 py-3 border border-gray-200 text-right">
                        {RupiahFormat(trans.trans_bayar)}
                      </td>
                    </tr>
                    <tr>
                      <td
                        colSpan="4"
                        className="px-6 py-3 border border-gray-200 text-right"
                      >
                        Kembalian
                      </td>
                      <td className="px-6 py-3 border border-gray-200 text-right">
                        {RupiahFormat(trans.trans_kembalian)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer: Tetap di bawah */}
            <div className="flex-none flex justify-between mt-5 pt-4 border-t">
              <button
                className="px-4 py-2 bg-gray-200 border border-gray-300 font-bold text-black rounded hover:bg-gray-300 transition-colors"
                onClick={onClose}
              >
                Close
              </button>
              <button
                onClick={() => handlePrint()}
                type="submit"
                className="px-2 md:px-4 py-1 md:py-2 bg-colorPrimary font-poppins text-colorGray rounded hover:bg-blue-900"
              >
                <i className="fa fa-print"></i> Cetak
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ModalDetailNota;
