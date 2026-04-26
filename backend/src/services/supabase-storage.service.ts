import { env } from "../config/env";

const logoBucket = "brand-logos";
const productBucket = "brand-products";

function getServiceKey() {
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  return key;
}

function getBaseUrl() {
  const url = env.SUPABASE_URL;
  if (!url) throw new Error("Missing SUPABASE_URL");
  return url.replace(/\/$/, "");
}

export function getPublicUrl(bucket: string, path: string) {
  return `${getBaseUrl()}/storage/v1/object/public/${bucket}/${path}`;
}

export async function uploadToBucket({
  bucket,
  path,
  contentType,
  buffer,
}: {
  bucket: string;
  path: string;
  contentType: string;
  buffer: Buffer;
}) {
  const url = `${getBaseUrl()}/storage/v1/object/${bucket}/${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getServiceKey()}`,
      apikey: getServiceKey(),
      "Content-Type": contentType,
      "x-upsert": "true",
    },
    body: buffer as unknown as BodyInit,
  });
  if (!res.ok) {
    const details = await res.text();
    throw new Error(details || `Failed to upload to ${bucket}`);
  }
}

export async function deleteFromBucket(bucket: string, path: string) {
  const url = `${getBaseUrl()}/storage/v1/object/${bucket}/${path}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getServiceKey()}`,
      apikey: getServiceKey(),
    },
  });
  if (!res.ok) {
    const details = await res.text();
    throw new Error(details || `Failed to delete from ${bucket}`);
  }
}

export function getLogoBucket() {
  return logoBucket;
}

export function getProductBucket() {
  return productBucket;
}
