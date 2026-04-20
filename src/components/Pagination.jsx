import React from "react";

const Pagination = ({ page, lastPage, onPageChange }) => {
  const getPages = () => {
    const pages = [];
    const delta = 2; // jumlah halaman di sekitar current

    const rangeStart = Math.max(2, page - delta);
    const rangeEnd = Math.min(lastPage - 1, page + delta);

    // selalu tampilkan halaman 1
    pages.push(1);

    // ellipsis awal
    if (rangeStart > 2) {
      pages.push("...");
    }

    // halaman tengah
    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i);
    }

    // ellipsis akhir
    if (rangeEnd < lastPage - 1) {
      pages.push("...");
    }

    // selalu tampilkan halaman terakhir
    if (lastPage > 1) {
      pages.push(lastPage);
    }

    return pages;
  };

  const pages = getPages();

  return (
    <div className="flex items-center justify-end gap-2 mt-2 flex-wrap">
      {/* Prev */}
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-100"
      >
        Prev
      </button>

      {/* Pages */}
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={i} className="px-2 text-gray-500">
            ...
          </span>
        ) : (
          <button
            type="button"
            key={i}
            onClick={() => onPageChange(p)}
            className={`px-3 py-1 rounded-lg text-sm border 
              ${
                p === page
                  ? "bg-colorPrimary text-white border-blue-500"
                  : "hover:bg-colorPrimaryHover hover:text-white"
              }`}
          >
            {p}
          </button>
        ),
      )}

      {/* Next */}
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page === lastPage}
        className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-100"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
