import React, { useRef, useState } from "react";
import Select from "react-select";
import api from "../utilities/axiosInterceptor";
import { ToastContainer, toast } from "react-toastify";
import isOnline from "../utilities/isOnline";

const AsyncSelect = ({ sendDataToParent, barcodeInputRef }) => {
  // TOKEN
  const token = localStorage.getItem("token");
  const [selectedOption, setSelectedOption] = useState(null);
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [stManual, setStManual] = useState(false);
  const [stBarcode, setStBarcode] = useState(true);

  const aturInput = (pilihan) => {
    if (pilihan === "barcode") {
      setStBarcode(true);
      setStManual(false);
    } else {
      setStBarcode(false);
      setStManual(true);
    }
  };
  // Fungsi untuk menangani pencarian API berdasarkan input
  const handleInputChange = async (input) => {
    setInputValue(input);
    if (isOnline) {
      // Hanya lakukan pencarian jika panjang input lebih dari 2 karakter
      if (input.length >= 1) {
        const cabang_id = localStorage.getItem("cabang_id");
        setIsLoading(true); // Menampilkan loading
        // Lakukan pencarian ke API
        api
          .get(
            `/api-data-barang-cabang?cabang_id=${cabang_id}&query=${input}`,
            {
              headers: {
                Authorization: `Bearer ${token}`, // Menambahkan header Authorization
                "Content-Type": "application/json", // Menambahkan header Content-Type jika diperlukan
              },
            },
          )
          .then((response) => {
            const data = response.data.map((item) => ({
              value: item.id, // ID sebagai value
              label: item.name, // Nama sebagai label yang ditampilkan
            }));
            setOptions(data); // Menampilkan opsi jika ada lebih dari satu hasil
            setIsLoading(false); // Sembunyikan loading
          })
          .catch((error) => {
            console.error("Error fetching data:", error.message);
            alert("Error fetching data : " + error.message);
            setIsLoading(false); // Sembunyikan loading jika error
          });
      }
    } else {
      if (input.length >= 1) {
        setIsLoading(true);

        try {
          const cabang_id = localStorage.getItem("cabang_id");

          const allData = await getAllBarang();
          // console.log(allData);
          // console.log(cabang_id);
          const filtered = allData.filter((item) => {
            return (
              item.cabang_id == cabang_id &&
              item.barang_nama?.toLowerCase().includes(input.toLowerCase())
            );
          });
          // mapping ke format select
          const data = filtered.map((item) => ({
            value: item.barang_cabang_id,
            label: item.barang_nama,
          }));

          setOptions(data);
        } catch (error) {
          console.error(error);
          alert("Error ambil data local");
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

  const getAllBarang = () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("pos-db", 2);

      request.onsuccess = (event) => {
        const db = event.target.result;

        const tx = db.transaction("barangMaster", "readonly");
        const store = tx.objectStore("barangMaster");

        const getAllRequest = store.getAll();

        getAllRequest.onsuccess = () => {
          resolve(getAllRequest.result);
        };

        getAllRequest.onerror = () => {
          reject("Gagal ambil data");
        };
      };

      request.onerror = () => reject("DB error");
    });
  };

  // Fungsi untuk menangani perubahan nilai select
  const handleChange = (selectedOption) => {
    sendDataToParent(selectedOption ? selectedOption.value : null);
    //
    // setSelectedOption(selectedOption);
    // console.log("Selected ID:", selectedOption ? selectedOption.value : null);
    // setInputValue("");
    setOptions([]);
  };

  const [valBarcode, serValBarcode] = useState("");
  const barcodeTimer = useRef(null);
  const handleInputBarcodeChange = (input) => {
    const inputValue = input.target.value;
    if (!/^\d*$/.test(inputValue)) return;
    serValBarcode(inputValue);
    if (barcodeTimer.current) {
      clearTimeout(barcodeTimer.current);
    }
    barcodeTimer.current = setTimeout(async () => {
      if (inputValue.length < 6) return;
      try {
        const cabang_id = localStorage.getItem("cabang_id");
        const response = await api.get(
          `/api-barcode-data-barang-cabang?cabang_id=${cabang_id}&query=${inputValue}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );
        if (Object.keys(response.data).length !== 0) {
          sendDataToParent(response.data.id);
        } else {
          const audio = new Audio("sounds/new-error-sound.mp3");
          audio.volume = 1;
          audio.play();
          toast.error("Data tidak ditemukan.", {
            autoClose: 3000,
          });
        }
        serValBarcode("");
      } catch (err) {
        console.log(err);
      }
    }, 200);
  };
  // const handleInputBarcodeChange = async (input) => {
  //   const inputValue = input.target.value;
  //   if (/^\d*$/.test(inputValue)) {
  //     serValBarcode(inputValue);
  //   }
  //   const characterCount = input.target.value.length;
  //   if (characterCount >= 12) {
  //     console.log(characterCount);
  //     const cabang_id = localStorage.getItem("cabang_id");
  //     const response = await api.get(
  //       `/api-barcode-data-barang-cabang?cabang_id=${cabang_id}&query=${input.target.value}`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`, // Menambahkan header Authorization
  //           "Content-Type": "application/json", // Menambahkan header Content-Type jika diperlukan
  //           // Header lainnya bisa ditambahkan sesuai kebutuhan
  //         },
  //       },
  //     );

  //     if (Object.keys(response.data).length !== 0) {
  //       // console.log(response.data);
  //       sendDataToParent(response.data.id);
  //       serValBarcode("");
  //     } else {
  //       const audio = new Audio("sounds/error-sound.mp3");
  //       audio.volume = 1;
  //       audio.play();
  //       toast.error("Data tidak ditemukan.", {
  //         autoClose: 5000, // Durasi toast muncul dalam milidetik
  //       });
  //       serValBarcode("");
  //     }
  //   }
  // };

  return (
    <div>
      <div className="flex gap-2 md:gap-5 mb-2">
        <button
          onClick={() => aturInput("barcode")}
          className={`cursor-pointer py-1 px-2 text-xs md:text-base ${
            stBarcode ? "active" : "inactive"
          }`}
        >
          Barcode
        </button>
        <button
          onClick={() => aturInput("manual")}
          className={`cursor-pointer py-1 px-2 inactive text-xs md:text-base ${
            stManual ? "active" : "inactive"
          } `}
        >
          Manual
        </button>
      </div>
      {stManual && (
        <Select
          autoFocus
          options={options} // Menyediakan opsi dari API
          value={selectedOption} // Nilai yang dipilih
          onChange={handleChange} // Fungsi saat pilihan berubah
          onInputChange={handleInputChange} // Fungsi untuk menangani perubahan input
          placeholder="Nama Barang / Barcode..."
          isClearable // Membuat pilihan dapat dihapus
          isLoading={isLoading} // Menampilkan loading jika sedang mengambil data
          inputValue={inputValue} // Mengatur nilai input yang diketik
          cacheOptions // Menyimpan opsi yang sudah dimuat untuk mempercepat pencarian berikutnya
        />
      )}
      {stBarcode && (
        <input
          ref={barcodeInputRef}
          className="border border-colorPrimary w-full text-sm md:text-base py-1 md:py-2 px-2 rounded-sm "
          autoFocus
          value={valBarcode}
          placeholder="Barcode"
          onChange={handleInputBarcodeChange}
        ></input>
      )}
    </div>
  );
};

export default AsyncSelect;
