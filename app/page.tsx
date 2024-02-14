import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rock Paper Scissors",
  other: {
    "fc:frame": "vNext",
    "fc:frame:image": "https://hips.hearstapps.com/hmg-prod/images/people-playing-paper-rock-scissors-royalty-free-illustration-1583269312.jpg",
    "og:image": "https://hips.hearstapps.com/hmg-prod/images/people-playing-paper-rock-scissors-royalty-free-illustration-1583269312.jpg",
    "xmtp:frame:post-url":
      "https://be23-2a01-cb04-85e-2800-75a9-4f30-c89-94fe.ngrok-free.app/frames",
    "fc:frame:button:1": "Play!",
  },
};

export default function Home() {
  return (
    <>
      <div>MAIN PAGE CONTENT</div>
    </>
  );
}
