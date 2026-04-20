import React, { useState, useEffect } from "react";
import { getToken } from "../utilities/Auth";
import { toast } from "react-toastify";
import api from "../utilities/axiosInterceptor";
import RupiahFormat from "../utilities/RupiahFormat";
import { swalConfirm, swalError, swalSuccess } from "../utilities/Swal";
import { Link } from "react-router-dom";

function ModalReturHistory({ isOpen, cartId, setStModalRetur }) {
  //
  const [notaData, setNotaData] = useState([]);
  //
  // const detailNota = async () => {
  //   alert("a");
  //   let params = { cart_id: cartId };
  //   try {
  //     const toastId = toast.loading("Getting data...");
  //     const token = getToken();
  //     const response = await api.post(`detail-nota`, params, {
  //       headers: {
  //         Authorization: `Bearer ${token}`, // Sisipkan token di header
  //       },
  //     });
  //     if (response.data.success) {
  //       toast.update(toastId, {
  //         render: "Berhasil mendapatkan data nota",
  //         type: "success",
  //         isLoading: false,
  //         autoClose: 1000,
  //       });
  //       setNotaData(response.data.data);
  //     }
  //     // console.log(response.data.data);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  // useEffect(() => {
  //   detailNota();
  // }, []);

  //
  let grandTotal = 0;

  const hanldeClose = () => {
    setStModalRetur(false);
  };

  //
  // if (!isOpen) return null;
  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center z-[60]">
        <div className="absolute inset-0 bg-gray-900 opacity-50"></div>
        <div className="bg-white w-[90%] md:w-1/2 h-auto p-6 rounded-lg shadow-lg relative z-10">
          <div className="flex justify-between items-center mb-2 md:mb-3">
            <h2 className="text-lg md:text-xl font-bold text-black font-poppins">
              History Retur Pembelian
            </h2>
          </div>
          <div className="h-[2px] w-full bg-colorPrimary mb-4"></div>
          <div className="w-full overflow-auto">
            <table className="min-w-full border-collapse border border-gray-200 shadow-md rounded-lg text-xs md:text-base font-poppins">
              <thead>
                <tr className="bg-gray-100 text-gray-700 uppercase text-sm font-semibold text-center">
                  <th className="px-1 py-3 border border-gray-200">No</th>
                  <th className="px-1 py-3 border border-gray-200">
                    Nama Barang
                  </th>
                  <th className="px-1 py-3 border border-gray-200">
                    Qty Retur
                  </th>
                  <th className="px-1 py-3 border border-gray-200">
                    Harga Retur
                  </th>
                  <th className="px-1 py-3 border bg-red-300 border-gray-200">
                    Tanggal
                  </th>
                </tr>
              </thead>
              <tbody></tbody>
            </table>
          </div>
          <div className="flex justify-between mt-5">
            <button
              className="px-2 md:px-4 py-1 md:py-2 bg-colorGray border-2 border-colorBlue font-poppins text-black rounded hover:bg-slate-200"
              onClick={hanldeClose}
            >
              Close
            </button>
            <button
              type="submit"
              className="px-2 md:px-4 py-1 md:py-2 bg-colorPrimary font-poppins text-colorGray rounded hover:bg-blue-900"
            >
              <i className="fa fa-undo"></i> Retur
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default ModalReturHistory;
