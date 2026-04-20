import React, { useState } from "react";

import Header from "../components/Header";
import Modal from "../components/ModalPembayaran";
import DraftPembayaran from "../components/DraftPembayaran";

function Pembayaran() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="h-screen">
      <div className="h-[7%]">
        <Header />
      </div>
      <div className="px-5 py-3 h-[93%]">
        <div className="md:flex h-full">
          <div className="left w-full md:w-[70%]">
            <div className="w-full h-[22%] overflow-hidden">
              <h3 className="text-colorPrimary font-semibold text-2xl font-poppins">
                Pembayaran
              </h3>
              <input type="date" />
              <div className="pt-2 pb-4">
                <input
                  type="text"
                  className="bg-transparent font-normal outline-none border-2 rounded-lg font-poppins border-colorPrimary px-1 py-2"
                  placeholder="keyword"
                />
              </div>
            </div>
            <div className="w-full h-[78%] overflow-y-scroll">
              <DraftPembayaran />
              <DraftPembayaran />
              <DraftPembayaran />
              <DraftPembayaran />
              <DraftPembayaran />
              <DraftPembayaran />
              <DraftPembayaran />
              <DraftPembayaran />
              <DraftPembayaran />
              <DraftPembayaran />
              <DraftPembayaran />
              <DraftPembayaran />
              <DraftPembayaran />
              <DraftPembayaran />
            </div>
          </div>
          <div className="hidden md:block h-full bg-colorPrimary w-1 mx-2"></div>
          <div className="right mt-10 md:mt-0 w-full md:w-[30%]">
            <div className="bg-colorGray h-[20%]">
              <p className="text-colorPrimary font-semibold font-poppins text-xs text-right p-2">
                ID : 30092400001
              </p>
              <h3 className="font-poppins text-3xl font-semibold text-colorPrimary py-10 text-center">
                Pembayaran
              </h3>
            </div>
            <div className="h-[65%] overflow-y-scroll">
              {/* <Draft/>
                            <Draft/> */}
            </div>
            <div className="h-[15%] bg-colorGray flex justify-between items-center">
              <div className="py-5 mx-auto w-1/2 text-center">
                <h3 className="font-poppins text-sm md:text-xl font-semibold text-colorPrimary">
                  Total : <span className="text-colorRed">Rp. 57.000,00</span>
                </h3>
              </div>
              <div className="w-1 h-full bg-colorPrimary"></div>
              <div className="flex w-1/2 items-center justify-center h-full">
                <h3
                  onClick={openModal}
                  className="font-poppins text-lg md:text-2xl font-semibold text-colorGray px-4 py-2 bg-colorPrimary rounded-sm hover:bg-blue-900"
                >
                  Bayar
                </h3>
              </div>
              <Modal isOpen={isModalOpen} onClose={closeModal} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Pembayaran;
