"use client";

import Masonry from "react-masonry-css";
import MediaCard from "./MediaCard";

export default function GalleryGrid({ memories, onImageClick, onToggleFavorite, onDelete }) {
  const breakpointColumnsObj = {
    default: 4,
    1536: 4,
    1280: 3,
    1024: 3,
    768: 2,
    640: 1,
  };

  if (memories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h3 className="text-2xl font-serif text-white/50 mb-2">No memories found</h3>
        <p className="text-white/30">Upload some moments to fill the gallery.</p>
      </div>
    );
  }

  return (
    <Masonry
      breakpointCols={breakpointColumnsObj}
      className="flex w-auto -ml-8"
      columnClassName="pl-8 bg-clip-padding"
    >
      {memories.map((memory) => (
        <div key={memory._id} className="mb-8">
          <MediaCard
            memory={memory}
            onImageClick={onImageClick}
            onToggleFavorite={onToggleFavorite}
            onDelete={onDelete}
          />
        </div>
      ))}
    </Masonry>
  );
}
