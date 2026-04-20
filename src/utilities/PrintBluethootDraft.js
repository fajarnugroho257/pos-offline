import { connectSavedPrinter } from "./printerCharacteristic.js";
import dayjs from "dayjs";
import "dayjs/locale/id";

const PrintBluethoot = async (
  cart_data,
  pusat,
  cabang,
  cartDraft
) => {
  //
  function padCenter(text, width, padChar = " ") {
    let padding = width - text.length;
    let padStart = Math.floor(padding / 2);
    let padEnd = padding - padStart;
    return padChar.repeat(padStart) + text + padChar.repeat(padEnd);
  }

  function formatRupiah(angka) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    })
      .format(angka)
      .replace(/\s+/g, "");
  }

  const formaOnlytDate = (dateString) => {
      const date = dayjs(dateString).locale("id");
      return date.format("DD MMM YYYY");
    };

  try {
    // ESC/POS Commands
    // const ESC = "\x1B";
    // const fontSmall = `${ESC}!\x01`; // Ukuran font kecil
    const printDatas = cart_data;
    // Format tabel dengan padding
    const pusat_nama = pusat;
    const cabang_nama = cabang;
    //
    const now = new Date();
    //
    let content = padCenter(pusat_nama, 30, " ") + "\n";
    content += padCenter(cabang_nama, 30, " ") + "\n";
    content += padCenter(`${now.toLocaleString()}`, 30, " ") + "\n";
    // 
    content +=  "\n";
    content += padCenter("Pelanggan", 30, " ") + "\n";

    content += "=============================" + "\n";
    let pelanggan = (cartDraft?.draft_pelanggan ?? "").toString().padStart(16, " ");
    content += `| Pelanggan  ${pelanggan}|\n`;
    let start = formaOnlytDate(cartDraft.draft_start).padStart(16, " ");
    content += `| Pembuatan  ${start}|\n`;
    let end = formaOnlytDate(cartDraft.draft_end).padStart(20, " ");
    content += `| Kirim  ${end}|\n`;
    let ttlBelanja = formatRupiah(cartDraft.draft_uang_tagihan).padStart(14, " ");
    content += `| Ttl Belanja  ${ttlBelanja}|\n`;
    let muka = formatRupiah(cartDraft.draft_uang_muka).padStart(16, " ");
    content += `| Uang Muka  ${muka}|\n`;
    let sisa = formatRupiah(cartDraft.draft_uang_sisa).padStart(15, " ");
    content += "=============================" + "\n";
    content += `| Kekurangan  ${sisa}|\n`;
    // 
    content +=  "\n";
    content += padCenter("Pembelian", 30, " ") + "\n";
    // 
    content += "=============================" + "\n";
    content += "| Item     |Qty| Price       |" + "\n";
    content += "=============================" + "\n";

    let ttlsSubTotal = 0;
    // 
    printDatas.forEach((item) => {
      ttlsSubTotal += parseInt(item.cart_subtotal);
      let nama = item.cart_nama;
      let cart_diskon = item.cart_diskon === "yes" ? " (Gros)" : "";
      let qty = String(item.cart_qty).padStart(3, " "); // lebar tetap
      let harga = `${formatRupiah(item.cart_harga_jual)}`.padEnd(8, " ");
      let subTotal = `${formatRupiah(item.cart_subtotal)}`.padStart(10, " ");
      content += `| ${nama}${cart_diskon}\n| ${harga} | ${qty} | ${subTotal}|\n`;
    });
    content += "=============================" + "\n";
    content +=
      "| Total".padEnd(13, " ") +
      `${formatRupiah(ttlsSubTotal)}`.padStart(15, " ") +
      " |\n";
    content += "=============================" + "\n";
    content += padCenter("Terimakasih", 30, " ") + "\n\n";
    console.log(content);
    // const printData = new TextEncoder().encode(content);
    const printData = new TextEncoder().encode(content + "\n\n");

    // Hubungkan ke perangkat Bluetooth
    // const device = await navigator.bluetooth.requestDevice({
    //   acceptAllDevices: true,
    //   optionalServices: ["000018f0-0000-1000-8000-00805f9b34fb"],
    // });

    // console.log("Perangkat ditemukan:", device.name);

    // const server = await device.gatt.connect();
    // const service = await server.getPrimaryService(
    //   "000018f0-0000-1000-8000-00805f9b34fb"
    // );
    // const characteristic = await service.getCharacteristic(
    //   "00002af1-0000-1000-8000-00805f9b34fb"
    // );

    const characteristic = await connectSavedPrinter();
    // console.log(characteristic);
    // Kirim data ke printer
    // await characteristic.writeValue(printData);
    // mambagi dua
    function chunkArrayBuffer(buffer, chunkSize) {
      let chunks = [];
      for (let i = 0; i < buffer.byteLength; i += chunkSize) {
        chunks.push(buffer.slice(i, i + chunkSize));
      }
      return chunks;
    }

    async function sendDataInChunks(characteristic, data) {
      const chunkSize = 64; // Kurangi ukuran chunk
      const chunks = chunkArrayBuffer(data, chunkSize);

      for (const chunk of chunks) {
        // await characteristic.writeValue(chunk);
        await characteristic.writeValueWithoutResponse(chunk);
        await new Promise((resolve) => setTimeout(resolve, 80)); // Tambah jeda waktu
      }
    }
    // end membagi dua
    await sendDataInChunks(characteristic, printData);

    console.log("Nota berhasil dicetak yaa.");
  } catch (error) {
    console.error("Gagal mencetak nota:", error);
  }
};

export default PrintBluethoot;
