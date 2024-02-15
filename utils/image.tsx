import * as fs from "fs";
import { join } from "path";
import { SCREEN, getConversation, getCurrentGame, getWinner } from "./play";
import { ImageResponse } from "@vercel/og";

// This code generates a PNG Image using the ImageResponse helper,
// using data passed to it (from the URL params) .

const interRegPath = join(process.cwd(), "public/Inter-Regular.ttf");
let interReg = fs.readFileSync(interRegPath);

type Data = {
  screen: SCREEN;
  playerAddress: string;
  conversationId: string;
};

export async function generateImage(data: Data) {
  const conversation = await getConversation(data.conversationId);
  const game = await getCurrentGame(data.conversationId);
  const playerScore = conversation?.score?.[data.playerAddress] || 0;
  const availableScores = Object.keys(conversation?.score || {});
  const otherPlayer = availableScores.find(
    (address) => address !== data.playerAddress
  );
  const otherScore =
    (otherPlayer ? conversation?.score?.[otherPlayer] : 0) || 0;

  const gameWinner =
    game && data.screen === SCREEN.RESULT_READY ? getWinner(game) : undefined;

  const imageResponse = new ImageResponse(
    (
      <div
        style={{
          display: "flex", // Use flex layout
          flexDirection: "row", // Align items horizontally
          alignItems: "stretch", // Stretch items to fill the container height
          width: "100%",
          height: "100vh", // Full viewport height
          backgroundColor: "white",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            paddingLeft: 24,
            paddingRight: 24,
            lineHeight: 1.2,
            fontSize: 36,
            color: "black",
            flex: 1,
            overflow: "hidden",
            marginTop: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            You: {playerScore}
            <br />
            Other: {otherScore}
            <br />
            SCREEN: {data.screen}
            <br />
            {data.screen === SCREEN.RESULT_READY && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                WINNER:{" "}
                {gameWinner
                  ? gameWinner === data.playerAddress
                    ? "YOU"
                    : "OTHER"
                  : "NO Winner"}
              </div>
            )}
          </div>
        </div>
      </div>
    ),
    {
      width: 1146,
      height: 600,
      fonts: [
        {
          name: "Inter",
          data: interReg,
          weight: 400,
          style: "normal",
        },
      ],
    }
  );

  const imgBuffer = await imageResponse?.arrayBuffer();
  return Buffer.from(imgBuffer);
}
