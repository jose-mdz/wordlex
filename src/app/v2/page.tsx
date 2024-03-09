"use client";

import { useEffect, useState } from "react";
import { dictionary } from "@/util/dictionary";
import { WordleKeyboard } from "../components/wordle-keyboard";
import { createGame, getResults, useWordleGame } from "@/hooks/useWordleGame";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Zap } from "../components/zap-icon";
import { Wordle } from "@/util/wordle";

interface History {
	games: number;
	wins: number;
	losses: number;
	levels: Record<string, number>;
}

const DefaultHistory: History = {
	games: 0,
	wins: 0,
	losses: 0,
	levels: {},
};

export default function Page() {
	const [game, setGame] = useState(createGame());
	const [toastText, setToastText] = useState<string>("");
	const [powerUsed, setPowerUsed] = useState(false);
	const [history, setHistory] = useLocalStorage<History>(
		"wordlex-history",
		DefaultHistory,
	);

	const toast = (message: string) => {
		setToastText(message);
		setTimeout(() => {
			setToastText("");
		}, 2000);
	};

	const { playChar, playWord, padWord } = useWordleGame({ game, toast });

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (game.over) {
			setHistory((prev) => {
				const newHistory = { ...prev };
				newHistory.games++;
				if (game.won) {
					newHistory.wins++;
				} else {
					newHistory.losses++;
				}
				const level = game.currentLine - 1;
				newHistory.levels[level] = (newHistory.levels[level] || 0) + 1;
				return newHistory;
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [game.over]);

	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.key === "Enter") {
				setGame(playChar("\n"));
			} else if (e.key === "Backspace" || e.key === "Delete") {
				setGame(playChar("\b"));
			} else if (e.key.length === 1) {
				setGame(playChar(e.key));
			}
		};

		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, [playChar]);

	const { tries: results, letters } = getResults(game);
	let wordle = Wordle.start();

	for (let i = 0; i < results.length; i++) {
		const w = results[i];

		for (let j = 0; j < w.length; j++) {
			if (w[j] === "correct") {
				wordle = wordle.hasIn(game.tries[i][j], j);
			} else if (w[j] === "misplaced") {
				wordle = wordle.hasNotIn(game.tries[i][j], j);
			} else if (w[j] === "used") {
				wordle = wordle.hasnt(game.tries[i][j]);
			}
		}
	}

	const filtered = wordle.s;

	const usePower = () => {
		if (filtered.length > 0) {
			const randomIndex = Math.floor(Math.random() * filtered.length);
			const randomWord = filtered[randomIndex];
			console.log({ randomWord });
			setGame(playWord(randomWord));
		}
		setPowerUsed(true);
	};

	console.log({ word: game.word, filtered });

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
					disabled={powerUsed}
					className={`${powerUsed ? "opacity-10" : ""} px-2 rounded-md mr-2`}
					onClick={usePower}
				>
					<Zap />
				</button>
			</div>
			<div className="flex flex-col gap-2 my-2">
				{game.tries.map((try_, i) => {
					return (
						// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
						<div key={i} className="flex gap-2 justify-center">
							{padWord(try_)
								.split("")
								.map((chr, j) => {
									const pos = { tryPos: i, charPos: j };
									return (
										// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
										<div
											// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
											key={j}
											onClick={() => playChar(chr)}
											className={`flex items-center justify-center border border-gray-600 size-[50px] text-center uppercase text-3xl${
												results[i]?.[j] === "used"
													? " bg-gray-800"
													: results[i]?.[j] === "misplaced"
													  ? " bg-yellow-600"
													  : results[i]?.[j] === "correct"
														  ? " bg-green-700"
														  : ""
											} ${"size-[60px]"}`}
										>
											{chr}
										</div>
									);
								})}
						</div>
					);
				})}
			</div>
			<div className="flex-1 flex flex-col  relative">
				{game.over ? (
					<div className="flex flex-col m-6 gap-6">
						<div className="text-center">
							{game.won ? "Good Job!" : "Game Over"}
						</div>
						<div className="flex justify-center">
							<div className="text-center uppercase rounded-lg p-2 bg-gray-300 text-gray-900 inline-block text-sm">
								{game.word}
							</div>
						</div>
						<div>
							<div>
								Games: {history.games} Wins:{" "}
								{Math.round((history.wins / history.games) * 100)}%
							</div>
							<div>
								<div className="py-2">Guess Distribution</div>
								<div className="flex flex-col gap-1">
									{Array.from({ length: 6 }).map((_, i) => {
										const levelsMax = Math.max(
											...Object.values(history.levels),
										);
										return (
											// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
											<div key={i} className="flex gap-3">
												<div>{i + 1}</div>
												<div
													className={`text-right px-1 ${
														history.levels[i] ? "bg-green-700" : "bg-gray-800"
													}`}
													style={{
														width: `${
															history.levels[i]
																? (history.levels[i] / levelsMax) * 100
																: ""
														}%`,
													}}
												>
													{history.levels[i]
														? `${Math.round(
																(history.levels[i] / history.wins) * 100,
														  )}%`
														: 0}
												</div>
											</div>
										);
									})}
								</div>
							</div>
						</div>
						<button
							type="button"
							className="bg-gray-800 text-white p-2 rounded-md"
							onClick={() => setGame(createGame())}
						>
							New Game
						</button>
					</div>
				) : (
					<div />
				)}
			</div>
			{game.over ? null : (
				<div>
					<WordleKeyboard
						onChar={(c) => setGame(playChar(c))}
						isCorrect={(c) => letters[c] === "correct"}
						isMisplaced={(c) => letters[c] === "misplaced"}
						isUsed={(c) => letters[c] === "used"}
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
