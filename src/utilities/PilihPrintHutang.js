import PrintBluethootHutang from "./PrintBluethootHutang";
import PrintKabel from "./PrintKabel";

const PilihPrintHutang = (datas, cartDraft) => {
  const pusat = localStorage.getItem("toko_pusat");
  const cabang = localStorage.getItem("cabang_nama");
  //
  const stPrinter = localStorage.getItem("printSelected");
  if (stPrinter === "bluethoot") {
    return PrintBluethootHutang(datas, pusat, cabang, cartDraft);
  } else {
    return PrintKabel(datas, pusat, cabang);
  }
};

export default PilihPrintHutang;
