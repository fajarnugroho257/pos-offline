import React, { useState, useEffect } from "react";
import { getToken } from "../utilities/Auth";
import { toast } from "react-toastify";
import api from "../utilities/axiosInterceptor";
import RupiahFormat from "../utilities/RupiahFormat";
import { swalConfirm, swalError, swalSuccess } from "../utilities/Swal";

function ModalDelete({ isOpen, cartId, stateTable, setStModalDelete }) {
  //
  const [notaData, setNotaData] = useState([]);
  const [trans, setTrans] = useState([]);
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
      }
      // console.log(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    detailNota();
  }, []);

  //
  let grandTotal = 0;
  const handleDelete = async (event) => {
    event.preventDefault();
    const result = await swalConfirm(
      "Apakah anda yakin akan menghapus data ini? ",
      "Silahkan pastikan terlebih dahulu",
    );
    if (result.isConfirmed) {
      try {
        const token = getToken();
        const params = { cart_id: cartId };
        const response = await api.post(`delete-transaksi`, params, {
          headers: {
            Authorization: `Bearer ${token}`, // Sisipkan token di header
          },
        });
        if (response.data.success) {
          setStModalDelete(false);
          stateTable();
          swalSuccess("Sukses", response.data.message);
        } else {
          swalError("Opps..!", response.data.message);
        }
        console.log(notaData);
      } catch (error) {}
    }
  };

  const hanldeClose = () => {
    setStModalDelete(false);
  };
  //
  if (!isOpen) return null;
  return (
    <>
      {notaData.length >= 1 && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-gray-900 opacity-50"></div>
          <div className="bg-white w-[90%] md:w-1/2 h-auto p-6 rounded-lg shadow-lg relative z-10">
            <h2 className="text-lg md:text-xl font-bold mb-4 text-red-600 font-poppins">
              Delete Pembelian
            </h2>
            <div className="h-[2px] w-full bg-colorPrimary mb-4"></div>
            <div className="w-full overflow-auto">
              <table className="min-w-full border-collapse border border-gray-200 shadow-md rounded-lg text-xs md:text-base font-poppins">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 uppercase text-sm font-semibold text-center">
                    <th className="px-1 py-3 border border-gray-200">No</th>
                    <th className="px-1 py-3 border border-gray-200">
                      Nama Barang
                    </th>
                    <th className="px-1 py-3 border border-gray-200">Harga</th>
                    <th className="px-1 py-3 border border-gray-200">Jumlah</th>
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
                onClick={handleDelete}
                type="submit"
                className="px-2 md:px-4 py-1 md:py-2 bg-red-600 font-poppins text-colorGray rounded hover:bg-red-500"
              >
                <i className="fa fa-trash"></i> Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ModalDelete;
