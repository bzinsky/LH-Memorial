import { YoutubeEmbed } from "@/components/youtubeEmbed";
import { getBucketData } from "@/services/bucketFunctions";
import { VideoData } from "@/app/videos/actions";
import { VideoInputForm } from "@/app/videos/videoInputForm";

export const runtime = "edge";

export default async function Videos() {
  const data = await getBucketData<VideoData>("videos");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 container text-center">
        <h1 className="text-6xl font-bold">Videos</h1>
        <p className="mt-3 text-2xl">Link a video for others to see</p>
        <div className="flex flex-wrap items-center justify-around max-w-4xl mt-6 sm:w-full">
          <VideoInputForm />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-10">
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
                <div className="">
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
