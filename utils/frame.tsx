// Method to get the next frame props to generate
// the next frame after an action is performed

import { XmtpValidationResponse } from "@xmtp/frames-validator";
import { PLAY_BUTTONS_LABELS, SCREEN, handlePlayAction } from "./play";

// Generate an image URL, passing it some data that will help with
// the image content generation
const getImageUrl = (
  conversationId: string,
  playerAddress: string,
  screen: SCREEN
) => {
  return `${process.env.DOMAIN_URL}/frames/image?data=${encodeURIComponent(
    JSON.stringify({ conversationId, playerAddress, screen })
  )}`;
};

// Get the next frame props, to generate the next frame headers
// and return them to the client.

export const getNextFrame = async (
  lastScreen: SCREEN,
  validatedData: XmtpValidationResponse
) => {
  // Getting the gameplay action result
  const nextScreen = await handlePlayAction(lastScreen, validatedData);
  const conversationId = validatedData.actionBody.opaqueConversationIdentifier;
  const playerAddress = validatedData.verifiedWalletAddress;
  switch (nextScreen) {
    case SCREEN.PLAY:
      return {
        nextScreen,
        nextFrameProps: {
          imageUrl: getImageUrl(conversationId, playerAddress, SCREEN.PLAY),
          buttons: PLAY_BUTTONS_LABELS,
        },
      };

    case SCREEN.RESULT_NOT_READY:
      return {
        nextScreen,
        nextFrameProps: {
          imageUrl: getImageUrl(
            conversationId,
            playerAddress,
            SCREEN.RESULT_NOT_READY
          ),
          buttons: ["REFRESH"],
        },
      };
    case SCREEN.RESULT_READY:
      return {
        nextScreen,
        nextFrameProps: {
          imageUrl: getImageUrl(
            conversationId,
            playerAddress,
            SCREEN.RESULT_READY
          ),
          buttons: ["PLAY AGAIN"],
        },
      };

    default:
      throw new Error("Error: did not handle that gameplay case");
  }
};

// Helpers to generate the HTML code for a Frame
// with the appropriate meta tags

export interface IFrameProps {
  frame?: string;
  imageUrl: string;
  buttons?: string[];
  postUrl?: string;
  textInput?: string;
  imageAspectRatio?: "1.91:1" | "1:1";
}

export const getFrameMetaTags = ({
  frame,
  imageUrl,
  imageAspectRatio,
  postUrl,
  buttons,
  textInput,
}: IFrameProps) => {
  // Default to vNext
  if (!frame) {
    frame = "vNext";
  }
  // Ensure there are at most four buttons
  if (buttons && buttons.length > 4) {
    throw new Error("Maximum of four buttons are allowed per frame.");
  }

  const metaTags: { [key: string]: string } = {};
  metaTags["fc:frame"] = frame ? frame : "vNext";
  metaTags["fc:frame:image"] = imageUrl;
  metaTags["og:image"] = imageUrl;
  metaTags["of:accepts:xmtp"] = "2024-02-01";

  if (buttons) {
    buttons.forEach((button, index) => {
      metaTags[`fc:frame:button:${index + 1}`] = button;
    });
  }

  if (textInput) {
    metaTags["fc:frame:input:text"] = textInput;
  }

  if (postUrl) {
    // metaTags["fc:frame:post_url"] = postUrl;
    // Using the Open Frame standard
    metaTags["of:post_url"] = postUrl;
    // Support legacy xmtp:frame:post-url until
    // the new Converse app is out
    metaTags["xmtp:frame:post-url"] = postUrl;
  }

  if (imageAspectRatio) {
    metaTags["fc:frame:image:aspect_ratio"] = imageAspectRatio;
  }

  return metaTags;
};

const generateFrameHeaders = (frameProps: IFrameProps): string => {
  const tags = getFrameMetaTags(frameProps);
  let metaTag = "";
  for (const tag in tags) {
    metaTag += `<meta property="${tag}" content="${tags[tag]}" />\n`;
  }

  return metaTag;
};

export const frameGenerator = (frameProps: IFrameProps): string => {
  const metatagHeaders = generateFrameHeaders(frameProps);

  const html = `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <title>XMTP Frame Example</title>
      ${metatagHeaders}
    </head>
  </html>`;
  return html;
};
