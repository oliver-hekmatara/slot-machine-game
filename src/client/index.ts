import SlotGame from "./SlotGame";

document.addEventListener("DOMContentLoaded", () => {
    const symbols = [
        "http://localhost:3000/static/images/sym1.png",
        "http://localhost:3000/static/images/sym2.png",
        "http://localhost:3000/static/images/sym3.png",
        "http://localhost:3000/static/images/sym4.png",
        "http://localhost:3000/static/images/sym5.png",
        "http://localhost:3000/static/images/sym6.png",
        "http://localhost:3000/static/images/sym7.png",
        "http://localhost:3000/static/images/sym8.png",
        "http://localhost:3000/static/images/sym9.png",
    ];

    const slotGame = new SlotGame(symbols); //Initialize the slot game.
});
