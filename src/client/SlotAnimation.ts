import * as PIXI from "pixi.js";
import { Application } from "pixi.js";

export default class SlotAnimation {
    private app: PIXI.Application;
    private reels: PIXI.Container[] = [];
    private textures: PIXI.Texture[] = [];

    private canvasWidth: number = 620;
    private canvasHeight: number = 458;
    private reelAmount: number = 3;
    private reelWidth: number = this.canvasWidth / this.reelAmount;
    private symbolsPerReel: number = 9;
    private symbolHeight: number = 150;
    private onAnimationComplete: (() => void) | null = null;

    constructor(parent: HTMLElement, private symbolPaths: string[]) {
        this.app = new Application({
            width: this.canvasWidth,
            height: this.canvasHeight,
            backgroundAlpha: 0,
        });

        // Add Pixi canvas to wrapper element.
        parent.appendChild(this.app.view as HTMLCanvasElement);

        this.loadTextures();
        this.setupReels();
    }

    // Create textures from images.
    private loadTextures(): void {
        this.symbolPaths.forEach((path) => {
            const texture = PIXI.Texture.from(path);
            this.textures.push(texture);
        });
    }

    private setupReels(): void {
        // Create reels and add to canvas.
        for (let i = 0; i < this.reelAmount; i++) {
            const reel = new PIXI.Container();
            reel.x = i * this.reelWidth;
            reel.y = 20;
            this.app.stage.addChild(reel);
            this.reels.push(reel);
        }

        // Add sprites to the reels. (9 per reel)
        this.reels.forEach((reel) => {
            for (let i = 0; i < this.symbolsPerReel; i++) {
                const textureIndex = Math.floor(Math.random() * this.textures.length);
                const sprite = this.setupSprite(i, textureIndex);
                reel.addChild(sprite);
            }
        });
    }

    public animateReels(outcome: number[][]): void {
        const animationDuration = 4000;
        const fadeStart = animationDuration * 0.97; // Start fading out at 97% of the duration
        const fadeDuration = 100;
        const fullReelHeight = this.symbolsPerReel * this.symbolHeight; //Calculate the height of the reel, all 9 sprites. (even outside view)

        this.reels.forEach((reel, index) => {
            const startTime = Date.now();
            const initialDelay = index * 200; // Delay for ripple effect, longer for each reel.
            const ticker = new PIXI.Ticker();

            // Setup ticker. All functions within ticker will be called on each tick, until stopped.
            ticker.add(() => {
                const elapsedMs = Date.now() - startTime - initialDelay; // Calculate elapsed time from animation start.

                if (elapsedMs > 0) {
                    const progress = Math.min(elapsedMs / animationDuration, 1);
                    const ease = progress < 0.08 ? -0.025 : 15 * Math.pow(progress, 3); // Initially move up, then speed down.
                    const speed = 20 * ease;

                    // For every child/sprite in each reel.
                    reel.children.forEach((sprite: any) => {
                        sprite.y += speed; //Move sprite horisontally with the help of speed value.

                        // When sprite y-position is higher than full reel height, reset it's y-position to 0.
                        if (sprite.y >= fullReelHeight) {
                            sprite.y -= fullReelHeight;
                        }
                    });

                    //Start final fadeout animation when reaching end.
                    if (elapsedMs >= fadeStart) {
                        // Start fading out to bring in the final result.
                        const fadeProgress = (elapsedMs - fadeStart) / fadeDuration;
                        reel.children.forEach((sprite) => {
                            sprite.alpha = 1 - Math.min(fadeProgress, 1); // Ensure alpha does not go below 0
                        });
                    }
                    // On spin animation complete.
                    if (elapsedMs >= animationDuration) {
                        ticker.stop();
                        this.setupResult(reel, outcome[index]);
                    }
                }
            });
            ticker.start();
        });

        setTimeout(() => {
            if (this.onAnimationComplete) {
                this.onAnimationComplete();
            }
        }, animationDuration + 1000);
    }

    // Display result per reel with bounce animation.
    private setupResult(reel: PIXI.Container, positions: number[]): void {
        // Clear "old" sprites from reel.
        while (reel.children.length) {
            reel.removeChildAt(0);
        }

        // Add result sprites with bounce animation
        positions.forEach((pos, idx) => {
            const textureIndex = pos - 1; // Get the correct index from texture array (starting from 0).
            const sprite = this.setupSprite(idx, textureIndex);

            reel.addChild(sprite); //Add sprite to reel.

            // Initialize animation parameters for bounce effect
            const targetY = idx * this.symbolHeight;
            const animationDuration = 500;
            const overshoot = 50;
            const startTime = Date.now();

            const ticker = new PIXI.Ticker();
            ticker.add(() => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / animationDuration, 1);

                // Bounce easing effect
                sprite.y = targetY + overshoot * Math.sin(progress * Math.PI);

                if (progress >= 1) {
                    ticker.stop();
                    sprite.y = targetY; // Ensure sprite is exactly at target position
                }
            });
            ticker.start();
        });

        // Refill the reel with additional random sprites for continuity (position 3-9)
        for (let i = positions.length; i < this.symbolsPerReel; i++) {
            const textureIndex = Math.floor(Math.random() * this.textures.length);
            const sprite = this.setupSprite(i, textureIndex);
            reel.addChild(sprite);
        }
    }

    private setupSprite(spriteYPos: number, textureIndex: number): PIXI.Sprite {
        // Setup sprite image, size and position.
        const sprite = new PIXI.Sprite(this.textures[textureIndex]);
        sprite.anchor.set(0.5, 0);
        sprite.x = this.reelWidth / 2;
        sprite.y = spriteYPos * this.symbolHeight;
        sprite.height = this.symbolHeight * 0.75;
        sprite.width = this.reelWidth * 0.8;

        return sprite;
    }

    public setAnimationCompleteCallback(callback: () => void): void {
        this.onAnimationComplete = callback;
    }
}
