const button = document.getElementById("sound-button");
let sounds = [];

async function loadSounds() {
  try {
    const response = await fetch("/api/sounds");
    if (!response.ok) {
      throw new Error("Failed to fetch sounds");
    }

    const data = await response.json();
    sounds = data.sounds.map((sound) => new Audio(sound.url));
  } catch (error) {
    console.error("Could not load sounds:", error);
  }
}

button.addEventListener("click", async () => {
  if (sounds.length === 0) {
    await loadSounds();
  }

  if (sounds.length === 0) {
    return;
  }

  const randomIndex = Math.floor(Math.random() * sounds.length);
  sounds[randomIndex].pause();
  sounds[randomIndex].currentTime = 0;
  sounds[randomIndex].play();
});

loadSounds();
