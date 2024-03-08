import { useState } from "react";
import { dictionary } from "../util/dictionary";

const LIMIT = 6;
const WORD_LENGTH = 5;
const EMPTY = "";
const PRISTINE = Array.from({ length: LIMIT }, () => EMPTY);

interface WordleGame {
	word: string;
	tries: string[];
	currentLine: number;
	over: boolean;
	won?: boolean;
}

interface CharPos {
	tryPos: number;
	charPos: number;
}

export function createGame(): WordleGame {
	const word = dictionary[Math.floor(Math.random() * dictionary.length)];
	console.log({ word, createGame: true });
	return {
		word,
		tries: PRISTINE,
		currentLine: 0,
		over: false,
	};
}

export function useWordleGame({
	game,
	toast,
}: { game: WordleGame; toast: (msg: string) => void }) {
	const { word } = game;

	const playChar = (char: string): WordleGame => {
		const newGame = { ...game };
		const currentTry = newGame.tries[newGame.currentLine];

		if (newGame.over) {
			return game;
		}

		if (char === "\n") {
			if (currentTry.length < WORD_LENGTH) {
				toast("Word is too short");
				return newGame;
			}
			if (newGame.currentLine === LIMIT) {
				toast("Game over");
				newGame.over = true;
				return newGame;
			}
			if (currentTry === word) {
				toast("You won!");
				newGame.over = true;
				newGame.won = true;
				return newGame;
			}
			if (dictionary.includes(currentTry)) {
				newGame.currentLine++;
				return newGame;
			}
		} else if (char === "\b") {
			if (currentTry.length > 0) {
				newGame.tries[newGame.currentLine] = currentTry.slice(0, -1);
			}
		} else {
			if (currentTry.length === WORD_LENGTH) {
				toast("Word is too long");
				return newGame;
			}

			newGame.tries[newGame.currentLine] = currentTry + char;
		}

		return newGame;
	};

	const playWord = (word: string) => {};

	const isCorrect = (char: string, pos: CharPos | null = null): boolean => {
		return false;
	};

	const isMisplaced = (char: string, pos: CharPos | null = null): boolean => {
		return false;
	};

	const isUsed = (char: string, pos: CharPos | null = null): boolean => {
		return false;
	};

	const padWord = (word: string): string => {
		return word.padEnd(WORD_LENGTH, " ");
	};

	return { playChar, playWord, isCorrect, isMisplaced, isUsed, padWord };
}
