"use client";

import { useEffect, useState } from "react";
import { dictionary } from "@/util/dictionary";
import { WordleKeyboard } from "../components/wordle-keyboard";
import { createGame, useWordleGame } from "@/hooks/useWordleGame";

export default function Page() {
	const [game, setGame] = useState(createGame());
	const [tagsVisible, setTagsVisible] = useState(false);
	const [toastText, setToastText] = useState<string>("");

	const toast = (message: string) => {
		setToastText(message);
		setTimeout(() => {
			setToastText("");
		}, 2000);
	};

	const { playChar, playWord, isCorrect, isMisplaced, isUsed, padWord } =
		useWordleGame({
			game,
			toast,
		});

	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.key === "Enter") {
				playChar("\n");
			} else if (e.key === "Backspace" || e.key === "Delete") {
				playChar("\b");
			} else if (e.key.length === 1) {
				playChar(e.key);
			}
		};

		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, [playChar]);

	const filtered = dictionary;

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
												isUsed(chr, pos)
													? " bg-gray-800"
													: isMisplaced(chr, pos)
													  ? " bg-yellow-600"
													  : isCorrect(chr, pos)
														  ? " bg-green-700"
														  : ""
											} ${tagsVisible ? "size-[40px]" : "size-[60px]"}`}
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
						<div className="text-center">Game over</div>
						<div className="text-center uppercase">{game.word}</div>
						<button
							type="button"
							className="bg-gray-800 text-white p-2 rounded-md"
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
								onClick={() => playWord(w)}
							>
								{w}
							</button>
						))}
					</div>
				)}
			</div>
			{game.over ? null : (
				<div>
					<WordleKeyboard
						onChar={(c) => setGame(playChar(c))}
						isCorrect={isCorrect}
						isMisplaced={isMisplaced}
						isUsed={isUsed}
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
