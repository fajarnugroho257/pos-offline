import PrintBluethootDraft from "./PrintBluethootDraft";
import PrintKabel from "./PrintKabel";

const PilihPrint = (datas, cartDraft) => {
  const pusat = localStorage.getItem("toko_pusat");
  const cabang = localStorage.getItem("cabang_nama");
  //
  const stPrinter = localStorage.getItem("printSelected");
  if (stPrinter === "bluethoot") {
    return PrintBluethootDraft(datas, pusat, cabang, cartDraft);
  } else {
    return PrintKabel(datas, pusat, cabang);
  }
};

export default PilihPrint;
