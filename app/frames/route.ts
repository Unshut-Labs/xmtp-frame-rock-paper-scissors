import { frameGenerator, getNextFrame } from "@/utils/frame";
import { SCREEN } from "@/utils/play";
import { validateFramesPost } from "@xmtp/frames-validator";

const getScreen = (request: Request) => {
  const url = new URL(request.url);
  const screen = url.searchParams.get("screen");
  return (screen || "HOME") as SCREEN;
};

// This method will be called with a POST
// request on every frame action
export async function POST(request: Request) {
  const body = await request.json();
  const currentScreen = getScreen(request);

  if (!body.clientProtocol?.startsWith("xmtp")) {
    return Response.json(
      { error: "This Frame only supports the XMTP protocol" },
      { status: 400 }
    );
  }

  // The validateFramesPost method of the @xmtp/frames-validator
  // module validates & decodes the trustedPayload so we're
  // sure we're handling "real" data
  const validatedData = await validateFramesPost(body);

  // Helper to get the frame props for the next frame
  // and get the next screen name to append it to the URL
  // to know from what frame the next action comes from!
  const { nextScreen, nextFrameProps } = await getNextFrame(
    currentScreen,
    validatedData
  );

  return new Response(
    frameGenerator({
      ...nextFrameProps,
      // Passing the screen parameter to the frame generator so the
      // next action will be known to come from that screen
      postUrl: `${process.env.DOMAIN_URL}/frames?screen=${nextScreen}`,
    }),
    {
      status: 200,
    }
  );
}
