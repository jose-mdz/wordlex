"use client";
import { useEffect, useState } from "react";
import { WordleKeyboard } from "./components/wordle-keyboard";
import { dictionary } from "@/util/dictionary";
import { FilterIcon } from "./components/filter-icon";
import { TagsIcon } from "./components/tags-icon";

interface Placed {
	char: string;
	pos: number;
}

const LIMIT = 6;
const EMPTY = "     ";
const pristine = () => Array.from({ length: LIMIT }, () => EMPTY);
const randomWord = () =>
	dictionary[Math.floor(Math.random() * dictionary.length)];

export default function Home() {
	const [word, setWord] = useState(randomWord());
	const [currentTry, setCurrentTry] = useState(0);
	const [currentTryPos, setCurrentTryPos] = useState(0);
	const [toastText, setToastText] = useState<string>("");
	const [tries, setTries] = useState<string[]>(pristine());
	const [over, setOver] = useState(false);
	const [playWordSignal, setPlayWordSignal] = useState(false);
	const [filterMode, setFilterMode] = useState(false);
	const [artificialMisplaced, setArtificialMisplaced] = useState<Placed[]>([]);
	const [artificialCorrect, setArtificialCorrect] = useState<Placed[]>([]);
	const [tagsVisible, setTagsVisible] = useState(false);

	const newGame = () => {
		setWord(randomWord());
		setCurrentTry(0);
		setCurrentTryPos(0);
		setTries(pristine());
		setOver(false);
	};

	const toast = (message: string) => {
		setToastText(message);
		setTimeout(() => {
			setToastText("");
		}, 2000);
	};

	const setAndPlayWord = (w: string) => {
		const newTries = [...tries];
		newTries[currentTry] = w;
		setTries(newTries);
		setCurrentTryPos(5);
		setPlayWordSignal(true);
	};

	const setCurrentChar = (char: string, offset = 0) => {
		const newTries = [...tries];
		const pos = currentTryPos + offset;
		newTries[currentTry] =
			newTries[currentTry].substr(0, pos) +
			char +
			newTries[currentTry].substr(pos + 1);
		setTries(newTries);
	};

	const charIsIncorrect = (char: string) => {
		if (filterMode) {
			const inIncorrect = artificialCorrect.some((c) => c.char === char);
			const inCorrect = artificialMisplaced.some((c) => c.char === char);
			return !inIncorrect && !inCorrect;
		}
		return !word.includes(char);
	};

	const charIsMisplaced = (char: string, pos: number) => {
		if (filterMode) {
			return artificialMisplaced.some((c) => c.char === char && c.pos === pos);
		}
		return word.includes(char) && word.charAt(pos) !== char;
	};

	const charIsMisplacedAnywhere = (char: string): boolean => {
		for (let i = 0; i < currentTry; i++) {
			const w = tries[i];
			for (let j = 0; j < w.length; j++) {
				if (word.includes(w[j]) && word.charAt(j) !== w[j] && w[j] === char) {
					return true;
				}
			}
		}

		return false;
	};

	const charIsCorrect = (char: string, pos: number) => {
		if (filterMode) {
			return artificialCorrect.some((c) => c.char === char && c.pos === pos);
		}
		return word.includes(char) && word.charAt(pos) === char;
	};

	const charIsCorrectAnywhere = (char: string): boolean => {
		for (let i = 0; i < currentTry; i++) {
			const w = tries[i];
			for (let i = 0; i < w.length; i++) {
				if (w[i] === char && word[i] === char) {
					return true;
				}
			}
		}
		return false;
	};

	const playWord = () => {
		const w = tries[currentTry];
		if (filterMode) {
			setCurrentTry(currentTry + 1);
			setCurrentTryPos(0);
		} else if (w === word) {
			setCurrentTry(currentTry + 1);
			setOver(true);
		} else if (dictionary.includes(w)) {
			if (currentTry === LIMIT - 1) {
				setCurrentTry(currentTry + 1);
				setOver(true);
			} else {
				setCurrentTry(currentTry + 1);
				setCurrentTryPos(0);
			}
		} else {
			toast(`Not a valid word! (${w})`);
		}
	};

	const handleChar = (char: string) => {
		if (char === "\b") {
			if (currentTryPos === 0) return;
			setCurrentChar(" ", -1);
			setCurrentTryPos(currentTryPos - 1);
		} else if (char === "\n") {
			if (currentTryPos === 5) {
				playWord();
			} else {
				toast("Not 5 characters yet!");
			}
		} else if (currentTryPos < 5) {
			setCurrentChar(char);
			setCurrentTryPos(currentTryPos + 1);
		}
	};

	let wordle = Wordle.start();

	for (let i = 0; i < currentTry; i++) {
		const w = tries[i];
		w.split("").forEach((char, j) => {
			if (charIsCorrect(char, j)) {
				wordle = wordle.hasIn(char, j);
			} else if (charIsMisplaced(char, j)) {
				wordle = wordle.hasNotIn(char, j);
			} else if (charIsIncorrect(char)) {
				wordle = wordle.hasnt(char);
			}
		});
	}

	const filtered = wordle.s;

	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.key === "Enter") {
				handleChar("\n");
			} else if (e.key === "Backspace" || e.key === "Delete") {
				handleChar("\b");
			} else if (e.key.length === 1) {
				handleChar(e.key);
			}
		};

		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	});

	const handleCharClick = (char: string, pos: number) => {
		if (!filterMode) return;

		const correctIndex = artificialCorrect.findIndex(
			(c) => c.char === char && c.pos === pos,
		);

		// If found in correct, delete from correct
		if (correctIndex >= 0) {
			// delete from correct
			setArtificialCorrect(
				artificialCorrect.filter((p) => p.char === char && p.pos !== pos),
			);
		} else {
			const misplacedIndex = artificialMisplaced.findIndex(
				(c) => c.char === char && c.pos === pos,
			);

			// If found in misplaced, delete from misplaced and add to correct
			if (misplacedIndex < 0) {
				setArtificialMisplaced([...artificialMisplaced, { char, pos }]);
			} else {
				// add to correct
				setArtificialCorrect([...artificialCorrect, { char, pos }]);

				// remove from missplaced
				setArtificialMisplaced(
					artificialMisplaced.filter(
						({ char: c, pos: i }) => c === char && i !== pos,
					),
				);
			}
		}
	};

	const charIsUsed = (char: string) => {
		for (let i = 0; i < currentTry; i++) {
			if (tries[i].includes(char)) return true;
		}
		return false;
	};

	useEffect(() => {
		if (playWordSignal) {
			setPlayWordSignal(false);
			playWord();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [playWordSignal]);

	return (
		<main className="flex flex-col h-svh">
			<div className="flex p-2 px-4 border-b border-b-gray-700 text-gray-500">
				<div className="flex-1">
					<span
						className=" uppercase font-bold text-white"
						style={{ fontFamily: "'Alpha Slab One', sans" }}
					>
						Wordle
					</span>
					, but fast.
				</div>
				<button
					type="button"
					onClick={() => setTagsVisible(!tagsVisible)}
					className={`${
						tagsVisible ? "bg-green-600 text-white" : ""
					} px-2 rounded-md mr-2`}
				>
					<TagsIcon />
				</button>
				<button
					type="button"
					onClick={() => setFilterMode(!filterMode)}
					className={`${
						filterMode ? "bg-green-600 text-white" : ""
					} px-2 rounded-md`}
				>
					<FilterIcon />
				</button>
			</div>

			<div className="flex flex-col gap-2 my-2">
				{tries.map((try_, i) => {
					return (
						// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
						<div key={i} className="flex gap-2 justify-center">
							{try_.split("").map((chr, j) => (
								// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
								<div
									// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
									key={j}
									onClick={() => handleCharClick(chr, j)}
									className={`flex items-center justify-center border border-gray-600 size-[50px] text-center uppercase text-3xl${
										i < currentTry
											? charIsIncorrect(chr)
												? " bg-gray-800"
												: charIsMisplaced(chr, j)
												  ? " bg-yellow-600"
												  : charIsCorrect(chr, j)
													  ? " bg-green-700"
													  : ""
											: ""
									} ${filterMode?'size-[60px]':'size-[50px]'}`}
								>
									{chr}
								</div>
							))}
						</div>
					);
				})}
			</div>
			<div className="flex-1 flex flex-col  relative">
				{over && !filterMode ? (
					<div className="flex flex-col m-6 gap-6">
						<div className="text-center">Game over</div>
						<div className="text-center uppercase">{word}</div>
						<button
							type="button"
							className="bg-gray-800 text-white p-2 rounded-md"
							onClick={newGame}
						>
							New Game
						</button>
					</div>
				) : (
					<div
						className={`absolute inset-0 overflow-auto ${
							tagsVisible ? "" : "hidden"
						}`}
					>
						{filtered.slice(0, 100).map((w) => (
							<button
								type="button"
								key={w}
								className=" bg-gray-800 inline-block m-3 px-3 py-1 rounded-md uppercase text-center"
								onClick={() => setAndPlayWord(w)}
							>
								{w}
							</button>
						))}
					</div>
				)}
			</div>
			{over ? null : (
				<div>
					<WordleKeyboard
						onChar={handleChar}
						isCorrect={charIsCorrectAnywhere}
						isMisplaced={charIsMisplacedAnywhere}
						isUsed={charIsUsed}
					/>
				</div>
			)}
			{toastText && (
				<div className="fixed flex items-center justify-center w-full">
					<span className="rounded-md bg-gray-200 text-black py-2 px-6">
						{toastText}
					</span>
				</div>
			)}
		</main>
	);
}

class Wordle {
	static start() {
		return new Wordle(dictionary);
	}
	constructor(readonly s: string[]) {}
	has(chars: string) {
		let filtered = this.s;
		for (const char of chars) {
			filtered = filtered.filter((str) => str.includes(char));
		}
		return new Wordle(filtered);
	}
	hasnt(chars: string) {
		let filtered = this.s;
		for (const char of chars) {
			filtered = filtered.filter((str) => !str.includes(char));
		}
		return new Wordle(filtered);
	}
	hasIn(chars: string, index: number) {
		let filtered = this.s;
		for (const char of chars) {
			filtered = filtered.filter((x) => x[index] === char);
		}
		return new Wordle(filtered);
	}
	hasNotIn(chars: string, index: number) {
		let filtered = this.s;
		for (const char of chars) {
			filtered = filtered.filter((x) => x.includes(char) && x[index] !== char);
		}
		return new Wordle(filtered);
	}
}
