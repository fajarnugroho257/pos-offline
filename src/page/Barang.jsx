import React, { useEffect, useState } from "react";
import api from "../utilities/axiosInterceptor";
import { getCabangId, getToken } from "../utilities/Auth";
import "dayjs/locale/id";
import { ToastContainer } from "react-toastify";
import { Link } from "react-router-dom";
import {
  swalConfirm,
  swalError,
  swalLoading,
  swalSuccess,
  swalSuccessAutoClose,
} from "../utilities/Swal";
// import ModalAdd from "../components/barang/ModalAdd";
import Table from "../components/Table";
import Pagination from "../components/Pagination";
import { dbPromise } from "../services/db";
import isOnline from "../utilities/isOnline";

// import ModalEdit from "../components/barang/ModalEdit";
// import ModalStok from "../components/barang/ModalStok";

const Barang = () => {
  // cabang ID
  const cabang_id = getCabangId();
  // state
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [search, setSearch] = useState("");
  const [showEdit, setShowEdit] = useState(false);
  const [detail, setDetail] = useState([]);
  const [stok, setStok] = useState(false);
  const [id, setId] = useState(false);
  // const [loading, setLoading] = useState(false);
  // get data
  const getBarangMaster = async (pageNumber = 1, keyword = "") => {
    swalLoading("Silahkan tunggu...", "Sedang mendapatkan data");
    if (isOnline) {
      try {
        const cabang_id = localStorage.getItem("cabang_id");
        const params = { cabang_id: cabang_id };
        const token = getToken();
        const response = await api.post(
          `list-data-barang-by-cabang?page=${pageNumber}&search=${keyword}`,
          params,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        setData(response.data.data || []);
        setPage(response.data.current_page);
        setLastPage(response.data.last_page);
        setPerPage(response.data.per_page);
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
      const db = await dbPromise;
      const datas = await db.getAll("barangMaster");
      const filtered = datas.filter(
        (item) =>
          item.barang_nama?.toLowerCase().includes(keyword) &&
          item.cabang_id.toString() === cabang_id.toString(),
      );
      const pagination = paginate(filtered, pageNumber, 50);
      setData(pagination.data);
      setPage(pageNumber);
      setLastPage(pagination.last_page);
      setPerPage(50);
      swalSuccessAutoClose("Berhasil", "Data berhasil didapatkan", 700);
    }
  };

  const paginate = (data, page, perPage) => {
    const start = (page - 1) * perPage;
    const end = start + perPage;

    return {
      data: data.slice(start, end),
      current_page: page,
      per_page: perPage,
      last_page: Math.ceil(data.length / perPage),
      total: data.length,
    };
  };

  useEffect(() => {
    getBarangMaster(1, search);
  }, []);

  const [stAdd, setStAdd] = useState(false);
  const addBarang = () => {
    setStAdd(!stAdd);
  };
  const handleCari = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const search = formData.get("search");
    setSearch(search);
    getBarangMaster(1, search);
  };
  const handleReset = () => {
    setSearch("");
    getBarangMaster(1, "");
  };
  const reloadPage = () => {
    getBarangMaster(1, "");
  };
  const detailData = async (id) => {
    try {
      const token = getToken();
      const response = await api.get(`get-detail-barang/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.success) {
        setDetail(response.data.detail);
        setShowEdit(!showEdit);
      }
    } catch (error) {
      swalError(
        "Opps..!",
        error?.response?.data?.message || error.message || "Terjadi kesalahan",
      );
    }
  };
  const deleteData = async (id) => {
    const result = await swalConfirm(
      "Apakah anda yakin akan menghapus data ini? ",
      "Silahkan pastikan terlebih dahulu",
    );
    if (result.isConfirmed) {
      try {
        const token = getToken();
        const response = await api.delete(`delete-barang-master/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data.success) {
          reloadPage();
        }
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
  const handleTambahStok = async (id) => {
    setStok(!stok);
    setId(id);
  };
  const handleCloseStok = async (id) => {
    setStok(!stok);
    setId(null);
    reloadPage();
  };
  const syncLocal = async () => {
    try {
      const cabang_id = localStorage.getItem("cabang_id");
      const params = { cabang_id: cabang_id };
      const token = getToken();
      const response = await api.post(
        `list-data-barang-by-cabang-all`,
        params,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const db = await dbPromise;
      // clear
      await db.clear("barangMaster");
      //
      const barangs = response.data || [];
      const tx = db.transaction("barangMaster", "readwrite");
      const store = tx.objectStore("barangMaster");
      // console.log(barangs.length);
      for (const barang of barangs) {
        await store.put(barang);
      }
      // Mengambil semua data dari object store "barangMaster"
      const datas = await db.getAll("barangMaster");
      swalSuccess(
        "Berhasil",
        "Data sebanyak " +
          datas.length +
          " berhasil di simpan ke local storage anda",
      );
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
        {/* <div className="grid grid-cols-2 gap-4 text-center font-poppins">
          <Link
            to={"/penjualan"}
            className={`text-xs md:text-sm cursor-pointer w-full mt-2 px-3 py-2 rounded-md ${tab === "penjualan" ? "bg-colorPrimary text-white" : "bg-gray-300 text-black"}`}
            onClick={() => handleTab("penjualan")}
          >
            Barang Master
          </Link>
          <Link
            to={"/hutang"}
            className={`text-xs md:text-sm cursor-pointer w-full mt-2 px-3 py-2 rounded-md ${tab === "hutang" ? "bg-colorPrimary text-white" : "bg-gray-300 text-black"}`}
            onClick={() => handleTab("hutang")}
          >
            Tambah Stok
          </Link>
        </div> */}
        <form onSubmit={handleCari}>
          <div className="flex justify-between my-3">
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
            <div className="flex gap-1 md:gap-2 justify-end">
              <input
                type="text"
                name="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border px-1 py-1 text-xs md:text-sm lg:text-base"
                placeholder="Nama barang / Barcode"
              />
              <Link
                onClick={handleReset}
                className="bg-red-600 hover:bg-red-500 text-white px-3 rounded-sm text-xs md:text-sm lg:text-base flex items-center"
              >
                <i className="fa fa-times"></i>
              </Link>
              <button
                type="submit"
                className="bg-colorPrimary hover:bg-colorPrimaryHover text-white px-2 rounded-sm text-xs md:text-sm font-poppins flex items-center gap-1"
              >
                <i className="fa fa-search"></i>{" "}
                <span className="hidden md:inline">Cari</span>
              </button>
              {/* <Link
              onClick={addBarang}
              className="bg-colorPrimary hover:bg-colorPrimaryHover text-white py-1 px-2 rounded-sm text-xs md:text-sm font-poppins flex items-center gap-1"
            >
              <i className="fa fa-plus"></i>
              <span className="hidden md:inline">Tambah</span>
            </Link> */}
              {isOnline && (
                <Link
                  onClick={syncLocal}
                  className="bg-colorPrimary hover:bg-colorPrimaryHover text-white py-1 px-2 rounded-sm text-xs md:text-sm font-poppins flex items-center gap-1"
                >
                  <i className="fa fa-sync-alt"></i>
                  <span className="hidden md:inline">Sync</span>
                </Link>
              )}

              <Link
                to={"/dashboard"}
                className="bg-colorPrimary hover:bg-colorPrimaryHover text-white py-1 px-2 rounded-sm text-xs md:text-sm font-poppins flex items-center gap-1"
              >
                <i className="fa fa-arrow-left"></i>{" "}
                <span className="hidden md:inline">Home</span>
              </Link>
            </div>
          </div>
        </form>
        <Table
          data={data}
          page={page}
          perPage={perPage}
          detailData={detailData}
          deleteData={deleteData}
          handleTambahStok={handleTambahStok}
        />
        <Pagination
          page={page}
          lastPage={lastPage}
          onPageChange={(p) => getBarangMaster(p, search)}
        />
      </div>
      <ToastContainer />
      {stAdd && (
        <ModalAdd isOpen={stAdd} onClose={addBarang} reload={reloadPage} />
      )}
      {showEdit && (
        <ModalEdit
          isOpen={showEdit}
          onClose={() => setShowEdit(false)}
          reload={reloadPage}
          data={detail}
        />
      )}
      {stok && (
        <ModalStok
          isOpen={handleTambahStok}
          onClose={() => handleCloseStok()}
          reload={reloadPage}
          id={id}
        />
      )}
      {/* {stModalDelete && (
        <ModalDelete
          isOpen={stModalDelete}
          cartId={cartId}
          stateTable={reloadGetBarangMaster}
          setStModalDelete={setStModalDelete}
        />
      )} */}
    </div>
  );
};

export default Barang;
