export function WordleKeyboard({ onChar }: { onChar: (char: string) => void }) {
  const rows = ["quertyuiop", "asdfghjkl", "\nzxcvbnm\b"];

  return (
    <div className="m-3 flex flex-col gap-1">
      {rows.map((row, i) => (
        <div key={i} className="flex gap-1 justify-center">
          {row.split("").map((chr, i) => (
            <button
              key={i}
              className="text-white bg-gray-500 min-w-[32px]  px-3 py-3 rounded-md text-center"
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
