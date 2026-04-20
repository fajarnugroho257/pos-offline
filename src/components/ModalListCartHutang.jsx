import React, { useState, useEffect } from "react";
import { getToken } from "../utilities/Auth";
import api from "../utilities/axiosInterceptor";
import { QZTrayProvider, useQZTray } from "./QZTrayContext";
import PrintBluethoot from "../utilities/PrintBluethoot";
import RupiahFormat from "../utilities/RupiahFormat";
import PilihPrintHutang from "../utilities/PilihPrintHutang";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { Link } from "react-router-dom";
import {
  swalError,
  swalLoading,
  swalSuccess,
  swalSuccessAutoClose,
} from "../utilities/Swal";


function ModalListCartHutang({ isOpen, onClose, cartId }) {
  //
  const [notaData, setNotaData] = useState([]);
  const [cartDraft, setCartDraft] = useState([]);
  const [openModal, setOpenModal] = useState(isOpen);
  //
  const detailNota = async () => {
    try {
      swalLoading("Silahkan tunggu...", "Sedang mendapatkan data");
      const token = getToken();
      const response = await api.get(`list-cart-data?cart_id=${cartId}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Sisipkan token di header
        },
      });
      if (response.data.success) {
        swalSuccessAutoClose("Berhasil", "Data berhasil didapatkan", 500);
        setNotaData(response.data.rs_cart);
        setCartDraft(response.data.cart_draft);
      }
      // console.log(response.data.data);
    } catch (error) {
      swalError(
        "Opps..!",
        error?.response?.data?.message || error.message || "Terjadi kesalahan",
      );
    }
  };

  useEffect(() => {
    detailNota();
  }, []);
  let grandTotal = 0;

  const handleClose = () => {
    onClose();
    setOpenModal(!openModal);
  };

  const handlePrintDraft = () => {
    PilihPrintHutang(
      notaData,
      cartDraft
    )
  }
  const formaOnlytDate = (dateString) => {
    const date = dayjs(dateString).locale("id");
    return date.format("DD MMM YYYY");
  };

  if (!openModal) return null;
  return (
    <>
      {notaData.length >= 1 && (
        <div className="fixed inset-0 flex items-center justify-center z-50 font-poppins p-4">
          {/* Overlay */}
          <div className="absolute inset-0 bg-gray-900 opacity-50" onClick={handleClose}></div>
          
          {/* Modal Card */}
          <div className="bg-white w-[95%] md:w-[60%] h-[90%] p-6 rounded-lg shadow-lg relative z-10 flex flex-col">
            
            {/* Header: Tetap di atas */}
            <div className="flex-none">
              <h2 className="text-base md:text-lg font-bold mb-2 text-black">
                Detail Hutang
              </h2>
              <div className="h-[2px] w-full bg-colorPrimary mb-4"></div>
            </div>

            {/* Content: Bagian yang bisa di-scroll */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <p className="mb-2 text-center font-semibold">Pelanggan</p>
              <table className="min-w-full border-collapse border border-gray-200 shadow-sm rounded-lg text-xs md:text-sm">
                <tbody>
                  <tr>
                    <td className="w-[30%] px-3 py-1 border border-gray-200">Nama Pelanggan</td>
                    <td className="w-[5%] px-3 py-1 border border-gray-200">:</td>
                    <td className="w-[65%] px-3 py-1 border border-gray-200 text-right">{cartDraft.draft_pelanggan}</td>
                  </tr>
                  <tr>
                    <td className="w-[30%] px-3 py-1 border border-gray-200">Ttl Belanja</td>
                    <td className="w-[5%] px-3 py-1 border border-gray-200">:</td>
                    <td className="w-[65%] px-3 py-1 border border-gray-200 text-right">{RupiahFormat(cartDraft.draft_uang_tagihan)}</td>
                  </tr>
                  <tr>
                    <td className="w-[30%] px-3 py-1 border border-gray-200">Uang Muka</td>
                    <td className="w-[5%] px-3 py-1 border border-gray-200">:</td>
                    <td className="w-[65%] px-3 py-1 border border-gray-200 text-right">{RupiahFormat(cartDraft.draft_uang_muka)}</td>
                  </tr>
                  <tr className="bg-red-200">
                    <td className="w-[30%] px-3 py-1 border border-gray-200">Kekurangan</td>
                    <td className="w-[5%] px-3 py-1 border border-gray-200">:</td>
                    <td className="w-[65%] px-3 py-1 border border-gray-200 text-right">{RupiahFormat(cartDraft.draft_uang_sisa)}</td>
                  </tr>
                  <tr>
                    <td className="w-[30%] px-3 py-1 border border-gray-200">Catatan</td>
                    <td className="w-[5%] px-3 py-1 border border-gray-200">:</td>
                    <td className="w-[65%] px-3 py-1 border border-gray-200 text-right">{cartDraft.draft_note}</td>
                  </tr>
                </tbody>
              </table>
              <p className="my-4 text-center font-semibold">Pembelian</p>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-200 shadow-sm rounded-lg text-xs md:text-sm">
                  <thead className="sticky top-0 bg-gray-100">
                    <tr className="text-gray-700 uppercase text-xs font-bold text-center">
                      <th className="px-2 py-3 border border-gray-200">No</th>
                      <th className="px-2 py-3 border border-gray-200">Nama Barang</th>
                      <th className="px-2 py-3 border border-gray-200">Harga</th>
                      <th className="px-2 py-3 border border-gray-200">Qty</th>
                      <th className="px-2 py-3 border border-gray-200">SubTotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notaData.map((val, index) => {
                      grandTotal += parseInt(val.cart_subtotal);
                      return (
                        <tr key={index} className={`${val.cart_diskon === "yes" ? "text-red-500" : ""} border border-gray-200 hover:bg-gray-50`}>
                          <td className="px-3 py-2 border border-gray-200 text-center">{index + 1}</td>
                          <td className="px-3 py-2 border border-gray-200">{val.cart_nama}</td>
                          <td className="px-3 py-2 border border-gray-200 text-right">{RupiahFormat(val.cart_harga_jual)}</td>
                          <td className="px-3 py-2 border border-gray-200 text-center">{val.cart_qty}</td>
                          <td className="px-3 py-2 border border-gray-200 text-right">{RupiahFormat(val.cart_subtotal)}</td>
                        </tr>
                      );
                    })}
                    <tr>
                      <td
                        colSpan="4"
                        className="px-3 py-2 border border-gray-200 text-right"
                      >
                        Grand Total
                      </td>
                      <td className="px-3 py-2 border border-gray-200 text-right">
                        {RupiahFormat(grandTotal)}
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
                onClick={handleClose}
              >
                Close
              </button>
              <button
                onClick={() => handlePrintDraft()}
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

export default ModalListCartHutang;
