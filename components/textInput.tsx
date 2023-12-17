import {
  ButtonHTMLAttributes,
  DetailedHTMLProps,
  InputHTMLAttributes,
  useId,
} from "react";

export function TextInput({
  label,
  name,
  ref,
  ...rest
}: {
  label: string;
  name: string;
  ref?: any;
  // Rest of the properties of HTMLInputElement
} & DetailedHTMLProps<
  InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>) {
  const id = useId();

  if (label) {
    return (
      <div className="flex flex-col items-center justify-center w-full text-center">
        <label
          className="block text-white text-sm font-bold mb-2"
          htmlFor={name}
        >
          {label}
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:shadow-outline mb-4"
          name={name}
          id={id}
          type="text"
          placeholder={label}
          ref={ref}
          {...rest}
        />
      </div>
    );
  } else {
    return (
      <input
        className="shadow appearance-none border rounded py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:shadow-outline mb-4"
        name={name}
        id={id}
        type="text"
        placeholder={label}
        ref={ref}
        {...rest}
      />
    );
  }
}

export function TextAreaInput({
  label,
  name,
  ...rest
}: {
  label: string;
  name: string;
} & DetailedHTMLProps<
  InputHTMLAttributes<HTMLTextAreaElement>,
  HTMLTextAreaElement
>) {
  const id = useId();
  return (
    <div className="flex flex-col items-center justify-center w-full flex-1 text-center">
      <label className="block text-white text-sm font-bold mb-2" htmlFor={name}>
        {label}
      </label>
      <textarea
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:shadow-outline mb-4"
        name={name}
        id={id}
        placeholder={label}
        {...rest}
      />
    </div>
  );
}

export function SubmitButton({
  label = "Submit",
  ...rest
}: {
  label?: string;
} & ButtonHTMLAttributes<any>) {
  return (
    <button
      className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      type="submit"
      {...rest}
    >
      {label}
    </button>
  );
}
