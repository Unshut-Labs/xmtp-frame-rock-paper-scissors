import { generateImage } from "@/utils/image";
import {
  XmtpValidationResponse,
  validateFramesPost,
} from "@xmtp/frames-validator";

interface IFrameProps {
  frame?: string;
  imageUrl: string;
  buttons?: string[];
  postUrl?: string;
  textInput?: string;
}

function generateFrameMetaTag({
  frame,
  imageUrl,
  postUrl,
  buttons,
  textInput,
}: IFrameProps): string {
  // Default to vNext
  if (!frame) {
    frame = "vNext";
  }
  // Ensure there are at most four buttons
  if (buttons && buttons.length > 4) {
    throw new Error("Maximum of four buttons are allowed per frame.");
  }

  // Generate Open Graph tags for image, redirect, and buttons
  let metaTag = `<meta property="fc:frame" content="${
    frame ? frame : "vNext"
  }" />\n`;
  metaTag += `<meta property="fc:frame:image" content="${imageUrl}" />\n`;

  if (buttons) {
    buttons.forEach((button, index) => {
      metaTag += `<meta property="fc:frame:button:${
        index + 1
      }" content="${button}" />\n`;
    });
  }

  if (textInput) {
    metaTag += `<meta property="fc:frame:input:text" content="${textInput}" />\n`;
  }

  // post URL if exists
  if (postUrl) {
    metaTag += `<meta property="xmtp:frame:post-url" content="${postUrl}" /> \n`;
  }

  return metaTag;
}

function frameGenerator(frameProps: IFrameProps): string {
  const metaTag = generateFrameMetaTag(frameProps);

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>XMTP Frame Example</title>
    ${metaTag}
  </head>
</html>`;
  return html;
}

const play = async (validatedData: XmtpValidationResponse) => {
  console.log("playing !!!");
  const frameProps: IFrameProps = {
    imageUrl:
      "https://hips.hearstapps.com/hmg-prod/images/people-playing-paper-rock-scissors-royalty-free-illustration-1583269312.jpg",
    buttons: ["Rock", "Paper", "Scissors"],
  };
  return new Response(frameGenerator(frameProps), {
    status: 200,
  });
};

const showPlay = async (validatedData: XmtpValidationResponse) => {
  console.log("showing play");
  const url = new URL(validatedData.actionBody.frameUrl);
  url.searchParams.set("playing", "true");
  const frameProps: IFrameProps = {
    imageUrl:
      "https://hips.hearstapps.com/hmg-prod/images/people-playing-paper-rock-scissors-royalty-free-illustration-1583269312.jpg",
    buttons: ["Rock", "Paper", "Scissors"],
    postUrl: url.toString()
  };
  console.log(frameProps);
  return new Response(frameGenerator(frameProps), {
    status: 200,
  });
};

export async function POST(request: Request) {
  const body = await request.json();
  console.log("request.url", request.url);
  const url = new URL(request.url);
  const playing = url.searchParams.get("playing");
  const validatedData = await validateFramesPost(body);
  console.log({playing});
  if (playing) {
    return play(validatedData);
  } else {
    return showPlay(validatedData);
  }
}
