import React, { useState, useEffect } from "react";
import { getToken } from "../utilities/Auth";
import { toast } from "react-toastify";
import api from "../utilities/axiosInterceptor";
import RupiahFormat from "../utilities/RupiahFormat";
import { swalConfirm, swalError, swalSuccess } from "../utilities/Swal";
import { Link } from "react-router-dom";
import ModalReturHistory from "./ModalReturHistory";

function ModalRetur({ isOpen, cartId, stateTable, setStModalRetur }) {
  //
  const [notaData, setNotaData] = useState([]);
  const [trans, setTrans] = useState([]);
  const [ubahData, setUbahData] = useState(false);
  const [stHistory, setStHistory] = useState(false);
  const [dataHistory, setDataHistory] = useState([]);
  const [modalHistory, setModalHistory] = useState(false);
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
        setStHistory(response.data.retur_data.status);
        setDataHistory(response.data.retur_data.rs_retur);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    detailNota();
  }, []);

  const handleInputChange = (index, event) => {
    const values = [...notaData];
    const hargaJual = values[index]["cart_harga_jual"];
    const cartQty = values[index]["cart_qty"];
    const inputValue = parseFloat(event.target.value);
    if (inputValue > cartQty) {
      swalError("Opps.!!", "tidak boleh melebihi Qty");
      values[index]["qty_retur"] = 0;
      values[index]["qty_retur_uang"] = 0;
      setNotaData(values);
    } else {
      let tambahan = 0;
      if (values[index]["cart_diskon"] === "yes") {
        const minGorsirPembelian =
          values[index]["barang_cabang"]["barang_master"][
            "barang_grosir_pembelian"
          ];
        const hargaNormal =
          values[index]["barang_cabang"]["barang_master"]["barang_harga_jual"];
        const hargaGrosir =
          values[index]["barang_cabang"]["barang_master"][
            "barang_grosir_harga_jual"
          ];
        const qtySisaRetur = cartQty - inputValue;
        if (qtySisaRetur < minGorsirPembelian) {
          // tambahkan selisih harga normal
          tambahan = qtySisaRetur * (hargaNormal - hargaGrosir);
          values[index]["keterangan"] = "Harga normal + ";
          values[index]["res_cart_diskon"] = "no";
          values[index]["tambahan"] = "-" + tambahan;
        } else {
          // tetap
          values[index]["keterangan"] = "";
          values[index]["res_cart_diskon"] = "yes";
          values[index]["tambahan"] = 0;
        }
        // cek ke beckend
      }
      values[index]["qty_retur_uang"] =
        inputValue * parseInt(hargaJual) - tambahan;
      values[index]["qty_retur"] = event.target.value;
      setNotaData(values);
    }
  };
  //
  let grandTotal = 0;
  let grandRetur = 0;
  //
  const handleRetur = async (event) => {
    event.preventDefault();
    const result = await swalConfirm(
      "Apakah anda yakin ? ",
      "Cek kembali barang yang akan diretur",
    );
    if (result.isConfirmed) {
      try {
        const token = getToken();
        const response = await api.post(`store-retur`, notaData, {
          headers: {
            Authorization: `Bearer ${token}`, // Sisipkan token di header
          },
        });
        if (response.data.success) {
          swalSuccess("Sukses", "Barang berhasil diretur");
          setUbahData(true);
          detailNota();
        } else {
          swalError("Opps..!", response.data.message);
        }
        // console.log(notaData);
      } catch (error) {}
    }
  };

  const totalRetur = notaData.reduce(
    (sum, row) => sum + (parseFloat(row.qty_retur_uang) || 0),
    0,
  );
  const totalQtyRetur = notaData.reduce(
    (sum, row) => sum + (parseFloat(row.qty_retur) || 0),
    0,
  );

  const hanldeClose = () => {
    setStModalRetur(false);
    setModalHistory(false);
    if (ubahData) {
      stateTable();
    }
  };

  const handleHistory = async () => {
    setModalHistory(!modalHistory);
  };

  const handleDeleteRetur = async (returId) => {
    const result = await swalConfirm(
      "Yakin ?",
      "Apakah Anda yakin ingin menghapus data ini?",
    );
    if (result.isConfirmed) {
      try {
        const token = getToken();
        const params = { retur_id: returId };
        const response = await api.post(`delete-retur`, params, {
          headers: {
            Authorization: `Bearer ${token}`, // Sisipkan token di header
          },
        });
        if (response.data.success) {
          swalSuccess("Sukses", response.data.message);
          setUbahData(true);
          detailNota();
          if (response.data.ttl <= 0) {
            setModalHistory(false);
          }
        } else {
          swalError("Opps..!", response.data.message);
        }
        // console.log(notaData);
      } catch (error) {}
    }
  };
  //
  if (!isOpen) return null;
  return (
    <>
      {notaData.length >= 1 && (
        <div className="fixed inset-0 flex items-center justify-center z-50 gap-4">
          <div className="absolute inset-0 bg-gray-900 opacity-50"></div>
          <div
            className={`bg-white w-[90%] ${modalHistory ? "" : "md:w-1/2"} h-auto p-6 rounded-lg shadow-lg relative z-10`}
          >
            <div
              className={` ${modalHistory ? "flex overflow-x-auto gap-4" : ""}`}
            >
              <div className={` ${modalHistory ? "md:w-[60%]" : ""}`}>
                <div className="flex justify-between items-center mb-2 md:mb-3">
                  <h2 className="text-lg md:text-xl font-bold text-black font-poppins">
                    Retur Pembelian
                  </h2>
                  {stHistory && (
                    <Link
                      onClick={handleHistory}
                      className="bg-colorPrimary text-white p-2 font-poppins hover:bg-colorPrimaryHover text-sm rounded-sm"
                    >
                      <i className="fa fa-history"></i> History
                    </Link>
                  )}
                </div>
                <div className="h-[2px] w-full bg-colorPrimary mb-4"></div>
                <form action="" onSubmit={handleRetur}>
                  <div className="w-full overflow-auto">
                    <table className="min-w-full border-collapse border border-gray-200 shadow-md rounded-lg text-xs md:text-base font-poppins">
                      <thead>
                        <tr className="bg-gray-100 text-gray-700 uppercase text-sm font-semibold text-center">
                          <th className="px-1 py-3 border border-gray-200">
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
                          <th className="px-1 py-3 border bg-red-300 border-gray-200">
                            Retur
                          </th>
                          <th className="px-1 py-3 border bg-red-300 border-gray-200">
                            Uang Kembali
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
                                <br />
                                <small className="text-black">
                                  {val.keterangan ?? ""}
                                </small>
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
                              <td className="py-3 border border-gray-200 text-right bg-red-300 text-black">
                                <input
                                  type="text"
                                  name="cart_qty"
                                  placeholder="0"
                                  value={val.qty_retur}
                                  onChange={(event) => {
                                    const value = event.target.value;
                                    // Hanya angka dan satu titik
                                    if (/^\d*\.?\d*$/.test(value)) {
                                      handleInputChange(index, event);
                                    }
                                  }}
                                  className="input-qty"
                                />
                              </td>
                              <td className="px-6 py-3 border border-gray-200 text-right bg-red-300 text-black">
                                {RupiahFormat(val.qty_retur_uang ?? 0)} <br />
                                {val.tambahan === 0 ? "" : val.tambahan}
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
                          <td className="px-6 py-3 border border-gray-200 text-center bg-red-300">
                            {totalQtyRetur}
                          </td>
                          <td className="px-6 py-3 border border-gray-200 text-right bg-red-300">
                            {RupiahFormat(totalRetur)}
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
                          <td className="px-6 py-3 border border-gray-200 text-right bg-gray-200"></td>
                          <td className="px-6 py-3 border border-gray-200 text-right bg-gray-200"></td>
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
                          <td className="px-6 py-3 border border-gray-200 text-right bg-gray-200"></td>
                          <td className="px-6 py-3 border border-gray-200 text-right bg-gray-200"></td>
                        </tr>
                      </tbody>
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
                </form>
              </div>
              {/* dua */}
              {dataHistory && modalHistory && (
                <div className="md:w-[40%]">
                  <div className="flex justify-between items-center mb-2 md:mb-3">
                    <h2 className="text-lg md:text-xl font-bold text-black font-poppins">
                      History Retur Pembelian
                    </h2>
                    <Link
                      onClick={handleHistory}
                      className="bg-red-600 text-white p-2 font-poppins hover:bg-red-500 text-sm rounded-sm"
                    >
                      <i className="fa fa-times"></i> Tutup
                    </Link>
                  </div>
                  <div className="h-[2px] w-full bg-colorPrimary mb-4"></div>
                  <div className="w-full overflow-auto">
                    <table className="min-w-full border-collapse border border-gray-200 shadow-md rounded-lg text-xs md:text-base font-poppins">
                      <thead>
                        <tr className="bg-gray-100 text-gray-700 uppercase text-sm font-semibold text-center">
                          <th className="px-1 py-3 border border-gray-200">
                            No
                          </th>
                          <th className="px-1 py-3 border border-gray-200">
                            Nama Barang
                          </th>
                          <th className="px-1 py-3 border border-gray-200">
                            Jumlah
                          </th>
                          <th className="px-1 py-3 border border-gray-200">
                            SubTotal
                          </th>
                          <th className="px-1 py-3 border border-gray-200">
                            Hapus
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {dataHistory &&
                          dataHistory.map((val, index) => {
                            grandRetur += parseInt(val.retur_harga);
                            return (
                              <tr
                                key={index}
                                className={` ${val.cart_diskon === "yes" ? "text-red-500" : ""} border border-gray-200 hover:bg-gray-50`}
                              >
                                <td className="px-6 py-3 border border-gray-200 text-center">
                                  {index + 1}
                                </td>
                                <td className="px-6 py-3 border border-gray-200">
                                  {val.barang_cabang.barang_master.barang_nama}
                                </td>
                                <td className="px-6 py-3 border border-gray-200 text-right">
                                  {val.retur_qty}
                                </td>
                                <td className="px-6 py-3 border border-gray-200 text-right">
                                  {RupiahFormat(val.retur_harga)}
                                </td>
                                <td className="px-6 py-3 border border-gray-200 text-right">
                                  <Link
                                    onClick={() => handleDeleteRetur(val.id)}
                                    className="bg-red-600 p-1 md:p-2 rounded-sm"
                                  >
                                    <i className="fa fa-trash text-white"></i>
                                  </Link>
                                </td>
                              </tr>
                            );
                          })}
                        <tr>
                          <td
                            colSpan="3"
                            className="px-6 py-3 border border-gray-200 text-right"
                          >
                            Grand Total
                          </td>
                          <td className="px-6 py-3 border border-gray-200 text-right">
                            {RupiahFormat(grandRetur)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ModalRetur;
