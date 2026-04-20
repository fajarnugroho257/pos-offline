function FormatTanggal(tanggal) {
  const tanggalObj = new Date(tanggal);
  const opsiFormat = {
    day: "numeric",
    month: "long",
    year: "numeric",
  };

  return new Intl.DateTimeFormat("id-ID", opsiFormat).format(tanggalObj);
}

export default FormatTanggal;
