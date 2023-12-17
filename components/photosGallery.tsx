"use client";
import { Gallery, Item } from "react-photoswipe-gallery";
import "photoswipe/dist/photoswipe.css";
import { PhotoData } from "@/app/photos/actions";

export function PhotosGallery({ data }: { data: PhotoData[] }) {
  const smallItemStyles: React.CSSProperties = {
    cursor: "pointer",
    objectFit: "cover",
    width: "100%",
    maxHeight: "100%",
  };
  return (
    <Gallery withCaption>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {data.map((photoEntry: any) => (
          <Item<HTMLImageElement>
            cropped
            key={photoEntry.imageId + photoEntry.createdAt}
            original={"/api/img/" + photoEntry.imageId}
            // thumbnail={"/api/img/" + photoEntry.imageId}
            width={photoEntry.width}
            height={photoEntry.height}
            caption={photoEntry.description}
          >
            {({ ref, open }) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                style={smallItemStyles}
                alt={photoEntry.description}
                ref={ref}
                onClick={open}
                src={"/api/img/" + photoEntry.imageId}
              />
            )}
          </Item>
        ))}
      </div>
    </Gallery>
  );
}
