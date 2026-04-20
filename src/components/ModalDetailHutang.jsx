import React, { useState, useEffect } from "react";
import { getToken } from "../utilities/Auth";
import api from "../utilities/axiosInterceptor";
import { QZTrayProvider, useQZTray } from "./QZTrayContext";
import PrintBluethoot from "../utilities/PrintBluethoot";
import RupiahFormat from "../utilities/RupiahFormat";
import PilihPrint from "../utilities/PilihPrint";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { Link } from "react-router-dom";
import {
  swalError,
  swalLoading,
  swalSuccess,
  swalSuccessAutoClose,
} from "../utilities/Swal";

function ModalDetailHutang({ isOpen, onClose, cartId, loadData }) {
  //
  const [notaData, setNotaData] = useState([]);
  const [cartDraft, setCartDraft] = useState([]);
  const [rows, setRows] = useState([]);
  const [tagihan, setTagihan] = useState(0);
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
        setRows(response.data.cart_draft.tagihan_cicilan);
        setTagihan(parseInt(response.data.cart_draft.draft_uang_sisa));
      }
      // console.log(response.data.data);
    } catch (error) {
      swalError(
        "Opps..!",
        error?.response?.data?.message || error.message || "Terjadi kesalahan",
      );
    }
  };

  const formatDate = (dateString) => {
    return dayjs(dateString).locale("id").format("DD MMM YYYY");
  };

  useEffect(() => {
    detailNota();
  }, []);
  //
  let grandTotal = 0;

  // Tambah baris baru
  const handleAddRow = () => {
    setRows([...rows, { cicilan_date: "", cicilan: "" }]);
  };

  const handleDeleteRow = (index) => {
    const newRows = rows.filter((_, i) => i !== index);
    setRows(newRows);
  };

  // Handle perubahan input
  const handleChange = (index, field, value) => {
    const newRows = [...rows];
    newRows[index][field] = value;
    setRows(newRows);
  };

  const totalCicilan = rows.reduce(
    (sum, row) => sum + (parseFloat(row.cicilan) || 0),
    0,
  );

  const sisaTagihan = totalCicilan - tagihan;

  const handleSimpan = async (event) => {
    event.preventDefault();

    const totalCicilan = rows.reduce(
      (sum, row) => sum + (parseFloat(row.uang) || 0),
      0,
    );
    const payload = {
      detail_cicilan: rows,
      cart_draft_id: cartDraft.id,
    };
    try {
      swalLoading("Silahkan tunggu...", "Sedang memproses data");
      const token = getToken();
      const response = await api.post(`store-cicilan`, payload, {
        headers: {
          Authorization: `Bearer ${token}`, // Sisipkan token di header
        },
      });
      if (response.data.success) {
        detailNota();
      } else {
        swalError("Opps..!", response.data.message || "Terjadi kesalahan");
      }
    } catch (error) {
      swalError(
        "Opps..!",
        error?.response?.data?.message || error.message || "Terjadi kesalahan",
      );
    }
  };

  const handleLunas = async () => {
    try {
      swalLoading("Silahkan tunggu...", "Sedang mendapatkan data");
      const token = getToken();
      const response = await api.get(`ubah-lunas?cart_id=${cartId}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Sisipkan token di header
        },
      });
      if (response.data.success) {
        swalSuccess("Sukses", response.data.message);
        // tutup
        onClose();
        loadData();
        // swalSuccessAutoClose("Berhasil", response.data.message, 1000);
      } else {
        swalError("Opps..!", response.data.message);
      }
      // console.log(response.data.data);
    } catch (error) {
      swalError(
        "Opps..!",
        error?.response?.data?.message || error.message || "Terjadi kesalahan",
      );
    }
  };
  //
  if (!isOpen) return null;
  return (
    <>
      {notaData.length >= 1 && (
        <div className="fixed inset-0 flex items-center justify-center z-50 font-poppins p-4">
          <div className="absolute inset-0 bg-gray-900 opacity-50" onClick={onclose}></div>

          {/* Modal Card */}
          <div className="bg-white w-[95%] md:w-[80%] h-[90%] p-6 rounded-lg shadow-lg relative z-10 flex flex-col">
            
            {/* Header: Tetap di atas */}
            <div className="flex-none">
              <h2 className="text-base md:text-lg font-bold mb-2 text-black">
                Detail Hutang / Cicilan
              </h2>
              <div className="h-[2px] w-full bg-colorPrimary mb-4"></div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <div className="md:grid md:grid-cols-2 gap-4">
                <table className="min-w-full border-collapse border border-gray-200 shadow-sm rounded-lg text-xs md:text-sm">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 uppercase text-sm font-semibold text-center">
                      <th className="w-5 px-1 py-3 border border-gray-200">
                        No
                      </th>
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
                            {val.cart_nama}{" "}
                            {val.cart_diskon === "yes" ? "(Grosir)" : ""}
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
                  </tbody>
                </table>
                <form action="" onSubmit={handleSimpan}>
                    <table className="min-w-full border-collapse border border-gray-200 shadow-md rounded-lg text-xs md:text-base">
                      <thead>
                        <tr className="bg-gray-100 text-gray-700 uppercase text-sm font-semibold text-center">
                          <th className="w-5 px-1 py-3 border border-gray-200">
                            No
                          </th>
                          <th className="px-1 py-3 border border-gray-200">
                            Tanggal
                          </th>
                          <th className="px-1 py-3 border border-gray-200">
                            Uang Pembayaran
                          </th>
                          <th className="px-1 py-3 border border-gray-200"></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          key="uangMuka"
                          className={`border border-gray-200 hover:bg-gray-50`}
                        >
                          <td className="px-6 py-3 border border-gray-200 text-center">
                            1
                          </td>
                          <td className="px-6 py-3 border border-gray-200 text-center">
                            {formatDate(cartDraft.created_at)}
                          </td>
                          <td className="px-6 py-3 border border-gray-200 text-right">
                            {cartDraft.draft_uang_muka === ""
                              ? "Tidak ada uang muka"
                              : RupiahFormat(cartDraft.draft_uang_muka)}
                          </td>
                          <td className="px-3 border border-gray-200 text-center">
                            <i className="fa fa-times text-gray-500"></i>
                          </td>
                        </tr>
                        {rows.map((row, index) => (
                          <tr key={index}>
                            <td className="px-6 py-3 border border-gray-200 text-center">
                              {index + 2}
                            </td>
                            <td className="px-6 py-3 border border-gray-200 text-center">
                              <input
                                type="date"
                                className="border py-1 px-2 w-28 md:w-44"
                                value={row.cicilan_date}
                                onChange={(e) =>
                                  handleChange(
                                    index,
                                    "cicilan_date",
                                    e.target.value,
                                  )
                                }
                                required
                              />
                            </td>
                            <td className="px-6 py-3 border border-gray-200 text-right">
                              <input
                                type="text"
                                className="border py-1 px-2 w-24 text-right"
                                value={row.cicilan}
                                onChange={(e) =>
                                  handleChange(index, "cicilan", e.target.value)
                                }
                                required
                              />
                            </td>
                            <td className="px-3 border border-gray-200 text-center">
                              <Link
                                onClick={() => handleDeleteRow(index)}
                                className="fa fa-times text-red-500"
                              ></Link>
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-red-200">
                          <td
                            colSpan="2"
                            className="px-6 py-3 border border-gray-200 text-right"
                          >
                            Kekurangan
                          </td>
                          <td className="px-6 py-3 border border-gray-200 text-right">
                            Rp {sisaTagihan.toLocaleString("id-ID")}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <div className="justify-between mt-3 gap-1 flex">
                      <Link
                        className="bg-red-600 w-20  h-8 text-white text-sm flex gap-1 items-center justify-center"
                        title="Lunasi Transaksi"
                        onClick={() => handleLunas()}
                      >
                        <i className="fa fa-check"></i> Lunas
                      </Link>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="bg-blue-600 w-8 h-8 text-white"
                          title="Simpan Cicilan"
                        >
                          <i className="fa fa-save"></i>
                        </button>
                        <button
                          className="bg-colorPrimary w-8 h-8 text-white"
                          title="Tambah Cicilan"
                          onClick={() => handleAddRow()}
                        >
                          <i className="fa fa-plus"></i>
                        </button>
                      </div>
                    </div>
                </form>
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
                // onClick={() => handlePrintDraft()}
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

export default ModalDetailHutang;
