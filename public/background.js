const images = ["1.jpg", "2.jpg", "3.jpg", "4.webp", "5.jpg"];
const div = document.getElementById("mainBanner");

const chosenImage = images[Math.floor(Math.random() * images.length)];

div.style.backgroundImage = `url(/imgs/${chosenImage})`;
div.style.backgroundRepeat = "no-repeat";
div.style.backgroundSize = "cover";