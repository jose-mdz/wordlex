"use client";
import { useEffect, useState } from "react";
import { WordleKeyboard } from "./components/wordle-keyboard";
import { dictionary } from "@/util/dictionary";

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
    return !word.includes(char);
  };

  const charIsMisplaced = (char: string, pos: number) => {
    return word.includes(char) && word.charAt(pos) !== char;
  };

  const charIsCorrect = (char: string, pos: number) => {
    return word.includes(char) && word.charAt(pos) === char;
  };

  const playWord = () => {
    const w = tries[currentTry];
    if (w === word) {
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
      toast("Not a valid word! (" + w + ")");
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

  useEffect(() => {
    if (playWordSignal) {
      setPlayWordSignal(false);
      playWord();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playWordSignal]);

  return (
    <main className="flex flex-col h-svh">
      <div className="p-2 px-4 border-b border-b-gray-700 text-gray-500">
        <span
          className=" uppercase font-bold text-white"
          style={{ fontFamily: "'Alpha Slab One', sans" }}
        >
          Wordle
        </span>
        , but fast.
      </div>
      <div className="flex flex-col gap-2 my-2">
        {tries.map((try_, i) => {
          return (
            <div key={i} className="flex gap-2 justify-center">
              {try_.split("").map((chr, j) => (
                <div
                  key={j}
                  className={
                    "flex items-center justify-center border-2 border-gray-600 size-16 text-center uppercase text-3xl" +
                    (i < currentTry
                      ? charIsIncorrect(chr)
                        ? " bg-gray-800"
                        : charIsMisplaced(chr, j)
                        ? " bg-yellow-600"
                        : charIsCorrect(chr, j)
                        ? " bg-green-700"
                        : ""
                      : "")
                  }
                >
                  {chr}
                </div>
              ))}
            </div>
          );
        })}
      </div>
      <div className="flex-1 flex flex-col  relative">
        {over ? (
          <div className="flex flex-col m-6 gap-6">
            <div className="text-center">Game over</div>
            <div className="text-center uppercase">{word}</div>
            <button
              className="bg-gray-800 text-white p-2 rounded-md"
              onClick={newGame}
            >
              New Game
            </button>
          </div>
        ) : (
          <div className=" absolute inset-0 overflow-auto">
            {filtered.slice(0, 100).map((w) => (
              <div
                key={w}
                className=" bg-gray-800 inline-block m-3 px-3 py-1 rounded-md uppercase text-center"
                onClick={() => setAndPlayWord(w)}
              >
                {w}
              </div>
            ))}
          </div>
        )}
      </div>
      {over ? null : (
        <div>
          <WordleKeyboard onChar={handleChar} />
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
