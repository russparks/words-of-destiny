// script.js

// Preload audio files
const sounds = [new Audio("sounds/hell-yeah.mp3"), new Audio("sounds/no-homo.mp3")];

const button = document.getElementById("sound-button");

button.addEventListener("click", () => {
  // Generate a random index between 0 and sounds.length - 1
  const randomIndex = Math.floor(Math.random() * sounds.length);

  // Reset the audio in case it was played before (optional)
  sounds[randomIndex].pause();
  sounds[randomIndex].currentTime = 0;

  // Play the randomly selected sound
  sounds[randomIndex].play();
});
