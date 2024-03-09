import { dictionary } from "./dictionary";

export class Wordle {
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
