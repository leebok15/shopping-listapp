const STORAGE_KEY = "shopping-list-items";

const form = document.getElementById("add-form");
const input = document.getElementById("item-input");
const list = document.getElementById("item-list");
const emptyMessage = document.getElementById("empty-message");
const summaryText = document.getElementById("summary-text");
const clearCheckedBtn = document.getElementById("clear-checked-btn");

let items = loadItems();

function loadItems() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveItems() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function render() {
  list.innerHTML = "";

  for (const item of items) {
    const li = document.createElement("li");
    li.className = "item" + (item.checked ? " checked" : "");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = item.checked;
    checkbox.addEventListener("change", () => toggleItem(item.id));

    const name = document.createElement("span");
    name.className = "item-name";
    name.textContent = item.name;
    name.addEventListener("click", () => toggleItem(item.id));

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "✕";
    deleteBtn.setAttribute("aria-label", `${item.name} 삭제`);
    deleteBtn.addEventListener("click", () => deleteItem(item.id));

    li.append(checkbox, name, deleteBtn);
    list.appendChild(li);
  }

  emptyMessage.hidden = items.length !== 0;

  const checkedCount = items.filter((i) => i.checked).length;
  summaryText.textContent =
    items.length === 0 ? "항목 없음" : `총 ${items.length}개 · 완료 ${checkedCount}개`;
  clearCheckedBtn.hidden = checkedCount === 0;
}

function addItem(name) {
  items.push({ id: crypto.randomUUID(), name, checked: false });
  saveItems();
  render();
}

function toggleItem(id) {
  const item = items.find((i) => i.id === id);
  if (item) {
    item.checked = !item.checked;
    saveItems();
    render();
  }
}

function deleteItem(id) {
  items = items.filter((i) => i.id !== id);
  saveItems();
  render();
}

function clearChecked() {
  items = items.filter((i) => !i.checked);
  saveItems();
  render();
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = input.value.trim();
  if (!name) return;
  addItem(name);
  input.value = "";
  input.focus();
});

clearCheckedBtn.addEventListener("click", clearChecked);

render();
