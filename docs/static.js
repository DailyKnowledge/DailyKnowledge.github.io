const searchForm = document.querySelector("[data-search-form]");
const searchInput = document.querySelector("#q");
const topicSelect = document.querySelector("[data-topic-select]");
const topicTabs = [...document.querySelectorAll(".topic-tab[data-topic]")];
const categoryChips = [...document.querySelectorAll("[data-category-chip]")];
const noteCards = [...document.querySelectorAll(".note-card")];
const randomNoteLink = document.querySelector("[data-random-note]");
const randomNotePageLink = document.querySelector("[data-random-note-page]");

function activeTopic() {
  return document.querySelector(".topic-tab.is-active")?.dataset.topic || "All";
}

function filterArchive() {
  if (!searchInput || noteCards.length === 0) return;

  const query = searchInput.value.trim().toLowerCase();
  const topic = activeTopic();
  let visibleCount = 0;

  noteCards.forEach((card) => {
    const categories = (card.dataset.categories || "").split("|");
    const matchesTopic = topic === "All" || categories.includes(topic);
    const matchesQuery = !query || card.dataset.search.includes(query);
    const visible = matchesTopic && matchesQuery;
    card.hidden = !visible;
    if (visible) visibleCount += 1;
  });

  document.querySelector(".empty-state")?.remove();
  if (visibleCount === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "No notes match that search.";
    document.querySelector(".archive-grid")?.append(empty);
  }
}

if (searchForm) {
  searchForm.addEventListener("submit", (event) => event.preventDefault());
}

if (searchInput) {
  searchInput.addEventListener("input", filterArchive);
}

if (topicSelect) {
  topicSelect.addEventListener("change", () => {
    const selected = topicSelect.value;
    topicTabs.forEach((item) => item.classList.toggle("is-active", item.dataset.topic === selected));
    filterArchive();
  });
}

function selectTopic(topic) {
  topicTabs.forEach((item) => item.classList.toggle("is-active", item.dataset.topic === topic));
  if (topicSelect) topicSelect.value = topic;
  filterArchive();
}

function applyUrlFilters() {
  const params = new URLSearchParams(window.location.search);
  const topic = params.get("topic");
  const query = params.get("q");

  if (query && searchInput) {
    searchInput.value = query;
  }

  if (topic && topicTabs.some((tab) => tab.dataset.topic === topic)) {
    selectTopic(topic);
    return;
  }

  filterArchive();
}

topicTabs.forEach((tab) => {
  tab.addEventListener("click", (event) => {
    event.preventDefault();
    selectTopic(tab.dataset.topic);
    document.querySelector("#archive")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

categoryChips.forEach((chip) => {
  chip.addEventListener("click", (event) => {
    const archive = document.querySelector("#archive");
    if (!archive) return;
    event.preventDefault();
    selectTopic(chip.dataset.categoryChip);
    archive.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

if (randomNoteLink && noteCards.length > 0) {
  randomNoteLink.addEventListener("click", (event) => {
    event.preventDefault();
    const links = noteCards.map((card) => card.querySelector("a[href]")).filter(Boolean);
    const randomLink = links[Math.floor(Math.random() * links.length)];
    if (randomLink) window.location.href = randomLink.href;
  });
}

if (randomNotePageLink && Array.isArray(window.KNOWLEDGE_NOTE_URLS) && window.KNOWLEDGE_NOTE_URLS.length > 0) {
  randomNotePageLink.addEventListener("click", (event) => {
    event.preventDefault();
    const urls = window.KNOWLEDGE_NOTE_URLS;
    window.location.href = urls[Math.floor(Math.random() * urls.length)];
  });
}

applyUrlFilters();
