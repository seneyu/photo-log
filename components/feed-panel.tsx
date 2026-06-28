"use client";

import { useState } from "react";
import Nav from "./nav";
import PinUploadModal from "./pin-upload-modal";

export default function Feedpanel() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <div className="flex h-full w-2/5 flex-col border-l">
      <Nav toggleModal={toggleModal} />
      <div className="flex-1 overflow-y-auto p-4">Feed</div>
      {isModalOpen && <PinUploadModal toggleModal={toggleModal} />}
    </div>
  );
}
