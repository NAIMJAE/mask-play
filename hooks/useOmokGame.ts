"use client";

import { requestAiMoveAsync } from "@/features/omok/gomoku/aiWorkerClient";
import {
  createBoard,
  oppositeTurn,
  placeStone,
  resolveGameStatus,
} from "@/features/omok/logic";
import type {
  Board,
  GameResult,
  LastMovesHighlight,
  OmokSetupConfig,
  Turn,
} from "@/types/omok";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";

type Phase = "playing" | "ended";

interface OmokState {
  board: Board;
  currentTurn: Turn;
  status: GameResult;
  phase: Phase;
  lastMoves: LastMovesHighlight;
}

const emptyLastMoves = (): LastMovesHighlight => ({
  human: null,
  ai: null,
});

type Action =
  | { type: "reset"; firstTurn: Turn }
  | { type: "humanMove"; row: number; col: number; humanStone: Turn }
  | { type: "applyAiMove"; row: number; col: number; aiStone: Turn };

function reduceOmok(state: OmokState, action: Action): OmokState {
  switch (action.type) {
    case "reset":
      return {
        board: createBoard(),
        currentTurn: action.firstTurn,
        status: "playing",
        phase: "playing",
        lastMoves: emptyLastMoves(),
      };
    case "humanMove": {
      if (state.phase !== "playing" || state.status !== "playing") return state;
      if (state.currentTurn !== action.humanStone) return state;
      const nextBoard = placeStone(
        state.board,
        action.row,
        action.col,
        action.humanStone,
      );
      if (!nextBoard) return state;
      const lastMoves: LastMovesHighlight = {
        ...state.lastMoves,
        human: { row: action.row, col: action.col },
      };
      const status = resolveGameStatus(nextBoard);
      if (status !== "playing") {
        return {
          board: nextBoard,
          currentTurn: state.currentTurn,
          status,
          phase: "ended",
          lastMoves,
        };
      }
      return {
        board: nextBoard,
        currentTurn: oppositeTurn(state.currentTurn),
        status: "playing",
        phase: "playing",
        lastMoves,
      };
    }
    case "applyAiMove": {
      if (state.phase !== "playing" || state.status !== "playing") return state;
      if (state.currentTurn !== action.aiStone) return state;
      const nextBoard = placeStone(
        state.board,
        action.row,
        action.col,
        action.aiStone,
      );
      if (!nextBoard) return state;
      const lastMoves: LastMovesHighlight = {
        ...state.lastMoves,
        ai: { row: action.row, col: action.col },
      };
      const status = resolveGameStatus(nextBoard);
      if (status !== "playing") {
        return {
          board: nextBoard,
          currentTurn: state.currentTurn,
          status,
          phase: "ended",
          lastMoves,
        };
      }
      return {
        board: nextBoard,
        currentTurn: oppositeTurn(state.currentTurn),
        status: "playing",
        phase: "playing",
        lastMoves,
      };
    }
    default:
      return state;
  }
}

export function useOmokGame(config: OmokSetupConfig) {
  const aiStone: Turn =
    config.playerColor === "black" ? "white" : "black";

  const [state, dispatch] = useReducer(
    reduceOmok,
    config.firstTurn,
    (firstTurn): OmokState => ({
      board: createBoard(),
      currentTurn: firstTurn,
      status: "playing",
      phase: "playing",
      lastMoves: emptyLastMoves(),
    }),
  );

  const humanMove = useCallback(
    (row: number, col: number) => {
      dispatch({
        type: "humanMove",
        row,
        col,
        humanStone: config.playerColor,
      });
    },
    [config.playerColor],
  );

  const restart = useCallback(() => {
    dispatch({ type: "reset", firstTurn: config.firstTurn });
  }, [config.firstTurn]);

  const aiEffectGen = useRef(0);
  const [aiThinking, setAiThinking] = useState<{
    active: boolean;
    delayMs: number;
    startedAt: number;
  }>({
    active: false,
    delayMs: 0,
    startedAt: 0,
  });

  useEffect(() => {
    if (state.phase !== "playing" || state.status !== "playing") return;
    if (state.currentTurn !== aiStone) return;

    const myGen = ++aiEffectGen.current;
    const boardSnapshot = state.board;
    const delayMs = 700 + Math.floor(Math.random() * 1401);
    setAiThinking({
      active: true,
      delayMs,
      startedAt: Date.now(),
    });

    const t = window.setTimeout(() => {
      void requestAiMoveAsync(
        boardSnapshot,
        aiStone,
        config.difficulty,
      ).then((move) => {
        if (myGen !== aiEffectGen.current) return;
        setAiThinking({
          active: false,
          delayMs: 0,
          startedAt: 0,
        });
        if (!move) return;
        dispatch({
          type: "applyAiMove",
          row: move.row,
          col: move.col,
          aiStone,
        });
      });
    }, delayMs);

    return () => {
      aiEffectGen.current += 1;
      setAiThinking({
        active: false,
        delayMs: 0,
        startedAt: 0,
      });
      clearTimeout(t);
    };
  }, [
    state.board,
    state.currentTurn,
    state.phase,
    state.status,
    aiStone,
    config.difficulty,
  ]);

  return {
    board: state.board,
    currentTurn: state.currentTurn,
    status: state.status,
    phase: state.phase,
    lastMoves: state.lastMoves,
    humanMove,
    restart,
    aiStone,
    aiThinking,
  };
}
