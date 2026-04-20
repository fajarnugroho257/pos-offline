import React, { useState } from "react";
import RupiahFormat from "../utilities/RupiahFormat";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import api from "../utilities/axiosInterceptor";

function TambahPembelian() {
  // TOKEN
  const token = localStorage.getItem("token");
  //
  const [suplier_nama, setsuplier_nama] = useState(null);
  const [suplier_tgl, setsuplier_tgl] = useState(null);
  //
  const handleSuplier_nama = (event) => {
    setsuplier_nama(event.target.value);
  };
  //
  const handleSuplier_tgl = (event) => {
    setsuplier_tgl(event.target.value);
  };

  const [inputFields, setInputFields] = useState([
    {
      pembayaran: "",
      pembelian_nama: "",
      pembelian_kotor: "",
      pembelian_potongan: "",
      pembelian_bersih: "",
      pembelian_harga: "",
      pembelian_total: "",
    },
  ]);

  const handleAddField = () => {
    setInputFields([
      ...inputFields,
      {
        pembayaran: "",
        pembelian_nama: "",
        pembelian_kotor: "",
        pembelian_potongan: "",
        pembelian_bersih: "",
        pembelian_harga: "",
        pembelian_total: "",
      },
    ]);
  };

  const handleRemoveField = (index) => {
    const values = [...inputFields];
    values.splice(index, 1);
    setInputFields(values);
  };

  const handleInputChange = (index, event) => {
    const values = [...inputFields];
    values[index][event.target.name] = event.target.value;
    setInputFields(values);
  };

  const handleInputChangePembelianKotor = (index, event) => {
    handleInputChangeHarga(index, event);
    const values = [...inputFields];
    if (event.target.name === "pembelian_kotor") {
      values[index]["pembelian_bersih"] =
        event.target.value - values[index]["pembelian_potongan"];
      //
      values[index]["pembelian_total"] =
        values[index]["pembelian_bersih"] * values[index]["pembelian_harga"];
    }
    values[index][event.target.name] = event.target.value;
    setInputFields(values);
  };

  const handleInputChangePembelianPotongan = (index, event) => {
    const values = [...inputFields];
    if (event.target.name === "pembelian_potongan") {
      values[index]["pembelian_bersih"] =
        values[index]["pembelian_kotor"] - event.target.value;
      //
      values[index]["pembelian_total"] =
        values[index]["pembelian_bersih"] * values[index]["pembelian_harga"];
    }
    values[index][event.target.name] = event.target.value;
    setInputFields(values);
  };

  const handleInputChangeHarga = (index, event) => {
    const values = [...inputFields];
    if (event.target.name === "pembelian_harga") {
      let ttl = values[index]["pembelian_bersih"] * event.target.value;
      values[index]["pembelian_total"] = ttl;
    }
    values[index][event.target.name] = event.target.value;
    setInputFields(values);
  };

  const handleSubmit = async (event) => {
    const btnValue = event.nativeEvent.submitter.value; // Mendapatkan nilai button yang di-klik
    event.preventDefault();
    const isConfirmed = window.confirm(
      "Apakah Anda yakin ingin menyimpan data ini?"
    );
    if (isConfirmed) {
      if (suplier_nama === null) {
        alert("Nama Suplier harus diisi");
        return;
      }
      if (suplier_tgl === null) {
        alert("Tanggal harus diisi");
        return;
      }
      const toastId = toast.loading("Sending data...");
      try {
        const data = { suplier_nama: suplier_nama, suplier_tgl: suplier_tgl };
        let params = {
          formData: inputFields,
          suplierData: data,
          type: btnValue,
        };
        let response = "";
        if (btnValue === "simcetak") {
          response = await api.post(`/add-Pembelian`, params, {
            headers: {
              Authorization: `Bearer ${token}`, // Sisipkan token di header
            },
            responseType: "blob", // penting untuk men-download file
          });
          // console.log(response.data);
          // Membuat URL untuk file yang didownload
          const url = window.URL.createObjectURL(new Blob([response.data]));
          // alert(url);
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", "Pembelian.png"); // Nama file untuk diunduh
          document.body.appendChild(link);
          link.click(); // Memicu download
          document.body.removeChild(link); // Menghapus link setelah download
        } else {
          response = await api.post("/add-Pembelian", params, {
            headers: {
              Authorization: `Bearer ${token}`, // Sisipkan token di header
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          });
        }
        // set null
        // console.log("Response:", response.status);
        if (response.status === 200) {
          setsuplier_nama("");
          setsuplier_tgl("");
          setInputFields([
            {
              pembayaran: "",
              pembelian_nama: "",
              pembelian_kotor: "",
              pembelian_potongan: "",
              pembelian_bersih: "",
              pembelian_harga: "",
              pembelian_total: "",
            },
          ]);
          //
          toast.update(toastId, {
            render: "Data sent successfully!",
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
      } catch (error) {
        toast.update(toastId, {
          render: "Error sending data! " + error.message,
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
        console.error("Error posting data:", error);
      }
    } else {
    }

    // console.log("inputFields:", inputFields);
  };
  const navigate = useNavigate();
  const handleTab = (event) => {
    navigate(`/${event}`);
  };

  let [number] = useState(1);

  const handleInputCheckbox = (index, event) => {
    const values = [...inputFields];
    values[index][event.target.name] = event.target.value;
    setInputFields(values);
  };

  //
  return (
    <div className="px-0 py-1 md:px-5 md:py-3 h-[86%] flex items-center">
      <div className=" w-full h-full md:w-[90%] md:h-[90%] mx-auto bg-gray-50 shadow-xl p-10 rounded-md">
        <div className="h-[5%] md:flex items-center mb-5 justify-between">
          <div className="font-poppins font-normal flex gap-4 items-center">
            <h3 className="text-colorPrimary text-lg font-bold ">Pembelian</h3>
            <h3
              className="text-gray-500 cursor-pointer border-l-2 px-2"
              onClick={() => handleTab("tambah-pengiriman")}
            >
              Pengiriman
            </h3>
            <h3
              className="text-gray-500 cursor-pointer border-l-2 px-2"
              onClick={() => handleTab("tambah-karyawan")}
            >
              Karyawan
            </h3>
            <h3
              className="text-gray-500 cursor-pointer border-l-2 px-2"
              onClick={() => handleTab("tambah-kardus")}
            >
              Kardus
            </h3>
          </div>
        </div>
        <div className="h-[2px] w-full bg-colorPrimary mb-4"></div>
        <div className="h-[94%] md:h-[95%] ">
          <form onSubmit={handleSubmit} className="max-h-[90%] overflow-y-auto">
            <div className="flex font-poppins items-center my-2">
              <p className="w-52">Nama Suplier</p>
              <p>:</p>
              <input
                className="border ml-5 w-full md:w-1/4  p-2"
                placeholder="Nama Suplier"
                name="suplier_nama"
                value={suplier_nama}
                onChange={handleSuplier_nama}
                required
              ></input>
            </div>
            <div className="flex font-poppins items-center my-2">
              <p className="w-52">Tanggal</p>
              <p>:</p>
              <input
                type="date"
                className="border ml-5 w-full md:w-1/4 p-2"
                placeholder="Nama Suplier"
                name="suplier_tgl"
                value={suplier_tgl}
                onChange={handleSuplier_tgl}
                required
              ></input>
            </div>
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr className="w-full text-white text-center font-poppins text-sm bg-colorPrimary">
                    <th className="border border-black md:w-[5%]">No</th>
                    <th className="border border-black md:w-[13%]">
                      Nama Barang
                    </th>
                    <th className="border border-black md:w-[10%]">
                      Tonase Kotor
                    </th>
                    <th className="border border-black md:w-[8%]">Potongan</th>
                    <th className="border border-black md:w-[8%]">
                      Tonase Bersih
                    </th>
                    <th className="border border-black md:w-[10%]">
                      Pembayaran
                    </th>
                    <th className="border border-black md:w-[15%]">Harga</th>
                    <th className="border border-black md:w-[15%]">Total</th>
                    <th className="border border-black md:w-[10%]"></th>
                  </tr>
                </thead>
                <tbody>
                  {inputFields.map((field, index) => (
                    <React.Fragment key={index}>
                      <tr
                        className={`text-center hover:bg-colorPrimary  ${
                          number % 2 === 0 ? "bg-gray-50" : "bg-gray-200"
                        }`}
                      >
                        <td className="border border-black">{number}</td>
                        <td className="border border-black">
                          <input
                            required
                            name="pembelian_nama"
                            className="border m-2 w-24 md:w-3/4 p-1"
                            value={field.pembelian_nama}
                            onChange={(event) =>
                              handleInputChange(index, event)
                            }
                          ></input>
                        </td>
                        <td className="border border-black">
                          <input
                            type="number"
                            className="border m-2 w-24 md:w-3/4 p-1"
                            name="pembelian_kotor"
                            value={field.pembelian_kotor}
                            onChange={(event) =>
                              handleInputChangePembelianKotor(index, event)
                            }
                            required
                            onFocus={(e) =>
                              e.target.addEventListener(
                                "wheel",
                                function (e) {
                                  e.preventDefault();
                                },
                                { passive: false }
                              )
                            }
                          ></input>
                        </td>
                        <td className="border border-black">
                          <input
                            type="number"
                            className="border m-2 w-24 md:w-3/4 p-1"
                            name="pembelian_potongan"
                            value={field.pembelian_potongan}
                            onChange={(event) =>
                              handleInputChangePembelianPotongan(index, event)
                            }
                            onFocus={(e) =>
                              e.target.addEventListener(
                                "wheel",
                                function (e) {
                                  e.preventDefault();
                                },
                                { passive: false }
                              )
                            }
                          ></input>
                        </td>
                        <td className="border border-black">
                          <input
                            className="border m-2 w-24 md:w-3/4 p-1 bg-slate-300"
                            name="pembelian_bersih"
                            value={field.pembelian_bersih}
                            readOnly
                            required
                          ></input>
                        </td>
                        <td className="border border-black">
                          <div className="flex gap-3 w-3/4 mx-auto">
                            <div>
                              <p className="text-xs font-poppins">Cash</p>
                              <input
                                type="checkbox"
                                className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded"
                                name="pembayaran"
                                value="cash"
                                onChange={(event) =>
                                  handleInputCheckbox(index, event)
                                }
                                checked={field.pembayaran === "cash"}
                                required={field.pembayaran === ""}
                              ></input>
                            </div>
                            <div>
                              <p className="text-xs font-poppins">Hutang</p>
                              <input
                                type="checkbox"
                                className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded"
                                name="pembayaran"
                                value="hutang"
                                // value={field.pembelian_harga}
                                onChange={(event) =>
                                  handleInputCheckbox(index, event)
                                }
                                checked={field.pembayaran === "hutang"}
                                required={field.pembayaran === ""}
                              ></input>
                            </div>
                          </div>
                        </td>
                        <td className="border border-black">
                          <input
                            type="number"
                            className={`border m-2 w-24 md:w-3/4 p-1`}
                            name="pembelian_harga"
                            value={field.pembelian_harga}
                            onChange={(event) =>
                              handleInputChangeHarga(index, event)
                            }
                            onFocus={(e) =>
                              e.target.addEventListener(
                                "wheel",
                                function (e) {
                                  e.preventDefault();
                                },
                                { passive: false }
                              )
                            }
                            required
                          ></input>
                        </td>
                        <td className="border border-black">
                          <input
                            type="text"
                            className="border m-2 w-24 md:w-3/4 bg-slate-300"
                            name="pembelian_total"
                            value={RupiahFormat(field.pembelian_total)}
                            readOnly
                            required
                          ></input>
                        </td>
                        <td className="border border-black">
                          {number === 1 ? (
                            <button
                              className={` bg-red-400 text-colorGray py-1 px-2 rounded-md my-2 font-sm md:font-normal`}
                              type="button"
                              disabled
                            >
                              <i className="fa fa-trash"></i>
                            </button>
                          ) : (
                            <button
                              className={` bg-red-600 text-colorGray py-1 px-2 rounded-md my-2 font-sm md:font-normal`}
                              type="button"
                              onClick={() => handleRemoveField(index)}

                              // { inputFields.length === 1 ? "" : ""}
                            >
                              <i className="fa fa-trash"></i>
                            </button>
                          )}
                        </td>
                      </tr>
                      <p className="hidden">{number++}</p>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="w-full">
              <div className="flex gap-3 justify-end">
                <button
                  className="mt-5 py-1 px-2 bg-blue-500 font-poppins text-colorGray rounded hover:bg-green-900"
                  type="submit"
                  value="simcetak"
                  name="type_submit"
                >
                  <i className="fa fa-image"></i> Simpan & Cetak
                </button>
                <button
                  className="mt-5 py-1 px-2 bg-green-700 font-poppins text-colorGray rounded hover:bg-green-900"
                  type="submit"
                  value="simpan"
                  name="type_submit"
                >
                  <i className="fa fa-save"></i> Simpan
                </button>
              </div>
            </div>
          </form>
          <div className="h-[10%]">
            <button
              className="bg-colorPrimary text-colorGray py-1 px-2 rounded-sm my-1 font-poppins text-sm"
              type="button"
              onClick={() => handleAddField()}
            >
              <i className="fa fa-plus text-sm"></i> Tambah
            </button>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default TambahPembelian;
