let wordDisplay = document.querySelector("#wordDisplay");
let definition = document.querySelector("#definition");
let searchBtn = document.querySelector("#searchBtn");
let searchInput = document.querySelector("#searchInput");
let speakBtn = document.querySelector("#speakBtn");
let currentWord = "";

if (speakBtn) speakBtn.disabled = true;

function searchWord() {
  let word = searchInput.value.trim();

  if (!word) {
    definition.textContent = "Please enter a word";
    return;
  }
  wordDisplay.textContent = "Loading...";
  definition.textContent = "Loading definition...";

  currentWord = word;
  wordDisplay.textContent = word;
  if (speakBtn) speakBtn.disabled = false;

  setTimeout(function () {
    wordDisplay.textContent = word;
    if (speakBtn) speakBtn.disabled = false;
    fetchDictionaryAPI(word);
  }, 20000);
  fetchDictionaryAPI(word);
}

function fetchDictionaryAPI(word) {
  const url =
    "https://api.dictionaryapi.dev/api/v2/entries/en/" +
    encodeURIComponent(word);

  fetch(url, { method: "GET", headers: { Accept: "application/json" } })
    .then(function (res) {
      return res.text().then(function (text) {
        let body = null;
        try {
          body = text ? JSON.parse(text) : null;
        } catch (e) {
          body = text;
        }
        if (!res.ok) {
          console.warn("DictionaryAPI non-OK response", res.status, body);
          const msg =
            (body && (body.title || body.message)) || `API error ${res.status}`;
          definition.textContent = msg;
          throw new Error("Dictionary API returned " + res.status);
        }
        return body;
      });
    })
    .then(function (data) {
      console.log("DictionaryAPI response:", data);
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
      console.warn("DictionaryAPI failed:", err);
      if (
        !definition.textContent ||
        definition.textContent === "Loading definition..."
      ) {
        definition.textContent = "Definition not found. Try another word.";
      }
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

if (searchBtn) searchBtn.addEventListener("click", searchWord);
if (speakBtn) speakBtn.addEventListener("click", speakWord);
if (searchInput) {
  searchInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      searchWord();
    }
  });
}
