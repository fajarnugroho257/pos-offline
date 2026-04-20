import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import FormatTanggal from "../utilities/FormatTanggal";
import RupiahFormat from "../utilities/RupiahFormat";
import api from "../utilities/axiosInterceptor";

function ModalPreview({ isOpen, onClose, suplier_id }) {
  // TOKEN
  const token = localStorage.getItem("token");
  //
  const [dataSuplier, setDataSuplier] = useState([]);
  const [dataPembelian, setDataPembelian] = useState([]);
  //
  useEffect(() => {
    const toastId = toast.loading("Getting data...");
    const fectData = async () => {
      //fetching
      const response = await api.get(`/detail-Pembelian/${suplier_id}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Sisipkan token di header
        },
      });
      if (response.status === 200) {
        setDataSuplier(response.data.data);
        setDataPembelian(response.data.data.listPembelian);
        //
        toast.update(toastId, {
          render: "Data getting successfully!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      } else {
        toast.update(toastId, {
          render: "Error sending data!" + response.status,
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
      }
    };
    //panggil method "fetchData"
    fectData();
  }, [suplier_id]);
  //
  const handlePrint = async () => {
    try {
      // ESC/POS Commands
      const ESC = "\x1B";
      const fontSmall = `${ESC}!\x01`; // Ukuran font kecil
      const fontNormal = `${ESC}!\x00`; // Ukuran font normal

      // Data nota
      const supplier = dataSuplier.suplier_nama;
      const tanggal = FormatTanggal(dataSuplier.suplier_tgl);
      const items = dataPembelian;
      const currentDateTime = getCurrentDateTime(); // Ambil tanggal dan jam sekarang
      //   console.log(supplier);
      //   console.log(tanggal);
      //   console.log(items);
      const grandTotal = items.reduce(
        (sum, item) => sum + parseInt(item.pembelian_total),
        0
      );

      // Format kolom
      const columnWidths = [6, 7, 8, 7]; // Lebar kolom untuk nama, tonase, dan harga

      // Format header
      const header =
        `${fontSmall}` + // Atur font kecil
        "Putra Cabe\n------------------------\n" +
        `Supplier    : ${supplier}\n` +
        `Tanggal     : ${tanggal}\n` +
        `Nota Cetak  : ${currentDateTime[0]}\n` + // Tambahkan tanggal dan jam sekarang
        `Nota Jam    : ${currentDateTime[1]}\n` + // Tambahkan tanggal dan jam sekarang
        "-------------------------------\n" +
        formatRow(["Brg", "Ton", "Harga", "Total"], columnWidths) +
        "\n" +
        "-------------------------------\n";

      // Format isi tabel
      const rows = items
        .map((item) =>
          formatRow(
            [
              item.pembelian_nama,
              item.pembelian_kotor.toString() +
                "|" +
                item.pembelian_bersih.toString(),
              formatRupiah(parseInt(item.pembelian_harga)),
              formatRupiah(parseInt(item.pembelian_total)),
            ],
            columnWidths
          )
        )
        .join("\n");

      // Format footer
      const footer =
        "-------------------------------\n" +
        formatRow(["Gr Tot", "", "", formatRupiah(grandTotal)], columnWidths) +
        "\n-------------------------------\n\n";

      // Gabungkan semuanya
      // const nota = header + rows + "\n" + footer;
      const nota =
        `${fontSmall}` + header + rows + "\n" + footer + `${fontSmall}`; // Kembalikan ke font normal jika perlu

      console.log(nota); // Debug: lihat output di konsol

      // Kirim ke printer thermal
      const printData = new TextEncoder().encode(nota);

      // Hubungkan ke perangkat Bluetooth
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ["000018f0-0000-1000-8000-00805f9b34fb"],
      });

      console.log("Perangkat ditemukan:", device.name);

      const server = await device.gatt.connect();
      const service = await server.getPrimaryService(
        "000018f0-0000-1000-8000-00805f9b34fb"
      );
      const characteristic = await service.getCharacteristic(
        "00002af1-0000-1000-8000-00805f9b34fb"
      );

      // Kirim data ke printer
      await characteristic.writeValue(printData);

      console.log("Nota berhasil dicetak.");
    } catch (error) {
      console.error("Gagal mencetak nota:", error);
    }
    // console.log(response);
  };

  function getCurrentDateTime() {
    const now = new Date();
    const options = {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    const tanggal = now.toLocaleDateString("id-ID", options); // Format: "Kamis, 16 November 2024"
    const jam = now.toLocaleTimeString("id-ID"); // Format: "13:45:30" atau sesuai lokal
    // return `${tanggal} ${jam}`;
    return [tanggal, jam];
  }

  // Fungsi untuk memformat baris teks
  function formatRow(columns, columnWidths) {
    return columns
      .map((col, index) => {
        const width = columnWidths[index];
        return col.toString().padEnd(width, " "); // Tambahkan spasi untuk alignment
      })
      .join(" ");
  }

  // Fungsi untuk memformat angka ke rupiah
  function formatRupiah(angka) {
    return `Rp${angka.toLocaleString("id-ID")}`;
  }
  //
  let grand_total = 0;
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-gray-900 opacity-50"></div>
      <div className="bg-white w-3/4 md:w-[30%] h-[50%] p-6 rounded-lg shadow-lg relative z-10">
        <div className="w-full h-[10%]">
          <h2 className="text-xl font-semibold mb-2 text-colorPrimary font-poppins">
            Preview Nota
          </h2>
          <div className="h-[2px] w-full bg-colorPrimary mb-4"></div>
        </div>
        <div className="w-full h-[80%] overflow-auto font-poppins text-sm">
          <table className=" my-3 w-full">
            <tr>
              <td className="">Suplier</td>
              <td className="">:</td>
              <td className="">{dataSuplier.suplier_nama}</td>
            </tr>
            <tr>
              <td className="">Tanggal</td>
              <td className="">:</td>
              <td className="">
                {dataSuplier.suplier_tgl &&
                  FormatTanggal(dataSuplier.suplier_tgl)}
              </td>
            </tr>
          </table>
          {/*  */}
          <table className=" my-3 w-full" id="myTable">
            <thead>
              <tr className="text-center">
                <th className="border border-black py-1 px-2">Nama Barang</th>
                <th className="border border-black py-1 px-2">Tonase</th>
                <th className="border border-black py-1 px-2">Harga</th>
                <th className="border border-black py-1 px-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {dataPembelian &&
                dataPembelian.map((value, index) => {
                  grand_total += parseInt(value.pembelian_total);
                  return (
                    <tr>
                      <td className="border border-black py-1 px-2">
                        {value.pembelian_nama}
                      </td>
                      <td className="border border-black py-1 px-2 text-center">
                        {value.pembelian_kotor} | {value.pembelian_bersih}
                      </td>
                      <td className="border border-black py-1 px-2 text-right">
                        {RupiahFormat(value.pembelian_harga)}
                      </td>
                      <td className="border border-black py-1 px-2 text-right">
                        {RupiahFormat(value.pembelian_total)}
                      </td>
                    </tr>
                  );
                })}
              <tr className="font-semibold">
                <td
                  className="border border-black py-1 px-2 text-right"
                  colSpan="3"
                >
                  Grand Total
                </td>
                <td className="border border-black py-1 px-2 text-right">
                  {RupiahFormat(grand_total)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="w-full h-[10%]">
          <div className="flex justify-between">
            <button
              className="px-4 py-2 bg-colorPrimary font-poppins text-white rounded"
              onClick={handlePrint}
            >
              Cetak
            </button>
            <button
              className="px-4 py-2 bg-colorGray border-2 border-colorPrimary font-poppins text-colorPrimary rounded hover:bg-slate-200"
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

export default ModalPreview;
