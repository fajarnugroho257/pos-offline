import React, { useEffect, useRef, useState } from "react";
import AsyncSelect from "../components/AsyncSelect";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import axios from "axios";
import RupiahFormat from "../utilities/RupiahFormat";
import api from "../utilities/axiosInterceptor";
import ModalPembayaran from "../components/ModalPembeyaran";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { swalConfirm, swalError } from "../utilities/Swal";
import isOnline from "../utilities/isOnline";
import {
  dbPromise,
  findBarang,
  findCartDraft,
  saveOrUpdateTransaction,
} from "../services/db";

function Pos() {
  // TOKEN
  const token = localStorage.getItem("token");
  const cabang_id = localStorage.getItem("cabang_id");
  // printer
  const navigate = useNavigate();
  const nowPrintSelected = localStorage.getItem("printSelected");
  //
  const [cart, SetCart] = useState([]);
  const [cart_id, setCartId] = useState(null);
  const [openBayar, setOpenBayar] = useState(false);
  // jika ada yang draft
  useEffect(() => {
    if (nowPrintSelected === null) {
      alert("maaf anda belum melakukan pengaturan printer");
      navigate("/dashboard");
    }
    const fectData = async () => {
      if (isOnline) {
        try {
          //fetching
          const response = await api.get(`get-cart-draft`, {
            headers: {
              Authorization: `Bearer ${token}`, // Sisipkan token di header
            },
          });
          if (response.status === 200) {
            //get response data
            const cart_data = await response.data.data;

            if (Object.keys(cart_data).length !== 0) {
              // console.log(cart_data);
              SetCart(cart_data);
            }
          } else {
            console.log(response.status);
          }
        } catch (error) {
          swalError(
            "Opps..!",
            error?.response?.data?.message ||
              error.message ||
              "Terjadi kesalahan",
          );
        }
      } else {
        const draftOffline = await findCartDraft();
        console.log(draftOffline.cart_id);
        SetCart(draftOffline.sortedCart);
        setCartId(draftOffline.cart_id);
      }
    };
    fectData();
  }, []);

  const [no, setNo] = useState(1);
  const dataCart = (childData) => {
    // console.log(childData);
    if (childData === null) {
    } else {
      // Cek apakah ID sudah ada dalam array
      const isExist = cart.some((item) => item.barang_cabang_id === childData);
      // Jika ID belum ada, tambahkan item baru
      if (!isExist) {
        // Fungsi async untuk mengambil data dari API
        const fetchData = async () => {
          try {
            let params = {
              barang_cabang_id: childData,
              id_cabang: cabang_id,
            };
            let draftCart;
            if (isOnline) {
              const response = await api.post(
                "/detail-api-barcode-data-barang-cabang",
                params,
                {
                  headers: {
                    Authorization: `Bearer ${token}`, // Sisipkan token di header
                    "Content-Type": "application/json",
                    Accept: "application/json",
                  },
                },
              );
              draftCart = response.data.barang_master;
            } else {
              draftCart = await findBarang(childData);
            }
            const draftDataCart = {
              no_urut: no,
              barang_cabang_id: childData,
              barang_nama: draftCart.barang_nama,
              barang_barcode: draftCart.barang_barcode,
              barang_harga_beli: draftCart.barang_harga_beli,
              awal_barang_harga_jual: draftCart.barang_harga_jual,
              barang_harga_jual: draftCart.barang_harga_jual,
              barang_grosir_pembelian: draftCart.barang_grosir_pembelian,
              barang_grosir_harga_jual: draftCart.barang_grosir_harga_jual,
              barang_grosir_diskon: draftCart.barang_grosir_harga_jual,
              barang_st_diskon: "no",
              pusat_id: draftCart.pusat_id,
              cart_qty: 1,
              cart_subtotal: draftCart.barang_harga_jual,
            };
            const audio = new Audio("sounds/ting.mp3");
            audio.volume = 1;
            audio.play();
            // console.log(draftDataCart);
            SetCart([...cart, draftDataCart]);
            setNo(no + 1);
          } catch (err) {
            toast.error("Terjadi kesalahan saat mengambil data.", {
              autoClose: 5000, // Durasi toast muncul dalam milidetik
            });
            // setError("Terjadi kesalahan saat mengambil data"); // Menangani error
          } finally {
            // setIsLoading(false);
          }
        };
        fetchData();

        // insert table cart
      } else {
        const audio = new Audio("sounds/new-error-sound.mp3");
        audio.volume = 1;
        audio.play();
        swalError("Opps", "Data sudah ada, Silahkan untuk menambah QTY");
      }
    }
  };
  // console.log(cart);
  const handleInputChange = (index, event) => {
    const values = [...cart];
    // console.log(values);
    if (event.target.name === "cart_qty") {
      let nilai_qty = event.target.value;
      let result_harga =
        parseInt(nilai_qty) >=
        parseInt(values[index]["barang_grosir_pembelian"])
          ? values[index]["barang_grosir_harga_jual"]
          : values[index]["awal_barang_harga_jual"];
      values[index]["barang_harga_jual"] = result_harga;
      let subTotal = result_harga * event.target.value;
      values[index]["cart_subtotal"] = subTotal;
      // status diskon
      let stDiskon = false;
      if (
        parseInt(nilai_qty) >=
        parseInt(values[index]["barang_grosir_pembelian"])
      ) {
        stDiskon = "yes";
      } else {
        stDiskon = "no";
      }
      values[index]["barang_st_diskon"] = stDiskon;
    }
    values[index][event.target.name] = event.target.value;
    SetCart(values);
  };
  const sortedCart = cart.sort((a, b) => b.no_urut - a.no_urut);

  const handleRemoveField = (index) => {
    const values = [...cart];
    values.splice(index, 1);
    focusBarcode();
    SetCart(values);
  };
  // console.log(cart);
  //
  const transaksiSubtotal = cart.reduce((total, item) => {
    // Jumlahkan harga jual setiap item ke dalam total
    return total + parseInt(item.cart_subtotal);
  }, 0);

  const tambahQty = (index) => {
    const values = [...cart];
    const qty = parseInt(values[index]["cart_qty"]);
    const resQty = (qty + 1).toString();
    values[index]["cart_qty"] = resQty;
    let result_harga =
      parseInt(resQty) >= parseInt(values[index]["barang_grosir_pembelian"])
        ? values[index]["barang_grosir_harga_jual"]
        : values[index]["awal_barang_harga_jual"];
    values[index]["barang_harga_jual"] = result_harga;
    let subTotal = result_harga * resQty;
    values[index]["cart_subtotal"] = subTotal;
    // status diskon
    let stDiskon = false;
    if (
      parseInt(resQty) >= parseInt(values[index]["barang_grosir_pembelian"])
    ) {
      stDiskon = "yes";
    } else {
      stDiskon = "no";
    }
    values[index]["barang_st_diskon"] = stDiskon;
    SetCart(values);
  };

  const kurangQty = (index) => {
    const values = [...cart];
    const qty = parseInt(values[index]["cart_qty"]);
    const resQty = (qty - 1).toString();
    if (resQty < 1) {
      return;
    }
    values[index]["cart_qty"] = resQty;
    let result_harga =
      parseInt(resQty) >= parseInt(values[index]["barang_grosir_pembelian"])
        ? values[index]["barang_grosir_harga_jual"]
        : values[index]["awal_barang_harga_jual"];
    values[index]["barang_harga_jual"] = result_harga;
    let subTotal = result_harga * resQty;
    values[index]["cart_subtotal"] = subTotal;
    // status diskon
    let stDiskon = false;
    if (
      parseInt(resQty) >= parseInt(values[index]["barang_grosir_pembelian"])
    ) {
      stDiskon = "yes";
    } else {
      stDiskon = "no";
    }
    values[index]["barang_st_diskon"] = stDiskon;
    SetCart(values);
  };

  const rowTable = (item, index, resNo) => {
    // console.log(item);
    return (
      <tr className="text-center text-xs md:text-lg" key={index}>
        <td>{resNo}</td>
        <td className="hidden md:table-cell">{item.barang_barcode}</td>
        <td>{item.barang_nama}</td>
        <td>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => kurangQty(index)}
              className="bg-red-500 px-2 md:px-3 rounded-sm"
            >
              <i className="fa fa-minus text-white"></i>
            </button>
            <input
              value={item.cart_qty}
              type="number"
              name="cart_qty"
              onChange={(event) => {
                const value = event.target.value;
                // Hanya angka dan satu titik
                if (/^\d*\.?\d*$/.test(value)) {
                  handleInputChange(index, event);
                }
              }}
              className="input-qty"
              required
            ></input>
            <button
              type="button"
              onClick={() => tambahQty(index)}
              className="bg-green-500 px-2 md:px-3 rounded-sm"
            >
              <i className="fa fa-plus text-white"></i>
            </button>
          </div>
        </td>
        <td className="text-right px-2">
          <p
            className={
              item.barang_st_diskon === "yes" ? "line-through text-red-500" : ""
            }
          >
            {RupiahFormat(item.awal_barang_harga_jual)}
          </p>
          <div
            className={`flex justify-between items-center ${
              item.barang_st_diskon === "yes" ? "" : "hidden"
            }`}
          >
            <span className="text-xs">Grosir : </span>
            <p>{RupiahFormat(item.barang_harga_jual)}</p>
          </div>
        </td>
        <td className="text-right px-2">{RupiahFormat(item.cart_subtotal)}</td>
        <td>
          <i
            onClick={() => handleRemoveField(index)}
            className="cursor-pointer fa fa-trash text-red-500 text-lg md:text-xl"
          ></i>
        </td>
      </tr>
    );
  };
  let number = 1;
  // handle submit
  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await swalConfirm(
      "Yakin ?",
      "Akan memasukkan ke keranjang ?",
    );
    if (result.isConfirmed) {
      // toas
      const toastId = toast.loading("Sending data...");
      try {
        const params = {
          keranjang: sortedCart,
        };
        if (isOnline) {
          // console.log(params);
          const response = await api.post("/api-store-cart-data", params, {
            headers: {
              Authorization: `Bearer ${token}`, // Sisipkan token di header
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          });
          if (response.status === 200) {
            if (response.data.success === false) {
              if (
                response.data.message === "Sukses Keranjang anda sudah kosong.."
              ) {
                toast.update(toastId, {
                  render: response.data.message,
                  type: "success",
                  isLoading: false,
                  autoClose: 3000,
                });
                // hapus cart data
                SetCart([]);
              } else {
                toast.update(toastId, {
                  render: response.data.message,
                  type: "error",
                  isLoading: false,
                  autoClose: 3000,
                });
              }
            } else {
              // open modal bayar
              setOpenBayar(true);
              setCartId(response.data.cart_id);
              // api-store-cart-data
              // console.log(response.data);
              toast.update(toastId, {
                render: "Sukses menambah ke keranjang",
                type: "success",
                isLoading: false,
                autoClose: 3000,
              });
            }
          }
        } else {
          const db = await dbPromise;
          //
          const cartIdOffline = cart_id ? cart_id : generateCartId();
          // console.log(sortedCart);
          const saveTransaction = {
            cart_id: cartIdOffline,
            trans_date: null,
            trans_total: null,
            trans_bayar: null,
            trans_kembalian: null,
            trans_pelanggan: null,
            trans_st: "draft",
            sortedCart: sortedCart,
          };
          console.log(saveTransaction);
          await saveOrUpdateTransaction(saveTransaction);
          const datas = await db.getAll("transactions");
          console.log(datas);
          if (datas) {
            console.log(transaksiSubtotal);
            // open modal bayar
            setOpenBayar(true);
            setCartId(cartIdOffline);
            // api-store-cart-data
            // console.log(response.data);
            toast.update(toastId, {
              render: "Sukses menambah ke keranjang",
              type: "success",
              isLoading: false,
              autoClose: 3000,
            });
          }
        }
        // console.log(response.data);
      } catch (error) {
        const errors = error.response?.data?.errors;
        let errorMessages;
        if (errors) {
          // Jika errors ada, buat string gabungan dari pesan error
          errorMessages = Object.keys(errors)
            .map((field) => `${field}: ${errors[field].join(", ")}`)
            .join("\n");

          console.log(errorMessages);
        } else {
          // Jika errors tidak ada
          errorMessages = "No errors found in the response.";
          console.log("No errors found in the response.");
        }
        toast.update(toastId, {
          render: `Error sending data ! \n${errorMessages}`,
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
        console.error(`Error sending data ! \n${errorMessages}`);
      }
    }
  };

  const generateCartId = () => {
    const now = new Date();

    const formatted =
      now.getFullYear().toString() +
      String(now.getMonth() + 1).padStart(2, "0") +
      String(now.getDate()).padStart(2, "0") +
      String(now.getHours()).padStart(2, "0") +
      String(now.getMinutes()).padStart(2, "0") +
      String(now.getSeconds()).padStart(2, "0");

    const random = Math.floor(1000 + Math.random() * 9000);

    return formatted + random;
  };

  const handleCloseBayar = () => {
    setOpenBayar(false);
    if (!isOnline) {
      setCartId(null);
    }
  };
  // delete all cart id success
  const deleteCart = () => {
    SetCart([]);
  };
  const barcodeInputRef = useRef(null);

  const focusBarcode = () => {
    barcodeInputRef.current?.focus();
  };
  // console.log(cart_id);
  return (
    <div className="px-5 pt-12 h-full flex flex-col font-poppins">
      <div className="flex justify-between">
        <div className="mb-1">
          <span className="text-colorPrimary font-semibold text-sm md:text-xl">
            <i className="fa fa-plus"></i> Tambah Item
          </span>
        </div>
        <Link
          to={"/dashboard"}
          className="font-poppins rounded-sm bg-colorPrimary text-white px-2 py-1 text-sm"
        >
          <i className="fa fa-arrow-left"></i> Home
        </Link>
      </div>
      <div className="flex flex-col flex-1 min-h-0">
        <div className="bg-white md:grid md:grid-cols-2 gap-5 md:my-4">
          <div className="my-1 md:my-0">
            <ToastContainer />
            <AsyncSelect
              sendDataToParent={dataCart}
              barcodeInputRef={barcodeInputRef}
            />
          </div>
          <div>
            <div className="my-1">
              <span className="text-colorPrimary font-semibold text-sm md:text-xl">
                <i className="fa fa-calculator"></i> Total
              </span>
            </div>
            <div className="bg-gray-100 p-2 rounded text-right">
              <div className="text-lg md:text-2xl text-colorPrimary font-bold">
                {RupiahFormat(transaksiSubtotal)}
              </div>
            </div>
          </div>
        </div>
        <div className="">
          <span className="text-colorPrimary font-semibold text-sm md:text-xl">
            <i className="fa fa-shopping-cart"></i> Keranjang
          </span>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-auto mt-2 bg-white rounded">
            <table className="min-w-[500px] w-full text-xs md:text-sm">
              <thead>
                <tr>
                  <th className="w-[5%]">No</th>
                  <th className="w-[10%] md:w-[20%] hidden md:table-cell">
                    Barcode
                  </th>
                  <th className="w-[25%]">Nama</th>
                  <th className="w-[25%] md:w-[15%]">Qty</th>
                  <th className="w-[15%]">Harga</th>
                  <th className="w-[15%]">SubTotal</th>
                  <th className="w-[5%]">Hapus</th>
                </tr>
              </thead>
              <tbody>
                {sortedCart &&
                  sortedCart.map((item, index) => {
                    const resNo = number++;
                    return rowTable(item, index, resNo);
                  })}
              </tbody>
            </table>
          </div>
          <button
            type="submit"
            className="sticky bottom-0 bg-yellow-500 text-white py-1 mt-2 text-sm md:text-lg shadow-lg z-40"
          >
            <i className="fa fa-cart-shop"></i> Masukkan Keranjang
          </button>
        </form>
      </div>
      {openBayar && (
        <ModalPembayaran
          isOpen={openBayar}
          onClose={handleCloseBayar}
          ttlBayar={transaksiSubtotal}
          cart_id={cart_id}
          deleteCart={deleteCart}
          cart_data={cart}
        />
      )}
    </div>
  );
}

export default Pos;
