document.addEventListener("DOMContentLoaded", () => {
    const themeCircle = document.querySelector(".theme-circle");
    const themeText = document.querySelector(".theme-text");
    const middleImages = document.querySelector(".middle-images");
    const styleQuote = document.querySelector(".style-quote");

    // Theme data
    const themes = {
        pink: {
            circleColor: "#ffc0cb",
            backgroundColor: "#fff6e5", // cream
            images: ["pink1.jpg", "pink2.jpg", "pink3.jpg"],
            quote: "Soft, romantic, and effortlessly chic."
        },
        blue: {
            circleColor: "#a7c7e7",
            backgroundColor: "#e6f2ff", // pale blue
            images: ["blue1.jpg", "blue2.jpg", "blue3.jpg"],
            quote: "Cool, calm, and beautifully collected."
        },
        brown: {
            circleColor: "#a9745b",
            backgroundColor: "#f9f2ec", // light beige
            images: ["brown1.jpg", "brown2.jpg", "brown3.jpg"],
            quote: "Earthy elegance that grounds your style."
        },
        white: {
            circleColor: "#ffffff",
            backgroundColor: "#d2b48c", // tan / brown
            images: ["white1.jpg", "white2.jpg", "white3.jpg"],
            quote: "Clean, timeless, and endlessly versatile."
        },
        riot: {
            circleColor: "#ff69b4",
            backgroundColor: "#ffe6e6", // light pastel riot
            images: ["riot1.jpg", "riot2.jpg", "riot3.jpg"],
            quote: "A joyful explosion of colors and patterns."
        }
    };

    // Week-to-theme mapping
    const weekOrder = ["pink", "blue", "brown", "white", "riot"];

    // Get current week number of the year
    function getWeekNumber() {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 1);
        const days = Math.floor((now - start) / (24 * 60 * 60 * 1000));
        return Math.ceil((days + start.getDay() + 1) / 7);
    }

    // Determine theme based on week
    const currentWeek = getWeekNumber();
    const themeKey = weekOrder[(currentWeek - 1) % weekOrder.length];
    const theme = themes[themeKey];

    // Apply theme colors
    themeCircle.style.backgroundColor = theme.circleColor;
    document.body.style.backgroundColor = theme.backgroundColor;

    // Update text
    themeText.textContent = `${themeKey.charAt(0).toUpperCase() + themeKey.slice(1)} Week`;

    // Update middle images
    middleImages.innerHTML = "";
    theme.images.forEach(img => {
        const imageEl = document.createElement("img");
        imageEl.src = `images/${img}`; // Place your images in 'images/' folder
        imageEl.alt = themeKey;
        middleImages.appendChild(imageEl);
    });

    // Update quote
    styleQuote.textContent = theme.quote;
});