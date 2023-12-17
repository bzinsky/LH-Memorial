import { revalidatePath } from "next/cache";
import { SubmitButton, TextAreaInput, TextInput } from "@/components/textInput";
import { appendBucketData, getBucketData } from "@/services/bucketFunctions";

export const runtime = "edge";

export default async function Condolences() {
  const onSubmit = async (formData: FormData) => {
    "use server";

    await appendBucketData("condolences", {
      name: formData.get("name"),
      message: formData.get("message"),
      createdAt: new Date().toISOString(),
    });

    // Revalidate the memories page
    revalidatePath("/condolences");
  };

  const data = await getBucketData<{
    name: string;
    message: string;
    createdAt: string;
  }>("condolences");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 container text-center">
        <h1 className="text-6xl font-bold">Condolences</h1>
        <p className="mt-3 text-2xl">Leave a message of condolences</p>
        <div className="flex flex-wrap items-center justify-around max-w-4xl mt-6 sm:w-full">
          <form
            className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center"
            action={onSubmit}
          >
            <TextInput label="Name" name="name" required />
            <TextAreaInput label="Message" name="message" required />
            <SubmitButton />
          </form>
        </div>

        <div className="grid grid-cols-1 gap-5 mt-6 container px-4 w-full text-left whitespace-pre-line">
          {data?.map(
            ({
              name,
              message,
              createdAt,
            }: {
              name: string;
              message: string;
              createdAt: string;
            }) => (
              <div
                key={name + createdAt}
                className="border-2 border-gray-700 rounded-lg p-4"
              >
                <p className="">{message}</p>
                <p className="text-sm text-center">
                  - {name} {new Date(createdAt).toLocaleDateString()}
                </p>
              </div>
            ),
          )}
        </div>
      </main>
    </div>
  );
}
