import { GameOutcome } from "../shared/interfaces/GameOutcome";
import { WinType } from "../shared/enums";
import SlotAnimation from "./SlotAnimation";
import SlotAudio from "./SlotAudio";
import { post } from "./services/HttpService";

export default class SlotGame {
    private slotWrapper: HTMLElement | null;
    private slotBody: HTMLElement | null;
    private spinButton: HTMLButtonElement | null;
    private modal: HTMLDialogElement | null;
    private bonusSpinButton: HTMLButtonElement | null;
    private slotResult: HTMLElement | null;
    private slotAmount: HTMLElement | null;
    private audioButton: HTMLButtonElement | null;

    private slotAnimation: SlotAnimation | null = null;
    private currentAmount: number = 100;
    private slotAudio: SlotAudio | null = null;
    private audioOn: boolean = false;

    constructor(private symbols: string[]) {
        this.slotWrapper = document.querySelector<HTMLElement>("#slotWrapper");
        this.slotBody = document.querySelector<HTMLElement>("#slotBody");
        this.spinButton = document.querySelector<HTMLButtonElement>("#playButton");
        this.modal = document.querySelector<HTMLDialogElement>("#modal");
        this.bonusSpinButton = document.querySelector<HTMLButtonElement>("#bonusButton");
        this.slotResult = document.querySelector<HTMLElement>("#slotResult");
        this.slotAmount = document.querySelector<HTMLElement>("#slotAmount");
        this.audioButton = document.querySelector<HTMLButtonElement>("#audioButton");

        this.initGame();
        this.setupListeners();
    }

    private initGame(): void {
        if (this.slotBody) {
            this.slotBody.innerHTML = "";

            if (this.slotAmount) this.slotAmount.textContent = this.currentAmount.toString();

            this.slotAnimation = new SlotAnimation(this.slotBody, this.symbols);

            this.slotAudio = new SlotAudio();
        }
    }

    private setupListeners(): void {
        this.spinButton?.addEventListener("click", () => {
            this.spin();
        });
        this.audioButton?.addEventListener("click", () => {
            this.audioOn = !this.audioOn;
            this.audioButton?.classList.toggle("audio-on");
            this.slotAudio?.enableAudio(this.audioOn);
            this.slotAudio?.play("bgMusic", true);
        });
        this.bonusSpinButton?.addEventListener("click", () => {
            this.modal?.close();
            this.spin(true);
        });
    }

    private async spin(bonusRound: boolean = false): Promise<any> {
        if (this.spinButton) this.spinButton.disabled = true;
        if (this.currentAmount < 10) return; //If amount is below 10, no more spins allowed.

        const resultData = await post("/spin"); // Fetch slot result from server.

        if (this.slotResult) {
            //Reset win display during spin.
            this.slotResult.innerHTML = "Spinnin...";
            this.slotWrapper?.classList.remove("win", "no-win");
        }

        if (!bonusRound) {
            this.updateAmount("subtract", 10); //Remove 10 coins for regular spins (not for bonus spin).
        }

        this.animate(resultData);
    }

    private animate(outcome: GameOutcome): void {
        //Play spin audio.
        this.slotAudio?.play("spin");
        this.slotAudio?.play("spinning");

        this.slotAnimation?.animateReels(outcome.reels); //Start animating reels.
        this.slotAnimation?.setAnimationCompleteCallback(() => {
            this.displayResult(outcome);
            this.slotAudio?.pause("spinning");
        });
    }

    private displayResult(outcome: GameOutcome): void {
        if (this.slotResult) this.slotResult.innerHTML = outcome.winType; //Display win type.

        //Add win type class for styling purposes.
        outcome.winType === WinType.NoWin
            ? this.slotWrapper?.classList.add("no-win")
            : this.slotWrapper?.classList.add("win");

        // Update amount and play audio based on win type.
        if (outcome.winType === WinType.BigWin) {
            this.updateAmount("add", 50);
            this.slotAudio?.play("bigWin");
        } else if (outcome.winType === WinType.SmallWin) {
            this.updateAmount("add", 15);
            this.slotAudio?.play("smallWin");
        } else {
            this.slotAudio?.play("noWin");
        }

        if (outcome.bonus && this.modal) {
            this.modal?.showModal();
            this.slotAudio?.play("bonus");
        } else {
            //Enable spin button when result has been displayed.
            if (this.spinButton) this.spinButton.disabled = false;
        }
    }

    private updateAmount(operation: string, amount: number): void {
        if (this.slotAmount) {
            this.currentAmount = parseInt(this.slotAmount.textContent || "0", 10);
            if (operation === "add") {
                this.currentAmount += amount;
            } else {
                this.currentAmount -= amount;
            }
            this.slotAmount.textContent = this.currentAmount.toString();
        }
    }
}
