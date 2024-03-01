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
				<div key={i} className="flex text-[20px] font-bold gap-1 justify-center">
					{row.split("").map((chr, i) => (
						// biome-ignore lint/a11y/useButtonType: <explanation>
						<button
							key={i}
							className={`text-white  min-w-[32px] bg-gray-500 px-3 py-3 rounded-md text-center ${
								isCorrect(chr)
									? "bg-green-700"
									: isMisplaced(chr)
									  ? "bg-yellow-600"
									  : isUsed(chr)
										  ? "bg-gray-800"
										  : ""
							}`}
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
