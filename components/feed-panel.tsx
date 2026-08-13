"use client";
import { useEffect, useRef, useState } from "react";
import Nav from "./nav";
import PinUploadModal from "./pin-upload-modal";
import { Pin } from "@/lib/types";
import type { User } from "@supabase/supabase-js";
import { useMapStore } from "@/providers/map-store-provider";
import PinDetailDrawer from "./pin-detail-drawer";
import { formatDate, formatTime } from "@/lib/utils";
import EmptyState from "./empty-state";
import { Scroll } from "lucide-react";

export default function Feedpanel({
  user,
  pins,
}: {
  user: User | null;
  pins: Pin[];
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailPinId, setDetailPinId] = useState<string | null>(null);
  const activePinId = useMapStore((state) => state.activePinId);
  const cardRefs = useRef<Record<string, HTMLDivElement>>({});

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  useEffect(() => {
    if (activePinId && cardRefs.current[activePinId]) {
      cardRefs.current[activePinId].scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [activePinId]);

  const detailPin = pins.find((pin) => pin.id === detailPinId) ?? null;

  return (
    <div className="flex h-full md:w-2/5 flex-col border-l bg-neutral-50 min-h-0">
      <Nav toggleModal={toggleModal} />
      <div
        className={`flex-1 min-h-0 overflow-y-auto p-8 flex flex-col ${pins.length === 0 ? "items-center justify-center" : "items-center"}`}
      >
        {pins.length > 0 ? (
          pins.map((pin) => {
            const isActive = activePinId === pin.id;
            const coverPhoto = pin.photo_urls[0];
            const photoCount = pin.photo_urls.length;

            return (
              <div
                key={pin.id}
                ref={(ele) => {
                  if (ele) cardRefs.current[pin.id] = ele;
                  else delete cardRefs.current[pin.id];
                }}
                className={`p-4 mb-6 w-[90%] flex-shrink-0 flex flex-col items-center rounded-lg transition-all duration-1000 ease-out ${
                  isActive
                    ? "border-blue-400 ring-2 ring-blue-200 shadow-md scale-[1.01]"
                    : "border-neutral-200 shadow-sm"
                }`}
              >
                <div
                  className="relative w-full aspect-square bg-neutral-100 cursor-pointer"
                  onClick={() => {
                    setDetailPinId(pin.id);
                  }}
                >
                  {coverPhoto && (
                    <img
                      src={coverPhoto}
                      alt={pin.caption || pin.location_name || "Pin photo"}
                      className="w-full aspect-square object-cover flex-shrink-0"
                    />
                  )}
                  {photoCount > 1 && (
                    <span className="absolute top-2 right-2 text-[11px] font-medium bg-black/60 text-white px-1.5 py-0.5 rounded-full">
                      1/{photoCount}
                    </span>
                  )}
                </div>

                <div className="p-4 flex flex-col gap-2 min-h-[60px] items-start w-full">
                  <p className="text-sm text-neutral-700 leading-snug text-left">
                    <span className="font-medium text-blue-600">
                      {user?.email}
                    </span>
                    {pin.caption && (
                      <span className="text-neutral-600">: {pin.caption}</span>
                    )}
                  </p>
                  <span className="text-[11px] text-neutral-400 mt-auto text-left">
                    Added {formatDate(pin.created_at)} at{" "}
                    {formatTime(pin.created_at)}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <EmptyState
            size={80}
            icon={Scroll}
            title="No Pins Found"
            subtitle="You haven't created any pins yet. Click 'Create Pin' to get started!"
            buttonDescription="Create Pin"
            onButtonClick={toggleModal}
          />
        )}
      </div>
      {isModalOpen && <PinUploadModal toggleModal={toggleModal} />}
      {detailPin && (
        <PinDetailDrawer
          pin={detailPin}
          user={user}
          onClose={() => setDetailPinId(null)}
        />
      )}
    </div>
  );
}
