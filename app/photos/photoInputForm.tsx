"use client";
import { useFormState, useFormStatus } from "react-dom";
import { ImageFormState, onImageSubmit } from "@/app/photos/actions";
import { SubmitButton, TextAreaInput, TextInput } from "@/components/textInput";
import { useEffect, useRef } from "react";

const initialState: ImageFormState = {
  error: undefined,
  success: undefined,
};

export function PhotoInputForm() {
  const [formState, formAction] = useFormState(onImageSubmit, initialState);
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
      className="flex flex-col items-center justify-center w-full flex-1 container text-center"
      action={formAction}
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
      {formState?.error && (
        <p className="text-red-500 py-4 italic">{formState.error}</p>
      )}
      <SubmitButton disabled={status.pending} />
    </form>
  );
}
