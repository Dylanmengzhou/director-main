"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

// 视频数据类型定义
interface VideoData {
  id: string;
  title: string;
  url: string;
  description: string;
  uploadDate: string;
  size: number;
}

// 全屏视频播放器组件
function FullscreenPlayer({
  video,
  onClose,
}: {
  video: VideoData;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // 自动播放全屏视频
    if (videoRef.current) {
      videoRef.current.play();
    }

    // ESC键关闭全屏
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* 关闭按钮 */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full flex items-center justify-center text-white transition-colors"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* 视频播放器 */}
      <video
        ref={videoRef}
        className="max-w-full max-h-full"
        controls
        autoPlay
        loop
        onClick={(e) => e.stopPropagation()}
      >
        <source src={video.url} type="video/mp4" />
        您的浏览器不支持视频播放
      </video>

      {/* 视频信息 */}
      <div className="absolute bottom-4 left-4 text-white">
        <h3 className="text-lg font-semibold">{video.title}</h3>
        <p className="text-sm text-gray-300">{video.description}</p>
      </div>

      {/* 点击空白区域关闭 */}
      <div className="absolute inset-0 -z-10" onClick={onClose}></div>
    </div>
  );
}

// 简化的视频卡片组件
function VideoCard({
  video,
  onFullscreen,
}: {
  video: VideoData;
  onFullscreen: (video: VideoData) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // 视频加载完成
  const handleCanPlay = () => {
    setIsLoaded(true);
    setHasError(false);
  };

  // 视频加载错误
  const handleError = () => {
    console.log("Video load error:", video.url);
    setHasError(true);
    console.log("Video load error:", hasError);
    setIsLoaded(false);
  };

  // 鼠标悬停
  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current && isLoaded) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {
        console.log("Auto play failed");
      });
    }
  };

  // 鼠标离开
  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  // 点击全屏播放
  const handleClick = () => {
    onFullscreen(video);
  };

  return (
    <div
      className="group relative cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <div className="relative w-full h-60 overflow-hidden">
        {/* 视频元素 - 直接显示，无背景色 */}
        <video
          ref={videoRef}
          className="w-full h-full object-cover bg-transparent"
          onCanPlay={handleCanPlay}
          onError={handleError}
          onLoadStart={() => console.log("Video load start:", video.title)}
          muted
          loop
          playsInline
          autoPlay={false}
        >
          <source src={video.url} type="video/mp4" />
          <source src={video.url} type="video/quicktime" />
          <source src={video.url} type="video/webm" />
        </video>

        {/* 简单的加载指示器 - 只在视频未加载时显示 */}
        {!isLoaded && !hasError && (
          <div className="absolute top-2 left-2">
            <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* 错误提示 */}
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
            <div className="text-center">
              <svg
                className="w-8 h-8 mx-auto mb-2 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <p className="text-xs text-red-400">加载失败</p>
            </div>
          </div>
        )}

        {/* 简单的播放指示器 - 右下角 */}
        {isHovered && isLoaded && (
          <div className="absolute bottom-2 right-2">
            <div className="w-6 h-6 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
              {isPlaying ? (
                <div className="w-2 h-2 bg-white"></div>
              ) : (
                <div className="w-0 h-0 border-l-[4px] border-l-white border-t-[2px] border-b-[2px] border-t-transparent border-b-transparent ml-0.5"></div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [fullscreenVideo, setFullscreenVideo] = useState<VideoData | null>(
    null
  );

  // 加载视频
  const loadVideos = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/videos");
      if (response.ok) {
        const data = await response.json();
        // 直接从vercel Blob查询视频列表
        setVideos(data.videos);
      } else {
        console.error("加载视频失败:", response.status);
        setVideos([]);
      }
    } catch (error) {
      console.error("加载视频失败:", error);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVideos();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* 头部 */}
      <header className=" sticky top-0 bg-black z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold">作品展示</h1>
              <p className="text-sm text-gray-400">SHOWREEL</p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={loadVideos}
                disabled={loading}
                className="text-sm bg-gray-800 px-3 py-1.5 rounded hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                {loading ? "Loading..." : "Refresh"}
              </button>

              <Link
                href="/test"
                className="bg-white text-black px-3 py-1.5 rounded text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Upload
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* 统计 */}

        {/* 视频网格 */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
            {videos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onFullscreen={setFullscreenVideo}
              />
            ))}
          </div>
        )}

        {/* 全屏播放器 */}
        {fullscreenVideo && (
          <FullscreenPlayer
            video={fullscreenVideo}
            onClose={() => setFullscreenVideo(null)}
          />
        )}

        {/* 空状态 */}
        {!loading && videos.length === 0 && (
          <div className="text-center py-20">
            <div className="w-12 h-12 mx-auto mb-3 bg-gray-800 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">No Content</h3>
            <p className="text-gray-400 mb-4">
              Upload your first video to get started
            </p>
            <Link
              href="/test"
              className="bg-white text-black px-4 py-2 rounded font-medium hover:bg-gray-200 transition-colors"
            >
              Upload Now
            </Link>
          </div>
        )}
      </main>
      <div className="mb-6 text-center">
        <div className="text-gray-400 text-sm">
          <span className="text-white font-bold">{videos.length}</span> 个视频
        </div>
      </div>

      {/* 底部 */}
      <footer className=" mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          Professional Video Showcase • Responsive Grid • Auto-Play Preview
        </div>
      </footer>
    </div>
  );
}
