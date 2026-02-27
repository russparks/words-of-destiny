const form = document.getElementById("upload-form");
const message = document.getElementById("message");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  message.textContent = "Uploading...";
  message.className = "message";

  const formData = new FormData(form);

  try {
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Upload failed");
    }

    message.className = "message success";
    message.textContent = `${data.message} \u{1F595}`;
    form.reset();
  } catch (error) {
    message.className = "message";
    message.textContent = error.message;
  }
});
