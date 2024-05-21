export default class SlotAudio {
    private audioCache = new Map<string, { audio: HTMLAudioElement; defaultVolume: number }>();
    private audioEnabled = false;

    constructor() {
        this.loadTracks();
    }

    private loadTracks(): void {
        const tracks = [
            { key: "bgMusic", url: "http://localhost:3000/static/audio/bgmusic.mp3", volume: 0.2 },
            { key: "spin", url: "http://localhost:3000/static/audio/spin.wav", volume: 0.3 },
            {
                key: "spinning",
                url: "http://localhost:3000/static/audio/spinning.wav",
                volume: 0.5,
            },
            { key: "bigWin", url: "http://localhost:3000/static/audio/big_win.wav", volume: 0.7 },
            {
                key: "smallWin",
                url: "http://localhost:3000/static/audio/small_win.wav",
                volume: 0.5,
            },
            { key: "noWin", url: "http://localhost:3000/static/audio/no_win.wav", volume: 0.5 },
            { key: "bonus", url: "http://localhost:3000/static/audio/bonus.wav", volume: 0.5 },
        ];

        tracks.forEach((track) => {
            const audio = new Audio(track.url);
            this.audioCache.set(track.key, { audio, defaultVolume: track.volume });
        });
    }

    public enableAudio(enable: boolean): void {
        this.audioEnabled = enable;
        if (enable) {
            this.unmuteAll();
        } else {
            this.muteAll();
        }
    }

    public play(trackKey: string, loop = false): void {
        const entry = this.audioCache.get(trackKey);

        if (entry) {
            entry.audio.volume = this.audioEnabled ? entry.defaultVolume : 0;
            entry.audio.loop = loop;
            entry.audio.play();
        }
    }

    public pause(trackKey: string): void {
        const entry = this.audioCache.get(trackKey);
        if (entry) {
            entry.audio.pause();
            entry.audio.currentTime = 0;
        }
    }

    private muteAll(): void {
        this.audioCache.forEach((entry) => {
            entry.audio.volume = 0;
        });
    }

    private unmuteAll(): void {
        this.audioCache.forEach((entry) => {
            entry.audio.volume = entry.defaultVolume;
        });
    }
}
