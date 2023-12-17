"use server";
import { appendBucketData, writeBucketData } from "@/services/bucketFunctions";
import { revalidatePath } from "next/cache";
import { imageSize, ISizeCalculationResult } from "@/app/photos/imageSizeUtils";

export interface PhotoData {
  name: string;
  imageId: string;
  description: string;
  createdAt: string;
  width: number;
  height: number;
}

export interface ImageFormState {
  error?: string;
  success?: boolean;
}

export async function onImageSubmit(prevState: any, formData: FormData) {
  "use server";
  console.log(formData);

  if (
    !formData.get("file") ||
    !formData.get("name") ||
    !formData.get("description")
  ) {
    return;
  }

  const file = formData.get("file") as File;

  // Make sure the file is an image
  if (!file.type.startsWith("image/")) {
    return {
      error: "File is not an image",
    };
  }

  const fileData = await file.arrayBuffer();
  const dataArray: Uint8Array = new Uint8Array(fileData);

  // Get the image size
  const detectedImageSize: ISizeCalculationResult = imageSize(dataArray);

  const fileData64 = Buffer.from(fileData).toString("base64");

  const uuid =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);

  const newPhoto: PhotoData = {
    name: formData.get("name") as string,
    imageId: uuid,
    description: formData.get("description") as string,
    createdAt: new Date().toISOString(),
    width: detectedImageSize.width as number,
    height: detectedImageSize.height as number,
  };

  await appendBucketData("photos", newPhoto);
  await writeBucketData(
    "img/" + uuid,
    JSON.stringify({
      data: fileData64,
      contentType: "image/png",
    }),
  );
  // TODO: Find an image processing library that can properly resize images from within Cloudflare Workers
  // await writeBucketData(
  //   "img/" + uuid + "_thumb",
  //   JSON.stringify({
  //     data: thumbnailData64,
  //     contentType: "image/png",
  //   }),
  // );

  // Revalidate the videos page
  revalidatePath("/photos");

  return {
    success: true,
  };
}
