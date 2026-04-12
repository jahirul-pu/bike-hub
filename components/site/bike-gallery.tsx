"use client";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { useState, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight as ArrowRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export function BikeGallery({ images }: { images: string[] }) {
  const [selected, setSelected] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  const scrollTo = useCallback((idx: number) => {
    setSelected(idx);
    emblaApi?.scrollTo(idx);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', () => setSelected(emblaApi.selectedScrollSnap()));
  }, [emblaApi]);

  return (
    <div className="w-full">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div ref={emblaRef} className="embla w-full h-full">
          <div className="flex h-full">
            {images.map((img, i) => (
              <div key={img} className="flex-[0_0_100%] h-full flex items-center justify-center">
                <div className={cn("relative w-full h-full transition-transform duration-300", zoomed ? "cursor-zoom-out scale-125" : "cursor-zoom-in")}
                  onClick={() => setZoomed(z => !z)}
                >
                  <Image src={img} alt={`Gallery ${i + 1}`} fill className="object-contain object-center select-none" draggable={false} />
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Gallery controls */}
        <button onClick={() => emblaApi?.scrollPrev()} className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-1 shadow hover:bg-white"><ChevronLeft className="h-5 w-5" /></button>
        <button onClick={() => emblaApi?.scrollNext()} className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-1 shadow hover:bg-white"><ArrowRight className="h-5 w-5" /></button>
        <button onClick={() => setZoomed(z => !z)} className="absolute right-2 bottom-2 z-10 bg-white/80 rounded-full p-1 shadow hover:bg-white"><Search className="h-5 w-5" /></button>
      </div>
      {/* Thumbnails */}
      <div className="flex gap-2 overflow-x-auto pb-1 mt-2">
        {images.map((img, i) => (
          <button key={img} onClick={() => scrollTo(i)} className={cn("relative h-14 w-20 flex-shrink-0 overflow-hidden rounded border", selected === i ? "border-slate-900" : "border-slate-200") }>
            <Image src={img} alt={`Thumb ${i + 1}`} fill className="object-cover object-center" />
          </button>
        ))}
      </div>
    </div>
  );
}
