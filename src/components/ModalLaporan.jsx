import React, { useState, useEffect } from "react";
import axios from "axios";
import RupiahFormat from "../utilities/RupiahFormat";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FormatTanggal from "../utilities/FormatTanggal";
import api from "../utilities/axiosInterceptor";

function ModalLaporan({ isOpen, onClose, suplier_tgl }) {
  // TOKEN
  const token = localStorage.getItem("token");
  //
  //
  const [blur, setBlur] = useState(true);
  const [suplier_nama, setsuplier_nama] = useState("");
  const [datasPembelian, setDatasPembelian] = useState([]);
  const [datasPengiriman, setDatasPengiriman] = useState([]);
  //
  const [datasPemBarang, setDatasPemBarang] = useState([]);
  const [datasPengBarang, setDatasPengBarang] = useState([]);
  //
  const [bbnKardus, setBbnKardus] = useState([]);
  //
  const endPoint = "/detail-Laporan";
  //
  useEffect(() => {
    //function "fetchData"
    let params = {
      suplier_tgl: suplier_tgl,
    };
    setBlur(true);
    const fectData = async () => {
      //fetching
      const response = await api.post(endPoint, params, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      // console.log(response.data);
      //get response data
      const pembelian = await response.data.data.pembelian;
      const pengiriman = await response.data.data.pengiriman;
      const pemBarang = await response.data.groupBarang.pemBarang;
      const pengBarang = await response.data.groupBarang.pengBarang;
      const resbbnKardus = await response.data.data.bbnKardus;
      // console.log(resbbnKardus);
      //
      if (response.status === 200) {
        setBlur(false);
      }
      //assign response data to state "posts"
      setDatasPembelian(pembelian);
      setDatasPengiriman(pengiriman);
      //
      setDatasPemBarang(pemBarang);
      setDatasPengBarang(pengBarang);
      //
      setBbnKardus(resbbnKardus);
    };
    fectData();
  }, [suplier_tgl]);
  // console.log(datasPengBarang);
  // Menghitung grand total dari semua subItems
  const grandTotalPembelian = datasPembelian.reduce((total, item) => {
    // Menambahkan jumlah dari setiap subItem
    const subTotal = item.listPembelian.reduce(
      (subTotal, subItem) => subTotal + Number(subItem.pembelian_total),
      0
    );
    return total + subTotal;
  }, 0);
  const grandTotalPengiriman = datasPengiriman.reduce((total, item) => {
    // Menambahkan jumlah dari setiap subItem
    const subTotal = item.listPengiriman.reduce(
      (subTotal, subItem) => subTotal + Number(subItem.data_total),
      0
    );
    return total + subTotal;
  }, 0);

  const grandTotalBebanKaryawan = datasPengiriman.reduce((total, item) => {
    // Menambahkan jumlah dari setiap subItem
    const subTotal = item.bebanKaryawan.reduce(
      (subTotal, subItem) => subTotal + Number(subItem.beban_value),
      0
    );
    return total + subTotal;
  }, 0);
  // console.log(grandTotalBebanKaryawan);
  const grandTotalBebanLain = datasPengiriman.reduce((total, item) => {
    // Menambahkan jumlah dari setiap subItem
    const subTotal = item.bebanLain.reduce(
      (subTotal, subItem) => subTotal + Number(subItem.beban_value),
      0
    );
    return total + subTotal;
  }, 0);
  // console.log(grandTotalBebanLain);
  const granTtlBeban = grandTotalBebanKaryawan + grandTotalBebanLain;
  //   const grandTotal = 0;
  const laba =
    grandTotalPengiriman - grandTotalPembelian - granTtlBeban - bbnKardus;
  let ttl_ops_lain = 0;
  let ttl_ops_karyawan = 0;
  //
  let ttl_group_pembelian = 0;
  let ttl_pembelian = 0;
  let ttl_pengiriman = 0;
  let selisih = 0;
  if (!isOpen) return null;
  // console.log(datasPengiriman);
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-gray-900 opacity-50"></div>
      <div className="bg-white w-[90%] md:w-[95%] h-[95%] md:h-[95%] p-6 rounded-lg shadow-lg relative z-10">
        <div className="w-full md:h-[5%]">
          <h2 className="text-md md:text-xl font-semibold mb-2  font-poppins">
            Laba / Rugi ||{" "}
            <span className="text-red-600">{FormatTanggal(suplier_tgl)}</span>
          </h2>
        </div>
        <div className="h-[2px] w-full bg-colorPrimary"></div>
        <div className="w-full h-[85%] overflow-auto text-sm md:text-md">
          <table className="font-poppins font-semibold w-full md:w-1/4 my-3">
            <tr>
              <td className="w-[25%]">Pengiriman</td>
              <td className="w-[5%]">:</td>
              <td className="text-blue-600 w-[70%] text-right">
                {RupiahFormat(grandTotalPengiriman)}
              </td>
            </tr>
            <tr>
              <td className="w-[25%]">Modal</td>
              <td className="w-[5%]">:</td>
              <td className="text-green-600 w-[70%] text-right">
                {RupiahFormat(
                  parseInt(grandTotalPembelian) +
                    parseInt(granTtlBeban) +
                    parseInt(bbnKardus)
                )}
              </td>
            </tr>
            <tr>
              <td colSpan="3">
                <hr className="fill-black" />
              </td>
            </tr>
            <tr>
              <td className="w-[25%]">Laba / Rugi</td>
              <td className="w-[5%]">:</td>
              <td className="text-red-600 w-[70%] text-right">
                {RupiahFormat(laba)}
              </td>
            </tr>
          </table>
          <div className="w-full h-fit md:grid grid-cols-2 gap-3">
            <div className="w-full">
              {/* <hr className="bg-colorPrimary py-[1px] my-3" /> */}
              <h3 className="mt-2 font-poppins font-semibold">Pembelian</h3>
              <table className="mt-2 w-full text-center font-poppins text-sm">
                <tr className="bg-colorPrimary text-white">
                  <td className="border border-black">Suplier</td>
                  <td className="border border-black">Barang</td>
                  <td className="border border-black">Kotor</td>
                  <td className="border border-black">Potongan</td>
                  <td className="border border-black">Bersih</td>
                  <td className="border border-black">Harga</td>
                  <td className="border border-black">Total</td>
                  <td className="border border-black">TTL Beli</td>
                </tr>
                {datasPembelian.length >= 1 ? (
                  datasPembelian.map((item, index) => {
                    const pembelian = item.listPembelian;
                    const pembelian_pertama =
                      item.listPembelian["0"]["pembelian_nama"];
                    const pembelian_kotor =
                      item.listPembelian["0"]["pembelian_kotor"];
                    const pembelian_bersih =
                      item.listPembelian["0"]["pembelian_bersih"];
                    const pembelian_potongan =
                      item.listPembelian["0"]["pembelian_potongan"];
                    const pembelian_harga =
                      item.listPembelian["0"]["pembelian_harga"];
                    const total_pertama =
                      item.listPembelian["0"]["pembelian_total"];
                    return (
                      <>
                        <tr
                          key={index}
                          className={`${
                            index % 2 === 0 ? "bg-gray-50" : "bg-gray-300"
                          }`}
                        >
                          <td
                            rowSpan={item.listPembelian.length}
                            className="border border-black"
                          >
                            {item.suplier_nama}
                          </td>
                          <td className="border border-black">
                            {pembelian_pertama}
                          </td>
                          <td className="border border-black">
                            {pembelian_kotor}
                          </td>
                          <td className="border border-black">
                            {pembelian_potongan}
                          </td>
                          <td className="border border-black">
                            {pembelian_bersih}
                          </td>
                          <td className="border border-black">
                            {RupiahFormat(pembelian_harga)}
                          </td>
                          <td className="border border-black">
                            {RupiahFormat(total_pertama)}
                          </td>
                          <td
                            rowSpan={item.listPembelian.length}
                            className="border border-black"
                          >
                            {RupiahFormat(item.ttlPembelian)}
                          </td>
                        </tr>
                        {pembelian &&
                          pembelian.map((pem, key) => {
                            return (
                              <>
                                {JSON.stringify(key) === "0" ? null : (
                                  <tr
                                    key={index + key}
                                    className={`${
                                      index % 2 === 0
                                        ? "bg-gray-50"
                                        : "bg-gray-300"
                                    }`}
                                  >
                                    <td className="border border-black">
                                      {pem.pembelian_nama}
                                    </td>
                                    <td className="border border-black">
                                      {pem.pembelian_kotor}
                                    </td>
                                    <td className="border border-black">
                                      {pem.pembelian_potongan}
                                    </td>
                                    <td className="border border-black">
                                      {pem.pembelian_bersih}
                                    </td>
                                    <td className="border border-black">
                                      {RupiahFormat(pem.pembelian_harga)}
                                    </td>
                                    <td className="border border-black">
                                      {RupiahFormat(pem.pembelian_total)}
                                    </td>
                                  </tr>
                                )}
                              </>
                            );
                          })}
                      </>
                    );
                  })
                ) : (
                  <tr>
                    <td className="boder border-black">Data tidak ditemukan</td>
                  </tr>
                )}
                <tr>
                  <td
                    className="border border-black text-right font-semibold px-1"
                    colSpan="7"
                  >
                    Grand Total
                  </td>
                  <td className="border border-black font-semibold text-green-600">
                    {RupiahFormat(grandTotalPembelian)}
                  </td>
                </tr>
              </table>
            </div>
            <div className="w-full">
              {/* <hr className="bg-colorPrimary py-[1px] my-3" /> */}
              <h3 className="mt-2 font-poppins font-semibold">Pengiriman</h3>
              <table className="mt-2 w-full text-center font-poppins text-sm">
                <tr className="bg-colorPrimary text-white">
                  <td className="border border-black">Merek</td>
                  <td className="border border-black">Nama Barang</td>
                  <td className="border border-black">Kardus</td>
                  <td className="border border-black">Tonase</td>
                  <td className="border border-black">Harga</td>
                  <td className="border border-black">Total</td>
                </tr>
                {datasPengiriman.length >= 1 ? (
                  datasPengiriman.map((item, index) => {
                    const pembelian = item.listPengiriman;
                    const data_barang = item.listPengiriman["0"]["data_barang"];
                    const data_merek = item.listPengiriman["0"]["data_merek"];
                    const data_box = item.listPengiriman["0"]["data_box"];
                    const data_tonase = item.listPengiriman["0"]["data_tonase"];
                    const data_harga = item.listPengiriman["0"]["data_harga"];
                    const total_pertama =
                      item.listPengiriman["0"]["data_total"];
                    return (
                      <>
                        <tr
                          key={index}
                          className={`${
                            index % 2 === 0 ? "bg-gray-50" : "bg-gray-300"
                          }`}
                        >
                          <td className="border border-black">{data_merek}</td>
                          <td className="border border-black">{data_barang}</td>
                          <td className="border border-black">{data_box}</td>
                          <td className="border border-black">{data_tonase}</td>
                          <td className="border border-black">
                            {RupiahFormat(data_harga)}
                          </td>
                          <td className="border border-black">
                            {RupiahFormat(total_pertama)}
                          </td>
                        </tr>
                        {pembelian &&
                          pembelian.map((pem, key) => {
                            return (
                              <>
                                {JSON.stringify(key) === "0" ? null : (
                                  <tr
                                    y={index + key}
                                    className={`${
                                      key % 2 === 0
                                        ? "bg-gray-50"
                                        : "bg-gray-300"
                                    }`}
                                  >
                                    <td className="border border-black">
                                      {pem.data_merek}
                                    </td>
                                    <td className="border border-black">
                                      {pem.data_barang}
                                    </td>
                                    <td className="border border-black">
                                      {pem.data_box}
                                    </td>
                                    <td className="border border-black">
                                      {pem.data_tonase}
                                    </td>
                                    <td className="border border-black">
                                      {RupiahFormat(pem.data_harga)}
                                    </td>
                                    <td className="border border-black">
                                      {RupiahFormat(pem.data_total)}
                                    </td>
                                  </tr>
                                )}
                              </>
                            );
                          })}
                      </>
                    );
                  })
                ) : (
                  <tr>
                    <td className="boder border-black">Data tidak ditemukan</td>
                  </tr>
                )}
                <tr>
                  <td
                    className="border border-black font-semibold text-right px-1"
                    colSpan="5"
                  >
                    Grand Total
                  </td>
                  <td className="border border-black font-semibold text-blue-600">
                    {RupiahFormat(grandTotalPengiriman)}
                  </td>
                </tr>
              </table>
            </div>
            {/* tabel group by nama */}
            <div className="w-full">
              {/* <hr className="bg-colorPrimary py-[1px] my-3" /> */}
              <h3 className="mt-2 font-poppins font-semibold">
                Group Barang Pembelian
              </h3>
              <table className="mt-2 w-full text-center font-poppins text-sm">
                <tr className="bg-colorPrimary text-white">
                  <td className="border border-black">Nama Barang</td>
                  <td className="border border-black">Tonase Kotor</td>
                  <td className="border border-black">Total</td>
                </tr>
                {datasPemBarang.length >= 1 ? (
                  datasPemBarang.map((item, index) => {
                    ttl_group_pembelian += parseInt(item.ttlGroupTotal);
                    return (
                      <>
                        <tr
                          key={index}
                          className={`${
                            index % 2 === 0 ? "bg-gray-50" : "bg-gray-300"
                          }`}
                        >
                          <td className="border border-black">
                            {item.pembelian_nama}
                          </td>
                          <td className="border border-black">
                            {item.ttlGroupBarang}
                          </td>
                          <td className="border border-black">
                            {RupiahFormat(item.ttlGroupTotal)}
                          </td>
                        </tr>
                      </>
                    );
                  })
                ) : (
                  <tr>
                    <td className="boder border-black">Data tidak ditemukan</td>
                  </tr>
                )}
                <tr>
                  <td className="border border-black" colSpan="2">
                    Total
                  </td>
                  <td className="border border-black font-bold font-poppins text-green-600">
                    {RupiahFormat(ttl_group_pembelian)}
                  </td>
                </tr>
              </table>
            </div>
            {/* tabel group by nama */}
            <div className="w-full">
              {/* <hr className="bg-colorPrimary py-[1px] my-3" /> */}
              <h3 className="mt-2 font-poppins font-semibold">
                Group Barang Pengiriman
              </h3>
              <table className="mt-2 w-full text-center text-sm font-poppins">
                <tr className="bg-colorPrimary text-white">
                  <td className="border border-black">Nama Barang</td>
                  <td className="border border-black">Tonase Pembelian</td>
                  <td className="border border-black">Tonase pengiriman</td>
                  <td className="border border-black">Status</td>
                </tr>
                {datasPengBarang.length >= 1 ? (
                  datasPengBarang.map((item, index) => {
                    ttl_pembelian += parseInt(item.pembelian);
                    ttl_pengiriman += parseInt(item.pengiriman);
                    selisih = ttl_pembelian - ttl_pengiriman;
                    return (
                      <>
                        <tr
                          key={index}
                          className={`${
                            index % 2 === 0 ? "bg-gray-50" : "bg-gray-300"
                          }`}
                        >
                          <td className="border border-black">{item.barang}</td>
                          <td className="border border-black">
                            {item.pembelian}
                          </td>
                          <td className="border border-black">
                            {item.pengiriman}
                          </td>
                          <td className="border border-black font-poppins text-sm">
                            {parseInt(item.pembelian) <
                            parseInt(item.pengiriman) ? (
                              <span className="">
                                {parseInt(item.pembelian) -
                                  parseInt(item.pengiriman)}
                                <i className="ml-1 fa fa-arrow-right text-green-500"></i>
                              </span>
                            ) : (
                              <span className="">
                                {parseInt(item.pembelian) -
                                  parseInt(item.pengiriman)}
                                <i className="ml-1 fa fa-arrow-down text-red-500"></i>
                              </span>
                            )}
                          </td>
                        </tr>
                      </>
                    );
                  })
                ) : (
                  <tr>
                    <td className="boder border-black">Data tidak ditemukan</td>
                  </tr>
                )}
                <tr className="font-semibold font-poppins">
                  <td className="border border-black">Total</td>
                  <td className="border border-black">{ttl_pembelian}</td>
                  <td className="border border-black">{ttl_pengiriman}</td>
                  <td className="border border-black font-poppins text-sm">
                    {ttl_pengiriman > ttl_pembelian ? (
                      <span className="">
                        {selisih}
                        <i className="ml-1 fa fa-arrow-up text-green-500"></i>
                      </span>
                    ) : (
                      <span className="">
                        {selisih}
                        <i className="ml-1 fa fa-arrow-down text-red-500"></i>
                      </span>
                    )}
                  </td>
                </tr>
              </table>
            </div>
            <div>
              <h1 className="font-poppins text-lg text-colorPrimary font-semibold">
                Total Operasional :{" "}
                {RupiahFormat(parseInt(granTtlBeban) + parseInt(bbnKardus))}
              </h1>
            </div>
            <div></div>
            <div className="w-full">
              {/* <hr className="bg-colorPrimary py-[1px] my-3" /> */}
              <h3 className="mt-2 font-poppins font-semibold">
                Operasional Karyawan
              </h3>
              <table className="mt-2 w-full text-center text-sm font-poppins">
                <tr key="Operasional" className="bg-colorPrimary text-white">
                  <td className="border border-black">Nama</td>
                  <td className="border border-black">Nilai</td>
                </tr>
                {datasPengiriman.length >= 1 ? (
                  datasPengiriman.map((item, index) => {
                    const { bebanKaryawan } = item;
                    return bebanKaryawan.map((item_beban, index_2) => {
                      ttl_ops_karyawan += parseInt(item_beban.beban_value, 10);
                      return (
                        <tr key={`${index}-${index_2}`}>
                          <td className="border border-black">
                            {item_beban.karyawan.karyawan_nama}
                          </td>
                          <td className="border border-black">
                            {RupiahFormat(item_beban.beban_value)}
                          </td>
                        </tr>
                      );
                    });
                  })
                ) : (
                  <tr>
                    <td className="boder border-black">Data tidak ditemukan</td>
                  </tr>
                )}
                <tr className="">
                  <td className="border border-black font-semibold">Total</td>
                  <td className="border border-black font-semibold">
                    {RupiahFormat(ttl_ops_karyawan)}
                  </td>
                </tr>
              </table>
            </div>
            <div className="w-full">
              {/* <hr className="bg-colorPrimary py-[1px] my-3" /> */}
              <h3 className="mt-2 font-poppins font-semibold">
                Operasional Lainnya
              </h3>
              <div className="w-full flex gap-4">
                <div className="w-1/2">
                  <table className="mt-2 w-full text-center text-sm font-poppins">
                    <tr
                      key="Operasional"
                      className="bg-colorPrimary text-white"
                    >
                      <td className="border border-black">Nama</td>
                      <td className="border border-black">Nilai</td>
                    </tr>
                    {datasPengiriman.length >= 1 ? (
                      datasPengiriman.map((item, index) => {
                        const { bebanLain } = item;
                        return bebanLain.map((item_beban, index_2) => {
                          ttl_ops_lain += parseInt(item_beban.beban_value, 10);
                          return (
                            <tr key={`${index}-${index_2}`}>
                              <td className="border border-black">
                                {item_beban.beban_nama}
                              </td>
                              <td className="border border-black">
                                {RupiahFormat(item_beban.beban_value)}
                              </td>
                            </tr>
                          );
                        });
                      })
                    ) : (
                      <tr>
                        <td className="boder border-black">
                          Data tidak ditemukan
                        </td>
                      </tr>
                    )}
                    <tr className="">
                      <td className="border border-black font-semibold">
                        Total
                      </td>
                      <td className="border border-black font-semibold">
                        {RupiahFormat(ttl_ops_lain)}
                      </td>
                    </tr>
                  </table>
                </div>
                <div className="w-1/2">
                  <table className="mt-2 w-full text-center font-poppins text-sm">
                    <tr className="bg-colorPrimary text-white">
                      <td className="border border-black font-semibold">
                        Kardus
                      </td>
                      <td className="border border-black font-semibold">
                        {RupiahFormat(bbnKardus)}
                      </td>
                    </tr>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full h-[5%] mt-2">
          <div className="flex justify-end">
            <button
              className="px-2 py-1 bg-colorGray border-2 border-colorPrimary font-poppins text-colorPrimary rounded hover:bg-slate-200"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModalLaporan;
