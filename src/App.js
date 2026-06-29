import { useState, useEffect } from "react";

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
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState(null);
  const [filterStore, setFilterStore] = useState("all");
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [shopFilterCat, setShopFilterCat] = useState(null);

  const persist = (key, val) => storage.set(key, JSON.stringify(val));

  useEffect(() => {
    const c = storage.get("gt:categories");
    const i = storage.get("gt:items");
    const h = storage.get("gt:history");
    const sl = storage.get("gt:shopping");
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
      if (!existing.includes(p.name.toLowerCase())) {
        const id = `seed-${p.name.toLowerCase().replace(/\s/g, "-").replace(/[()]/g, "")}`;
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

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  const addItem = () => {
    if (!newItem.name.trim()) return;
    const id = Date.now().toString();
    const updated = { ...items, [id]: { id, name: newItem.name.trim(), category: newItem.category } };
    setItems(updated); persist("gt:items", updated);
    showToast(`"${newItem.name.trim()}" adicionado!`);
    setNewItem({ name: "", category: newItem.category });
    setView("list");
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
    setView("list"); showToast("Item removido.");
  };

  const togglePinned = (id) => {
    const cur = shoppingList[id] || { pinned: false, done: false };
    const updated = { ...shoppingList, [id]: { ...cur, pinned: !cur.pinned, done: false } };
    setShoppingList(updated); persist("gt:shopping", updated);
  };

  const toggleDone = (id) => {
    const cur = shoppingList[id] || { pinned: true, done: false };
    const updated = { ...shoppingList, [id]: { ...cur, done: !cur.done } };
    setShoppingList(updated); persist("gt:shopping", updated);
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
  const groupedItems = categories.reduce((acc, cat) => { const ci = filteredItems.filter(it => it.category === cat); if (ci.length) acc[cat] = ci; return acc; }, {});
  const pinnedItems = allItems.filter(it => shoppingList[it.id]?.pinned);
  const shopItems = allItems.filter(it => !shopFilterCat || it.category === shopFilterCat);
  const shopGrouped = categories.reduce((acc, cat) => { const ci = shopItems.filter(it => it.category === cat); if (ci.length) acc[cat] = ci; return acc; }, {});
  const doneCount = pinnedItems.filter(it => shoppingList[it.id]?.done).length;

  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "system-ui", color: "#888" }}>A carregar...</div>;

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
              <button key={st} onClick={() => setFilterStore(st)} style={{ ...s.btn, padding: "4px 10px", fontSize: 12, background: filterStore === st ? "#2a9d8f" : "#f1f3f5", color: filterStore === st ? "#fff" : "#444" }}>
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
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontWeight: 700, fontSize: 17 }}>{e.price.toFixed(2)} €</span>
                  <button onClick={() => setConfirmDelete({ itemId: selectedItem.id, idx: i })} style={{ ...s.btnGhost, color: "#e63946", fontSize: 16 }}>🗑</button>
                </div>
              </div>
            ))
          }
          <button style={{ ...s.btn, ...s.btnPrimary, width: "100%", marginTop: 8 }} onClick={() => { setLogEntry({ price: "", weight: "", supermarket: SUPERMARKETS[0], date: new Date().toISOString().split("T")[0] }); setView("log-price"); }}>
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
        <label style={s.label}>Peso / Quantidade <span style={{ fontWeight: 400, color: "#aaa" }}>(opcional, ex: 500g, 1kg, 6un)</span></label>
        <input style={s.input} type="text" placeholder="ex: 500g" value={logEntry.weight} onChange={e => setLogEntry({ ...logEntry, weight: e.target.value })} />
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

  return (
    <div style={s.app}>
      <div style={s.header}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 19 }}>🛒 Grocery Tracker</div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>{allItems.length} produtos · {Object.values(history).reduce((a, h) => a + h.length, 0)} registos</div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={exportData} title="Exportar backup" style={{ ...s.btn, padding: "6px 10px", fontSize: 13, background: "rgba(255,255,255,0.2)", color: "#fff" }}>⬇️</button>
            <label title="Importar backup" style={{ ...s.btn, padding: "6px 10px", fontSize: 13, background: "rgba(255,255,255,0.2)", color: "#fff", cursor: "pointer", display: "inline-flex", alignItems: "center" }}>
              ⬆️<input type="file" accept=".json" onChange={importData} style={{ display: "none" }} />
            </label>
          </div>
        </div>
        {tab === "list" && (
          <input style={{ ...s.input, marginTop: 10, marginBottom: 0, background: "rgba(255,255,255,0.15)", border: "none", color: "#fff" }}
            placeholder="🔍 Pesquisar produto..." value={search} onChange={e => setSearch(e.target.value)} />
        )}
      </div>

      <div style={{ display: "flex", background: "#fff", borderBottom: "1px solid #eee" }}>
        <button style={s.tab(tab === "list")} onClick={() => setTab("list")}>📋 Produtos</button>
        <button style={s.tab(tab === "shopping")} onClick={() => setTab("shopping")}>
          🛍️ Lista{pinnedItems.length > 0 ? ` (${pinnedItems.length})` : ""}
        </button>
      </div>

      {tab === "list" && (
        <div style={{ padding: "0 16px" }}>
          <div style={{ display: "flex", gap: 6, overflowX: "auto", padding: "10px 0 2px" }}>
            <button onClick={() => setFilterCat(null)} style={{ ...s.btn, padding: "4px 12px", fontSize: 12, whiteSpace: "nowrap", background: !filterCat ? "#2a9d8f" : "#f1f3f5", color: !filterCat ? "#fff" : "#444" }}>Todas</button>
            {categories.filter(c => filteredItems.some(i => i.category === c)).map(c => (
              <button key={c} onClick={() => setFilterCat(filterCat === c ? null : c)} style={{ ...s.btn, padding: "4px 12px", fontSize: 12, whiteSpace: "nowrap", background: filterCat === c ? "#2a9d8f" : "#f1f3f5", color: filterCat === c ? "#fff" : "#444" }}>{c}</button>
            ))}
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
                return (
                  <div key={item.id} style={{ ...s.card, display: "flex", alignItems: "center", gap: 8 }}>
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
                      style={{ ...s.btnGhost, fontSize: 22, color: pinned ? "#2a9d8f" : "#ccc", transition: "color .15s", flexShrink: 0 }}>🛒</button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {tab === "shopping" && (
        <div style={{ padding: "0 16px" }}>
          {pinnedItems.length === 0 ? (
            <div style={{ textAlign: "center", color: "#bbb", fontSize: 14, marginTop: 40, lineHeight: 1.8 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🛒</div>
              <div>A lista está vazia.</div>
              <div style={{ fontSize: 13 }}>Toca em 🛒 num produto para o adicionar.</div>
            </div>
          ) : (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "14px 0 6px" }}>
                <span style={{ ...s.catLabel, margin: 0 }}>✅ Na lista ({pinnedItems.length})</span>
                {doneCount > 0 && <button style={{ ...s.btn, ...s.btnSecondary, padding: "3px 10px", fontSize: 12 }} onClick={clearDone}>Desmarcar todos</button>}
              </div>
              {pinnedItems.map(item => {
                const done = !!shoppingList[item.id]?.done;
                const last = getLastEntry(item.id);
                return (
                  <div key={item.id} style={{ ...s.card, display: "flex", alignItems: "center", gap: 12, opacity: done ? 0.45 : 1, transition: "opacity .2s" }}>
                    <div onClick={() => toggleDone(item.id)} style={{ width: 24, height: 24, borderRadius: 6, border: done ? "none" : "2px solid #ccc", background: done ? "#2a9d8f" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer", transition: "all .15s" }}>
                      {done && <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>✓</span>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 15, textDecoration: done ? "line-through" : "none" }}>{item.name}</div>
                      {last && (
                        <div style={{ fontSize: 12, color: "#888", display: "flex", alignItems: "center", gap: 6, marginTop: 2, flexWrap: "wrap" }}>
                          {last.price.toFixed(2)} € · <StoreBadge store={last.supermarket} />{last.weight ? ` · ${last.weight}` : ""}
                        </div>
                      )}
                    </div>
                    <button onClick={() => togglePinned(item.id)} title="Remover da lista" style={{ ...s.btnGhost, color: "#e63946", fontSize: 18, flexShrink: 0 }}>✕</button>
                  </div>
                );
              })}
            </div>
          )}
          <div style={{ marginTop: 20 }}>
            <div style={{ ...s.catLabel, color: "#aaa" }}>TODOS OS PRODUTOS</div>
            <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 6 }}>
              <button onClick={() => setShopFilterCat(null)} style={{ ...s.btn, padding: "4px 12px", fontSize: 12, whiteSpace: "nowrap", background: !shopFilterCat ? "#2a9d8f" : "#f1f3f5", color: !shopFilterCat ? "#fff" : "#444" }}>Todas</button>
              {categories.filter(c => allItems.some(i => i.category === c)).map(c => (
                <button key={c} onClick={() => setShopFilterCat(shopFilterCat === c ? null : c)} style={{ ...s.btn, padding: "4px 12px", fontSize: 12, whiteSpace: "nowrap", background: shopFilterCat === c ? "#2a9d8f" : "#f1f3f5", color: shopFilterCat === c ? "#fff" : "#444" }}>{c}</button>
              ))}
            </div>
            {Object.entries(shopGrouped).map(([cat, catItems]) => (
              <div key={cat}>
                <div style={s.catLabel}>{cat}</div>
                {catItems.map(item => {
                  const pinned = !!shoppingList[item.id]?.pinned;
                  const last = getLastEntry(item.id);
                  return (
                    <div key={item.id} style={{ ...s.card, display: "flex", alignItems: "center", gap: 12, opacity: pinned ? 0.4 : 1 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 15 }}>{item.name}</div>
                        {last && (
                          <div style={{ fontSize: 12, color: "#888", display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                            {last.price.toFixed(2)} € · <StoreBadge store={last.supermarket} />
                          </div>
                        )}
                      </div>
                      <button onClick={() => togglePinned(item.id)} style={{ ...s.btnGhost, fontSize: 22, color: pinned ? "#2a9d8f" : "#ccc", transition: "color .15s", flexShrink: 0 }}
                        title={pinned ? "Já na lista" : "Adicionar à lista"}>🛒</button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "list" && (
        <button style={s.fab} onClick={() => { setNewItem({ name: "", category: categories[0] }); setShowAddCategory(false); setView("add-item"); }}>+</button>
      )}
      {toast && <div style={s.toast}>{toast}</div>}
    </div>
  );
}
