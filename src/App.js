import { useState, useEffect, useRef } from "react";

const SUPERMARKETS = ["Continente", "Pingo Doce", "Auchan", "Mercadona", "Lidl", "Meu Super", "Outros"];
const DEFAULT_CATEGORIES = ["Lacticínios", "Frutas & Legumes", "Carnes & Peixe", "Padaria", "Bebidas", "Limpeza", "Higiene", "Congelados", "Conservas", "Outros"];
const STORE_COLORS = {
  "Continente": "#e63946", "Pingo Doce": "#f4a261", "Auchan": "#e76f51",
  "Mercadona": "#2a9d8f", "Lidl": "#264653", "Meu Super": "#457b9d", "Outros": "#6c757d"
};
const SEED = [
  { name: "Acelga", category: "Frutas & Legumes" }, { name: "Clementinas", category: "Frutas & Legumes" },
  { name: "Cogumelos", category: "Frutas & Legumes" }, { name: "Melão", category: "Frutas & Legumes" },
  { name: "Pepino", category: "Frutas & Legumes" }, { name: "Pão de forma", category: "Padaria" },
  { name: "Tortilhas", category: "Padaria" }, { name: "Frango (Peito)", category: "Carnes & Peixe" },
  { name: "Frango (Inteiro)", category: "Carnes & Peixe" }, { name: "Frango (Coxas)", category: "Carnes & Peixe" },
  { name: "Porco (Bifana)", category: "Carnes & Peixe" }, { name: "Misto (Carne Moída)", category: "Carnes & Peixe" },
  { name: "Boi (Carne Moída)", category: "Carnes & Peixe" }, { name: "Pizza", category: "Congelados" },
  { name: "Bolacha água e sal", category: "Conservas" }, { name: "Chá", category: "Conservas" },
  { name: "Sumo de frutas", category: "Conservas" },
  { name: "Mandioca", category: "Frutas & Legumes" },
  { name: "Nectarina", category: "Frutas & Legumes" },
  { name: "Leite (Meio-gordo)", category: "Lacticínios" },
  { name: "Manteiga (c/ Sal)", category: "Lacticínios" },
  { name: "Fio Dentário", category: "Higiene" },
  { name: "Flocos de Milho", category: "Conservas" },
  { name: "Porco (Carne Picada)", category: "Carnes & Peixe" },
];

const storage = {
  get: (key) => { try { const v = localStorage.getItem(key); return v ? { value: v } : null; } catch { return null; } },
  set: (key, value) => { try { localStorage.setItem(key, value); } catch {} },
};

