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
import Image from "next/image";
import { fetchMorePins } from "@/lib/actions/pins";
import { createClient } from "@/lib/supabase/client";

interface FeedPanelProps {
  user: User | null;
  initialPins: Pin[];
  limit: number;
  nextCursorId: string;
  nextCursorCreatedAt: string;
  hasMoreInitial: boolean;
}

export default function Feedpanel({
  user,
  initialPins,
  limit,
  nextCursorId,
  nextCursorCreatedAt,
  hasMoreInitial,
}: FeedPanelProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const activePinId = useMapStore((state) => state.activePinId);
  const cardRefs = useRef<Record<string, HTMLDivElement>>({});

  const [pins, setPins] = useState(initialPins);
  const [cursorId, setCursorId] = useState(nextCursorId); // last seen post ID
  const [cursorCreateAt, setCursorCreatedAt] = useState(nextCursorCreatedAt);
  const [hasMore, setHasMore] = useState(hasMoreInitial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const activeDetailPinId = useMapStore((state) => state.activeDetailPinId);
  const setActiveDetailPinId = useMapStore(
    (state) => state.setActiveDetailPinId,
  );

  const activeDetailPin = pins.find((p) => p.id === activeDetailPinId) ?? null;
  const [fetchedPin, setFetchedPin] = useState<Pin | null>(null);

  useEffect(() => {
    if (activeDetailPinId && !activeDetailPin) {
      const supabase = createClient();
      supabase
        .from("pins")
        .select("*")
        .eq("id", activeDetailPinId)
        .single()
        .then(({ data }) => setFetchedPin(data));
    } else {
      setFetchedPin(null);
    }
  }, [activeDetailPinId, activeDetailPin]);

  const pinToShow = activeDetailPin ?? fetchedPin;

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  // sync state when revalidatePath updates initialPins from server action
  useEffect(() => {
    setPins((prevPins) => {
      const incomingIds = new Set(initialPins.map((p) => p.id));
      const preservedPrev = prevPins.filter((p) => !incomingIds.has(p.id));
      return [...initialPins, ...preservedPrev];
    });
  }, [initialPins]);

  // // map selection scrolling
  // useEffect(() => {
  //   if (activePinId && cardRefs.current[activePinId]) {
  //     cardRefs.current[activePinId].scrollIntoView({
  //       behavior: "smooth",
  //     });
  //   }
  // }, [activePinId]);

  useEffect(() => {
    if (!activePinId) return;

    const isLoaded = pins.some((p) => p.id === activePinId);

    if (isLoaded && cardRefs.current[activePinId]) {
      cardRefs.current[activePinId].scrollIntoView({ behavior: "smooth" });

      // give the scroll animation some time to visually land before the drawer appears
      const timer = setTimeout(() => {
        setActiveDetailPinId(activePinId);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // not loaded so nothing to scroll to, open drawer immediately
      setActiveDetailPinId(activePinId);
    }
  }, [activePinId, pins]);

  // intersection detection for infinite scroll
  useEffect(() => {
    if (!loaderRef.current || !hasMore) return;

    const observer = new IntersectionObserver(async (entries) => {
      if (entries[0].isIntersecting && !loading) {
        setLoading(true);
        const {
          success,
          data,
          nextCursor,
          nextCreatedAt,
          error: fetchError,
        } = await fetchMorePins(cursorId, cursorCreateAt, limit);

        if (!success) {
          setError(fetchError || "Failed to load pins");
        } else if (data && data.length > 0) {
          setPins((prev) => [...prev, ...data]);
          setCursorId(nextCursor);
          setCursorCreatedAt(nextCreatedAt);
          setHasMore(data.length === limit);
        } else {
          setHasMore(false);
        }
        setLoading(false);
      }
    });

    const node = loaderRef.current;
    observer.observe(node);

    return () => {
      if (node) observer.unobserve(node);
    };
  }, [hasMore, cursorId, cursorCreateAt, limit]);

  return (
    <div className="flex h-full w-full md:w-3/5 flex-col border-l bg-neutral-50 min-h-0">
      <Nav toggleModal={toggleModal} />
      <div
        className={`flex-1 min-h-0 overflow-y-auto p-8 flex flex-col ${pins.length === 0 ? "items-center justify-center" : "items-center"}`}
      >
        {pins.length > 0 ? (
          <>
            {pins.map((pin) => {
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
                    className="relative w-full aspect-square bg-neutral-100 cursor-pointer overflow-hidden rounded-sm"
                    onClick={() => {
                      setActiveDetailPinId(pin.id);
                    }}
                  >
                    {coverPhoto && (
                      <Image
                        src={coverPhoto}
                        alt={pin.caption || pin.location_name || "Pin photo"}
                        fill
                        sizes="(max-w-md) 90vw, 400px"
                        className="object-cover"
                        priority={pin.id === pins[0]?.id}
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
                        <span className="text-neutral-600">
                          : {pin.caption}
                        </span>
                      )}
                    </p>
                    <span className="text-[11px] text-neutral-400 mt-auto text-left">
                      Added {formatDate(pin.created_at)} at{" "}
                      {formatTime(pin.created_at)}
                    </span>
                  </div>
                </div>
              );
            })}
            {hasMore && (
              <div
                ref={loaderRef}
                className="w-full py-4 text-center text-xs text-neutral-400"
              >
                {loading && "Loading more pins..."}
              </div>
            )}
          </>
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
      {pinToShow && (
        <PinDetailDrawer
          onPinDelete={(pinId) =>
            setPins((prev) => prev.filter((p) => p.id !== pinId))
          }
          pin={pinToShow}
          user={user}
          onClose={() => setActiveDetailPinId(null)}
        />
      )}
    </div>
  );
}
