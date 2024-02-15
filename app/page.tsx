import { IFrameProps, getFrameMetaTags } from "@/utils/frame";
import { Metadata } from "next";

// Here, we put the home frame metadata

const INITIAL_FRAME_PROPS: IFrameProps = {
  imageUrl:
    "https://hips.hearstapps.com/hmg-prod/images/people-playing-paper-rock-scissors-royalty-free-illustration-1583269312.jpg",
  postUrl: `${process.env.DOMAIN_URL}/frames`,
  buttons: ["PLAY"],
};

export const metadata: Metadata = {
  title: "Rock Paper Scissors",
  other: {
    "og:image":
      "https://hips.hearstapps.com/hmg-prod/images/people-playing-paper-rock-scissors-royalty-free-illustration-1583269312.jpg",
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
