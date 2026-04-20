// import { toast } from "react-toastify";
// import api from "../utilities/axiosInterceptor";
// import { getToken } from "../utilities/Auth";
// import React, { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import {
//   swalError,
//   swalLoading,
//   swalSuccessAutoClose,
// } from "../utilities/Swal";
// import { dbPromise } from "../services/db";

// const Barang = () => {
//   // state
//   const [dataTransaksi, setDataTransaksi] = useState([]);
//   //
//   // get data
//   const getDataTransaksi = async () => {
//     // swalLoading("Silahkan tunggu...", "Sedang mendapatkan data");
//     try {
//       //   const cabang_id = localStorage.getItem("cabang_id");
//       //   const params = { cabang_id: cabang_id };
//       //   const token = getToken();
//       //   const db = await dbPromise;
//       //   console.log(db);
//       //   const response = await api.post(`list-data-barang-by-cabang`, params, {
//       //     headers: {
//       //       Authorization: `Bearer ${token}`,
//       //     },
//       //   });
//       //   const barangs = response.data.data || [];
//       //   const tx = db.transaction("products", "readwrite");
//       //   const store = tx.objectStore("products");
//       //   for (const barang of barangs) {
//       //     await store.put(barang);
//       //   }
//       //   swalSuccessAutoClose("Berhasil", "Data berhasil didapatkan", 500);
//       //   await tx.done;
//       //   console.log("Data barang berhasil disinkronkan ke offline storage.");
//       // const dataTanggal = { start, end };
//       // localStorage.setItem("filterTanggal", JSON.stringify(dataTanggal));
//       const db = await dbPromise;
//       // Mengambil semua data dari object store "products"
//       const datas = await db.getAll("products");
//       console.log(datas);
//     } catch (error) {
//       swalError(
//         "Opps..!",
//         error?.response?.data?.message || error.message || "Terjadi kesalahan",
//       );
//     }
//   };
//   useEffect(() => {
//     getDataTransaksi();
//   }, []);
//   return (
//     <div className="">
//       <div className="h-full overflow-auto px-4 py-12 md:py-14 md:px-10">
//         <div className="flex justify-end">
//           <div className="flex justify-end mb-3">
//             <Link
//               to={"/dashboard"}
//               className="font-poppins rounded-sm bg-colorPrimary text-white px-2 py-1 text-xs md:text-sm"
//             >
//               <i className="fa fa-arrow-left"></i> Home
//             </Link>
//           </div>
//         </div>
//         <table className="w-full md:w-1/2 md:mx-auto border-collapse border border-gray-200 shadow-md rounded-lg text-xs md:text-base font-poppins">
//           <thead>
//             <tr className="bg-gray-100 text-gray-700 uppercase text-sm font-semibold text-center">
//               <th className="px-1 py-3 border border-gray-200">No</th>
//               <th className="px-1 py-3 border border-gray-200">Nama</th>
//               <th className="px-1 py-3 border border-gray-200">Status</th>
//             </tr>
//           </thead>
//           <tbody>
//             <tr key="11" className="border border-gray-200 hover:bg-gray-50">
//               <td className="px-6 py-3 border border-gray-200 text-center">
//                 1
//               </td>
//               <td className="px-6 py-3 border border-gray-200 text-center">
//                 Printer
//               </td>
//             </tr>
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default Barang;

import React, { useEffect, useState } from "react";
import api from "../utilities/axiosInterceptor";
import { getToken } from "../utilities/Auth";
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
  const [tab, setTab] = useState("penjualan");
  // get data
  const getBarangMaster = async (pageNumber = 1, keyword = "") => {
    swalLoading("Silahkan tunggu...", "Sedang mendapatkan data");

    try {
      if (isOnline) {
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
      } else {
        const db = await dbPromise;
        const datas = await db.getAll("barangMaster");
        console.log(datas);
        setData(datas || []);
        setPage(1);
        setLastPage(0);
        setPerPage(50);
        swalSuccessAutoClose("Berhasil", "Data berhasil didapatkan", 500);
      }
    } catch (error) {
      swalError(
        "Opps..!",
        error?.response?.data?.message || error.message || "Terjadi kesalahan",
      );
    }
  };

  useEffect(() => {
    getBarangMaster(1, search);
  }, []);

  const handleTab = (tabStatus) => {
    setTab(tabStatus);
  };

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
      console.log(barangs.length);
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
          <div className="my-3 flex gap-1 md:gap-2 justify-end">
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
            <Link
              onClick={addBarang}
              className="bg-colorPrimary hover:bg-colorPrimaryHover text-white py-1 px-2 rounded-sm text-xs md:text-sm font-poppins flex items-center gap-1"
            >
              <i className="fa fa-plus"></i>
              <span className="hidden md:inline">Tambah</span>
            </Link>
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
