"use server";
import { appendBucketData } from "@/services/bucketFunctions";
import { revalidatePath } from "next/cache";

export interface VideoData {
  name: string;
  link: string;
  year: string;
  createdAt: string;
}

export interface VideoFormState {
  error?: string;
  success?: boolean;
}

export async function onVideoSubmit(prevState: any, formData: FormData) {
  function isValidYoutubeLink(link?: string | null): boolean {
    if (!link) {
      return false;
    }

    if (!link.startsWith("https://www.youtube.com")) {
      return false;
    }

    if (!link.includes("watch?v=") && !link.includes("shorts/")) {
      return false;
    }

    return true;
  }

  // On the server, save the condolence to the R2 store and return the updated videos array
  if (!isValidYoutubeLink(formData.get("link") as string)) {
    return {
      error: "Invalid YouTube link",
    };
  }

  await appendBucketData<VideoData>("videos", {
    name: formData.get("name") as string,
    link: formData.get("link") as string,
    year: formData.get("year") as string,
    createdAt: new Date().toISOString(),
  });

  // Revalidate the videos page
  revalidatePath("/videos");

  return {
    success: true,
  };
}
