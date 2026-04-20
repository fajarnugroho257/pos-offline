import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

export const swalSuccess = (title, text) => {
  return MySwal.fire({
    icon: "success",
    title: title,
    text: text,
    confirmButtonText: "OK",
  });
};

export const swalError = (title, text) => {
  return MySwal.fire({
    icon: "error",
    title: title,
    text: text,
    confirmButtonText: "OK",
  });
};

export const swalConfirm = (title, text) => {
  return MySwal.fire({
    icon: "warning",
    title: title,
    text: text,
    showCancelButton: true,
    confirmButtonText: "Ya",
    cancelButtonText: "Batal",
  });
};

export const swalLoading = (title, text) => {
  Swal.fire({
    title: title,
    text: text,
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });
};

// Success auto close
export const swalSuccessAutoClose = (title, text, timer) => {
  Swal.fire({
    icon: "info",
    title: title,
    text: text,
    showConfirmButton: false,
    timer: timer,
  });
};
