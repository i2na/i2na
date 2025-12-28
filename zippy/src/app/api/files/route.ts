import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;
const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
const endpoint = process.env.CLOUDFLARE_R2_ENDPOINT;

const s3Client = new S3Client({
  region: "auto",
  endpoint: endpoint,
  credentials: {
    accessKeyId: accessKeyId!,
    secretAccessKey: secretAccessKey!,
  },
});

export async function GET() {
  try {
    const command = new ListObjectsV2Command({ Bucket: bucketName });
    const response = await s3Client.send(command);

    if (!response.Contents) {
      return NextResponse.json({ message: "파일이 없습니다." });
    }

    const fileList = response.Contents.map((file) => ({
      name: file.Key,
    }));

    return NextResponse.json(fileList);
  } catch (error) {
    console.error("❌ Cloudflare R2 API 오류:", error);
    return NextResponse.json(
      { error: "파일을 불러오는 데 실패했습니다.", details: error },
      { status: 500 }
    );
  }
}
