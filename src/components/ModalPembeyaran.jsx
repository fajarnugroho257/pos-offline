import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../utilities/axiosInterceptor";
import { QZTrayProvider, useQZTray } from "./QZTrayContext";
import PrintBluethootPos from "../utilities/PrintBluethootPos";
import ModalAddDraf from "./ModalAddDraft";
import ModalAddHutang from "./ModalAddHutang";
import { swalError } from "../utilities/Swal";
import isOnline from "../utilities/isOnline";
import { dbPromise, findCartById, updatePartialByCartId } from "../services/db";
import dayjs from "dayjs";

function ModalPembayaran({
  isOpen,
  onClose,
  ttlBayar,
  cart_id,
  deleteCart,
  cart_data,
}) {
  // TOKEN
  const token = localStorage.getItem("token");
  const pusat = localStorage.getItem("toko_pusat");
  const cabang = localStorage.getItem("cabang_nama");
  const stPrinter = localStorage.getItem("printSelected");
  //
  // const [number, setNumber] = useState([]);
  const [tagihan, setTagihan] = useState(0);
  const [kembalian, setKembalian] = useState(0);
  const [resCartData, setCartData] = useState(cart_data);
  const [stModalDraft, setStModalDraft] = useState(false);
  const [stModalHutang, setStModalHutang] = useState(false);
  const [draftStart, setSdraftStart] = useState(false);
  const [draftEnd, setdraftEnd] = useState(false);
  const [draftNote, setdraftNote] = useState(false);
  const [valInputPelanggan, setValInputPelanggan] = useState("");
  const handleInputPelanggan = (event) => {
    const val = event.target.value;
    setValInputPelanggan(val);
  };
  // console.log(formatRupiah(result));
  const [valInputBayar, setValInputBayar] = useState("");
  // lama
  // const handleInputBayar = (event) => {
  //   // const val = event.target.value;
  //   let input = event.target.value.replace(/\./g, "");
  //   if (/^\d*$/.test(input)) {
  //     let res = Number(input);
  //     setKembalian(res - parseInt(tagihan));
  //     setValInputBayar(res);
  //   }
  // };
  // baru
  const handleInputBayar = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setKembalian(parseInt(value) - parseInt(tagihan));
    setValInputBayar(value);
  };

  const getGrandTotalByCartId = async () => {
    //fetching
    try {
      const params = { cart_id: cart_id };
      if (isOnline) {
        const response = await api.post("/get-cart-subtotal-draft", params, {
          headers: {
            Authorization: `Bearer ${token}`, // Sisipkan token di header
          },
        });
        if (response.status === 200) {
          //get response data
          const draftTagihan = await response.data.grand_total;
          const draftCart = await response.data.rs_draft;
          const cartDataDraft = await response.data.cartDataDraft;
          // cek kosong / tidak
          if (cartDataDraft || Object.keys(cartDataDraft).length >= 1) {
            // set nama pelanggan dari darft
            setValInputPelanggan(cartDataDraft.draft_pelanggan ?? "");
            const draft_uang_muka = Number(cartDataDraft.draft_uang_muka ?? 0);
            setKembalian(draft_uang_muka - parseInt(draftTagihan ?? ttlBayar));
            setValInputBayar(draft_uang_muka.toString());
            // tanggal
            setSdraftStart(cartDataDraft.draft_start ?? null);
            setdraftEnd(cartDataDraft.draft_end ?? null);
            setdraftNote(cartDataDraft.draft_note ?? null);
          }
          //
          setTagihan(draftTagihan ?? ttlBayar);
          setCartData(draftCart);
        } else {
          console.log(response.status);
        }
      } else {
        const detailOffline = await findCartById(cart_id);
        console.log(detailOffline);
        setValInputPelanggan(detailOffline.trans_pelanggan ?? "");
        const draft_uang_muka = Number(detailOffline.draft_uang_muka ?? 0);
        setKembalian(draft_uang_muka - parseInt(ttlBayar));
        setValInputBayar(draft_uang_muka.toString());
        // tanggal
        setSdraftStart(detailOffline.draft_start ?? null);
        setdraftEnd(detailOffline.draft_end ?? null);
        setdraftNote(detailOffline.draft_note ?? null);
        // offline
        setTagihan(ttlBayar);
      }
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
      console.error(`Error sending data ! \n${errorMessages}`);
    }
  };

  // Update total bayar dari backend
  useEffect(() => {
    getGrandTotalByCartId();
  }, []);

  // Fungsi untuk memformat angka menjadi format Rupiah
  const formatRupiah = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const { isConnected, printer } = useQZTray();

  function padCenter(text, width, padChar = " ") {
    let padding = width - text.length;
    let padStart = Math.floor(padding / 2);
    let padEnd = padding - padStart;
    return padChar.repeat(padStart) + text + padChar.repeat(padEnd);
  }
  // print kabel
  const printThermal = async () => {
    try {
      if (!printer) {
        alert("Printer belum dipilih!");
        return;
      }
      // start content
      const printDatas = resCartData;
      // Format tabel dengan padding
      const pusat_nama = pusat;
      const cabang_nama = cabang;
      //
      const now = new Date();
      //
      let content = padCenter(pusat_nama, 30, " ") + "\n";
      content += padCenter(cabang_nama, 30, " ") + "\n";
      content += padCenter(`${now.toLocaleString()}`, 30, " ") + "\n";
      content += "=============================" + "\n";
      content += "| Item     |Qty| Price       |" + "\n";
      content += "=============================" + "\n";

      printDatas.forEach((item) => {
        let nama = item.barang_nama;
        let cart_diskon = item.barang_st_diskon === "yes" ? " (Gros)" : "";
        let qty = String(item.cart_qty).padStart(1, " ");
        let harga = `${formatRupiah(item.barang_harga_jual)}`.padEnd(8, " ");
        let subTotal = `${formatRupiah(item.cart_subtotal)}`.padStart(11, " ");
        content += `| ${nama}${cart_diskon}\n| ${harga} | ${qty} | ${subTotal} |\n`;
      });

      content += "=============================" + "\n";
      content +=
        "| Total".padEnd(13, " ") +
        `${formatRupiah(tagihan)}`.padStart(15, " ") +
        " |\n";
      content += "-----------------------------" + "\n";
      content +=
        "| Bayar".padEnd(13, " ") +
        `${formatRupiah(valInputBayar)}`.padStart(15, " ") +
        " |\n";
      content +=
        "| Kembalian".padEnd(13, " ") +
        `${formatRupiah(kembalian)}`.padStart(15, " ") +
        " |\n";
      content += "=============================" + "\n";
      content += padCenter("Terimakasih", 30, " ") + "\n\n";
      // end content

      // Data dummy sebagai pengganti respons API Laravel
      const printData = {
        options: {
          printer: "POS-58", // Nama printer
          "font-size": 11, // Ukuran font
        },
        content: content,
      };

      console.log("Print Data (Dummy):", printData);
      const qz = window.qz; // Akses qz dari window
      // Konfigurasi printer
      const config = qz.configs.create(printData.options.printer, {
        fontSize: printData.options["font-size"], // Sesuaikan opsi lainnya
      });

      // Data yang akan dicetak
      const data = [
        {
          type: "raw",
          format: "plain",
          data: printData.content,
        },
      ];

      // Kirim perintah cetak
      await qz.print(config, data);
      console.log("Print job successful");
      alert("Print job sent successfully!");
    } catch (error) {
      console.error("Error during printing:", error);
      alert("Error during printing: " + error.message);
    }
  };

  const closeModalBayar = () => {
    onClose();
  };
  const handleStoreBayar = async () => {
    // alert(cart_id);
    // const selisih = parseInt(valInputBayar) - tagihan;
    if (parseInt(valInputBayar) <= 0) {
      swalError(
        "Opps.!",
        "Nilai pembayaran wajib diisi, Atau pilih hutang / draft ",
      );
      return;
    }
    if (kembalian < 0 || valInputBayar.length === 0) {
      swalError(
        "Opps.!",
        "Pembayaran Kurang dari Tagihan, Atau pilih hutang / draft",
      );
      return;
    }
    // toas
    const toastId = toast.loading("Sending data...");
    const stPrinter = localStorage.getItem("printSelected");
    if (isOnline) {
      try {
        const params = {
          cart_id: cart_id,
          ttlBayar: tagihan ?? ttlBayar,
          valInputBayar: valInputBayar,
          valInputPelanggan: valInputPelanggan,
          kembalian: kembalian,
        };
        // console.log(params);
        const response = await api.post("/store-bayar", params, {
          headers: {
            Authorization: `Bearer ${token}`, // Sisipkan token di header
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });
        if (response.status === 200) {
          if (response.data.success === false) {
            toast.update(toastId, {
              render: response.data.message,
              type: "error",
              isLoading: false,
              autoClose: 1000,
            });
          } else {
            // status printer
            if (stPrinter === "kabel") {
              printThermal();
            } else {
              PrintBluethootPos(
                resCartData,
                pusat,
                cabang,
                tagihan,
                valInputBayar,
                kembalian,
                valInputPelanggan,
              );
            }
            // close modal bayar
            closeModalBayar();
            // delete
            deleteCart();
            toast.update(toastId, {
              render: "Sukses melakukan pembayaran",
              type: "success",
              isLoading: false,
              autoClose: 1000,
            });
          }
        }
      } catch (error) {
        let errorMessages;
        console.log(error.response);
        toast.update(toastId, {
          render: `Error sending data ! \n${errorMessages}`,
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
        console.error(`Error sending data ! \n${errorMessages}`);
      }
    } else {
      // simpan offline
      const params = {
        trans_total: tagihan,
        trans_date: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        trans_bayar: valInputBayar,
        trans_kembalian: kembalian,
        trans_pelanggan: valInputPelanggan,
        trans_st: "yes",
        cart_st: "yes",
      };
      await updatePartialByCartId(cart_id, params);
      const db = await dbPromise;
      const datas = await db.getAll("transactions");
      console.log(datas);
      // cetak
      // status printer
      if (stPrinter === "kabel") {
        printThermal();
      } else {
        PrintBluethootPos(
          resCartData,
          pusat,
          cabang,
          tagihan,
          valInputBayar,
          kembalian,
          valInputPelanggan,
        );
      }
      // close modal bayar
      closeModalBayar();
      // delete
      deleteCart();
      toast.update(toastId, {
        render: "Sukses melakukan pembayaran",
        type: "success",
        isLoading: false,
        autoClose: 1000,
      });
    }
  };
  const formatNumber = (number) => {
    return new Intl.NumberFormat("id-ID").format(number);
  };

  // modal draft pesanan
  const handleDraftPensanan = () => {
    setStModalDraft(!stModalDraft);
  };

  // modal draft hutang
  const handleHutang = () => {
    setStModalHutang(!stModalHutang);
  };

  const handleClickNumber = (num) => {
    const newValue = (valInputBayar + num).replace(/\D/g, "");
    setValInputBayar(newValue);
    setKembalian(parseInt(newValue || 0) - parseInt(tagihan || 0));
  };

  const handleDelete = () => {
    const newValue = valInputBayar.slice(0, -1);
    setValInputBayar(newValue);
    setKembalian(parseInt(newValue || 0) - parseInt(tagihan || 0));
  };

  const handleClear = () => {
    setKembalian(0 - parseInt(tagihan || 0));
    setValInputBayar("");
  };

  // perhitungan

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-[100]">
      <div className="absolute inset-0 bg-gray-900 opacity-50"></div>
      <div className="bg-white w-[90%] md:w-1/2 h-auto p-4 md:p-6 rounded-lg shadow-lg relative z-10">
        <h2 className="text-sm md:text-lg xl:text-xl font-bold mb-2 md:mb-3 text-black font-poppins">
          Pembayaran
        </h2>
        <div className={`${stPrinter === "kabel" ? "" : "hidden"}`}>
          <p>QZ Tray: {isConnected ? "Connected" : "Disconnected"}</p>
          <p>Printer: {printer || "Not Found"}</p>
        </div>
        <div className="h-[2px] w-full bg-colorPrimary mb-1 md:mb-3"></div>
        <div className="">
          <div className="w-full">
            <div className="font-poppins text-sm md:text-lg xl:text-xl flex justify-between font-semibold my-1 md:my-2">
              <h3 className="text-xs md:text-base xl:text-lg text-black">
                PEMBAYARAN
              </h3>
              {/* <h3 className="text-black">{formatRupiah(result)}</h3> */}
              <h3 className="text-xs md:text-base xl:text-lg text-black">
                {formatRupiah(valInputBayar)}
              </h3>
            </div>
            <div className="font-poppins text-sm md:text-lg xl:text-xl flex justify-between font-semibold">
              <h3 className="text-xs md:text-base xl:text-lg text-black">
                TAGIHAN
              </h3>
              <h3 className="text-xs md:text-base xl:text-lg text-colorRed">
                {formatRupiah(tagihan)}
              </h3>
            </div>
            <div className="h-[2px] w-full bg-colorPrimary my-1 md:my-2"></div>
            <div className="font-poppins text-sm md:text-lg xl:text-xl flex justify-between font-semibold">
              <h3 className="text-xs md:text-base xl:text-lg text-black">
                KEMBALIAN
              </h3>
              <h3
                className={`text-black px-2 ${
                  kembalian >= 0 ? "bg-green-500" : "bg-red-500"
                }`}
              >
                {formatRupiah(kembalian)}
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-2 md:gap-4 mt-2 md:mt-4">
              <div>
                {/* tombol 1 sampai 9 seperti kalkulator untuk mengisi nominal pembayaran */}
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                    <button
                      key={n}
                      onClick={() => handleClickNumber(n)}
                      className="bg-gray-200 py-2 text-sm md:text-base xl:text-lg font-semibold rounded hover:bg-gray-300"
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    onClick={handleClear}
                    className="bg-red-400 text-sm md:text-base xl:text-lg text-white py-2 rounded hover:bg-red-500"
                  >
                    C
                  </button>
                  <button
                    onClick={() => handleClickNumber(0)}
                    className="bg-gray-200 py-2 text-sm md:text-base xl:text-lg font-semibold rounded hover:bg-gray-300"
                  >
                    0
                  </button>
                  <button
                    onClick={() => handleClickNumber("000")}
                    className="bg-blue-400 text-sm md:text-base xl:text-lg text-white py-2 rounded hover:bg-blue-500"
                  >
                    000
                  </button>
                </div>
              </div>
              <div className="flex flex-col justify-between ">
                <div className="text-right">
                  <input
                    pattern="\d*"
                    inputMode="numeric"
                    onChange={(event) => handleInputBayar(event)}
                    value={formatNumber(valInputBayar)}
                    placeholder="Bayar"
                    // autoFocus
                    className="text-sm md:text-base w-full text-right border border-colorPrimary py-2 md:py-3 px-2 font-poppins font-semibold"
                  ></input>
                  <small className="text-xs text-red-500">
                    *<i>Wajib diisi</i>
                  </small>
                </div>
                <button
                  onClick={handleDelete}
                  className="bg-yellow-400 text-sm md:text-base xl:text-lg py-2 rounded hover:bg-yellow-500"
                >
                  ⌫
                </button>
              </div>
            </div>
            <div className="mt-2 text-right">
              <input
                onChange={(event) => handleInputPelanggan(event)}
                value={valInputPelanggan}
                placeholder="Nama pelanggan"
                className="text-sm md:text-base w-full mt-1 text-right border border-colorPrimary py-2 px-2 font-poppins font-semibold"
              ></input>
              <small className="text-xs text-colorPrimary ">
                *<i>Boleh dikosongi</i>
              </small>
            </div>
          </div>
        </div>
        {/* <input type="text" name="customer" className={`border-2 border-colorBlue block mb-4 py-1 w-full px-2`} placeholder="" /> */}
        <div className="md:flex md:justify-between mt-2 md:mt-4">
          <div className="flex text-sm md:text-base justify-end md:justify-center order-2">
            <button
              onClick={() => handleHutang()}
              type="submit"
              className="text-sm mr-1 px-2 md:px-4 py-1 bg-red-600 font-poppins text-colorGray rounded-sm md:rounded-md hover:bg-red-500"
            >
              Hutang
            </button>
            <button
              onClick={() => handleDraftPensanan()}
              type="submit"
              className="text-sm mr-1 px-2 md:px-4 py-1 bg-blue-600 font-poppins text-colorGray rounded-sm md:rounded-md hover:bg-blue-500"
            >
              Buat Draft
            </button>
            <button
              onClick={() => handleStoreBayar()}
              type="submit"
              className="text-sm px-2 md:px-4 py-1 bg-colorPrimary font-poppins text-colorGray rounded-sm md:rounded-md hover:bg-blue-900"
            >
              Bayar & Cetak
            </button>
          </div>
          <button
            className="order-1 mt-3 text-sm md:text-base px-2 md:px-4 py-1 md:py-2 bg-colorGray border-2 border-colorBlue font-poppins text-black rounded-sm md:rounded-md hover:bg-slate-200"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
      {stModalDraft && (
        <ModalAddDraf
          close={handleDraftPensanan}
          cart_id={cart_id}
          inputBayar={valInputBayar}
          tagihan={tagihan}
          pelanggan={valInputPelanggan}
          ttlBayar={ttlBayar}
          deleteCart={deleteCart}
          draftStart={draftStart}
          draftEnd={draftEnd}
          draftNote={draftNote}
          closeModalPembayaran={onClose}
        />
      )}
      {stModalHutang && (
        <ModalAddHutang
          close={handleHutang}
          cart_id={cart_id}
          inputBayar={valInputBayar}
          tagihan={tagihan}
          pelanggan={valInputPelanggan}
          ttlBayar={ttlBayar}
          deleteCart={deleteCart}
          draftNote={draftNote}
          closeModalPembayaran={onClose}
        />
      )}
    </div>
  );
}

export default ModalPembayaran;
