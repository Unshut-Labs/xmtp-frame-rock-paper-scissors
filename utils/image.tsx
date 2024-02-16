import * as fs from "fs";
import { join } from "path";
import { SCREEN, getConversation, getCurrentGame, getWinner } from "./play";
import { ImageResponse } from "@vercel/og";

// This code generates a PNG Image using the ImageResponse helper,
// using data passed to it (from the URL params) .

const fontPath = join(process.cwd(), "public/PressStart2P-Regular.ttf");
let fontReg = fs.readFileSync(fontPath);

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

  let image = "1";
  switch (data.screen) {
    case SCREEN.HOME:
      image = "1";
      break;
    case SCREEN.PLAY:
      image = "2";
      break;
    case SCREEN.RESULT_NOT_READY:
      image = "3";
      break;
    case SCREEN.RESULT_READY:
      image = gameWinner
        ? gameWinner === data.playerAddress
          ? "4"
          : "5"
        : "6";
      break;

    default:
      image = "1";
      break;
  }

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
        <img src={`${process.env.DOMAIN_URL}/${image}.png`} />
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "18%",
            position: "absolute",
            left: 0,
            bottom: 0,
            color: "white",
            fontSize: 35,
            opacity: data.screen === SCREEN.HOME ? 0 : 1,
          }}
        >
          <div
            style={{
              width: "40%",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              paddingLeft: 40,
            }}
          >
            YOU: {playerScore} PTS
          </div>
          <div
            style={{
              width: "60%",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              paddingRight: 40,
            }}
          >
            OPPONENT: {otherScore} PTS
          </div>
        </div>
      </div>
    ),
    {
      width: 1146,
      height: 600,
      fonts: [
        {
          name: "PressStart",
          data: fontReg,
          weight: 400,
          style: "normal",
        },
      ],
    }
  );

  const imgBuffer = await imageResponse?.arrayBuffer();
  return Buffer.from(imgBuffer);
}
