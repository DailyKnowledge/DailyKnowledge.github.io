const searchForm = document.querySelector("[data-search-form]");
const searchInput = document.querySelector("#q");
const topicSelect = document.querySelector("[data-topic-select]");
const topicTabs = [...document.querySelectorAll(".topic-tab[data-topic]")];
const archiveGrid = document.querySelector(".archive-grid");
const pagination = document.querySelector("[data-archive-pagination]");
const randomNoteLink = document.querySelector("[data-random-note]");
const randomNotePageLink = document.querySelector("[data-random-note-page]");
const archiveNotes = Array.isArray(window.KNOWLEDGE_ARCHIVE_NOTES) ? window.KNOWLEDGE_ARCHIVE_NOTES : [];
const pageSize = Number(window.KNOWLEDGE_ARCHIVE_PAGE_SIZE || 9);

let archivePage = 1;

function activeTopic() {
  const active = document.querySelector(".topic-tab.is-active");
  return active ? active.dataset.topic : "All";
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function filteredNotes() {
  const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
  const topic = activeTopic();

  return archiveNotes.filter((note) => {
    const categories = note.categories || [];
    const matchesTopic = topic === "All" || categories.includes(topic);
    const matchesQuery = !query || String(note.search || "").includes(query);
    return matchesTopic && matchesQuery;
  });
}

function categoryUrl(category) {
  return `?topic=${encodeURIComponent(category)}#archive`;
}

function noteCard(note) {
  const categories = note.categories || [];
  const tags = categories
    .map(
      (category) =>
        `<a href="${categoryUrl(category)}" data-category-chip="${escapeHtml(category)}">${escapeHtml(category)}</a>`
    )
    .join("");

  return `
    <article class="note-card" data-categories="${escapeHtml(categories.join("|"))}" data-search="${escapeHtml(note.search || "")}">
      <div class="note-card-image" style="background-image: url('${escapeHtml(note.image)}')" aria-hidden="true"></div>
      <div class="note-card-body">
        <small>${escapeHtml(note.topic)} · ${escapeHtml(note.prettyDate)}</small>
        <h3>${escapeHtml(note.title)}</h3>
        <p>${escapeHtml(note.summary)}</p>
        <div class="tag-list" aria-label="Knowledge categories">${tags}</div>
        <a href="${escapeHtml(note.url)}">Read note</a>
      </div>
    </article>
  `;
}

function renderPagination(totalNotes) {
  if (!pagination) return;

  const totalPages = Math.max(1, Math.ceil(totalNotes / pageSize));
  if (totalPages <= 1) {
    pagination.innerHTML = "";
    return;
  }

  pagination.innerHTML = `
    <button type="button" data-page-action="previous" ${archivePage === 1 ? "disabled" : ""}>Previous</button>
    <span>Page ${archivePage} of ${totalPages}</span>
    <button type="button" data-page-action="next" ${archivePage === totalPages ? "disabled" : ""}>Next</button>
  `;
}

function renderArchive() {
  if (!archiveGrid || archiveNotes.length === 0) return;

  const notes = filteredNotes();
  const totalPages = Math.max(1, Math.ceil(notes.length / pageSize));
  archivePage = Math.min(archivePage, totalPages);
  const start = (archivePage - 1) * pageSize;
  const pageNotes = notes.slice(start, start + pageSize);

  if (pageNotes.length === 0) {
    archiveGrid.innerHTML = '<p class="empty-state">No notes match that search.</p>';
  } else {
    archiveGrid.innerHTML = pageNotes.map(noteCard).join("");
  }

  renderPagination(notes.length);
}

function selectTopic(topic) {
  archivePage = 1;
  topicTabs.forEach((item) => item.classList.toggle("is-active", item.dataset.topic === topic));
  if (topicSelect) topicSelect.value = topic;
  renderArchive();
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

  renderArchive();
}

if (searchForm) {
  searchForm.addEventListener("submit", (event) => event.preventDefault());
}

if (searchInput) {
  searchInput.addEventListener("input", () => {
    archivePage = 1;
    renderArchive();
  });
}

if (topicSelect) {
  topicSelect.addEventListener("change", () => selectTopic(topicSelect.value));
}

topicTabs.forEach((tab) => {
  tab.addEventListener("click", (event) => {
    event.preventDefault();
    selectTopic(tab.dataset.topic);
    const archive = document.querySelector("#archive");
    if (archive) archive.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

if (archiveGrid) {
  archiveGrid.addEventListener("click", (event) => {
    const chip = event.target.closest("[data-category-chip]");
    const archive = document.querySelector("#archive");
    if (!chip || !archive) return;
    event.preventDefault();
    selectTopic(chip.dataset.categoryChip);
    archive.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

if (pagination) {
  pagination.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-page-action]");
    if (!button) return;
    archivePage += button.dataset.pageAction === "next" ? 1 : -1;
    renderArchive();
    const archive = document.querySelector("#archive");
    if (archive) archive.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

if (randomNoteLink && archiveNotes.length > 0) {
  randomNoteLink.addEventListener("click", (event) => {
    event.preventDefault();
    const randomNote = archiveNotes[Math.floor(Math.random() * archiveNotes.length)];
    if (randomNote) window.location.href = randomNote.url;
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
