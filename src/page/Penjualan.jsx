import React, { useEffect, useState } from "react";
import api from "../utilities/axiosInterceptor";
import { getToken } from "../utilities/Auth";
import RupiahFormat from "../utilities/RupiahFormat";
import dayjs from "dayjs";
import "dayjs/locale/id";
import ModalDetailNota from "../components/ModalDetailNota";
import { ToastContainer } from "react-toastify";
import { Link } from "react-router-dom";
import {
  swalConfirm,
  swalError,
  swalLoading,
  swalSuccess,
  swalSuccessAutoClose,
} from "../utilities/Swal";
import ModalRetur from "../components/ModalRetur";
import ModalDelete from "../components/ModalDelete";
import isOnline from "../utilities/isOnline";
import {
  deleteDataTransactionOffline,
  findCartById,
  listPembayaran,
  updatePartialByCartId,
} from "../services/db";
import ModalShowOffline from "../components/ModalShowOffline";

const Penjualan = () => {
  // state
  const [dataTransaksi, setDataTransaksi] = useState([]);
  const [dataTransaksiOffline, setDataTransaksiOffline] = useState([]);
  const [tab, setTab] = useState("penjualan");
  const [tanggal, setTanggal] = useState({
    start: "",
    end: "",
  });
  // get data
  const getDataTransaksi = async (start, end) => {
    swalLoading("Silahkan tunggu...", "Sedang mendapatkan data");
    if (isOnline) {
      try {
        const params = { start: start, end: end };
        const token = getToken();
        const response = await api.post(
          `list-transaksi-data-barang-cabang`,
          params,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        setDataTransaksi(response.data.data || []);
        swalSuccessAutoClose("Berhasil", "Data berhasil didapatkan", 500);
      } catch (error) {
        swalError(
          "Opps..!",
          error?.response?.data?.message ||
            error.message ||
            "Terjadi kesalahan",
        );
      }
    } else {
      //
      const datas = await listPembayaran("yes");
      // console.log(datas);
      setDataTransaksiOffline(datas || []);
      swalSuccessAutoClose("Berhasil", "Data berhasil didapatkan", 500);
    }
  };
  const handleDeleteOffline = async () => {
    const result = await swalConfirm(
      "Yakin ?",
      "Apakah Anda yakin ingin menghapus semua data penjualan..?",
    );
    if (result.isConfirmed) {
      const deleteOffline = await deleteDataTransactionOffline("yes");
      if (deleteOffline.success) {
        swalSuccess(
          "Suksess",
          deleteOffline.message + " " + deleteOffline.deleted,
        );
        await reloadGetDataTransaksi();
      } else {
        swalError("Opps..!", deleteOffline.message);
      }
    }
  };

  const [modalOffline, stModalOffline] = useState(false);
  const handleShowModalOffline = () => {
    stModalOffline(!modalOffline);
  };

  const reloadGetDataTransaksi = () => {
    const savedTanggal = localStorage.getItem("filterTanggal");
    // const today = new Date().toISOString().split("T")[0];
    let tanggalFix;
    if (savedTanggal) {
      // const parsed = JSON.parse(savedTanggal);
      // // Kalau end bukan hari ini → reset ke default
      // if (!isSameDate(parsed.end, today)) {
      //   tanggalFix = getDefaultTanggal();
      //   localStorage.setItem("filterTanggal", JSON.stringify(tanggalFix));
      // } else {
      //   tanggalFix = parsed;
      // }
      //
      tanggalFix = JSON.parse(savedTanggal);
    } else {
      tanggalFix = getDefaultTanggal();
      localStorage.setItem("filterTanggal", JSON.stringify(tanggalFix));
    }

    setTanggal(tanggalFix);
    getDataTransaksi(tanggalFix.start, tanggalFix.end);
  };

  useEffect(() => {
    reloadGetDataTransaksi();
  }, []);

  const formatDate = (dateString) => {
    return dayjs(dateString).locale("id").format("DD MMM YYYY [jam] HH:mm:ss");
  };

  // modal nota
  const [stModal, setStModal] = useState(false);
  const [stModalRetur, setStModalRetur] = useState(false);
  const [stModalDelete, setStModalDelete] = useState(false);
  const [cartId, setCartId] = useState(null);
  const handleNota = (cart_id) => {
    setStModal(!stModal);
    setCartId(cart_id);
  };

  const handleRetur = (cart_id) => {
    if (!isOnline) {
      return swalError(
        "Opps..!",
        "Fitur hanya tersedia jika data sudah di upload",
      );
    }
    setStModalRetur(!stModalRetur);
    setCartId(cart_id);
  };

  const handleDelete = (cart_id) => {
    setStModalDelete(!stModalDelete);
    setCartId(cart_id);
  };

  const handleTab = (tabStatus) => {
    setTab(tabStatus);
  };

  const handleCari = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const start = formData.get("start");
    const end = formData.get("end");
    const dataTanggal = { start, end };
    // simpan ke state
    setTanggal(dataTanggal);
    // simpan ke localStorage
    localStorage.setItem("filterTanggal", JSON.stringify(dataTanggal));
    reloadGetDataTransaksi();
  };

  const formatDateLocal = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const getDefaultTanggal = () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return {
      start: formatDateLocal(firstDay),
      end: formatDateLocal(lastDay),
    };
  };

  const handleReset = () => {
    let tanggalFix = getDefaultTanggal();
    localStorage.setItem("filterTanggal", JSON.stringify(tanggalFix));
    setTanggal({ start: tanggalFix.start, end: tanggalFix.end });
    reloadGetDataTransaksi();
  };

  let ttlBelanja = 0;
  let ttlCash = 0;
  let ttlKembalian = 0;

  const handleUploadById = async (cart_id) => {
    try {
      const detail = await findCartById(cart_id);
      // console.log(alltransaksiOffline);
      const token = getToken();
      const response = await api.post(`store-transaksi-offline-byId`, detail, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const listCart = response.data.list_cart;
      const dataSukses = response.data.data_sukses;
      for (const val of listCart) {
        const params = {
          upload_st: "yes",
        };
        await updatePartialByCartId(val, params);
      }
      swalSuccess("Sukses", response.data.message);
      dataSukses;
      await reloadGetDataTransaksi();
    } catch (error) {
      swalError(
        "Opps..!",
        error?.response?.data?.message || error.message || "Terjadi kesalahan",
      );
    }
  };

  return (
    <div className="">
      <div className="h-full overflow-auto px-4 py-12 md:py-14 md:px-5">
        <div className="flex justify-between">
          <div
            className={`font-poppins ${isOnline ? "bg-green-500" : "bg-red-500"} flex items-center px-2 gap-1 text-white`}
          >
            <i className="fa fa-wifi text-white text-xs"></i>{" "}
            {isOnline ? "Online" : "Offline"}{" "}
            <small className="text-white hidden md:block">
              {!isOnline &&
                "(data anda tersedia hanya yang di local storage anda)"}
            </small>
          </div>
          <Link
            to={"/dashboard"}
            className="font-poppins rounded-sm bg-colorPrimary text-white px-2 py-1 text-xs md:text-sm"
          >
            <i className="fa fa-arrow-left"></i> Home
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center font-poppins">
          <Link
            to={"/penjualan"}
            className={`text-xs md:text-sm cursor-pointer w-full my-2 px-3 py-2 rounded-md ${tab === "penjualan" ? "bg-colorPrimary text-white" : "bg-gray-300 text-black"}`}
            onClick={() => handleTab("penjualan")}
          >
            Riwayat Penjualan
          </Link>
          <Link
            to={"/hutang"}
            className={`text-xs md:text-sm cursor-pointer w-full my-2 px-3 py-2 rounded-md ${tab === "hutang" ? "bg-colorPrimary text-white" : "bg-gray-300 text-black"}`}
            onClick={() => handleTab("hutang")}
          >
            Daftar Hutang
          </Link>
          <Link
            to={"/draft-penjualan"}
            className={`text-xs md:text-sm cursor-pointer w-full my-2 px-3 py-2 rounded-md ${tab === "draft" ? "bg-colorPrimary text-white" : "bg-gray-300 text-black"}`}
            onClick={() => handleTab("draft")}
          >
            Draft Penjualan
          </Link>
        </div>
        <form
          onSubmit={handleCari}
          className="flex justify-between items-center"
        >
          <div className="flex gap-1">
            <div className="bg-red-500 text-white px-2 py-1">
              <button type="button" onClick={handleDeleteOffline}>
                <i className="fa fa-trash"></i>{" "}
                <small className="text-white hidden lg:inline">
                  {!isOnline && " Hapus Transaksi Offline"}
                </small>
              </button>
            </div>
            <div className="bg-colorPrimary text-white px-2 py-1">
              <button type="button" onClick={handleShowModalOffline}>
                <i className="fa fa-upload"></i>{" "}
                <small className="text-white hidden lg:inline">
                  {!isOnline && " Sync Transaksi Offline"}
                </small>
              </button>
            </div>
          </div>
          <div className="flex gap-1 md:gap-2 justify-end my-3">
            <input
              type="date"
              name="start"
              value={tanggal.start}
              onChange={(e) =>
                setTanggal({ ...tanggal, start: e.target.value })
              }
              className="border px-1 py-1 text-xs md:text-sm lg:text-base text-center"
            />
            <input
              type="date"
              name="end"
              value={tanggal.end}
              onChange={(e) => setTanggal({ ...tanggal, end: e.target.value })}
              className="border px-1 py-1 text-xs md:text-sm lg:text-base text-center"
            />
            <Link
              onClick={handleReset}
              className="bg-red-600 hover:bg-red-500 text-white px-3 rounded-sm text-xs md:text-sm lg:text-base flex items-center"
            >
              <i className="fa fa-times"></i>
            </Link>
            <button
              type="submit"
              className="bg-colorPrimary hover:bg-colorPrimaryHover text-white px-3 rounded-sm text-xs md:text-sm lg:text-base"
            >
              <i className="fa fa-search"></i>{" "}
              <span className="hidden md:inline">Cari</span>
            </button>
          </div>
        </form>
        <table className="min-w-full border-collapse border border-gray-200 shadow-md rounded-lg text-xs md:text-sm font-poppins">
          <thead>
            <tr className="bg-gray-100 text-gray-700 uppercase text-xs md:text-sm font-semibold text-center">
              <th className="px-2 py-1 md:py-3 border border-gray-200">No</th>
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
              <th className="px-2 py-1 md:py-3 border border-gray-200">Cash</th>
              <th className="px-2 py-1 md:py-3 border border-gray-200">
                Kembalian
              </th>
              <th className="px-2 py-1 md:py-3 border border-gray-200">
                {isOnline ? "Kasir" : "Upload"}
              </th>
              <th className="px-2 py-1 md:py-3 border border-gray-200">Nota</th>
            </tr>
          </thead>
          <tbody>
            {isOnline ? (
              dataTransaksi && dataTransaksi.length > 0 ? (
                dataTransaksi.map((val, index) => {
                  ttlBelanja += parseInt(val.trans_total);
                  ttlCash += parseInt(val.trans_bayar);
                  ttlKembalian += parseInt(val.trans_kembalian);
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
                      <td className="px-2 py-1 md:py-3 border border-gray-200">
                        {val.users.name}
                      </td>
                      <td className="px-2 py-1 md:py-3 border border-gray-200 text-center ">
                        <button
                          onClick={() => handleNota(val.cart_id)}
                          className="px-2 py-1 text-white bg-blue-500 hover:bg-blue-600 rounded"
                        >
                          <i className="fa fa-print"></i>
                        </button>
                        <Link
                          onClick={() => handleRetur(val.cart_id)}
                          title="Retur"
                          className="px-2 py-1 text-white my-1 md:my-0 mx-0 md:mx-2 bg-green-500 hover:bg-green-600 rounded"
                        >
                          <i className="fa fa-undo"></i>
                        </Link>
                        <button
                          onClick={() => handleDelete(val.cart_id)}
                          className="px-2 py-1 text-white bg-red-500 hover:bg-red-600 rounded"
                        >
                          <i className="fa fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="9"
                    className="border border-gray-200 hover:bg-gray-50 text-center"
                  >
                    Data tidak ditemukan
                  </td>
                </tr>
              )
            ) : dataTransaksiOffline && dataTransaksiOffline.length > 0 ? (
              dataTransaksiOffline.map((val, index) => {
                ttlBelanja += parseInt(val.trans_total);
                let trans_bayar = val.trans_bayar === "" ? 0 : val.trans_bayar;
                ttlCash += parseInt(trans_bayar);
                ttlKembalian += parseInt(val.trans_kembalian);
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
                      {val.upload_st === "no" ? (
                        <span
                          // onClick={() => handleUploadById(val.cart_id)}
                          className={`text-white p-2 ${val.upload_st === "no" ? "bg-red-500" : "bg-green-500"}`}
                        >
                          NO
                        </span>
                      ) : (
                        <span
                          className={`text-white p-2 ${val.upload_st === "no" ? "bg-red-500" : "bg-green-500"}`}
                        >
                          YES
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-1 md:py-3 border border-gray-200 text-center ">
                      <button
                        onClick={() => handleNota(val.cart_id)}
                        className="px-2 py-1 text-white bg-blue-500 hover:bg-blue-600 rounded"
                      >
                        <i className="fa fa-print"></i>
                      </button>
                      <Link
                        onClick={() => handleRetur(val.cart_id)}
                        title="Retur"
                        className="px-2 py-1 text-white my-1 md:my-0 mx-0 md:mx-2 bg-green-500 hover:bg-green-600 rounded"
                      >
                        <i className="fa fa-undo"></i>
                      </Link>
                      <button
                        onClick={() => handleDelete(val.cart_id)}
                        className="px-2 py-1 text-white bg-red-500 hover:bg-red-600 rounded"
                      >
                        <i className="fa fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="9"
                  className="border border-gray-200 hover:bg-gray-50 text-center"
                >
                  Data tidak ditemukan
                </td>
              </tr>
            )}
            <tr className="bg-gray-100">
              <td
                colSpan={4}
                className="px-2 py-1 md:py-3 border border-gray-200 text-right"
              >
                Jumlah
              </td>
              <td className="px-2 py-1 md:py-3 border border-gray-200 text-right bg-green-200">
                {RupiahFormat(ttlBelanja)}
              </td>
              <td className="px-2 py-1 md:py-3 border border-gray-200 text-right">
                {RupiahFormat(ttlCash)}
              </td>
              <td className="px-2 py-1 md:py-3 border border-gray-200 text-right">
                {RupiahFormat(ttlKembalian)}
              </td>
              <td className="px-2 py-1 md:py-3 border border-gray-200 text-right"></td>
              <td className="px-2 py-1 md:py-3 border border-gray-200 text-right"></td>
            </tr>
          </tbody>
        </table>
      </div>
      <ToastContainer />
      {stModal && (
        <ModalDetailNota isOpen={true} onClose={handleNota} cartId={cartId} />
      )}
      {stModalRetur && (
        <ModalRetur
          isOpen={true}
          cartId={cartId}
          stateTable={reloadGetDataTransaksi}
          setStModalRetur={setStModalRetur}
        />
      )}
      {stModalDelete && (
        <ModalDelete
          isOpen={stModalDelete}
          cartId={cartId}
          stateTable={reloadGetDataTransaksi}
          setStModalDelete={setStModalDelete}
        />
      )}
      {modalOffline && (
        <ModalShowOffline
          isOpen={modalOffline}
          closeModal={handleShowModalOffline}
          reloadTable={reloadGetDataTransaksi}
        />
      )}
    </div>
  );
};

export default Penjualan;
