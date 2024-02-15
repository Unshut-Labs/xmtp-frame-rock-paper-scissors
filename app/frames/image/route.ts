import { generateImage } from "@/utils/image";
import { readFileSync } from "fs";
import { join } from "path";

// Headers needed for CORS (in a web XMTP Client)

const HEADERS = {
  "Content-Type": "image/png",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Origin": "*",
  Vary: "Origin",
  "Access-Control-Allow-Methods": "GET,DELETE,PATCH,POST,PUT,OPTIONS",
  "Access-Control-Allow-Headers":
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
};

const homeImage = join(process.cwd(), "public/1.png");

export async function GET(request: Request) {
  const dataParam = new URL(request.url).searchParams.get("data");
  if (!dataParam) {
    const file = readFileSync(homeImage);
    return new Response(file, { headers: HEADERS });
  } else {
    const data = JSON.parse(dataParam);
    const imagePng = await generateImage(data);
    return new Response(imagePng, { headers: HEADERS });
  }
}

// OPTIONS needed for CORS (in a web XMTP Client)

export async function OPTIONS() {
  return new Response("", {
    headers: HEADERS,
  });
}
