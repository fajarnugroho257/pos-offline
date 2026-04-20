import React from "react";
import RupiahFormat from "../utilities/RupiahFormat";
import { Link } from "react-router-dom";

const Table = ({
  data,
  loading,
  page,
  perPage,
  detailData,
  deleteData,
  handleTambahStok,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse border border-gray-200 shadow-md rounded-lg text-xs md:text-sm font-poppins">
        <thead className="bg-gray-100">
          <tr className="bg-gray-100 text-gray-700 uppercase text-xs md:text-sm font-semibold text-center">
            <th className="px-2 py-1 md:py-3 border border-gray-200">No</th>
            <th className="px-2 py-1 md:py-3 border border-gray-200">
              Nama Barang
            </th>
            <th className="px-2 py-1 md:py-3 border border-gray-200">
              Barcode
            </th>
            <th className="px-2 py-1 md:py-3 border border-gray-200">Stok</th>
            <th className="px-2 py-1 md:py-3 border border-gray-200">
              Stok Minimal
            </th>
            <th className="px-2 py-1 md:py-3 border border-gray-200">
              Harga Beli
            </th>
            <th className="px-2 py-1 md:py-3 border border-gray-200">
              Harga Jual
            </th>
            <th className="px-2 py-1 md:py-3 border border-gray-200">
              Keuntungan
            </th>
            <th className="px-2 py-1 md:py-3 border border-gray-200">Persen</th>
            <th className="px-2 py-1 md:py-3 border border-gray-200">
              Gros Harga Jual
            </th>
            <th className="px-2 py-1 md:py-3 border border-gray-200">
              Gros Keuntungan
            </th>
            <th className="px-2 py-1 md:py-3 border border-gray-200">
              Gros Persen
            </th>
            <th className="px-2 py-1 md:py-3 border border-gray-200">
              Gros Min Pembelian
            </th>
            <th className="px-2 py-1 md:py-3 border border-gray-200">AKsi</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="3" className="text-center py-4">
                Loading...
              </td>
            </tr>
          ) : data.length > 0 ? (
            data.map((item, index) => {
              const nomor = index + 1 + (page - 1) * perPage;
              return (
                <tr
                  key={item.id}
                  className="border-t hover:bg-gray-50 font-poppins text-sm"
                >
                  <td className="px-2 py-1 border border-gray-200 text-center">
                    {nomor}
                  </td>
                  <td className="px-2 py-1 border border-gray-200">
                    {item.barang_nama}
                  </td>
                  <td className="px-2 py-1 border border-gray-200 text-center">
                    {item.barang_barcode}
                  </td>
                  <td className="py-1 border border-gray-200 text-center font-bold">
                    {item.barang_stok}
                  </td>
                  <td className="px-2 py-1 border border-gray-200 text-center">
                    {item.barang_stok_minimal}
                  </td>
                  <td className="px-2 py-1 border border-gray-200 text-right">
                    {RupiahFormat(item.barang_harga_beli)}
                  </td>
                  <td className="px-2 py-1 border border-gray-200 text-right">
                    {RupiahFormat(item.barang_harga_jual)}
                  </td>
                  <td className="px-2 py-1 border border-gray-200 text-right">
                    {RupiahFormat(item.barang_keuntungan)}
                  </td>
                  <td className="px-2 py-1 border border-gray-200 text-center">
                    {item.barang_persentase}%
                  </td>
                  <td className="px-2 py-1 border border-gray-200 text-right">
                    {RupiahFormat(item.barang_grosir_harga_jual)}
                  </td>
                  <td className="px-2 py-1 border border-gray-200 text-right">
                    {RupiahFormat(item.barang_grosir_keuntungan)}
                  </td>
                  <td className="px-2 py-1 border border-gray-200 text-center">
                    {item.barang_grosir_persentase ??
                      item.barang_grosir_persentase}
                    {item.barang_grosir_persentase === null ||
                    item.barang_grosir_persentase === ""
                      ? ""
                      : "%"}
                  </td>
                  <td className="px-2 py-1 border border-gray-200 text-center">
                    {item.barang_grosir_pembelian}
                  </td>
                  <td className="px-2 py-1 border border-gray-200 text-center">
                    <div className="flex gap-1">
                      <Link
                        onClick={() => detailData(item.id)}
                        className="border border-gray-200 px-2 py-[2px]"
                      >
                        <i className="fa fa-pen my-2 text-blue-500 hover:text-blue-400"></i>
                      </Link>
                      <Link
                        onClick={() => deleteData(item.id)}
                        className="border border-gray-200 px-2 py-[2px]"
                      >
                        <i className="fa fa-trash my-2 text-red-500 hover:text-red-400"></i>
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td
                colSpan="14"
                className="px-2 py-1 border border-gray-200 text-center"
              >
                Tidak ada data
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
