import { NextRequest, NextResponse } from "next/server";
import { writeFile, readFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

// 视频数据类型
interface VideoData {
  id: number;
  title: string;
  url: string;
  description: string;
  uploadDate: string;
}

// 数据文件路径
const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "videos.json");

// 确保数据目录存在
async function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
}

// 读取视频列表
async function getVideos(): Promise<VideoData[]> {
  try {
    await ensureDataDir();
    if (!existsSync(DATA_FILE)) {
      return [];
    }
    const data = await readFile(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("读取视频列表失败:", error);
    return [];
  }
}

// 保存视频列表
async function saveVideos(videos: VideoData[]): Promise<void> {
  try {
    await ensureDataDir();
    await writeFile(DATA_FILE, JSON.stringify(videos, null, 2));
  } catch (error) {
    console.error("保存视频列表失败:", error);
    throw error;
  }
}

// GET - 获取视频列表
export async function GET() {
  try {
    const videos = await getVideos();
    return NextResponse.json({ videos });
  } catch (error) {
    console.error("获取视频列表失败:", error);
    return NextResponse.json({ error: "获取视频列表失败" }, { status: 500 });
  }
}

// POST - 添加新视频
export async function POST(request: NextRequest) {
  try {
    const { title, url, description } = await request.json();

    if (!title || !url) {
      return NextResponse.json({ error: "标题和URL是必需的" }, { status: 400 });
    }

    const videos = await getVideos();
    const newVideo: VideoData = {
      id: Date.now(),
      title,
      url,
      description: description || `上传于 ${new Date().toLocaleString()}`,
      uploadDate: new Date().toISOString(),
    };

    videos.unshift(newVideo); // 添加到列表开头
    await saveVideos(videos);

    return NextResponse.json({
      success: true,
      video: newVideo,
    });
  } catch (error) {
    console.error("添加视频失败:", error);
    return NextResponse.json({ error: "添加视频失败" }, { status: 500 });
  }
}
