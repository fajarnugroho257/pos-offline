import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../utilities/axiosInterceptor";
import Booking from "./Booking";
import { swalConfirm } from "../utilities/Swal";
import PilihPrintDraft from "../utilities/PilihPrintDraft";

function ModalAddDraf({
  close,
  cart_id,
  inputBayar,
  tagihan,
  pelanggan,
  ttlBayar,
  deleteCart,
  draftStart,
  draftEnd,
  draftNote,
  closeModalPembayaran,
}) {
  // TOKEN
  const token = localStorage.getItem("token");
  const [totitem, setTotItem] = useState(0);
  const statusTransaksi = "booking";
  const [form, setForm] = useState({
    cart_id: cart_id,
    cart_st: statusTransaksi,
    trans_pelanggan: pelanggan,
    draft_uang_muka: inputBayar,
    draft_uang_sisa: tagihan - inputBayar,
    draft_start: draftStart,
    draft_end: draftEnd,
    draft_note: draftNote,
    draft_st: "yes",
    ttlBayar: ttlBayar,
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Fungsi untuk memformat angka menjadi format Rupiah
  const formatRupiah = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Update total bayar dari backend
  useEffect(() => {
    getGrandTotalByCartId();
  }, []);
  //
  const getGrandTotalByCartId = async () => {
    try {
      //fetching
      const params = { cart_id: cart_id };
      const response = await api.post("/get-cart-subtotal-draft", params, {
        headers: {
          Authorization: `Bearer ${token}`, // Sisipkan token di header
        },
      });
      if (response.status === 200) {
        //get response data
        const draftItem = await response.data.total_item;
        setTotItem(draftItem);
      } else {
        console.log(response.status);
      }
    } catch (err) {
      console.log(err);
    }
  };
  //
  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await swalConfirm(
      "Yakin ?",
      "Apakah Anda yakin ingin menyimpan data ini?",
    );
    if (result.isConfirmed) {
      const toastId = toast.loading("Sending data...");
      try {
        const response = await api.post("/create-draft-pembelian", form, {
          headers: {
            Authorization: `Bearer ${token}`, // Sisipkan token di header
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });
        //
        // console.log(response.data);
        if (response.data.success) {
          // delete cart
          close();
          closeModalPembayaran();
          deleteCart();
          toast.update(toastId, {
            render: `${response.data.message}`,
            type: "success",
            isLoading: false,
            autoClose: 2000,
          });
          // cetak
          PilihPrintDraft(
            response.data.cartData,
            response.data.cartDraft,
          )
        } else {
          toast.update(toastId, {
            render: `${response.data.message}`,
            type: "error",
            isLoading: false,
            autoClose: 2000,
          });
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

  const formatNumber = (number) => {
    return new Intl.NumberFormat("id-ID").format(number);
  };

  const handleUangMuka = (event) => {
    // const val = event.target.value;
    let input = event.target.value.replace(/\./g, "");
    if (/^\d*$/.test(input)) {
      let res = Number(input);
      setForm((prev) => ({
        ...prev,
        draft_uang_muka: res,
        draft_uang_sisa: tagihan - res,
      }));
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-gray-900 opacity-50"></div>
      <div className="bg-white w-[90%] md:w-1/2 h-auto p-4 md:p-6 rounded-lg shadow-lg relative z-10">
        <h2 className="text-lg md:text-xl font-bold mb-2 md:mb-4 text-black font-poppins">
          Draft Penjualan
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="h-[2px] w-full bg-colorPrimary mb-2 md:mb-4"></div>
          <div className="grid grid-rows mb-2">
            <small>
              Total pembayaran :{" "}
              <span className="text-red-700 font-bold">
                {formatRupiah(tagihan)}
              </span>
            </small>
            <small>
              Total item :{" "}
              <span className="text-red-700 font-bold">{totitem}</span>
            </small>
          </div>
          <div className="grid gap-1 md:gap-2">
            <div className="text-xs md:text-base flex items-center">
              <label className="font-semibold w-full text-xs md:text-sm">
                Nama Customer
              </label>
              <div className="w-full">
                <input
                  type="text"
                  name="trans_pelanggan"
                  value={form.trans_pelanggan}
                  placeholder="Nama customer"
                  className="border px-3 py-2 w-full"
                  onChange={handleChange}
                />
                <br />
                <small className="text-green-500">*optional</small>
              </div>
            </div>
            <div className="text-xs md:text-base flex items-center">
              <label className="font-semibold w-full text-xs md:text-sm">
                Uang Muka
              </label>
              <div className="w-full">
                <input
                  type="text"
                  onChange={(event) => handleUangMuka(event)}
                  value={formatNumber(form.draft_uang_muka)}
                  name="draft_uang_muka"
                  placeholder="Uang Muka"
                  className="border px-3 py-2 w-full"
                />
                <small className="text-green-500">*optional</small>
              </div>
            </div>
            <div className="text-xs md:text-base flex items-center">
              <label className="font-semibold w-full text-xs md:text-sm">
                Kekurangan
              </label>
              <div className="w-full">
                <input
                  type="text"
                  value={formatNumber(form.draft_uang_sisa.toString())}
                  disabled
                  placeholder="Kekurangan"
                  className="border px-3 py-2 w-full"
                />
              </div>
            </div>
            <div className="text-xs md:text-base flex items-center">
              <label className="font-semibold w-full text-xs md:text-sm">
                Tanggal Pembuatan
              </label>
              <div className="w-full">
                <input
                  type="date"
                  name="draft_start"
                  value={form.draft_start}
                  required
                  className="border px-3 py-2 w-full"
                  onChange={handleChange}
                />
                <small className="text-red-500">*wajib</small>
              </div>
            </div>
            <div className="text-xs md:text-base flex items-center">
              <label className="font-semibold w-full text-xs md:text-sm">
                Tanggal Pengiriman
              </label>
              <div className="w-full">
                <input
                  type="date"
                  name="draft_end"
                  value={form.draft_end}
                  required
                  className="border px-3 py-2 w-full"
                  onChange={handleChange}
                />
                <small className="text-red-500">*wajib</small>
              </div>
            </div>
            <div className="text-xs md:text-base flex items-center">
              <label className="font-semibold w-full text-xs md:text-sm">
                Catatan
              </label>
              <div className="w-full">
                <textarea
                  name="draft_note"
                  id=""
                  value={form.draft_note}
                  rows={3}
                  className="border px-3 py-2 w-full"
                  onChange={handleChange}
                ></textarea>
                {/* <textarea type="date" name="draft_end" required className="border px-3 py-2 w-full" onChange={handleChange} /> */}
                {/* <small className="text-red-500">*wajib</small> */}
              </div>
            </div>
          </div>
          <div className="flex justify-between mt-5">
            <button
              onClick={close}
              className="px-2 md:px-4 py-1 md:py-2 bg-colorGray border-2 border-colorBlue font-poppins text-black rounded hover:bg-slate-200"
            >
              Close
            </button>
            <button
              type="submit"
              className="px-2 md:px-4 py-1 md:py-2 text-sm md:text-base bg-blue-600 font-poppins text-colorGray rounded hover:bg-blue-500"
            >
              <i className="fa fa-save"></i> Simpan Draft
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalAddDraf;
