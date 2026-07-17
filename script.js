const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
const TABLE = "shopping_items";

const form = document.getElementById("add-form");
const input = document.getElementById("item-input");
const list = document.getElementById("item-list");
const emptyMessage = document.getElementById("empty-message");
const summaryText = document.getElementById("summary-text");
const clearCheckedBtn = document.getElementById("clear-checked-btn");

let items = [];

async function loadItems() {
  const { data, error } = await supabaseClient
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to load items:", error);
    return [];
  }
  return data;
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

async function addItem(name) {
  const { data, error } = await supabaseClient
    .from(TABLE)
    .insert({ name, checked: false })
    .select()
    .single();

  if (error) {
    console.error("Failed to add item:", error);
    return;
  }
  items.push(data);
  render();
}

async function toggleItem(id) {
  const item = items.find((i) => i.id === id);
  if (!item) return;

  const nextChecked = !item.checked;
  const { error } = await supabaseClient
    .from(TABLE)
    .update({ checked: nextChecked })
    .eq("id", id);

  if (error) {
    console.error("Failed to update item:", error);
    return;
  }
  item.checked = nextChecked;
  render();
}

async function deleteItem(id) {
  const { error } = await supabaseClient.from(TABLE).delete().eq("id", id);

  if (error) {
    console.error("Failed to delete item:", error);
    return;
  }
  items = items.filter((i) => i.id !== id);
  render();
}

async function clearChecked() {
  const checkedIds = items.filter((i) => i.checked).map((i) => i.id);
  if (checkedIds.length === 0) return;

  const { error } = await supabaseClient.from(TABLE).delete().in("id", checkedIds);

  if (error) {
    console.error("Failed to clear checked items:", error);
    return;
  }
  items = items.filter((i) => !i.checked);
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

(async function init() {
  items = await loadItems();
  render();
})();
