"use client";

import { useState } from "react";
import Nav from "./nav";
import PinUploadModal from "./pin-upload-modal";
import { Pin } from "@/lib/types";

export default function Feedpanel({ pins }: { pins: Pin[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <div className="flex h-full w-2/5 flex-col border-l">
      <Nav toggleModal={toggleModal} />
      <div className="flex-1 overflow-y-auto p-4">
        {pins.map((pin) => (
          <div key={pin.id}>
            <div>
              {pin.photo_urls.map((url: string, i: number) => (
                <img key={i} src={url} />
              ))}
            </div>
            <div>Caption: {pin.caption}</div>
            <div>Location: {pin.location_name}</div>
            <div>Visited On: {pin.visited_at}</div>
            <div>Created On: {pin.created_at}</div>
          </div>
        ))}
      </div>
      {isModalOpen && <PinUploadModal toggleModal={toggleModal} />}
    </div>
  );
}
