"use client";

import { useEffect, useState, memo } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import Image from "next/image";

// const PublicBaseUrl = "https://zippy.b-cdn.net"; //Bunny CDN을 사용할 경우
const PublicBaseUrl = "https://pub-80a42cc7d41749078071917a4265d3ca.r2.dev"; //Bunny CDN을 사용하지 않을 경우

export default function Home() {
  const [media, setMedia] = useState<MediaData[]>([]);

  useEffect(() => {
    fetch("/api/files")
      .then((res) => res.json())
      .then((data) => {
        console.log("API 응답 데이터:", data);
        if (Array.isArray(data)) {
          setMedia(
            data.map((file) => ({
              ...file,
              url: `${PublicBaseUrl}/${file.name}`,
            }))
          );
        } else {
          throw new Error("API 응답이 배열이 아닙니다.");
        }
      })
      .catch((error) => {
        console.error("파일 불러오기 오류:", error);
        toast.error("미디어를 불러오는 데 실패했습니다.");
      });
  }, []);

  return (
    <>
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
          {media.length > 0 ? (
            media.map((file, index) => (
              <MediaItem
                key={`${file.name}_${index}`}
                file={file}
                index={index}
              />
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500">
              불러올 파일이 없습니다.
            </p>
          )}
        </div>
      </div>
    </>
  );
}

const MediaItem = memo(({ file, index }: MediaItemProps) => {
  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL이 복사되었습니다!");
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="relative cursor-pointer overflow-hidden rounded-lg shadow-md h-64"
      initial="hidden"
      animate="visible"
      variants={itemVariants}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      onClick={() => copyToClipboard(file.url)}
    >
      {file.url.endsWith(".mov") || file.url.endsWith(".mp4") ? (
        <video
          src={file.url}
          controls
          preload="metadata"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              e.preventDefault();
              e.stopPropagation();
              copyToClipboard(file.url);
            }
          }}
          className="object-contain w-full h-full"
        />
      ) : (
        <Image
          src={file.url}
          alt={file.name}
          width={500}
          height={500}
          className="object-cover w-full h-full transition-transform duration-300 ease-in-out hover:scale-105"
          loading="lazy"
        />
      )}
    </motion.div>
  );
});

MediaItem.displayName = "MediaItem";
