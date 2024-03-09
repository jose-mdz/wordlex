import { dictionary } from "../util/dictionary";

const LIMIT = 6;
const WORD_LENGTH = 5;
const EMPTY = "";
const PRISTINE = () => Array.from({ length: LIMIT }, () => EMPTY);

type Result = "correct" | "misplaced" | "used" | "empty";

interface WordleGame {
	word: string;
	tries: string[];
	currentLine: number;
	over: boolean;
	won?: boolean;
	results: Result[][];
}

export function createGame(): WordleGame {
	const word = dictionary[Math.floor(Math.random() * dictionary.length)];
	return {
		word,
		tries: PRISTINE(),
		currentLine: 0,
		over: false,
		results: [],
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
				newGame.currentLine++;
				newGame.over = true;
				newGame.won = true;
				return newGame;
			}
			if (dictionary.includes(currentTry)) {
				console.log("moving next");
				newGame.currentLine++;
				return newGame;
			}
			toast("Not in dictionary");
			return newGame;
		}

		if (char === "\b") {
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

	const playWord = (word: string): WordleGame => {
		const newGame = { ...game };

		if (game.tries.length < LIMIT) {
			newGame.tries[game.tries.length] = word;
			playChar("\n");
		}

		return newGame;
	};

	const padWord = (word: string): string => {
		return word.padEnd(WORD_LENGTH, " ");
	};

	return { playChar, playWord, padWord };
}

export function getResults(game: WordleGame): {
	tries: Result[][];
	letters: Record<string, Result>;
} {
	const letters: Record<string, Result> = {};
	const assignLetter = (char: string, result: Result) => {
		if (!(char in letters)) {
			letters[char] = result;
		} else {
			const current = letters[char];

			if (current === "correct") {
				return;
			}

			if (current === "misplaced" && result === "correct") {
				letters[char] = result;
			}

			if (current === "used" && result !== "used") {
				letters[char] = result;
			}
		}
	};

	const tries = game.tries.map((attempt, i) => {
		if (i === game.currentLine) {
			return [];
		}
		const attemptResult = attempt.split("").map((char, j) => {
			const result = (() => {
				if (game.word[j] === char) {
					return "correct";
				}
				if (game.word.includes(char)) {
					return "misplaced";
				}
				return "used";
			})();

			assignLetter(char, result);

			return result;
		});

		// Check for repeated chars
		// if there is a repeated char in the attempt
		//    if the char is not repeated in word
		//  	  make sure a second misplaced is set as used
		//    end if
		// end if
		const repeatedCharsAttempt = repeatedChars(attempt);
		const repeatedCharsWord = repeatedChars(game.word);

		for (const char of repeatedCharsAttempt) {
			if (repeatedCharsWord.includes(char)) {
				break;
			}

			const hasASuccessChar = (() => {
				for (let j = 0; j < attemptResult.length; j++) {
					if (attempt[j] === char && attemptResult[j] === "correct") {
						return true;
					}
				}
				return false;
			})();

			if (hasASuccessChar) {
				// clean up any misplaced
				for (let j = 0; j < attemptResult.length; j++) {
					if (attempt[j] === char && attemptResult[j] === "misplaced") {
						attemptResult[j] = "used";
					}
				}
			} else {
				// clean up second misplaced
				let misplacedCount = 0;
				for (let j = 0; j < attemptResult.length; j++) {
					if (attempt[j] === char && attemptResult[j] === "misplaced") {
						if (misplacedCount > 0) {
							attemptResult[j] = "used";
						}
						misplacedCount++;
					}
				}
			}
		}

		return attemptResult;
	});

	return { tries, letters };
}

function repeatedChars(str: string): string[] {
	const repeated = new Set<string>();
	for (const chr of str) {
		if (str.indexOf(chr) !== str.lastIndexOf(chr)) {
			repeated.add(chr);
		}
	}
	return Array.from(repeated.values());
}
