import React, { useEffect, useState } from "react";
import { getToken } from "../utilities/Auth";
import Booking from "./Booking";
import { swalConfirm, swalError, swalSuccess } from "../utilities/Swal";
import PilihPrintDraft from "../utilities/PilihPrintDraft";
import {
  listPembayaran,
  listPembayaranUploadSt,
  updatePartialByCartId,
} from "../services/db";
import RupiahFormat from "../utilities/RupiahFormat";
import api from "../utilities/axiosInterceptor";
import isOnline from "../utilities/isOnline";
import dayjs from "dayjs";

function ModalShowOffline({ isOpen, closeModal, reloadTable }) {
  const [dataOffline, setDataOffline] = useState([]);
  //
  const getDataOffline = async () => {
    const alltransaksiOffline = await listPembayaran("yes");
    console.log(alltransaksiOffline);
    setDataOffline(alltransaksiOffline);
  };

  // Update total bayar dari backend
  useEffect(() => {
    getDataOffline();
  }, []);

  const formatDate = (dateString) => {
    return dayjs(dateString).locale("id").format("DD MMM YYYY [jam] HH:mm:ss");
  };

  //
  const handleSyncOffline = async () => {
    if (!isOnline) {
      return swalError("Opps..!", "Fitur hanya tersedia saat Online");
    }
    const result = await swalConfirm(
      "Yakin ?",
      "Apakah Anda yakin ingin sinkronisasi data penjualan..?",
    );
    if (result.isConfirmed) {
      try {
        const alltransaksiOffline = await listPembayaran("yes");
        // console.log(alltransaksiOffline);
        const token = getToken();
        const response = await api.post(
          `store-transaksi-offline`,
          alltransaksiOffline,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const listCart = response.data.list_cart;
        const dataSukses = response.data.data_sukses;
        for (const val of listCart) {
          console.log(val);
          const params = {
            upload_st: "yes",
          };
          await updatePartialByCartId(val, params);
        }
        swalSuccess("Sukses", response.data.message);
        dataSukses;
        await getDataOffline();
        await reloadTable();
      } catch (error) {
        swalError(
          "Opps..!",
          error?.response?.data?.message ||
            error.message ||
            "Terjadi kesalahan",
        );
      }
    }
  };

  if (!isOpen) return null;
  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center z-50 font-poppins p-4">
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-gray-900 opacity-50"
          onClick={closeModal}
        ></div>

        {/* Modal Card */}
        <div className="bg-white w-[95%] md:w-[60%] h-[90%] p-6 rounded-lg shadow-lg relative z-10 flex flex-col">
          {/* Header: Tetap di atas */}
          <div className="flex-none">
            <h2 className="text-base md:text-lg font-bold mb-2 text-black">
              Daftar transaksi offline
            </h2>
            <div className="h-[2px] w-full bg-colorPrimary mb-4"></div>
          </div>

          {/* Content: Bagian yang bisa di-scroll */}
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-200 shadow-sm rounded-lg text-xs md:text-sm">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 uppercase text-xs md:text-sm font-semibold text-center">
                    <th className="px-2 py-1 md:py-3 border border-gray-200">
                      No
                    </th>
                    <th className="px-2 py-1 md:py-3 border border-gray-200">
                      ID Keranjang
                    </th>
                    <th className="px-2 py-1 md:py-3 border border-gray-200">
                      Date Time
                    </th>
                    <th className="px-2 py-1 md:py-3 border border-gray-200">
                      Pelanggan
                    </th>
                    <th className="px-2 py-1 md:py-3 border border-gray-200 bg-green-200">
                      Ttl Belanja
                    </th>
                    <th className="px-2 py-1 md:py-3 border border-gray-200">
                      Cash
                    </th>
                    <th className="px-2 py-1 md:py-3 border border-gray-200">
                      Kembalian
                    </th>
                    <th className="px-2 py-1 md:py-3 border border-gray-200">
                      upload
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dataOffline.map((val, index) => {
                    return (
                      <tr
                        key={index}
                        className="border border-gray-200 hover:bg-gray-50 text-xs md:text-sm"
                      >
                        <td className="px-2 py-1 md:py-3 border border-gray-200 text-center">
                          {index + 1}
                        </td>
                        <td className="px-2 py-1 md:py-3 border border-gray-200 text-center">
                          {val.cart_id}
                        </td>
                        <td className="px-2 py-1 md:py-3 border border-gray-200 text-center">
                          {formatDate(val.trans_date)}
                        </td>
                        <td className="px-2 py-1 md:py-3 border border-gray-200 text-center">
                          {val.trans_pelanggan}
                        </td>
                        <td className="px-2 py-1 md:py-3 border border-gray-200 text-right bg-green-200">
                          {RupiahFormat(val.trans_total)}
                        </td>
                        <td className="px-2 py-1 md:py-3 border border-gray-200 text-right">
                          {RupiahFormat(val.trans_bayar)}
                        </td>
                        <td className="px-2 py-1 md:py-3 border border-gray-200 text-right">
                          {RupiahFormat(val.trans_kembalian)}
                        </td>
                        <td className="px-2 py-1 md:py-3 border border-gray-200 text-center">
                          <span
                            className={`text-white p-2 ${val.upload_st === "no" ? "bg-red-500" : "bg-green-500"}`}
                          >
                            {val.upload_st === "no" ? "NO" : "YES"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer: Tetap di bawah */}
          <div className="flex-none flex justify-between mt-5 pt-4 border-t">
            <button
              className="px-4 py-2 bg-gray-200 border border-gray-300 font-bold text-black rounded hover:bg-gray-300 transition-colors"
              onClick={() => closeModal()}
            >
              Close
            </button>
            <button
              onClick={() => handleSyncOffline()}
              type="submit"
              className="px-2 md:px-4 py-1 md:py-2 bg-red-500 font-poppins text-colorGray rounded hover:bg-red-400"
            >
              <i className="fa fa-upload"></i> Upload Ke Server
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default ModalShowOffline;
