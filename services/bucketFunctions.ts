"use server";
import { binding } from "cf-bindings-proxy";
import { Blob, R2Bucket, ReadableStream } from "@cloudflare/workers-types";

export async function getBucketData<T>(key: string, defaultValue: T[] = []) {
  // Get all the videos from the Cloudflare R2 API
  const memorialBucket = binding<R2Bucket>("memorialBucket");

  const fileContents = await memorialBucket.get(key);

  // If there are no videos, return an empty array
  if (!fileContents) return defaultValue;

  // Return the videos array
  return JSON.parse(await fileContents.text()) as T[];
}

export async function appendBucketData<T>(key: string, newData: T) {
  // Get all the data from the R2 API
  const memorialBucket = binding<R2Bucket>("memorialBucket");
  const data = await memorialBucket.get(key);

  // Add the new data to the array
  const newArray = [...JSON.parse((await data?.text()) ?? "[]"), newData];

  // Save the new videos array to the R2 store
  await memorialBucket.put(key, JSON.stringify(newArray));
}

export async function writeBucketData<T>(
  key: string,
  value: ReadableStream | ArrayBuffer | ArrayBufferView | string | null | Blob,
) {
  const memorialBucket = binding<R2Bucket>("memorialBucket");
  await memorialBucket.put(key, value);
}

export async function deleteBucketData(key: string) {
  const memorialBucket = binding<R2Bucket>("memorialBucket");
  await memorialBucket.delete(key);
}

export async function getRawBucketData<T>(key: string) {
  const memorialBucket = binding<R2Bucket>("memorialBucket");
  return await memorialBucket.get(key);
}
