import { generateImage } from "@/utils/image";

export async function GET(request: Request) {
  const dataParam = new URL(request.url).searchParams.get("data");
  if (!dataParam) throw new Error("missing data");

  const data = JSON.parse(dataParam);
  const imagePng = await generateImage(data);
  return new Response(imagePng, { headers: { "Content-Type": "image/png" } });
}
