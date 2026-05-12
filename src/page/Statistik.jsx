import React, { useState, useEffect, useRef } from "react";
import { Link, Navigate } from "react-router-dom";
import api from "../utilities/axiosInterceptor";
import { getToken } from "../utilities/Auth";
import RupiahFormat from "../utilities/RupiahFormat";
import dayjs from "dayjs";
import Highcharts from "highcharts";
import { HighchartsReact } from "highcharts-react-official";
import {
  swalError,
  swalLoading,
  swalSuccessAutoClose,
} from "../utilities/Swal";
// import ModalOmset from "../components/statistik/ModalOmset";

const Statistik = () => {
  const [dataTransaksi, setDataTransaksi] = useState([]);
  const [transMonth, setTransMonth] = useState([]);
  const [tanggal, setTanggal] = useState({
    start: "",
    end: "",
  });
  const [active, setActive] = useState("pendapatan");
  const chartRef = useRef(null);

  // get data
  const getDataTransaksi = async (start, end) => {
    swalLoading("Silahkan tunggu...", "Sedang mendapatkan data");
    try {
      const params = { start: start, end: end };
      const token = getToken();
      const response = await api.post(`get-data-statistik`, params, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDataTransaksi(response.data.data || []);
      const dataTransMonth = response.data.tranMonth || [];
      //
      const pendapatan = dataTransMonth.map((item) => item.pendapatan);
      const tanggal = dataTransMonth.map((item) =>
        formaOnlytDate(item.tanggal),
      );
      const transaksi = dataTransMonth.map((item) => item.jlh_transaksi);
      const laba = dataTransMonth.map((item) => item.laba);
      console.log(pendapatan);
      setTransMonth({
        pendapatan: pendapatan,
        tanggal: tanggal,
        transaksi: transaksi,
        laba: laba,
      });

      swalSuccessAutoClose("Berhasil", "Data berhasil didapatkan", 500);
    } catch (error) {
      swalError(
        "Opps..!",
        error?.response?.data?.message || error.message || "Terjadi kesalahan",
      );
    }
  };

  const reloadGetDataTransaksi = () => {
    const savedTanggal = localStorage.getItem("filterTanggal");
    // const today = new Date().toISOString().split("T")[0];
    let tanggalFix;
    if (savedTanggal) {
      tanggalFix = JSON.parse(savedTanggal);
    } else {
      tanggalFix = getDefaultTanggal();
      localStorage.setItem("filterTanggal", JSON.stringify(tanggalFix));
    }
    setTanggal(tanggalFix);
    getDataTransaksi(tanggalFix.start, tanggalFix.end);
  };

  useEffect(() => {
    reloadGetDataTransaksi();
  }, []);

  const formaOnlytDate = (dateString) => {
    const date = dayjs(dateString).locale("id");
    return date.format("DD MMM YYYY");
  };

  const handleCari = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const start = formData.get("start");
    const end = formData.get("end");
    const dataTanggal = { start, end };
    localStorage.setItem("filterTanggal", JSON.stringify(dataTanggal));
    // simpan ke state
    setTanggal(dataTanggal);
    getDataTransaksi(start, end);
    // fetch data
  };

  const formatDateLocal = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const getDefaultTanggal = () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return {
      start: formatDateLocal(firstDay),
      end: formatDateLocal(lastDay),
    };
  };

  const handleReset = () => {
    let tanggalFix = getDefaultTanggal();
    localStorage.setItem("filterTanggal", JSON.stringify(tanggalFix));
    setTanggal({ start: tanggalFix.start, end: tanggalFix.end });
    reloadGetDataTransaksi();
  };

  const optionsKotor = {
    title: {
      text: "Grafik Pendapatan Kotor",
      align: "left",
    },
    yAxis: {
      title: {
        text: "Dalam Rupiah",
      },
    },

    xAxis: {
      categories: transMonth.tanggal, // Nama bulan
      title: {
        text: "Month",
      },
    },

    legend: {
      layout: "vertical",
      align: "right",
      verticalAlign: "middle",
    },

    series: [
      {
        name: "Pendapatan",
        data: transMonth.pendapatan,
      },
    ],
    tooltip: {
      valuePrefix: "Rp. ",
      valueDecimals: 0, // Tidak ada desimal
      valueSuffix: "", // Tambahkan jika perlu
    },
    responsive: {
      rules: [
        {
          condition: {
            maxWidth: 500,
          },
          chartOptions: {
            legend: {
              layout: "horizontal",
              align: "center",
              verticalAlign: "bottom",
            },
          },
        },
      ],
    },
  };

  const optionsLaba = {
    title: {
      text: "Grafik Laba Bersih",
      align: "left",
    },
    yAxis: {
      title: {
        text: "Dalam Rupiah",
      },
    },

    xAxis: {
      categories: transMonth.tanggal, // Nama bulan
      title: {
        text: "Month",
      },
    },

    legend: {
      layout: "vertical",
      align: "right",
      verticalAlign: "middle",
    },

    series: [
      {
        name: "Laba",
        data: transMonth.laba,
      },
    ],
    tooltip: {
      valuePrefix: "Rp. ",
      valueDecimals: 0, // Tidak ada desimal
      valueSuffix: "", // Tambahkan jika perlu
    },
    responsive: {
      rules: [
        {
          condition: {
            maxWidth: 500,
          },
          chartOptions: {
            legend: {
              layout: "horizontal",
              align: "center",
              verticalAlign: "bottom",
            },
          },
        },
      ],
    },
  };

  const optionsTransaksi = {
    title: {
      text: "Grafik Transaksi",
      align: "left",
    },
    yAxis: {
      title: {
        text: "Transaksi",
      },
    },

    xAxis: {
      categories: transMonth.tanggal, // Nama bulan
      title: {
        text: "Month",
      },
    },

    legend: {
      layout: "vertical",
      align: "right",
      verticalAlign: "middle",
    },

    series: [
      {
        name: "Transaksi",
        data: transMonth.transaksi,
      },
    ],
    // tooltip: {
    //   valuePrefix: "",
    //   valueDecimals: 0, // Tidak ada desimal
    //   valueSuffix: "", // Tambahkan jika perlu
    // },
    responsive: {
      rules: [
        {
          condition: {
            maxWidth: 500,
          },
          chartOptions: {
            legend: {
              layout: "horizontal",
              align: "center",
              verticalAlign: "bottom",
            },
          },
        },
      ],
    },
  };

  const menus = [
    { key: "pendapatan", label: "Pendapatan Kotor" },
    { key: "laba", label: "Laba" },
    { key: "transaksi", label: "Transaksi" },
    // { key: "barang", label: "Barang Paling Laku" },
    // { key: "stok", label: "Stok Minim" },
  ];

  return (
    <>
      <div className="">
        <div className="h-full overflow-auto px-4 py-12 md:py-14 md:px-5">
          {/* <div className="flex justify-end">
            <div className="flex justify-end">
              <Link
                to={"/dashboard"}
                className="font-poppins rounded-sm bg-colorPrimary text-white px-2 py-1 text-xs md:text-sm"
              >
                <i className="fa fa-arrow-left"></i> Home
              </Link>
            </div>
          </div>
          <form onSubmit={handleCari}>
            <div className="my-3 flex gap-1 md:gap-2 justify-end">
              <input
                type="date"
                name="start"
                value={tanggal.start}
                onChange={(e) =>
                  setTanggal({ ...tanggal, start: e.target.value })
                }
                className="border px-1 py-1 text-xs md:text-sm lg:text-base text-center"
              />
              <input
                type="date"
                name="end"
                value={tanggal.end}
                onChange={(e) =>
                  setTanggal({ ...tanggal, end: e.target.value })
                }
                className="border px-1 py-1 text-xs md:text-sm lg:text-base text-center"
              />
              <Link
                onClick={handleReset}
                className="bg-red-600 hover:bg-red-500 text-white px-3 rounded-sm text-xs md:text-sm lg:text-base flex items-center"
              >
                <i className="fa fa-times"></i>
              </Link>
              <button
                type="submit"
                className="bg-colorPrimary hover:bg-colorPrimaryHover text-white px-3 rounded-sm text-xs md:text-sm lg:text-base"
              >
                <i className="fa fa-search"></i>{" "}
                <span className="hidden md:inline">Cari</span>
              </button>
            </div>
          </form> */}
          <form onSubmit={handleCari}>
            <div className="flex justify-end my-3">
              <div className="flex gap-1 md:gap-2 justify-end">
                <input
                  type="date"
                  name="start"
                  value={tanggal.start}
                  onChange={(e) =>
                    setTanggal({ ...tanggal, start: e.target.value })
                  }
                  className="border px-1 py-1 text-xs md:text-sm lg:text-base text-center"
                />
                <input
                  type="date"
                  name="end"
                  value={tanggal.end}
                  onChange={(e) =>
                    setTanggal({ ...tanggal, end: e.target.value })
                  }
                  className="border px-1 py-1 text-xs md:text-sm lg:text-base text-center"
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
          <div className="min-w-full border-collapse border border-gray-200 shadow-md rounded-lg text-xs md:text-sm font-poppins">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
              <div className="bg-gray-700 text-white rounded-xl shadow">
                <div className="p-5">
                  <h1 className="text-3xl font-bold">
                    {RupiahFormat(dataTransaksi.ttlPendapatanKotor ?? 0)}
                  </h1>
                  <p className="text-sm mt-2 opacity-80">
                    Pendapatan Kotor / Omset
                  </p>
                </div>
                <div className="bg-gray-800 px-5 py-3 flex justify-center items-center gap-2 cursor-pointer hover:bg-gray-900">
                  Selengkapnya →
                </div>
              </div>

              <div className="bg-cyan-600 text-white rounded-xl shadow">
                <div className="p-5">
                  <h1 className="text-3xl font-bold">
                    {RupiahFormat(dataTransaksi.resTransRupiah ?? 0)}
                  </h1>
                  <p className="text-sm mt-2 opacity-80">
                    Pendapatan / Uang diterima (termasuk uang muka)
                  </p>
                </div>
                <div className="bg-cyan-700 px-5 py-3 flex justify-center items-center gap-2 cursor-pointer hover:bg-cyan-800">
                  Selengkapnya →
                </div>
              </div>

              <div className="bg-red-500 text-white rounded-xl shadow">
                <div className="p-5">
                  <h1 className="text-3xl font-bold">
                    {RupiahFormat(dataTransaksi.resPiutang ?? 0)}
                  </h1>
                  <p className="text-sm mt-2 opacity-80">
                    Piutang ke pelanggan
                  </p>
                </div>
                <div className="bg-red-600 px-5 py-3 flex justify-center items-center gap-2 cursor-pointer hover:bg-red-700">
                  Selengkapnya →
                </div>
              </div>

              <div className="bg-yellow-400 text-gray-900 rounded-xl shadow">
                <div className="p-5">
                  <h1 className="text-3xl font-bold">
                    {RupiahFormat(dataTransaksi.ttlBeli ?? 0)}
                  </h1>
                  <p className="text-sm mt-2">Harga Pokok Penjualan</p>
                </div>
                <div className="bg-yellow-500 px-5 py-3 flex justify-center items-center gap-2 cursor-pointer hover:bg-yellow-600">
                  Selengkapnya →
                </div>
              </div>

              <div className="bg-green-600 text-white rounded-xl shadow">
                <div className="p-5">
                  <h1 className="text-3xl font-bold">
                    {RupiahFormat(dataTransaksi.ttlLaba ?? 0)}
                  </h1>
                  <p className="text-sm mt-2 opacity-80">Laba Bersih</p>
                </div>
                <div className="bg-green-700 px-5 py-3 flex justify-center items-center gap-2 cursor-pointer hover:bg-green-800">
                  Selengkapnya →
                </div>
              </div>

              <div className="bg-gray-200 text-gray-800 rounded-xl shadow">
                <div className="p-5">
                  <h1 className="text-3xl font-bold">
                    {dataTransaksi.transaksi ?? 0}
                  </h1>
                  <p className="text-sm mt-2">Transaksi</p>
                </div>
                <div className="bg-gray-300 px-5 py-3 flex justify-center items-center gap-2 cursor-pointer hover:bg-gray-400">
                  Selengkapnya →
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="border-b flex gap-6 text-gray-500">
                {menus.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setActive(item.key)}
                    className={`px-4 py-2 transition ${
                      active === item.key
                        ? "border border-b-0 rounded-t-lg bg-white text-gray-800"
                        : "hover:text-blue-600"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div
                ref={chartRef}
                className="p-4 bg-white border rounded-b-lg overflow-auto"
              >
                {active === "pendapatan" && (
                  <div>
                    <HighchartsReact
                      highcharts={Highcharts}
                      options={optionsKotor}
                    />
                  </div>
                )}
                {active === "laba" && (
                  <div>
                    <HighchartsReact
                      highcharts={Highcharts}
                      options={optionsLaba}
                    />
                  </div>
                )}
                {active === "transaksi" && (
                  <div>
                    <HighchartsReact
                      highcharts={Highcharts}
                      options={optionsTransaksi}
                    />
                  </div>
                )}
                {/* {active === "barang" && <div>Isi Barang Paling Laku</div>}
                {active === "stok" && <div>Isi Stok Minim</div>} */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Statistik;
