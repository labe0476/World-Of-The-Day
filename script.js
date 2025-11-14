const words = [
  "Student",
  "Tutor",
  "Hub",
  "Laptop",
  "Router",
  "Project",
  "Coding",
  "Charger",
  "good",
  "Folder",
];

let wordDisplay = document.querySelector("#wordDisplay");
let definition = document.querySelector("#definition");
let newWordBtn = document.querySelector("#newWordBtn");
let speakBtn = document.querySelector("#speakBtn");
let currentWord = "";
let wordIndex = 0;

if (speakBtn) speakBtn.disabled = true;

function fetchWord() {
  if (!wordDisplay || !definition) {
    console.error("HTML elements not found");
    return;
  }

  wordDisplay.textContent = "Loading...";
  definition.textContent = "Loading definition...";

  let word = words[wordIndex];
  wordIndex = (wordIndex + 1) % words.length;

  const url =
    "https://www.wordsapi.com/api/v1/words/" + encodeURIComponent(word);
  const fetchData = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  };

  fetch(url, fetchData)
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then(function (data) {
      console.log("Response:", data);

      if (!data || !data.word) {
        throw new Error("Invalid response format");
      }

      currentWord = data.word;
      wordDisplay.textContent = currentWord;
      if (speakBtn) speakBtn.disabled = false;

      if (
        data.results &&
        Array.isArray(data.results) &&
        data.results.length > 0
      ) {
        definition.textContent = data.results[0].definition;
      } else {
        fetchDictionaryFallback(word);
      }
    })
    .catch(function (error) {
      console.error("Error:", error);
      currentWord = word;
      wordDisplay.textContent = word;
      if (speakBtn) speakBtn.disabled = false;
      fetchDictionaryFallback(word);
    })
    .finally(function () {
      console.log("Fetch completed");
    });
}

function speakWord() {
  if (!currentWord || !window.speechSynthesis) {
    console.warn("Cannot speak: no word or speech synthesis not available");
    return;
  }
  const utterance = new SpeechSynthesisUtterance(currentWord);
  utterance.lang = "en-US";
  window.speechSynthesis.speak(utterance);
}

function fetchDictionaryFallback(word) {
  const url =
    "https://api.dictionaryapi.dev/api/v2/entries/en/" +
    encodeURIComponent(word);
  fetch(url, { method: "GET", headers: { Accept: "application/json" } })
    .then(function (res) {
      if (!res.ok) throw new Error("Fallback fetch failed");
      return res.json();
    })
    .then(function (data) {
      console.log("Fallback response:", data);
      if (
        Array.isArray(data) &&
        data[0] &&
        data[0].meanings &&
        data[0].meanings[0] &&
        data[0].meanings[0].definitions &&
        data[0].meanings[0].definitions[0]
      ) {
        definition.textContent = data[0].meanings[0].definitions[0].definition;
      } else {
        definition.textContent = "No definition available.";
      }
    })
    .catch(function (err) {
      console.warn("Fallback definition failed", err);
      definition.textContent = "No definition available.";
    });
}

if (newWordBtn) newWordBtn.addEventListener("click", fetchWord);
if (speakBtn) speakBtn.addEventListener("click", speakWord);

fetchWord();
