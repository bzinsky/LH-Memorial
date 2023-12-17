import { SubmitButton, TextAreaInput, TextInput } from "@/components/textInput";
import { getBucketData } from "@/services/bucketFunctions";
import { PhotosGallery } from "@/components/photosGallery";
import { onImageSubmit, PhotoData } from "@/app/photos/actions";

export const runtime = "edge";

export default async function Page() {
  const data = await getBucketData<PhotoData>("photos");
  console.log(data);
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold">Photos</h1>
        <p className="mt-3 text-2xl">Upload photos</p>
        <div className="flex flex-wrap items-center justify-around max-w-4xl mt-6 sm:w-full">
          <form
            className="flex flex-col items-center justify-center w-full flex-1 container text-center"
            action={onImageSubmit}
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
