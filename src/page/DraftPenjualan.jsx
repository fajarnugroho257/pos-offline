import React, { useState, useEffect } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import api from "../utilities/axiosInterceptor";
import { getToken } from "../utilities/Auth";
import RupiahFormat from "../utilities/RupiahFormat";
import dayjs from "dayjs";
import {
  swalConfirm,
  swalError,
  swalLoading,
  swalSuccess,
  swalSuccessAutoClose,
} from "../utilities/Swal";
import ModalListCart from "../components/ModalListCart";

const DraftPenjualan = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState("draft");
  const [dataTransaksi, setDataTransaksi] = useState([]);
  const [stModalList, setStModalList] = useState(false);
  const [cartId, setCartId] = useState(null);
  const [tanggal, setTanggal] = useState({
    start: "",
    end: "",
  });

  const handleTab = (tabStatus) => {
    setTab(tabStatus);
  };

  // get data
  const getDataTransaksi = async (start, end) => {
    swalLoading("Silahkan tunggu...", "Sedang mendapatkan data");
    try {
      const params = { start: start, end: end };
      const token = getToken();
      const response = await api.post(
        `list-transaksi-data-barang-cabang-booking`,
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
        error?.response?.data?.message || error.message || "Terjadi kesalahan",
      );
    }
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
  }

  useEffect(() => {
    reloadGetDataTransaksi();
  }, []);

  const formatDate = (dateString) => {
    const date = dayjs(dateString).locale("id");
    return (
      <>
        {date.format("DD MMM YYYY")}
        <br />
        jam {date.format("HH:mm:ss")}
      </>
    );
  };

  const formaOnlytDate = (dateString) => {
    const date = dayjs(dateString).locale("id");
    return date.format("DD MMM YYYY");
  };

  const hanldeTransaksi = async (cart_id) => {
    // get data
    const token = getToken();
    const result = await swalConfirm(
      "Yakin ?",
      "Akan melanjutkan / ubah data ?",
    );
    if (result.isConfirmed) {
      swalLoading("Silahkan tunggu...", "Sedang memproses data");
      // const toastDraft = toast.loading("Silahkan Tunggu...");
      try {
        let params = { cart_id: cart_id };
        const response = await api.post("change-status-by-cart-id", params, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data.success) {
          navigate("/pos");
          swalSuccess("Berhasil", "Silahkan untuk melakukan transaksi kembali");
        } else {
          swalError("error", response.data.message);
        }
      } catch (error) {}
    }
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
    localStorage.setItem("filterTanggal", JSON.stringify(dataTanggal));
    // simpan ke state
    setTanggal(dataTanggal);
    getDataTransaksi(start, end);
    // fetch data
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

  return (
    <>
      <div className="">
        <div className="h-full overflow-auto px-4 py-12 md:py-14 md:px-10">
          <div className="flex justify-end">
            <div className="flex justify-end">
              <Link
                to={"/dashboard"}
                className="font-poppins rounded-sm bg-colorPrimary text-white px-2 py-1 text-xs md:text-sm"
              >
                <i className="fa fa-arrow-left"></i> Home
              </Link>
            </div>
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
          <form onSubmit={handleCari}>
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
                onChange={(e) =>
                  setTanggal({ ...tanggal, end: e.target.value })
                }
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
                <i className="fa fa-search"></i> <span className="hidden md:inline">Cari</span>
              </button>
            </div>
          </form>
          <table className="min-w-full border-collapse border border-gray-200 shadow-md rounded-lg text-xs md:text-sm font-poppins">
            <thead>
              <tr className="bg-gray-100 text-gray-700 uppercase font-semibold text-center">
                <th className="px-2 py-1 md:py-3 border border-gray-200">No</th>
                <th className="px-2 py-1 md:py-3 border border-gray-200">
                  Date Create
                </th>
                <th className="px-2 py-1 md:py-3 border border-gray-200">Cart ID</th>
                <th className="px-2 py-1 md:py-3 border border-gray-200">
                  Buat - Kirim
                </th>
                <th className="px-2 py-1 md:py-3 border border-gray-200">Pelanggan</th>
                <th className="px-2 py-1 md:py-3 border border-gray-200 bg-green-200">
                  Ttl Belanja
                </th>
                <th className="px-2 py-1 md:py-3 border border-gray-200">Uang Muka</th>
                <th className="px-2 py-1 md:py-3 border border-gray-200 bg-red-200">
                  Kekurangan
                </th>
                <th className="px-2 py-1 md:py-3 border border-gray-200">Note</th>
                <th className="px-2 py-1 md:py-3 border border-gray-200">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {dataTransaksi && dataTransaksi.length > 0 ? (
                dataTransaksi.map((val, index) => {
                  ttlUangMuka += parseInt(val.cart_draft.draft_uang_muka);
                  ttlTagihan += parseInt(val.cart_draft.draft_uang_tagihan);
                  ttlKekurangan += parseInt(val.cart_draft.draft_uang_sisa);
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
                        {formaOnlytDate(val.cart_draft.draft_start)}
                        {" - "}
                        {formaOnlytDate(val.cart_draft.draft_end)}
                      </td>
                      <td className="px-2 py-1 md:py-3 border border-gray-200 text-center">
                        {val.cart_draft.draft_pelanggan}
                      </td>
                      <td className="px-2 py-1 md:py-3 border border-gray-200 text-right bg-green-200">
                        {RupiahFormat(val.cart_draft.draft_uang_tagihan)}
                      </td>
                      <td className="px-2 py-1 md:py-3 border border-gray-200 text-right">
                        {RupiahFormat(val.cart_draft.draft_uang_muka)}
                      </td>
                      <td className="px-2 py-1 md:py-3 border border-gray-200 text-right bg-red-200">
                        {RupiahFormat(val.cart_draft.draft_uang_sisa)}
                      </td>
                      <td className="px-2 py-1 md:py-3 border border-gray-200">
                        {val.cart_draft.draft_note}
                      </td>
                      <td className="px-2 py-3 border border-gray-200 text-base md:text-xl text-center">
                        <Link
                          onClick={() => handleListCart(val.cart_id)}
                          title="Lihat Data Barang"
                          className="fa fa-eye text-colorPrimary md:mr-3"
                        ></Link>
                        <Link
                          onClick={() => hanldeTransaksi(val.cart_id)}
                          title="Ubah Data / Lanjutkan Transaksi"
                          className="fa fa-shopping-cart text-red-600 md:mr-3"
                        ></Link>
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
                  colSpan={5}
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
              </tr>
            </tbody>
          </table>
        </div>
        {stModalList && (
          <ModalListCart
            isOpen={true}
            onClose={handleListCart}
            cartId={cartId}
          />
        )}
      </div>
    </>
  );
};

export default DraftPenjualan;
