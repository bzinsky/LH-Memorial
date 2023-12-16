import { SubmitButton, TextAreaInput, TextInput } from "@/components/textInput";
import {
  appendBucketData,
  getBucketData,
  writeBucketData,
} from "@/services/bucketFunctions";
import { revalidatePath } from "next/cache";
import { PhotosGallery } from "@/components/photosGallery";

export const runtime = "edge";

interface PhotoData {
  name: string;
  imageId: string;
  description: string;
  createdAt: string;
}

export default async function Page() {
  const onSubmit = async (formData: FormData) => {
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
        status: 400,
        body: "File must be an image",
      };
    }

    const fileData = await file.arrayBuffer();
    const fileData64 = Buffer.from(fileData).toString("base64");

    const uuid =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

    const newPhoto: PhotoData = {
      name: formData.get("name") as string,
      imageId: uuid,
      description: formData.get("description") as string,
      createdAt: new Date().toISOString(),
    };

    await appendBucketData("photos", newPhoto);
    await writeBucketData(
      "img/" + uuid,
      JSON.stringify({
        data: fileData64,
        contentType: file.type,
      }),
    );

    // Revalidate the videos page
    revalidatePath("/photos");
  };

  const data = await getBucketData<PhotoData>("photos");
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold">Photos</h1>
        <p className="mt-3 text-2xl">Upload photos</p>
        <div className="flex flex-wrap items-center justify-around max-w-4xl mt-6 sm:w-full">
          <form
            className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center"
            action={onSubmit}
          >
            <TextInput label="Name" name="name" required />
            <TextAreaInput label="Description" name="description" required />
            {/* Upload image here. Only allow actual images */}
            <TextInput
              required
              label="Upload"
              type="file"
              name="file"
              accept="image/*"
            />
            <SubmitButton />
          </form>
        </div>
        <div className="flex flex-wrap items-center justify-around max-w-4xl mt-6 sm:w-full">
          <PhotosGallery data={data} />
        </div>
      </main>
    </div>
  );
}
