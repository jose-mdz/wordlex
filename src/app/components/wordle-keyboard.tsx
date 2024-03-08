export function WordleKeyboard({
	onChar,
	isUsed,
	isCorrect,
	isMisplaced,
}: {
	onChar: (char: string) => void;
	isUsed: (char: string) => boolean;
	isCorrect: (char: string) => boolean;
	isMisplaced: (char: string) => boolean;
}) {
	const rows = ["qwertyuiop", "asdfghjkl", "\nzxcvbnm\b"];

	return (
		<div className="m-3 flex flex-col gap-1">
			{rows.map((row, i) => (
				<div key={i} className="flex font-bold gap-1 justify-center">
					{row.split("").map((chr, i) => (
						// biome-ignore lint/a11y/useButtonType: <explanation>
						<button
							key={i}
							className={`text-white  min-w-[32px] h-[53px] bg-gray-500 rounded-md text-center flex justify-center items-center ${
								isCorrect(chr)
									? "bg-green-700"
									: isMisplaced(chr)
									  ? "bg-yellow-600"
									  : isUsed(chr)
										  ? "bg-gray-800"
										  : ""
							} ${chr === "\n" ? "text-[15px]  px-2" : "text-[20px]"}`}
							onClick={() => onChar(chr)}
						>
							{chr.toUpperCase().replace("\n", "Enter").replace("\b", "⌫")}
						</button>
					))}
				</div>
			))}
		</div>
	);
}
