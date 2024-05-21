import { GameOutcome } from "../shared/interfaces/GameOutcome";
import { WinType } from "../shared/enums";

function generateReelNumbers(): number[] {
    // Create an array of numbers from 1 to 9
    let numbers = Array.from({ length: 9 }, (_, i) => i + 1);

    // Borrowing Fisher-Yates shuffle algorithm to shuffle the result array.
    for (let i = numbers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }

    // Return the first three elements from the shuffled array
    return numbers.slice(0, 3);
}

function evaluateResults(row: number[]): WinType {
    const uniqueNumbers = new Set(row);
    switch (uniqueNumbers.size) {
        case 1:
            return WinType.BigWin;
        case 2:
            return WinType.SmallWin;
        case 3:
            return WinType.NoWin;
        default:
            return WinType.Invalid;
    }
}

function determineWinType(results: WinType[]): WinType {
    if (results.includes(WinType.BigWin)) {
        return WinType.BigWin;
    }
    if (results.includes(WinType.SmallWin)) {
        return WinType.SmallWin;
    }
    return WinType.NoWin;
}

function checkBonusRound(): boolean {
    const bonus = Math.random() <= 0.1;

    return bonus;
}

export function playSlot(): GameOutcome {
    const reel1 = generateReelNumbers();
    const reel2 = generateReelNumbers();
    const reel3 = generateReelNumbers();

    const reels = [reel1, reel2, reel3];

    const results: WinType[] = [];

    // Here we create an array with win types per row.
    for (let i = 0; i < 3; i++) {
        const resultPerRow = evaluateResults([reel1[i], reel2[i], reel3[i]]);
        results.push(resultPerRow);
    }

    // Here we determine win type based on all rows for the current spin.
    const winType = determineWinType(results);

    const bonus = checkBonusRound(); // This will be true for 10% of spins.

    return { reels, winType, bonus };
}
