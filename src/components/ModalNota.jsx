import React, { useState, useEffect } from "react";
import axios from "axios";
import RupiahFormat from "../utilities/RupiahFormat";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../utilities/axiosInterceptor";
import FormatTanggal from "../utilities/FormatTanggal";

function ModalNota({ isOpen, nota_id, isClose }) {
  // TOKEN
  const token = localStorage.getItem("token");
  //
  //
  let number = 1;
  const [blur, setBlur] = useState(true);
  let [grandTtlPembelian, setGrandTtlPembelian] = useState("0");
  const [bayarValue, setBayarValue] = useState("");
  const [bayarEditValue, setBayarEditValue] = useState("");
  const [dataBayar, setDataBayar] = useState([]);
  const [bayarId, setBayarId] = useState();
  const [stEdit, setstEdit] = useState(true);
  const [notaSt, setNotaSt] = useState("no");
  const [datasPembelian, setPembelian] = useState([]);
  const [saveBayar, setSaveBayar] = useState(false);

  const handleInputChange = (event) => {
    const name = event.target.name;
    const val = event.target.value;
    if (name === "bayar_value") {
      setBayarValue(val);
    }
    if (name === "edit_bayar_value") {
      setBayarEditValue(val);
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Jakarta",
    }).format(date);
  };

  //
  const fectData = async () => {
    const toastId = toast.loading("Getting data...");
    const response = await api.get(`/detail-draft-nota/${nota_id}`, {
      headers: {
        Authorization: `Bearer ${token}`, // Sisipkan token di header
      },
    });
    if (response.status === 200) {
      toast.update(toastId, {
        render: "Data telah diperbaharui !",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
      setGrandTtlPembelian(response.data.ttl_pembelian.grand_ttl_pembelian);
      setDataBayar(response.data.data.nota_bayar);
      setNotaSt(response.data.data.nota_st);
      setPembelian(response.data.pembelian.nota_data);
      console.log(response.data.pembelian.nota_data);
      setBlur(false);
    } else {
      toast.update(toastId, {
        render: "Error getting data!" + response.status,
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
    }
  };
  useEffect(() => {
    //
    fectData();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (bayarValue === 0 || bayarValue === null) {
      alert("Nilai harus diisi");
      return;
    }
    // alert(bayarValue);
    try {
      setSaveBayar(false);
      let params = {
        bayarValue: bayarValue,
        notaId: nota_id,
      };
      const response = await api.post("/add-bayar-nota", params, {
        headers: {
          Authorization: `Bearer ${token}`, // Sisipkan token di header
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      // set null
      // console.log("Response:", response.status);
      if (response.status === 200) {
        fectData();
        setBayarValue("");
      } else {
        alert(response.status);
      }
    } catch (error) {
      alert(error.response.data.message);
      console.error("Error updating data:", error);
    }
  };
  const handleDelete = async (id) => {
    const isConfirmed = window.confirm(
      "Apakah Anda yakin ingin menghapus data ini?"
    );
    if (isConfirmed) {
      try {
        let params = {
          id: id,
        };
        const response = await api.post("/delete-bayar-nota", params, {
          headers: {
            Authorization: `Bearer ${token}`, // Sisipkan token di header
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });
        // set null
        // console.log("Response:", response.status);
        if (response.status === 200) {
          fectData();
        }
      } catch (error) {
        alert(error.response.data.message);
      }
    }
  };
  const handleEdit = async (id) => {
    setBayarId(id);
    try {
      let params = {
        id: id,
      };
      const response = await api.post("/show-bayar-nota", params, {
        headers: {
          Authorization: `Bearer ${token}`, // Sisipkan token di header
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      // set null
      // console.log("Response:", response.status);
      if (response.status === 200) {
        // fectData();
        setBayarEditValue(response.data.data.bayar_value);
        setstEdit(false);
      }
    } catch (error) {
      alert(error.response.data.message);
    }
  };
  const handleEditSubmit = async (event) => {
    event.preventDefault();
    if (bayarValue === 0 || bayarValue === null) {
      alert("Nilai harus diisi");
      return;
    }
    // alert(bayarValue);
    try {
      setSaveBayar(false);
      let params = {
        bayarValue: bayarEditValue,
        notaId: nota_id,
        id: bayarId,
      };
      const response = await api.post("/edit-proses-bayar-nota", params, {
        headers: {
          Authorization: `Bearer ${token}`, // Sisipkan token di header
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      // set null
      // console.log("Response:", response.status);
      if (response.status === 200) {
        fectData();
        setBayarId("");
        setBayarEditValue("");
        setstEdit(true);
      } else {
        alert(response.status);
      }
    } catch (error) {
      alert(error.response.data.message);
      console.error("Error updating data:", error);
    }
  };
  const renderRow = (key, val, temp_sisa, number) => {
    return (
      <>
        <tr
          key={key + val}
          className={`${number % 2 === 0 ? "bg-gray-50" : "bg-gray-200"}`}
        >
          <td className="border border-black text-center">
            {/* {RupiahFormat(grandTtlPembelian)} */}
          </td>
          <td className="border border-black text-center">
            {RupiahFormat(val.bayar_value)}
          </td>
          <td className="border border-black text-center">
            {formatDate(val.updated_at)}
          </td>
          <td className="border border-black text-center">
            <div className="flex gap-2 justify-center">
              <i
                onClick={() => handleEdit(val.id)}
                className="fa fa-pen text-green-500 cursor-pointer"
              ></i>
              <i
                onClick={() => handleDelete(val.id)}
                className="fa fa-trash text-red-500 cursor-pointer"
              ></i>
            </div>
          </td>
        </tr>
        <tr
          key={key}
          className={`${number % 2 === 0 ? "bg-gray-50" : "bg-gray-200"}`}
        >
          <td className="border border-black text-center">
            {RupiahFormat(temp_sisa)}
          </td>
          <td className="border border-black text-center"></td>
          <td className="border border-black text-center"></td>
          <td className="border border-black text-center"></td>
        </tr>
      </>
    );
  };

  const handleLunas = async (nota_st) => {
    // alert(nota_id);
    const isConfirmed = window.confirm(
      "Apakah Anda yakin akan merubah status pelunasan ?"
    );
    if (isConfirmed) {
      try {
        setSaveBayar(false);
        let params = {
          nota_id: nota_id,
          nota_st: nota_st,
        };
        const response = await api.post("/update-bayar-nota", params, {
          headers: {
            Authorization: `Bearer ${token}`, // Sisipkan token di header
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });
        // set null
        if (response.status === 200) {
          isClose();
        } else {
          alert(response.status);
        }
      } catch (error) {
        alert(error.response.data.message);
        console.error("Error updating data:", error);
      }
    }
  };
  let ttl_harga = 0;
  let ttl_total = 0;
  let no = 0;
  let ttlPembelian = 0;

  // PRINT
  const handlePrint = async () => {
    try {
      // ESC/POS Commands
      const ESC = "\x1B";
      const fontSmall = `${ESC}!\x01`; // Ukuran font kecil
      const fontNormal = `${ESC}!\x00`; // Ukuran font normal

      // Data nota
      // const supplier = dataSuplier.suplier_nama;
      // const tanggal = FormatTanggal(dataSuplier.suplier_tgl);
      const items = datasPembelian;
      // console.log(items);
      const currentDateTime = getCurrentDateTime(); // Ambil tanggal dan jam sekarang
      const grandTotal = items.reduce((grandSum, item) => {
        const supplierTotal = item.suplier.pembelian.reduce(
          (sum, pembelian) => sum + parseInt(pembelian.pembelian_total, 10),
          0
        );
        return grandSum + supplierTotal;
      }, 0);
      // console.log(grandTotal);
      // Format kolom
      const columnWidths = [6, 7, 8, 7]; // Lebar kolom untuk nama, tonase, dan harga

      // Format header
      const header =
        `${fontSmall}` + // Atur font kecil
        "Putra Cabe\n------------------------\n" +
        // `Supplier    : ${supplier}\n` +
        // `Tanggal     : ${tanggal}\n` +
        `Nota Cetak  : ${currentDateTime[0]}\n` + // Tambahkan tanggal dan jam sekarang
        `Nota Jam    : ${currentDateTime[1]}\n` + // Tambahkan tanggal dan jam sekarang
        "-------------------------------\n";
      // formatRow(["Brg", "Ton", "Harga", "Total"], columnWidths) +
      // "\n" +
      // "-------------------------------\n";

      // console.log(item.suplier.suplier_tgl)
      // Format isi tabel
      const rows = items
        .flatMap((item) => {
          const headerRow = formatRow(
            [FormatTanggal(item.suplier.suplier_tgl)],
            columnWidths
          );
          // Format pembelian untuk setiap suplier
          const pembelianRows = item.suplier.pembelian.map((item2) =>
            formatRow(
              [
                item2.pembelian_nama,
                item2.pembelian_kotor + "|" + item2.pembelian_bersih,
                formatRupiah(parseInt(item2.pembelian_harga)),
                formatRupiah(parseInt(item2.pembelian_total)),
              ],
              columnWidths
            )
          );
          // Gabungkan header dengan detail pembelian
          return [headerRow, ...pembelianRows];
        })
        .join("\n");

      // Format footer
      const footer =
        "-------------------------------\n" +
        formatRow(["Gr Tot", "", "", formatRupiah(grandTotal)], columnWidths) +
        "\n-------------------------------\n\n";
      const rows_2 = dataBayar
        .map((val) => {
          let temp_sisa = grandTtlPembelian - val.bayar_value;
          grandTtlPembelian = temp_sisa;
          number++;
          return formatRow([temp_sisa, val.bayar_value], columnWidths);
        })
        .join("\n");
      // Gabungkan semuanya
      // const nota = header + rows + "\n" + footer;
      const nota =
        `${fontSmall}` +
        header +
        rows +
        "\n" +
        footer +
        rows_2 +
        `${fontSmall}`; // Kembalikan ke font normal jika perlu

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
  // END PRINT
  if (!isOpen) return null;
  // console.log(datasPengiriman);
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-gray-900 opacity-50"></div>
      <div className="bg-white w-[90%] md:w-[85%] md:h-[85%] h-3/4 p-6 rounded-lg shadow-lg relative z-10">
        <div className="w-full h-[10%]">
          <h2 className="text-xl font-semibold mb-2 text-colorPrimary font-poppins">
            Bayar / Nitip Pembelian
          </h2>
          <div className="h-[2px] w-full bg-colorPrimary mb-4"></div>
        </div>
        <div className="w-full h-[80%] overflow-auto">
          <table
            className={`border font-poppins bg-colorPrimary text-gray-700 text-xs md:text-sm w-full ${
              blur ? "blur-sm" : "blur-none"
            }`}
          >
            <thead>
              <tr className="text-center h-14 text-white" key="head-pembelian">
                <th className="border border-black w-[5%]">No</th>
                <th className="border border-black w-[10%]">Suplier</th>
                <th className="border border-black w-[10%]">Tanggal</th>
                <th className="border border-black w-[12%]">Nama Barang</th>
                <th className="border border-black w-[9%]">Tonase Kotor</th>
                <th className="border border-black w-[5%]">Potongan</th>
                <th className="border border-black w-[9%]">Tonase Bersih</th>
                <th className="border border-black w-[11%]">Harga</th>
                <th className="border border-black w-[11%]">Total</th>
              </tr>
            </thead>
            <tbody key="t-body-pembelian">
              {datasPembelian &&
                datasPembelian.map((nota_data, index) => {
                  let pembeli = nota_data.suplier.pembelian;
                  let ttlpem = pembeli.length;
                  no++;
                  return (
                    <>
                      <tr
                        key={nota_data.nota_id}
                        className={`${
                          no % 2 === 0 ? "bg-gray-50" : "bg-gray-300"
                        }`}
                      >
                        <td
                          className="border border-black text-center"
                          rowSpan={ttlpem}
                        >
                          {no}
                        </td>
                        <td
                          className="border border-black text-center"
                          rowSpan={ttlpem}
                        >
                          {nota_data.suplier.suplier_nama}
                        </td>
                        <td
                          className="border border-black text-center py-1 px-2"
                          rowSpan={ttlpem}
                        >
                          {FormatTanggal(nota_data.suplier.suplier_tgl)}
                        </td>
                        <td className="border border-black text-center py-1 px-2">
                          {pembeli[0]["pembelian_nama"]}
                        </td>
                        <td className="border border-black text-center py-1 px-2">
                          {pembeli[0]["pembelian_kotor"]}
                        </td>
                        <td className="border border-black text-center py-1 px-2">
                          {pembeli[0]["pembelian_potongan"]}
                        </td>
                        <td className="border border-black text-center py-1 px-2">
                          {pembeli[0]["pembelian_bersih"]}
                        </td>
                        <td className="border border-black text-right py-1 px-2">
                          {RupiahFormat(pembeli[0]["pembelian_harga"])}
                        </td>
                        <td className="border border-black text-right py-1 px-2">
                          {RupiahFormat(pembeli[0]["pembelian_total"])}
                        </td>
                      </tr>
                      {pembeli.map((pemb, inxpem) => {
                        ttlPembelian += parseInt(pemb.pembelian_total);
                        if (inxpem !== 0) {
                          return (
                            <tr
                              key={nota_data.nota_id}
                              className={`${
                                no % 2 === 0 ? "bg-gray-50" : "bg-gray-300"
                              }`}
                            >
                              <td className="border border-black text-center py-1 px-2">
                                {pemb.pembelian_nama}
                              </td>
                              <td className="border border-black text-center py-1 px-2">
                                {pemb.pembelian_kotor}
                              </td>
                              <td className="border border-black text-center py-1 px-2">
                                {pemb.pembelian_potongan}
                              </td>
                              <td className="border border-black text-center py-1 px-2">
                                {pemb.pembelian_bersih}
                              </td>
                              <td className="border border-black text-right py-1 px-2">
                                {RupiahFormat(pemb.pembelian_harga)}
                              </td>
                              <td className="border border-black text-right py-1 px-2">
                                {RupiahFormat(pemb.pembelian_total)}
                              </td>
                            </tr>
                          );
                        } else {
                          return null;
                        }
                      })}
                    </>
                  );
                })}
              <tr>
                <td
                  colSpan="8"
                  className="border border-black text-right py-1 px-2"
                >
                  TOTAL
                </td>
                <td className="border border-black text-right py-1 px-2">
                  {RupiahFormat(ttlPembelian)}
                </td>
              </tr>
            </tbody>
          </table>
          <div className="grid grid-cols-2 gap-3">
            <div className="my-2 flex justify-between">
              <div className="text-xs">
                {notaSt === "no" ? (
                  <button
                    onClick={() => handleLunas("yes")}
                    className="bg-green-500 text-white font-poppins py-1 px-2 rounded-sm"
                  >
                    <i className="fa fa-check"></i> Lunas
                  </button>
                ) : (
                  <button
                    onClick={() => handleLunas("no")}
                    className="bg-red-500 text-white font-poppins py-1 px-2 rounded-sm"
                  >
                    <i className="fa fa-times"></i> Batalkan Pelunasan
                  </button>
                )}
              </div>
              <div className="text-xs">
                <button
                  onClick={handlePrint}
                  className="bg-yellow-500 text-white font-poppins py-1 px-2 rounded-sm"
                >
                  <i className="fa fa-print"></i> Cetak
                </button>
              </div>
            </div>
            <div></div>
            <table
              className={`border font-poppins bg-colorPrimary text-gray-700 text-xs md:text-sm  w-full  ${
                blur ? "blur-sm" : "blur-none"
              }`}
            >
              <thead>
                <tr key="table3" className="text-center h-14 text-white">
                  <th className="border border-black w-[30%]">Sisa Hutang</th>
                  <th className="border border-black w-[30%]">Bayar / Cicil</th>
                  <th className="border border-black w-[25%]">Update</th>
                  <th className="border border-black w-[15%]">Aksi</th>
                </tr>
                <tr
                  className={`${
                    number % 2 === 0 ? "bg-gray-50" : "bg-gray-200"
                  }`}
                >
                  <td className="border border-black text-center">
                    {RupiahFormat(grandTtlPembelian)}
                  </td>
                  <td className="border border-black text-center"></td>
                  <td className="border border-black text-center"></td>
                  <td className="border border-black text-center"></td>
                </tr>
                {dataBayar &&
                  dataBayar.map((val, key) => {
                    let temp_sisa = grandTtlPembelian - val.bayar_value;
                    grandTtlPembelian = temp_sisa;
                    number++;
                    return renderRow(key, val, temp_sisa, number);
                  })}
              </thead>
            </table>
            <div className="">
              <div className="">
                <h2 className="font-poppins">Bayar / Cicil</h2>
                <form onSubmit={handleSubmit}>
                  <div className="flex font-poppins gap-4 mt-1 items-center">
                    {/* <label>Bayar</label> */}
                    <input
                      className="border border-black px-2 py-1 w-32 md:w-full"
                      name="bayar_value"
                      required
                      value={bayarValue}
                      type="number"
                      onChange={(event) => handleInputChange(event)}
                    ></input>
                    <button
                      type="submit"
                      className="bg-blue-400 py-1 px-2 text-white rounded-sm"
                    >
                      Simpan
                    </button>
                  </div>
                </form>
              </div>
              <div className={`${stEdit ? "hidden" : "block"} mt-5 `}>
                <h2 className="font-poppins">Ubah</h2>
                <form onSubmit={handleEditSubmit}>
                  <div className="flex font-poppins gap-4 mt-1 items-center">
                    {/* <label>Bayar</label> */}
                    <input
                      className="border border-black px-2 py-1 w-32 md:w-full"
                      name="edit_bayar_value"
                      value={bayarEditValue}
                      type="number"
                      onChange={(event) => handleInputChange(event)}
                    ></input>
                    <button
                      type="submit"
                      className="bg-green-400 py-1 px-2 text-white rounded-sm"
                    >
                      Ubah
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full h-[10%]">
          <div className="flex justify-end">
            <button
              className="px-4 py-2 bg-colorGray border-2 border-colorPrimary font-poppins text-colorPrimary rounded hover:bg-slate-200"
              onClick={() => isClose()}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModalNota;
