import { IFrameProps, getFrameMetaTags } from "@/utils/frame";
import { Metadata } from "next";

// Here, we put the home frame metadata

const INITIAL_FRAME_PROPS: IFrameProps = {
  imageUrl: `${process.env.DOMAIN_URL}/frames/image`,
  postUrl: `${process.env.DOMAIN_URL}/frames`,
  buttons: ["PLAY"],
};

export const metadata: Metadata = {
  title: "Rock Paper Scissors",
  other: {
    "og:image": `${process.env.DOMAIN_URL}/frames/image`,
    ...getFrameMetaTags(INITIAL_FRAME_PROPS),
  },
};

export default function Home() {
  return (
    <>
      <div>Rock / Paper / Scissors XMTP Frame by Converse</div>
    </>
  );
}