const StoreBadge = ({ store }) => (
  <span style={{ background: STORE_COLORS[store] || "#6c757d", color: "#fff", borderRadius: 4, padding: "1px 7px", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>{store}</span>
);

const s = {
  app: { fontFamily: "system-ui, sans-serif", maxWidth: 480, margin: "0 auto", background: "#f8f9fa", minHeight: "100vh", paddingBottom: 80 },
  header: { background: "#2a9d8f", color: "#fff", padding: "14px 16px", position: "sticky", top: 0, zIndex: 10 },
  input: { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #dee2e6", fontSize: 15, marginBottom: 10, boxSizing: "border-box", outline: "none" },
  btn: { padding: "10px 18px", borderRadius: 8, border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer" },
  btnPrimary: { background: "#2a9d8f", color: "#fff" },
  btnSecondary: { background: "#f1f3f5", color: "#444" },
  btnDanger: { background: "#e63946", color: "#fff" },
  btnGhost: { background: "none", border: "none", cursor: "pointer", padding: "4px 8px" },
  fab: { position: "fixed", bottom: 24, right: 20, background: "#2a9d8f", color: "#fff", border: "none", borderRadius: "50%", width: 54, height: 54, fontSize: 26, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.2)", zIndex: 20, display: "flex", alignItems: "center", justifyContent: "center" },
  backBtn: { background: "none", border: "none", color: "#fff", fontSize: 14, cursor: "pointer", fontWeight: 600, padding: 0 },
  label: { fontSize: 12, fontWeight: 700, color: "#555", marginBottom: 4, display: "block" },
  card: { background: "#fff", borderRadius: 10, marginBottom: 8, padding: "12px 14px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" },
  catLabel: { fontSize: 11, fontWeight: 700, color: "#2a9d8f", textTransform: "uppercase", letterSpacing: 1, margin: "14px 0 6px" },
  row: { display: "flex", gap: 8 },
  toast: { position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)", background: "#222", color: "#fff", padding: "10px 20px", borderRadius: 20, fontSize: 14, zIndex: 99, whiteSpace: "nowrap" },
  tab: (active) => ({ flex: 1, padding: "8px 0", border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer", borderBottom: active ? "3px solid #2a9d8f" : "3px solid transparent", background: "#fff", color: active ? "#2a9d8f" : "#888", transition: "all .15s" }),
};

export default function App() {
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [items, setItems] = useState({});
  const [history, setHistory] = useState({});
  const [shoppingList, setShoppingList] = useState({});
  const [view, setView] = useState("list");
  const [tab, setTab] = useState("list");
  const [selectedItem, setSelectedItem] = useState(null);
  const [newItem, setNewItem] = useState({ name: "", category: DEFAULT_CATEGORIES[0] });
  const [editItem, setEditItem] = useState(null);
  const [newCategory, setNewCategory] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [logEntry, setLogEntry] = useState({ price: "", weight: "", supermarket: SUPERMARKETS[0], date: new Date().toISOString().split("T")[0] });
  const [editingEntry, setEditingEntry] = useState(null); // { idx, price, weight, supermarket, date }
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState(null);
  const [filterStore, setFilterStore] = useState("all");
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [shopFilterCat, setShopFilterCat] = useState(null);
  const [highlightId, setHighlightId] = useState(null);
  const itemRefs = useRef({});

  const [deletedIds, setDeletedIds] = useState(new Set());
  const [showMenu, setShowMenu] = useState(false);
  const persist = (key, val) => storage.set(key, JSON.stringify(val));

  useEffect(() => {
    const c = storage.get("gt:categories");
    const i = storage.get("gt:items");
    const h = storage.get("gt:history");
    const sl = storage.get("gt:shopping");
    const dl = storage.get("gt:deleted");
    const deletedSet = dl ? new Set(JSON.parse(dl.value)) : new Set();
    setDeletedIds(deletedSet);

    if (c) setCategories(JSON.parse(c.value));
    let loaded = i ? JSON.parse(i.value) : {};
    const renames = {
      "frango peito": "Frango (Peito)", "frango inteiro": "Frango (Inteiro)",
      "coxas de frango": "Frango (Coxas)", "bifana de porco": "Porco (Bifana)",
      "carne moída mista": "Misto (Carne Moída)", "carne moída de boi": "Boi (Carne Moída)",
    };
    let changed = false;
    for (const it of Object.values(loaded)) {
      const renamed = renames[it.name.toLowerCase()];
      if (renamed) { loaded[it.id].name = renamed; changed = true; }
    }
    const existing = Object.values(loaded).map(x => x.name.toLowerCase());
    for (const p of SEED) {
      const id = `seed-${p.name.toLowerCase().replace(/\s/g, "-").replace(/[()]/g, "")}`;
      if (!existing.includes(p.name.toLowerCase()) && !deletedSet.has(id)) {
        loaded[id] = { id, name: p.name, category: p.category };
        changed = true;
      }
    }
    setItems(loaded);
    if (changed) persist("gt:items", loaded);
    if (h) setHistory(JSON.parse(h.value));
    if (sl) {
      const raw = JSON.parse(sl.value);
      const migrated = {};
      for (const [k, v] of Object.entries(raw)) {
        migrated[k] = typeof v === "boolean" ? { pinned: v, done: false } : v;
      }
      setShoppingList(migrated);
    }
    setLoading(false);
  }, []);

  // Scroll to highlighted item
  useEffect(() => {
    if (highlightId && itemRefs.current[highlightId]) {
      setTimeout(() => {
        itemRefs.current[highlightId]?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
      const t = setTimeout(() => setHighlightId(null), 2000);
      return () => clearTimeout(t);
    }
  }, [highlightId]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  const addItem = () => {
    if (!newItem.name.trim()) return;
    const id = Date.now().toString();
    const updated = { ...items, [id]: { id, name: newItem.name.trim(), category: newItem.category } };
    setItems(updated); persist("gt:items", updated);
    showToast(`"${newItem.name.trim()}" adicionado!`);
    setFilterCat(newItem.category);
    setHighlightId(id);
    setNewItem({ name: "", category: newItem.category });
    setView("list");
    setTab("list");
  };

  const saveEditItem = () => {
    if (!editItem.name.trim()) return;
    const updated = { ...items, [editItem.id]: { ...items[editItem.id], name: editItem.name.trim(), category: editItem.category } };
    setItems(updated); persist("gt:items", updated);
    setSelectedItem(updated[editItem.id]);
    showToast("Item atualizado!");
    setView("history");
  };

  const addCategory = () => {
    if (!newCategory.trim() || categories.includes(newCategory.trim())) return;
    const updated = [...categories, newCategory.trim()];
    setCategories(updated); persist("gt:categories", updated);
    setNewCategory(""); setShowAddCategory(false);
    showToast("Categoria adicionada!");
  };

  const logPrice = () => {
    const price = parseFloat(logEntry.price);
    if (!logEntry.price || isNaN(price)) return;
    const entry = { price, weight: logEntry.weight.trim(), supermarket: logEntry.supermarket, date: logEntry.date };
    const prev = history[selectedItem.id] || [];
    const updated = { ...history, [selectedItem.id]: [entry, ...prev] };
    setHistory(updated); persist("gt:history", updated);
    setLogEntry({ price: "", weight: "", supermarket: SUPERMARKETS[0], date: new Date().toISOString().split("T")[0] });
    showToast("Preço registado!");
    setView("history");
  };

  const saveEditEntry = () => {
    const price = parseFloat(editingEntry.price);
    if (!editingEntry.price || isNaN(price)) return;
    const prev = history[selectedItem.id] || [];
    const updated = prev.map((e, i) => i === editingEntry.idx
      ? { price, weight: editingEntry.weight.trim(), supermarket: editingEntry.supermarket, date: editingEntry.date }
      : e
    );
    const newHistory = { ...history, [selectedItem.id]: updated };
    setHistory(newHistory); persist("gt:history", newHistory);
    setEditingEntry(null);
    showToast("Entrada atualizada!");
  };

  const deleteEntry = (itemId, idx) => {
    const updated = { ...history, [itemId]: (history[itemId] || []).filter((_, i) => i !== idx) };
    setHistory(updated); persist("gt:history", updated);
    setConfirmDelete(null); showToast("Entrada removida.");
  };

  const deleteItem = (id) => {
    const { [id]: _a, ...restI } = items;
    const { [id]: _b, ...restH } = history;
    const { [id]: _c, ...restS } = shoppingList;
    setItems(restI); persist("gt:items", restI);
    setHistory(restH); persist("gt:history", restH);
    setShoppingList(restS); persist("gt:shopping", restS);
    // remember deleted id so SEED never re-adds it
    const updated = new Set([...deletedIds, id]);
    setDeletedIds(updated);
    persist("gt:deleted", [...updated]);
    setView("list"); showToast("Item removido.");
  };

  const togglePinned = (id) => {
    const cur = shoppingList[id] || { pinned: false, done: false };
    const updated = { ...shoppingList, [id]: { ...cur, pinned: !cur.pinned, done: false } };
    setShoppingList(updated); persist("gt:shopping", updated);
  };

  const toggleDone = (id) => {
    // when marked as done, remove from list entirely
    const cur = shoppingList[id] || { pinned: true, done: false };
    if (!cur.done) {
      // mark done then remove after short delay for visual feedback
      const marked = { ...shoppingList, [id]: { ...cur, done: true } };
      setShoppingList(marked); persist("gt:shopping", marked);
      setTimeout(() => {
        const removed = { ...marked, [id]: { pinned: false, done: false } };
        setShoppingList(removed); persist("gt:shopping", removed);
      }, 800);
    }
  };

  const clearDone = () => {
    const updated = Object.fromEntries(Object.entries(shoppingList).map(([k, v]) => [k, { ...v, done: false }]));
    setShoppingList(updated); persist("gt:shopping", updated);
    showToast("Itens desmarcados!");
  };

  const exportData = () => {
    const data = { version: 1, exportedAt: new Date().toISOString(), categories, items, history, shoppingList };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `grocery-tracker-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Backup exportado!");
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!data.items || !data.history) throw new Error("Ficheiro inválido");
        if (data.categories) { setCategories(data.categories); persist("gt:categories", data.categories); }
        setItems(data.items); persist("gt:items", data.items);
        setHistory(data.history); persist("gt:history", data.history);
        if (data.shoppingList) { setShoppingList(data.shoppingList); persist("gt:shopping", data.shoppingList); }
        showToast("Dados importados com sucesso!");
      } catch { showToast("Erro ao importar ficheiro."); }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const getLastEntry = (id) => { const h = history[id]; return h?.length ? h[0] : null; };
  const getCheapest = (id) => { const h = history[id]; return h?.length ? h.reduce((a, b) => a.price < b.price ? a : b) : null; };

  const allItems = Object.values(items);
  const filteredItems = allItems.filter(it => it.name.toLowerCase().includes(search.toLowerCase()) && (!filterCat || it.category === filterCat));
  const groupedItems = categories.reduce((acc, cat) => {
    const ci = filteredItems.filter(it => it.category === cat);
    if (ci.length) acc[cat] = ci;
    return acc;
  }, {});
  const pinnedItems = allItems.filter(it => shoppingList[it.id]?.pinned);
  const shopItems = allItems.filter(it => !shopFilterCat || it.category === shopFilterCat);
  const shopGrouped = categories.reduce((acc, cat) => {
    const ci = shopItems.filter(it => it.category === cat);
    if (ci.length) acc[cat] = ci;
    return acc;
  }, {});
  const doneCount = pinnedItems.filter(it => shoppingList[it.id]?.done).length;

  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "system-ui", color: "#888" }}>A carregar...</div>;

  // ── EDIT ENTRY ──
  if (view === "edit-entry" && editingEntry && selectedItem) return (
    <div style={s.app}>
      <div style={s.header}>
        <button style={s.backBtn} onClick={() => { setEditingEntry(null); setView("history"); }}>← Voltar</button>
        <div style={{ fontWeight: 700, fontSize: 16, marginTop: 4 }}>Editar registo</div>
        <div style={{ fontSize: 12, opacity: 0.8 }}>{selectedItem.name}</div>
      </div>
      <div style={{ padding: 16 }}>
        <label style={s.label}>Preço (€)</label>
        <input style={s.input} type="number" step="0.01" min="0" placeholder="ex: 1.99" value={editingEntry.price} onChange={e => setEditingEntry({ ...editingEntry, price: e.target.value })} autoFocus />
        <label style={s.label}>Peso / Quantidade <span style={{ fontWeight: 400, color: "#aaa" }}>(ex: 1kg, 500g, 1L, 6un)</span></label>
        <input style={s.input} type="text" placeholder="ex: 1kg" value={editingEntry.weight} onChange={e => setEditingEntry({ ...editingEntry, weight: e.target.value })} />
        <label style={s.label}>Supermercado</label>
        <select style={s.input} value={editingEntry.supermarket} onChange={e => setEditingEntry({ ...editingEntry, supermarket: e.target.value })}>
          {SUPERMARKETS.map(st => <option key={st}>{st}</option>)}
        </select>
        <label style={s.label}>Data</label>
        <input style={s.input} type="date" value={editingEntry.date} onChange={e => setEditingEntry({ ...editingEntry, date: e.target.value })} />
        <div style={s.row}>
          <button style={{ ...s.btn, ...s.btnSecondary, flex: 1 }} onClick={() => { setEditingEntry(null); setView("history"); }}>Cancelar</button>
          <button style={{ ...s.btn, ...s.btnPrimary, flex: 1 }} onClick={saveEditEntry}>Guardar</button>
        </div>
      </div>
      {toast && <div style={s.toast}>{toast}</div>}
    </div>
  );

  // ── EDIT ITEM ──
  if (view === "edit-item" && editItem) return (
    <div style={s.app}>
      <div style={s.header}>
        <button style={s.backBtn} onClick={() => setView("history")}>← Voltar</button>
        <div style={{ fontWeight: 700, fontSize: 16, marginTop: 4 }}>Editar produto</div>
      </div>
      <div style={{ padding: 16 }}>
        <label style={s.label}>Nome</label>
        <input style={s.input} value={editItem.name} onChange={e => setEditItem({ ...editItem, name: e.target.value })} autoFocus />
        <label style={s.label}>Categoria</label>
        <select style={s.input} value={editItem.category} onChange={e => setEditItem({ ...editItem, category: e.target.value })}>
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
        {showAddCategory ? (
          <div style={{ marginBottom: 10 }}>
            <label style={s.label}>Nova categoria</label>
            <div style={s.row}>
              <input style={{ ...s.input, marginBottom: 0, flex: 1 }} value={newCategory} onChange={e => setNewCategory(e.target.value)} onKeyDown={e => e.key === "Enter" && addCategory()} autoFocus />
              <button style={{ ...s.btn, ...s.btnPrimary }} onClick={addCategory}>OK</button>
            </div>
          </div>
        ) : <button style={{ ...s.btn, ...s.btnSecondary, marginBottom: 10, fontSize: 13 }} onClick={() => setShowAddCategory(true)}>+ Nova categoria</button>}
        <div style={s.row}>
          <button style={{ ...s.btn, ...s.btnSecondary, flex: 1 }} onClick={() => setView("history")}>Cancelar</button>
          <button style={{ ...s.btn, ...s.btnPrimary, flex: 1 }} onClick={saveEditItem}>Guardar</button>
        </div>
        <button style={{ ...s.btn, ...s.btnDanger, width: "100%", marginTop: 8 }} onClick={() => deleteItem(editItem.id)}>Apagar item</button>
      </div>
      {toast && <div style={s.toast}>{toast}</div>}
    </div>
  );

  // ── HISTORY ──
  if (view === "history" && selectedItem) {
    const h = (history[selectedItem.id] || []).filter(e => filterStore === "all" || e.supermarket === filterStore);
    const cheapest = getCheapest(selectedItem.id);
    return (
      <div style={s.app}>
        <div style={s.header}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button style={s.backBtn} onClick={() => { setView("list"); setFilterStore("all"); }}>← Voltar</button>
              <span style={{ fontWeight: 700, fontSize: 16 }}>{selectedItem.name}</span>
            </div>
            <button style={{ ...s.backBtn, fontSize: 18 }} onClick={() => { setEditItem({ ...selectedItem }); setView("edit-item"); }}>✏️</button>
          </div>
          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>{selectedItem.category}</div>
        </div>
        <div style={{ padding: "14px 16px 0" }}>
          {cheapest && (
            <div style={{ background: "#e9f7f5", borderRadius: 10, padding: "10px 14px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, color: "#2a9d8f", fontWeight: 600 }}>🏆 Mais barato</span>
              <span style={{ fontWeight: 700 }}>{cheapest.price.toFixed(2)} €{cheapest.weight ? ` / ${cheapest.weight}` : ""}</span>
              <StoreBadge store={cheapest.supermarket} />
            </div>
          )}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
            {["all", ...SUPERMARKETS].map(st => (
              <button key={st} onClick={() => setFilterStore(st)}
                style={{ ...s.btn, padding: "4px 10px", fontSize: 12, background: filterStore === st ? "#2a9d8f" : "#f1f3f5", color: filterStore === st ? "#fff" : "#444" }}>
                {st === "all" ? "Todos" : st}
              </button>
            ))}
          </div>
          {h.length === 0
            ? <div style={{ textAlign: "center", color: "#aaa", marginTop: 32 }}>Sem registos{filterStore !== "all" ? ` para ${filterStore}` : ""}.</div>
            : h.map((e, i) => (
              <div key={i} style={{ ...s.card, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px" }}>
                <div>
                  <div style={{ fontSize: 12, color: "#888" }}>{e.date}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                    <StoreBadge store={e.supermarket} />
                    {e.weight && <span style={{ fontSize: 12, color: "#666", fontWeight: 600 }}>⚖️ {e.weight}</span>}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontWeight: 700, fontSize: 17 }}>{e.price.toFixed(2)} €</span>
                  <button onClick={() => setEditingEntry({ idx: i, price: e.price, weight: e.weight || "", supermarket: e.supermarket, date: e.date })}
                    style={{ ...s.btnGhost, color: "#2a9d8f", fontSize: 15 }} title="Editar">✏️</button>
                  <button onClick={() => setConfirmDelete({ itemId: selectedItem.id, idx: i })}
                    style={{ ...s.btnGhost, color: "#e63946", fontSize: 15 }} title="Apagar">🗑</button>
                </div>
              </div>
            ))
          }
          {editingEntry && (
            <div style={{ background: "#fff", borderRadius: 12, padding: 16, marginTop: 8, boxShadow: "0 2px 12px rgba(0,0,0,0.12)" }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, color: "#2a9d8f" }}>Editar registo</div>
              <label style={s.label}>Preço (€)</label>
              <input style={s.input} type="number" step="0.01" min="0" value={editingEntry.price} onChange={e => setEditingEntry({ ...editingEntry, price: e.target.value })} autoFocus />
              <label style={s.label}>Peso / Quantidade</label>
              <input style={s.input} type="text" placeholder="ex: 1kg" value={editingEntry.weight} onChange={e => setEditingEntry({ ...editingEntry, weight: e.target.value })} />
              <label style={s.label}>Supermercado</label>
              <select style={s.input} value={editingEntry.supermarket} onChange={e => setEditingEntry({ ...editingEntry, supermarket: e.target.value })}>
                {SUPERMARKETS.map(st => <option key={st}>{st}</option>)}
              </select>
              <label style={s.label}>Data</label>
              <input style={s.input} type="date" value={editingEntry.date} onChange={e => setEditingEntry({ ...editingEntry, date: e.target.value })} />
              <div style={s.row}>
                <button style={{ ...s.btn, ...s.btnSecondary, flex: 1 }} onClick={() => setEditingEntry(null)}>Cancelar</button>
                <button style={{ ...s.btn, ...s.btnPrimary, flex: 1 }} onClick={saveEditEntry}>Guardar</button>
              </div>
            </div>
          )}
          <button style={{ ...s.btn, ...s.btnPrimary, width: "100%", marginTop: 8 }}
            onClick={() => { setLogEntry({ price: "", weight: "", supermarket: SUPERMARKETS[0], date: new Date().toISOString().split("T")[0] }); setView("log-price"); }}>
            + Registar preço
          </button>
        </div>
        {confirmDelete && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
            <div style={{ background: "#fff", borderRadius: 12, padding: 24, maxWidth: 300, width: "90%", textAlign: "center" }}>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Remover entrada?</div>
              <div style={{ color: "#888", fontSize: 14, marginBottom: 16 }}>Esta ação não pode ser desfeita.</div>
              <div style={s.row}>
                <button style={{ ...s.btn, ...s.btnSecondary, flex: 1 }} onClick={() => setConfirmDelete(null)}>Cancelar</button>
                <button style={{ ...s.btn, ...s.btnDanger, flex: 1 }} onClick={() => deleteEntry(confirmDelete.itemId, confirmDelete.idx)}>Remover</button>
              </div>
            </div>
          </div>
        )}
        {toast && <div style={s.toast}>{toast}</div>}
      </div>
    );
  }

  // ── LOG PRICE ──
  if (view === "log-price" && selectedItem) return (
    <div style={s.app}>
      <div style={s.header}>
        <button style={s.backBtn} onClick={() => setView("history")}>← Voltar</button>
        <div style={{ fontWeight: 700, fontSize: 16, marginTop: 4 }}>Registar preço</div>
        <div style={{ fontSize: 12, opacity: 0.8 }}>{selectedItem.name}</div>
      </div>
      <div style={{ padding: 16 }}>
        <label style={s.label}>Preço (€)</label>
        <input style={s.input} type="number" step="0.01" min="0" placeholder="ex: 1.99" value={logEntry.price} onChange={e => setLogEntry({ ...logEntry, price: e.target.value })} autoFocus />
        <label style={s.label}>Peso / Quantidade <span style={{ fontWeight: 400, color: "#aaa" }}>(ex: 1kg, 500g, 1L, 6un)</span></label>
        <input style={s.input} type="text" placeholder="ex: 1kg" value={logEntry.weight} onChange={e => setLogEntry({ ...logEntry, weight: e.target.value })} />
        <label style={s.label}>Supermercado</label>
        <select style={s.input} value={logEntry.supermarket} onChange={e => setLogEntry({ ...logEntry, supermarket: e.target.value })}>
          {SUPERMARKETS.map(st => <option key={st}>{st}</option>)}
        </select>
        <label style={s.label}>Data</label>
        <input style={s.input} type="date" value={logEntry.date} onChange={e => setLogEntry({ ...logEntry, date: e.target.value })} />
        <div style={s.row}>
          <button style={{ ...s.btn, ...s.btnSecondary, flex: 1 }} onClick={() => setView("history")}>Cancelar</button>
          <button style={{ ...s.btn, ...s.btnPrimary, flex: 1 }} onClick={logPrice}>Guardar</button>
        </div>
      </div>
      {toast && <div style={s.toast}>{toast}</div>}
    </div>
  );

  // ── ADD ITEM ──
  if (view === "add-item") return (
    <div style={s.app}>
      <div style={s.header}>
        <button style={s.backBtn} onClick={() => setView("list")}>← Voltar</button>
        <div style={{ fontWeight: 700, fontSize: 16, marginTop: 4 }}>Novo produto</div>
      </div>
      <div style={{ padding: 16 }}>
        <label style={s.label}>Nome do produto</label>
        <input style={s.input} placeholder="ex: Leite meio-gordo" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} onKeyDown={e => e.key === "Enter" && addItem()} autoFocus />
        <label style={s.label}>Categoria</label>
        <select style={s.input} value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })}>
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
        {showAddCategory ? (
          <div style={{ marginBottom: 10 }}>
            <label style={s.label}>Nova categoria</label>
            <div style={s.row}>
              <input style={{ ...s.input, marginBottom: 0, flex: 1 }} value={newCategory} onChange={e => setNewCategory(e.target.value)} onKeyDown={e => e.key === "Enter" && addCategory()} autoFocus />
              <button style={{ ...s.btn, ...s.btnPrimary }} onClick={addCategory}>OK</button>
            </div>
          </div>
        ) : <button style={{ ...s.btn, ...s.btnSecondary, marginBottom: 10, fontSize: 13 }} onClick={() => setShowAddCategory(true)}>+ Nova categoria</button>}
        <div style={s.row}>
          <button style={{ ...s.btn, ...s.btnSecondary, flex: 1 }} onClick={() => setView("list")}>Cancelar</button>
          <button style={{ ...s.btn, ...s.btnPrimary, flex: 1 }} onClick={addItem}>Adicionar</button>
        </div>
      </div>
      {toast && <div style={s.toast}>{toast}</div>}
    </div>
  );

  // ── MAIN ──
  return (
    <div style={s.app}>
      <div style={s.header}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="36" height="36" viewBox="0 0 90 90" xmlns="http://www.w3.org/2000/svg">
                <circle cx="45" cy="45" r="42" fill="#1f7a6e"/>
                <path d="M18 28 L25 28 L33 58 L62 58" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M25 28 L30 48 L62 48 L67 28 Z" fill="#fff" opacity="0.2"/>
                <line x1="30" y1="48" x2="62" y2="48" stroke="#fff" stroke-width="3"/>
                <circle cx="36" cy="64" r="4" fill="#fff"/>
                <circle cx="57" cy="64" r="4" fill="#fff"/>
                <text x="47" y="43" textAnchor="middle" fill="#fff" fontSize="14" fontFamily="system-ui" fontWeight="900">€</text>
              </svg>
              <div style={{ fontWeight: 700, fontSize: 19 }}>Comprinha</div>
            </div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>{allItems.length} produtos · {Object.values(history).reduce((a, h) => a + h.length, 0)} registos</div>
          </div>
          <div style={{ position: "relative" }}>
            <button onClick={() => setShowMenu(!showMenu)} title="Mais opções" style={{ ...s.btn, padding: "7px 9px", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <circle cx="24" cy="10" r="3.5" fill="#fff"/>
                <circle cx="24" cy="24" r="3.5" fill="#fff"/>
                <circle cx="24" cy="38" r="3.5" fill="#fff"/>
              </svg>
            </button>
            {showMenu && (
              <>
                <div onClick={() => setShowMenu(false)} style={{ position: "fixed", inset: 0, zIndex: 30 }} />
                <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, background: "#fff", borderRadius: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.18)", zIndex: 31, minWidth: 200, overflow: "hidden" }}>
                  <button onClick={() => { exportData(); setShowMenu(false); }}
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
                    <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                      <rect x="8" y="8" width="32" height="32" rx="3" fill="none" stroke="#2a9d8f" strokeWidth="2.5" strokeLinejoin="round"/>
                      <path d="M14 8 L14 18 L30 18 L30 8" fill="none" stroke="#2a9d8f" strokeWidth="2.5" strokeLinejoin="round"/>
                      <rect x="18" y="26" width="12" height="10" rx="1" fill="none" stroke="#2a9d8f" strokeWidth="2.2"/>
                    </svg>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#222" }}>Exportar backup</div>
                      <div style={{ fontSize: 12, color: "#888" }}>Guardar os dados num ficheiro</div>
                    </div>
                  </button>
                  <div style={{ height: 1, background: "#eee" }} />
                  <label style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", cursor: "pointer", textAlign: "left" }}>
                    <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                      <line x1="24" y1="32" x2="24" y2="10" stroke="#2a9d8f" strokeWidth="2.8" strokeLinecap="round"/>
                      <path d="M15 19 L24 10 L33 19" fill="none" stroke="#2a9d8f" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M10 32 L10 36 Q10 38 12 38 L36 38 Q38 38 38 36 L38 32" fill="none" stroke="#2a9d8f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#222" }}>Importar backup</div>
                      <div style={{ fontSize: 12, color: "#888" }}>Restaurar dados de um ficheiro</div>
                    </div>
                    <input type="file" accept=".json" onChange={e => { importData(e); setShowMenu(false); }} style={{ display: "none" }} />
                  </label>
                </div>
              </>
            )}
          </div>
        </div>
        <style>{`
          .search-input::placeholder { color: #1a6b5f; font-style: italic; font-weight: 700; opacity: 0.85; font-size: 13px; }
        `}</style>
        <input
          className="search-input"
          style={{ ...s.input, marginTop: 10, marginBottom: 0, background: "rgba(210,240,235,0.85)", border: "none", color: "#1a6b5f", fontWeight: 700 }}
          placeholder="Pesquisar Produtos..."
          value={search}
          onChange={e => {
            setSearch(e.target.value);
            if (e.target.value && tab === "shopping") setTab("list");
          }}
        />
      </div>

      <div style={{ display: "flex", background: "#fff", borderBottom: "1px solid #eee" }}>
        <button style={s.tab(tab === "list")} onClick={() => setTab("list")}>
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 6 Q38 12 36 26 Q32 38 24 38 Q16 38 12 26 Q10 12 24 6Z" fill="none" stroke={tab === "list" ? "#2a9d8f" : "#888"} strokeWidth="2.8"/>
              <line x1="24" y1="8" x2="24" y2="36" stroke={tab === "list" ? "#2a9d8f" : "#888"} strokeWidth="2.2"/>
              <line x1="17" y1="20" x2="24" y2="16" stroke={tab === "list" ? "#2a9d8f" : "#888"} strokeWidth="2"/>
              <line x1="13" y1="28" x2="24" y2="22" stroke={tab === "list" ? "#2a9d8f" : "#888"} strokeWidth="2"/>
              <line x1="31" y1="20" x2="24" y2="16" stroke={tab === "list" ? "#2a9d8f" : "#888"} strokeWidth="2"/>
              <line x1="35" y1="28" x2="24" y2="22" stroke={tab === "list" ? "#2a9d8f" : "#888"} strokeWidth="2"/>
            </svg>
            Produtos
          </span>
        </button>
        <button style={s.tab(tab === "shopping")} onClick={() => setTab("shopping")}>
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 14 L15 19 L22 11" fill="none" stroke={tab === "shopping" ? "#2a9d8f" : "#888"} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="26" y1="15" x2="38" y2="15" stroke={tab === "shopping" ? "#2a9d8f" : "#888"} strokeWidth="2.2" strokeLinecap="round"/>
              <path d="M10 24 L15 29 L22 21" fill="none" stroke={tab === "shopping" ? "#2a9d8f" : "#888"} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="26" y1="25" x2="38" y2="25" stroke={tab === "shopping" ? "#2a9d8f" : "#888"} strokeWidth="2.2" strokeLinecap="round"/>
              <path d="M10 34 L15 39 L22 31" fill="none" stroke={tab === "shopping" ? "#2a9d8f" : "#888"} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="26" y1="35" x2="34" y2="35" stroke={tab === "shopping" ? "#2a9d8f" : "#888"} strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
            Lista{pinnedItems.length > 0 ? ` (${pinnedItems.length})` : ""}
          </span>
        </button>
      </div>

      {/* ── PRODUTOS TAB ── */}
      {tab === "list" && (
        <div style={{ padding: "0 16px" }}>
          <div style={{ position: "relative" }}>
            <div style={{ display: "flex", gap: 6, overflowX: "auto", padding: "10px 28px 2px 0", scrollbarWidth: "none", msOverflowStyle: "none" }}>
              <button onClick={() => setFilterCat(null)} style={{ ...s.btn, padding: "4px 12px", fontSize: 12, whiteSpace: "nowrap", background: !filterCat ? "#2a9d8f" : "#f1f3f5", color: !filterCat ? "#fff" : "#444" }}>Todas</button>
              {categories.filter(c => filteredItems.some(i => i.category === c) || c === filterCat).map(c => (
                <button key={c} onClick={() => setFilterCat(filterCat === c ? null : c)}
                  style={{ ...s.btn, padding: "4px 12px", fontSize: 12, whiteSpace: "nowrap", background: filterCat === c ? "#2a9d8f" : "#f1f3f5", color: filterCat === c ? "#fff" : "#444" }}>{c}</button>
              ))}
            </div>
            <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, display: "flex", alignItems: "center", background: "linear-gradient(to right, transparent, #f8f9fa 50%)", paddingLeft: 24, paddingRight: 4, pointerEvents: "none" }}>
              <span style={{ color: "#999", fontSize: 22, fontWeight: 300, lineHeight: 1 }}>›</span>
            </div>
          </div>
          {Object.keys(items).length === 0 ? (
            <div style={{ textAlign: "center", color: "#aaa", marginTop: 60 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🛍️</div>
              <div style={{ fontWeight: 600 }}>Sem produtos ainda</div>
              <div style={{ fontSize: 14, marginTop: 4 }}>Toca no + para adicionar.</div>
            </div>
          ) : Object.keys(groupedItems).length === 0 ? (
            <div style={{ textAlign: "center", color: "#aaa", marginTop: 40 }}>Nenhum produto encontrado.</div>
          ) : Object.entries(groupedItems).map(([cat, catItems]) => (
            <div key={cat}>
              <div style={s.catLabel}>{cat}</div>
              {catItems.map(item => {
                const last = getLastEntry(item.id);
                const count = (history[item.id] || []).length;
                const pinned = !!shoppingList[item.id]?.pinned;
                const isNew = highlightId === item.id;
                return (
                  <div key={item.id} ref={el => itemRefs.current[item.id] = el}
                    style={{ ...s.card, display: "flex", alignItems: "center", gap: 8, transition: "box-shadow .3s, background .3s", boxShadow: isNew ? "0 0 0 3px #2a9d8f" : "0 1px 4px rgba(0,0,0,0.07)", background: isNew ? "#e9f7f5" : "#fff" }}>
                    <div style={{ flex: 1, cursor: "pointer", minWidth: 0 }} onClick={() => { setSelectedItem(item); setFilterStore("all"); setView("history"); }}>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>{item.name}</div>
                      {last ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3, flexWrap: "wrap" }}>
                          <StoreBadge store={last.supermarket} />
                          <span style={{ fontSize: 12, color: "#888" }}>{last.date}</span>
                          {last.weight && <span style={{ fontSize: 12, color: "#666" }}>· {last.weight}</span>}
                        </div>
                      ) : <div style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>Sem registos</div>}
                    </div>
                    <div style={{ textAlign: "right", cursor: "pointer" }} onClick={() => { setSelectedItem(item); setFilterStore("all"); setView("history"); }}>
                      {last && <div style={{ fontWeight: 700, fontSize: 16 }}>{last.price.toFixed(2)} €</div>}
                      <div style={{ fontSize: 11, color: "#aaa" }}>{count} {count === 1 ? "reg." : "regs."}</div>
                    </div>
                    <button onClick={e => { e.stopPropagation(); togglePinned(item.id); }}
                      title={pinned ? "Remover da lista" : "Adicionar à lista de compras"}
                      style={{ background: pinned ? "#2a9d8f" : "#d2f0eb", border: "none", borderRadius: 8, padding: "6px 8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background .15s" }}>
                      <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 24 L18 32 L38 12" fill="none" stroke={pinned ? "#fff" : "#1a6b5f"} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* ── LISTA DE COMPRAS TAB ── */}
      {tab === "shopping" && (
        <div style={{ padding: "0 16px" }}>
          <div style={{ position: "relative" }}>
            <div style={{ display: "flex", gap: 6, overflowX: "auto", padding: "10px 28px 2px 0", scrollbarWidth: "none", msOverflowStyle: "none" }}>
              <button onClick={() => setShopFilterCat(null)} style={{ ...s.btn, padding: "4px 12px", fontSize: 12, whiteSpace: "nowrap", background: !shopFilterCat ? "#2a9d8f" : "#f1f3f5", color: !shopFilterCat ? "#fff" : "#444" }}>Todas</button>
              {categories.filter(c => pinnedItems.some(i => i.category === c) || c === shopFilterCat).map(c => (
                <button key={c} onClick={() => setShopFilterCat(shopFilterCat === c ? null : c)}
                  style={{ ...s.btn, padding: "4px 12px", fontSize: 12, whiteSpace: "nowrap", background: shopFilterCat === c ? "#2a9d8f" : "#f1f3f5", color: shopFilterCat === c ? "#fff" : "#444" }}>{c}</button>
              ))}
            </div>
            <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, display: "flex", alignItems: "center", background: "linear-gradient(to right, transparent, #f8f9fa 50%)", paddingLeft: 24, paddingRight: 4, pointerEvents: "none" }}>
              <span style={{ color: "#999", fontSize: 22, fontWeight: 300, lineHeight: 1 }}>›</span>
            </div>
          </div>
          {pinnedItems.filter(it => !shopFilterCat || it.category === shopFilterCat).length === 0 ? (
            <div style={{ textAlign: "center", color: "#bbb", fontSize: 14, marginTop: 40, lineHeight: 1.8 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🛒</div>
              <div>A lista está vazia.</div>
              <div style={{ fontSize: 13 }}>Toca no ✓ num produto para o adicionar.</div>
            </div>
          ) : (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "14px 0 6px" }}>
                <span style={{ ...s.catLabel, margin: 0 }}>Na lista ({pinnedItems.length})</span>
              </div>
              {pinnedItems.filter(it => !shopFilterCat || it.category === shopFilterCat).map(item => {
                const done = !!shoppingList[item.id]?.done;
                const last = getLastEntry(item.id);
                return (
                  <div key={item.id} onClick={() => toggleDone(item.id)}
                    style={{ ...s.card, display: "flex", alignItems: "center", gap: 8, opacity: done ? 0.35 : 1, transition: "opacity .3s", cursor: "pointer" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 15, textDecoration: done ? "line-through" : "none" }}>{item.name}</div>
                      {last ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3, flexWrap: "wrap" }}>
                          <StoreBadge store={last.supermarket} />
                          <span style={{ fontSize: 12, color: "#888" }}>{last.date}</span>
                          {last.weight && <span style={{ fontSize: 12, color: "#666" }}>· {last.weight}</span>}
                        </div>
                      ) : <div style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>Sem registos</div>}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      {last && <div style={{ fontWeight: 700, fontSize: 16 }}>{last.price.toFixed(2)} €</div>}
                      <div style={{ fontSize: 11, color: "#aaa" }}>&nbsp;</div>
                    </div>
                    <button onClick={e => { e.stopPropagation(); togglePinned(item.id); }} title="Remover da lista"
                      style={{ background: "#fbd5d8", border: "none", borderRadius: 8, color: "#c0303d", fontSize: 14, fontWeight: 700, cursor: "pointer", padding: "4px 9px", flexShrink: 0 }}>✕</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === "list" && (
        <button style={s.fab} onClick={() => { setNewItem({ name: "", category: categories[0] }); setShowAddCategory(false); setView("add-item"); }}>+</button>
      )}
      {toast && <div style={s.toast}>{toast}</div>}
    </div>
  );
}
