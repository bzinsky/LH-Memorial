import { getBucketData } from "@/services/bucketFunctions";
import { PhotosGallery } from "@/components/photosGallery";
import { PhotoData } from "@/app/photos/actions";
import { PhotoInputForm } from "@/app/photos/photoInputForm";

export const runtime = "edge";

export default async function Page() {
  const data = await getBucketData<PhotoData>("photos");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 container text-center">
        <h1 className="text-6xl font-bold">Photos</h1>
        <p className="mt-3 text-2xl">Upload photos</p>
        <div className="flex flex-wrap items-center justify-around max-w-4xl mt-6 sm:w-full">
          <PhotoInputForm />
        </div>
        <div className="flex flex-wrap items-center justify-around mt-6 sm:w-full px-4 sm:px-0">
          <PhotosGallery data={data} />
        </div>
      </main>
    </div>
  );
}
