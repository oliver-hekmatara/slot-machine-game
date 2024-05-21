import express from "express";
import cors from "cors";
import { GameOutcome } from "../shared/interfaces/GameOutcome";
import { playSlot } from "./slotLogic";

const port = 3000;
const app = express();

app.use(cors());

// Serve static files
app.use("/static", express.static("static"));

app.post("/spin", (req, res) => {
    res.setHeader("Content-Type", "application/json");

    const result: GameOutcome = playSlot();

    res.send(JSON.stringify(result));
});

app.listen(port);
