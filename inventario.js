
const INVENTORY_KEY = "goblox_inventory";

export function getInventory() {
  try {
    const raw = localStorage.getItem(INVENTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveInventory(items) {
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(items));
}

export function addItem(item) {
  const list = getInventory();
  list.push(item);
  saveInventory(list);
  return list;
}

export function removeItem(itemId) {
  const list = getInventory().filter(item => item.id !== itemId);
  saveInventory(list);
  return list;
}

export function hasItem(itemId) {
  return getInventory().some(item => item.id === itemId);
}
