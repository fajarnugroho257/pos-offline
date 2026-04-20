import React, { useState } from "react";

function Footer(status) {
  if (status.status === "hidden") {
    return <></>;
  } else {
    return (
      // <div className="bg-colorPrimary h-full w-full flex items-center justify-end px-5">
      //   <p className="text-right font-poppins font-semibold text-xs ms:text-sm text-colorGray">
      //     POS Kasir v.1
      //   </p>
      // </div>
      <footer className="fixed bottom-0 left-0 right-0 h-[40px] bg-colorPrimary z-50 flex items-center justify-end px-4 text-white text-sm">
        <p className="text-right font-poppins font-semibold text-xs ms:text-sm text-colorGray">
          POS Kasir v.1
        </p>
      </footer>
    );
  }
}

export default Footer;
