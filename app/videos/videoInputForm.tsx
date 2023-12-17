"use client";
import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { onVideoSubmit, VideoFormState } from "@/app/videos/actions";
import { SubmitButton, TextInput } from "@/components/textInput";

const initialState: VideoFormState = {
  error: undefined,
  success: undefined,
};

export function VideoInputForm() {
  const [formState, formAction] = useFormState(onVideoSubmit, initialState);
  const status = useFormStatus();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!status.pending && formState?.success) {
      formRef.current?.reset();
    }
  }, [formState?.success, status.pending]);

  return (
    <form
      ref={formRef}
      className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center"
      action={formAction}
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
      {formState?.error && (
        <p className="text-red-500 py-4 italic">{formState.error}</p>
      )}
      <SubmitButton />
    </form>
  );
}
