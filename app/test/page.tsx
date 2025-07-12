"use client";

import { type PutBlobResult } from "@vercel/blob";
import { upload } from "@vercel/blob/client";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";

export default function VideoUploadPage() {
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [blob, setBlob] = useState<PutBlobResult | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const router = useRouter();
  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">视频上传</h1>

      <form
        onSubmit={async (event) => {
          event.preventDefault();

          if (!inputFileRef.current?.files) {
            alert("请选择要上传的视频文件");
            return;
          }

          const file = inputFileRef.current.files[0];

          // 检查文件类型
          if (!file.type.startsWith("video/")) {
            alert("请选择视频文件");
            return;
          }

          // 检查文件大小 (500MB)
          if (file.size > 500 * 1024 * 1024) {
            alert("文件大小不能超过500MB");
            return;
          }

          setUploading(true);
          setUploadProgress(0);

          try {
            const newBlob = await upload(file.name, file, {
              access: "public",
              handleUploadUrl: "/api/test",
              onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total
                );
                setUploadProgress(percentCompleted);
              },
            });

            setBlob(newBlob);

            // 保存视频信息到服务器
            try {
              const response = await fetch("/api/videos", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  title: file.name.replace(/\.[^/.]+$/, ""), // 去掉文件扩展名
                  url: newBlob.url,
                  description: `上传于 ${new Date().toLocaleString()}`,
                }),
              });

              if (response.ok) {
                alert("视频上传成功！所有设备都能在主页查看。");
              } else {
                alert("视频上传成功，但保存到服务器失败。");
              }
            } catch (error) {
              console.error("保存视频信息失败:", error);
              alert("视频上传成功，但保存到服务器失败。");
            }
          } catch (error) {
            console.error("上传失败:", error);
            alert("上传失败，请重试");
          } finally {
            setUploading(false);
            setUploadProgress(0);
          }
        }}
        className="space-y-6"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            选择视频文件
          </label>
          <input
            name="file"
            ref={inputFileRef}
            type="file"
            accept="video/*"
            required
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="mt-1 text-sm text-gray-500">
            支持 MP4, WebM, QuickTime 等格式，最大 500MB
          </p>
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {uploading ? `上传中... ${uploadProgress}%` : "上传视频"}
        </button>

        {uploading && (
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        )}
      </form>

      {blob && (
        <div className="mt-8 p-4 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">上传成功！</h3>
          <p className="text-sm text-gray-600 mb-2">视频链接:</p>
          <a
            href={blob.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline break-all"
          >
            {blob.url}
          </a>

          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">预览:</p>
            <video
              controls
              className="w-full max-w-md rounded-lg"
              src={blob.url}
            >
              您的浏览器不支持视频播放
            </video>
          </div>
        </div>
      )}

      <div className="mt-8 text-center">
        <div
          onClick={() => {
            router.push("/");
          }}
          className="text-blue-600 hover:text-blue-800 underline"
        >
          返回主页查看所有视频
        </div>
      </div>
    </div>
  );
}
