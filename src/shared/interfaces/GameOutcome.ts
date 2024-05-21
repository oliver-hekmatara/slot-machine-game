import { WinType } from "../enums";

export interface GameOutcome {
    reels: number[][];
    winType: WinType;
    bonus: boolean;
}
