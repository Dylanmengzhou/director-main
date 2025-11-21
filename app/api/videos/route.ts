import { NextResponse } from "next/server";
import { list } from "@vercel/blob";

// 视频数据类型
interface VideoData {
  id: string;
  title: string;
  url: string;
  description: string;
  uploadDate: string;
  size: number;
}

// GET - 从 Vercel Blob 获取视频列表
export async function GET() {
  try {
    // 直接从 Vercel Blob 查询所有视频
    const { blobs } = await list();

    // 视频文件扩展名
    const videoExtensions = [
      ".mp4",
      ".mov",
      ".webm",
      ".avi",
      ".mkv",
      ".flv",
      ".wmv",
      ".m4v",
    ];

    // 过滤出视频文件并转换为我们的格式
    const videos: VideoData[] = blobs
      .filter((blob) => {
        // 根据文件扩展名判断是否为视频
        const pathname = blob.pathname.toLowerCase();
        return videoExtensions.some((ext) => pathname.endsWith(ext));
      })
      .map((blob) => ({
        id: blob.pathname,
        title:
          blob.pathname
            .split("/")
            .pop()
            ?.replace(/\.[^/.]+$/, "") || "未命名",
        url: blob.url,
        description: `上传于 ${new Date(blob.uploadedAt).toLocaleString(
          "zh-CN"
        )}`,
        uploadDate: new Date(blob.uploadedAt).toISOString(),
        size: blob.size,
      }))
      .sort(
        (a, b) =>
          new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
      );

    return NextResponse.json({ videos });
  } catch (error) {
    console.error("获取视频列表失败:", error);
    return NextResponse.json({ error: "获取视频列表失败" }, { status: 500 });
  }
}
