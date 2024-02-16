import { kv } from "@vercel/kv";
import { XmtpValidationResponse } from "@xmtp/frames-validator";
import { nanoid } from "nanoid";

// This code is specific to this Rock / Paper / Scissors game
// and implements the gameplay but is not specifically linked
// to frames.

type Move = "ROCK" | "PAPER" | "SCISSORS";
const MOVES_ORDER = ["ROCK", "PAPER", "SCISSORS"] as Move[];
export const PLAY_BUTTONS_LABELS = ["ROCK 🪨", "PAPER 📜", "SCISSORS ✂️"];

type Game = {
  gameId: string;
  conversationId: string;
  moves: { [playerAddress: string]: Move };
};

type Conversation = {
  gameId: string;
  score: { [playerAddress: string]: number };
};

export const getWinner = (game: Game) => {
  const players = Object.keys(game.moves);
  if (players.length !== 2) return undefined;
  const bestMove = getBestMove(game.moves[players[0]], game.moves[players[1]]);
  if (!bestMove) return undefined;
  if (bestMove === game.moves[players[0]]) {
    return players[0];
  } else {
    return players[1];
  }
};

const play = async (
  conversationId: string,
  playerAddress: string,
  move: Move
) => {
  console.log(`${playerAddress} just played ${move} in ${conversationId}`);

  const game = await getOrCreateGame(conversationId);
  if (game.moves[playerAddress]) {
    return false;
  }
  await saveMove(game, playerAddress, move);
  const otherPlayers = Object.keys(game.moves);
  if (otherPlayers.length > 0) {
    const otherMove = game.moves[otherPlayers[0]];
    const bestMove = getBestMove(move, otherMove);

    const isWinner = bestMove === move;
    // Let's save the fact that there is a winner !
    if (bestMove) {
      await saveWinner(
        conversationId,
        isWinner ? playerAddress : otherPlayers[0]
      );
    }
    return true;
  }
  return false;
};

const saveWinner = async (conversationId: string, playerAddress: string) => {
  const conversation = await getConversation(conversationId);
  if (!conversation) return;

  const newConversation = {
    ...conversation,
    score: {
      ...(conversation.score || {}),
      [playerAddress]: (conversation.score?.[playerAddress] || 0) + 1,
    },
  };

  await kv.set<Conversation>(conversationId, newConversation);
};

const saveMove = async (game: Game, playerAddress: string, move: Move) => {
  const updatedGame = {
    ...game,
    moves: { ...game.moves, [playerAddress]: move },
  };
  await kv.set<Game>(game.gameId, updatedGame);
  return updatedGame;
};

const getGameId = async (conversationId: string) => {
  const conversation = await getConversation(conversationId);
  return conversation?.gameId;
};

export const getConversation = (conversationId: string) =>
  kv.get<Conversation>(conversationId);

export const getCurrentGame = async (conversationId: string) => {
  const currentGameId = await getGameId(conversationId);
  if (!currentGameId) return null;
  const currentGame = await getGame(currentGameId);
  return currentGame;
};

const getOrCreateGame = async (conversationId: string) => {
  const game = await getCurrentGame(conversationId);
  if (game && Object.keys(game.moves).length < 2) {
    // Game exists and is not ended
    return game;
  }
  // Else, let's create it !
  const gameId = nanoid();
  const currentConversation = await getConversation(conversationId);
  await kv.set<Conversation>(conversationId, {
    gameId,
    score: currentConversation?.score || {},
  });
  const newGame: Game = { conversationId, moves: {}, gameId };
  await kv.set<Game>(gameId, newGame);
  return newGame;
};

const getGame = (gameId: string) => kv.get<Game>(gameId);

const getBestMove = (move1: Move, move2: Move): Move | undefined => {
  const moves = [move1, move2];
  if (moves.includes("PAPER") && moves.includes("ROCK")) return "PAPER";
  if (moves.includes("PAPER") && moves.includes("SCISSORS")) return "SCISSORS";
  if (moves.includes("SCISSORS") && moves.includes("ROCK")) return "ROCK";
  return undefined;
};

export enum SCREEN {
  HOME = "HOME",
  PLAY = "PLAY",
  RESULT_READY = "RESULT_READY",
  RESULT_NOT_READY = "RESULT_NOT_READY",
}

export const handlePlayAction = async (
  lastScreen: SCREEN,
  validatedData: XmtpValidationResponse
): Promise<SCREEN> => {
  // Let's get current player game for this conversation
  const currentGame = await getCurrentGame(
    validatedData.actionBody.opaqueConversationIdentifier
  );
  const canPlay =
    !currentGame ||
    !currentGame.moves[validatedData.verifiedWalletAddress] ||
    Object.keys(currentGame.moves).length === 2;
  if (lastScreen === SCREEN.HOME || lastScreen === SCREEN.RESULT_READY) {
    if (canPlay) {
      return SCREEN.PLAY;
    } else {
      return SCREEN.RESULT_NOT_READY;
    }
  } else if (lastScreen === SCREEN.PLAY) {
    const isDone = await play(
      validatedData.actionBody.opaqueConversationIdentifier,
      validatedData.verifiedWalletAddress,
      MOVES_ORDER[validatedData.actionBody.buttonIndex - 1]
    );
    if (isDone) {
      return SCREEN.RESULT_READY;
    } else {
      return SCREEN.RESULT_NOT_READY;
    }
  } else if (lastScreen === SCREEN.RESULT_NOT_READY) {
    const isDone = Object.keys((currentGame as Game).moves || {}).length === 2;
    const hasPlayed =
      currentGame && currentGame.moves?.[validatedData.verifiedWalletAddress];
    if (isDone) {
      return SCREEN.RESULT_READY;
    } else if (hasPlayed) {
      return SCREEN.RESULT_NOT_READY;
    } else {
      return SCREEN.PLAY;
    }
  }
  throw new Error("Error: did not handle that gameplay case");
};
