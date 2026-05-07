import React, { useEffect, useState } from "react";
import api from "../utilities/axiosInterceptor";
import { getToken } from "../utilities/Auth";
import RupiahFormat from "../utilities/RupiahFormat";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { Link } from "react-router-dom";
import ModalDetailHutang from "../components/ModalDetailHutang";
import {
  swalConfirm,
  swalError,
  swalLoading,
  swalSuccess,
  swalSuccessAutoClose,
} from "../utilities/Swal";
import ModalListCartHutang from "../components/ModalListCartHutang";
import isOnline from "../utilities/isOnline";
import {
  deleteById,
  deleteDataTransactionOffline,
  findCartHutang,
} from "../services/db";
import ModalShowHutangOffline from "../components/ModalShowHutangOffline";

const Hutang = () => {
  // state
  const [dataTransaksi, setDataTransaksi] = useState([]);
  const [dataTransaksiOffline, setDataTransaksiOffline] = useState([]);
  const [tab, setTab] = useState("hutang");
  const token = getToken();
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
        const response = await api.post(
          `list-transaksi-data-barang-cabang-hutang`,
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
      // get offline
      const cartHutang = await findCartHutang();
      setDataTransaksiOffline(cartHutang);
      swalSuccessAutoClose("Berhasil", "Data berhasil didapatkan", 500);
      console.log(cartHutang);
    }
  };

  // const isSameDate = (date1, date2) => {
  //   return new Date(date1).toDateString() === new Date(date2).toDateString();
  // };

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
  const [stModalList, setStModalList] = useState(false);
  const [cartId, setCartId] = useState(null);
  const handleNota = (cart_id) => {
    setStModal(!stModal);
    setCartId(cart_id);
  };

  const handleTab = (tabStatus) => {
    setTab(tabStatus);
  };

  const handleListCart = (cart_id) => {
    setCartId(cart_id);
    setStModalList(!stModalList);
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

  //
  let ttlUangMuka = 0;
  let ttlTagihan = 0;
  let ttlKekurangan = 0;
  //
  const handleDeleteOffline = async () => {
    const result = await swalConfirm(
      "Yakin ?",
      "Apakah Anda yakin ingin menghapus semua data hutang..?",
    );
    if (result.isConfirmed) {
      const deleteOffline = await deleteDataTransactionOffline("hutang");
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

  const handleDelete = async (cart_id) => {
    const result = await swalConfirm(
      "Apakah anda yakin akan menghapus data ini? ",
      "Silahkan pastikan terlebih dahulu",
    );
    if (result.isConfirmed) {
      const detail = await deleteById(cart_id);
      swalSuccess("Suksess", detail.message);
      reloadGetDataTransaksi();
    }
  };

  const [modalOffline, stModalOffline] = useState(false);
  const handleShowModalOffline = () => {
    stModalOffline(!modalOffline);
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
            className={`text-xs md:text-sm cursor-pointer w-full my-2 px-3 py-2 rounded-md ${tab == "penjualan" ? "bg-colorPrimary text-white" : "bg-gray-300 text-black"}`}
            onClick={() => handleTab("penjualan")}
          >
            Riwayat Penjualan
          </Link>
          <Link
            to={"/hutang"}
            className={`text-xs md:text-sm cursor-pointer w-full my-2 px-3 py-2 rounded-md ${tab == "hutang" ? "bg-colorPrimary text-white" : "bg-gray-300 text-black"}`}
            onClick={() => handleTab("hutang")}
          >
            Daftar Hutang
          </Link>
          <Link
            to={"/draft-penjualan"}
            className={`text-xs md:text-sm cursor-pointer w-full my-2 px-3 py-2 rounded-md ${tab == "draft" ? "bg-colorPrimary text-white" : "bg-gray-300 text-black"}`}
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
                  {!isOnline && " Hapus Hutang Offline"}
                </small>
              </button>
            </div>
            <div className="bg-colorPrimary text-white px-2 py-1">
              <button type="button" onClick={handleShowModalOffline}>
                <i className="fa fa-upload"></i>{" "}
                <small className="text-white hidden lg:inline">
                  {!isOnline && " Sync Hutang Offline"}
                </small>
              </button>
            </div>
          </div>
          <div className="my-3 flex gap-1 md:gap-2 justify-end">
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
            <tr className="bg-gray-100 text-gray-700 uppercase font-semibold text-center ext-xs md:text-sm">
              <th className="px-2 py-1 md:py-3 border border-gray-200">No</th>
              <th className="px-2 py-1 md:py-3 border border-gray-200">
                Date Create
              </th>
              <th className="px-2 py-1 md:py-3 border border-gray-200">
                Cart ID
              </th>
              <th className="px-2 py-1 md:py-3 border border-gray-200">
                Pelanggan
              </th>
              <th className="px-2 py-1 md:py-3 border border-gray-200 bg-green-200">
                Ttl Belanja
              </th>
              <th className="px-2 py-1 md:py-3 border border-gray-200">
                Uang Muka
              </th>
              <th className="px-2 py-1 md:py-3 border border-gray-200 bg-red-200">
                Kekurangan
              </th>
              <th className="px-2 py-1 md:py-3 border border-gray-200">Note</th>
              {!isOnline && (
                <th className="px-2 py-1 md:py-3 border border-gray-200">
                  Upload
                </th>
              )}
              <th className="px-2 py-1 md:py-3 border border-gray-200">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isOnline && dataTransaksi && dataTransaksi.length > 0 ? (
              dataTransaksi.map((val, index) => {
                ttlUangMuka += parseInt(val.cart.cart_draft.draft_uang_muka);
                ttlTagihan += parseInt(val.cart.cart_draft.draft_uang_tagihan);
                ttlKekurangan += parseInt(val.cart.cart_draft.draft_uang_sisa);
                return (
                  <tr
                    key={index}
                    className="border border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-2 py-1 md:py-3 border border-gray-200 text-center">
                      {index + 1}
                    </td>
                    <td className="px-2 py-1 md:py-3 border border-gray-200 text-center">
                      {formatDate(val.created_at)}
                    </td>
                    <td className="px-2 py-1 md:py-3 border border-gray-200 text-center">
                      {val.cart_id}
                    </td>
                    <td className="px-2 py-1 md:py-3 border border-gray-200 text-center">
                      {val.trans_pelanggan ?? ""}
                    </td>
                    <td className="px-2 py-1 md:py-3 border border-gray-200 text-right bg-green-200">
                      {RupiahFormat(val.cart.cart_draft.draft_uang_tagihan)}
                    </td>
                    <td className="px-2 py-1 md:py-3 border border-gray-200 text-right">
                      {RupiahFormat(val.cart.cart_draft.draft_uang_muka)}
                    </td>
                    <td className="px-2 py-1 md:py-3 border border-gray-200 text-right bg-red-200">
                      {RupiahFormat(val.cart.cart_draft.draft_uang_sisa)}
                    </td>
                    <td className="px-2 py-1 md:py-3 border border-gray-200">
                      {val.cart.cart_draft.draft_note}
                    </td>
                    <td className="px-2 py-3 border border-gray-200 text-base md:text-xl text-center">
                      <Link
                        onClick={() => handleListCart(val.cart_id)}
                        title="Lihat Data Barang"
                        className="fa fa-eye text-colorPrimary xl:mr-3"
                      ></Link>
                      <Link
                        onClick={() => handleNota(val.cart_id)}
                        title="Bayar hutang"
                        className="fa fa-money-bill-alt text-red-600"
                      ></Link>
                    </td>
                  </tr>
                );
              })
            ) : dataTransaksiOffline && dataTransaksiOffline.length > 0 ? (
              dataTransaksiOffline.map((val, index) => {
                let uangMuka =
                  val.draft_uang_muka.length === 0 ? 0 : val.draft_uang_muka;
                ttlUangMuka += parseInt(uangMuka);
                ttlTagihan += parseInt(val.ttlBayar);
                ttlKekurangan += parseInt(val.draft_uang_sisa);
                return (
                  <tr
                    key={index}
                    className="border border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-2 py-1 md:py-3 border border-gray-200 text-center">
                      {index + 1}
                    </td>
                    <td className="px-2 py-1 md:py-3 border border-gray-200 text-center">
                      {formatDate(val.created_at)}
                    </td>
                    <td className="px-2 py-1 md:py-3 border border-gray-200 text-center">
                      {val.cart_id}
                    </td>
                    <td className="px-2 py-1 md:py-3 border border-gray-200 text-center">
                      {val.trans_pelanggan}
                    </td>
                    <td className="px-2 py-1 md:py-3 border border-gray-200 text-right bg-green-200">
                      {RupiahFormat(val.ttlBayar)}
                    </td>
                    <td className="px-2 py-1 md:py-3 border border-gray-200 text-right">
                      {RupiahFormat(val.draft_uang_muka)}
                    </td>
                    <td className="px-2 py-1 md:py-3 border border-gray-200 text-right bg-red-200">
                      {RupiahFormat(val.draft_uang_sisa)}
                    </td>
                    <td className="px-2 py-1 md:py-3 border border-gray-200">
                      {val.draft_note}
                    </td>
                    {!isOnline && (
                      <td className="px-2 py-1 md:py-3 border border-gray-200 text-center">
                        {val.upload_st === "no" ? (
                          <span className="text-white p-2 bg-red-500">NO</span>
                        ) : (
                          <span className="text-white p-2 bg-green-500">
                            YES
                          </span>
                        )}
                      </td>
                    )}
                    <td className="px-2 py-3 border border-gray-200 text-base md:text-xl text-center">
                      <Link
                        onClick={() => handleListCart(val.cart_id)}
                        title="Lihat Data Barang"
                        className="px-2 py-1 text-white bg-amber-500 hover:bg-amber-600 rounded"
                      >
                        <i className="fa fa-eye"></i>
                      </Link>
                      <Link
                        onClick={() => handleNota(val.cart_id)}
                        title="Bayar hutang"
                        className="px-2 py-1 mx-1 text-white bg-green-500 hover:bg-green-600 rounded"
                      >
                        <i className="fa fa-money-bill-alt"></i>
                      </Link>
                      {!isOnline && (
                        <button
                          onClick={() => handleDelete(val.cart_id)}
                          className="px-2 py-1 text-white bg-red-500 hover:bg-red-600 rounded"
                        >
                          <i className="fa fa-trash"></i>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="10"
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
                {RupiahFormat(ttlTagihan)}
              </td>
              <td className="px-2 py-1 md:py-3 border border-gray-200 text-right">
                {RupiahFormat(ttlUangMuka)}
              </td>
              <td className="px-2 py-1 md:py-3 border border-gray-200 text-right bg-red-200">
                {RupiahFormat(ttlKekurangan)}
              </td>
              <td className="px-2 py-1 md:py-3 border border-gray-200 text-right"></td>
              <td className="px-2 py-1 md:py-3 border border-gray-200 text-right"></td>
              {!isOnline && (
                <td className="px-2 py-1 md:py-3 border border-gray-200 text-right"></td>
              )}
            </tr>
          </tbody>
        </table>
      </div>
      {stModal && (
        <ModalDetailHutang
          isOpen={true}
          onClose={handleNota}
          cartId={cartId}
          loadData={reloadGetDataTransaksi}
        />
      )}
      {stModalList && (
        <ModalListCartHutang
          isOpen={true}
          onClose={handleListCart}
          cartId={cartId}
        />
      )}
      {modalOffline && (
        <ModalShowHutangOffline
          isOpen={modalOffline}
          closeModal={handleShowModalOffline}
          reloadDataOnline={reloadGetDataTransaksi}
        />
      )}
    </div>
  );
};

export default Hutang;
