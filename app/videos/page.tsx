import { revalidatePath } from "next/cache";
import { YoutubeEmbed } from "@/components/youtubeEmbed";
import { SubmitButton, TextInput } from "@/components/textInput";
import { appendBucketData, getBucketData } from "@/services/bucketFunctions";

export const runtime = "edge";

interface VideoData {
  name: string;
  link: string;
  year: string;
  createdAt: string;
}

export function isValidYoutubeLink(link?: string | null): boolean {
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

export default async function Videos() {
  const onSubmit = async (formData: FormData) => {
    // On the server, save the condolence to the R2 store and return the updated videos array
    "use server";

    await appendBucketData<VideoData>("videos", {
      name: formData.get("name") as string,
      link: formData.get("link") as string,
      year: formData.get("year") as string,
      createdAt: new Date().toISOString(),
    });

    // Revalidate the videos page
    revalidatePath("/videos");
  };

  const data = await getBucketData<VideoData>("videos");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold">Videos</h1>
        <p className="mt-3 text-2xl">Link a video for others to see</p>
        <div className="flex flex-wrap items-center justify-around max-w-4xl mt-6 sm:w-full">
          <form
            className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center"
            action={onSubmit}
          >
            <TextInput label="Name" name="name" required />
            {/* Require a valid youtube link  */}
            <TextInput
              label="YouTube Link"
              name="link"
              pattern="https://www.youtube.com/(watch\?v=|shorts\/).*"
              title="Must be a valid YouTube video or shorts link"
              required
            />
            <TextInput
              label="Year"
              name="year"
              pattern="[0-9]{4}"
              title="Must be a valid year"
              required
            />
            <SubmitButton />
          </form>
        </div>

        <div className="grid grid-cols-2 gap-5 mt-6 sm:w-full text-left">
          {data
            ?.sort(
              (a, b) =>
                // filter by year (descending)
                parseInt(b.year) - parseInt(a.year) ||
                // filter by name
                a.name.localeCompare(b.name) ||
                // filter by createdAt
                new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime(),
            )
            .filter((video) => video.link)
            .filter((video) => video.year)
            .filter((video) => video.name)
            ?.map(({ name, link, createdAt }) => (
              <div
                key={name + createdAt}
                className="border-2 border-gray-700 rounded-lg p-4"
              >
                <div className="w-full flex place-content-center">
                  <YoutubeEmbed url={link} />
                </div>
                <p className="text-sm text-center mt-4">
                  - {name} {new Date(createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
        </div>
      </main>
    </div>
  );
}
