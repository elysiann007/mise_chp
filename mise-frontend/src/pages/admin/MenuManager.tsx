import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, ChevronRight, Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import { toast } from 'sonner'
import {
  getCategories, createCategory, updateCategory, deleteCategory,
  getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem,
  createModifierGroup, deleteModifierGroup,
  createModifier, deleteModifier,
} from '../../services/api/admin.api'
import { useAuthStore } from '../../store/authStore'
import { formatTRY } from '../../utils/formatCurrency'
import type { MenuCategory, MenuItem, ModifierGroup, Modifier } from '../../types/entity.types'

export default function MenuManager() {
  const { accessToken } = useAuthStore()
  const navigate = useNavigate()

  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [items, setItems] = useState<MenuItem[]>([])
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  const [newCatName, setNewCatName] = useState('')
  const [newItem, setNewItem] = useState<Record<string, { name: string; price: string; station: string }>>({})
  const [newGroup, setNewGroup] = useState<Record<string, { name: string; min: string; max: string; required: boolean }>>({})
  const [newMod, setNewMod] = useState<Record<string, { name: string; delta: string }>>({})

  async function load() {
    if (!accessToken) return
    try {
      const [cats, itms] = await Promise.all([getCategories(accessToken), getMenuItems(accessToken)])
      setCategories(cats)
      setItems(itms)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!accessToken) { navigate('/login'); return }
    load()
  }, [accessToken])

  const toggle = (id: string) =>
    setExpanded((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })

  const itemsByCategory = (catId: string) => items.filter((i) => i.categoryId === catId)

  async function addCategory() {
    if (!newCatName.trim() || !accessToken) return
    try {
      await createCategory(accessToken, { name: newCatName.trim() })
      setNewCatName('')
      await load()
      toast.success('Kategori eklendi')
    } catch { toast.error('Kategori eklenemedi') }
  }

  async function toggleCatActive(cat: MenuCategory) {
    if (!accessToken) return
    await updateCategory(accessToken, cat.id, { isActive: !cat.isActive })
    await load()
  }

  async function removeCategory(id: string) {
    if (!accessToken || !confirm('Kategoriyi silmek istiyor musunuz?')) return
    try {
      await deleteCategory(accessToken, id)
      await load()
      toast.success('Kategori silindi')
    } catch { toast.error('Silinemedi') }
  }

  async function addItem(catId: string) {
    const f = newItem[catId]
    if (!f?.name?.trim() || !f?.price || !accessToken) return
    try {
      await createMenuItem(accessToken, {
        categoryId: catId, name: f.name.trim(),
        basePrice: Number(f.price), prepStation: f.station || 'kitchen',
      })
      setNewItem((p) => ({ ...p, [catId]: { name: '', price: '', station: 'kitchen' } }))
      await load()
      toast.success('Ürün eklendi')
    } catch { toast.error('Ürün eklenemedi') }
  }

  async function toggleItemActive(item: MenuItem) {
    if (!accessToken) return
    await updateMenuItem(accessToken, item.id, { isActive: !item.isActive })
    await load()
  }

  async function removeItem(id: string) {
    if (!accessToken || !confirm('Ürünü silmek istiyor musunuz?')) return
    try {
      await deleteMenuItem(accessToken, id)
      await load()
      toast.success('Ürün silindi')
    } catch { toast.error('Silinemedi') }
  }

  async function addGroup(itemId: string) {
    const f = newGroup[itemId]
    if (!f?.name?.trim() || !accessToken) return
    try {
      await createModifierGroup(accessToken, itemId, {
        name: f.name.trim(), minSelect: Number(f.min) || 0,
        maxSelect: Number(f.max) || 1, isRequired: f.required ?? false,
      })
      setNewGroup((p) => ({ ...p, [itemId]: { name: '', min: '0', max: '1', required: false } }))
      await load()
      toast.success('Seçenek grubu eklendi')
    } catch { toast.error('Eklenemedi') }
  }

  async function removeGroup(id: string) {
    if (!accessToken || !confirm('Seçenek grubunu silmek istiyor musunuz?')) return
    try {
      await deleteModifierGroup(accessToken, id)
      await load()
    } catch { toast.error('Silinemedi') }
  }

  async function addModifier(groupId: string) {
    const f = newMod[groupId]
    if (!f?.name?.trim() || !accessToken) return
    try {
      await createModifier(accessToken, groupId, { name: f.name.trim(), priceDelta: Number(f.delta) || 0 })
      setNewMod((p) => ({ ...p, [groupId]: { name: '', delta: '' } }))
      await load()
    } catch { toast.error('Seçenek eklenemedi') }
  }

  async function removeMod(id: string) {
    if (!accessToken || !confirm('Seçeneği silmek istiyor musunuz?')) return
    try {
      await deleteModifier(accessToken, id)
      await load()
    } catch { toast.error('Silinemedi') }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center gap-3 text-stone-400">
        <div className="w-5 h-5 border-2 border-stone-200 border-t-amber-500 rounded-full animate-spin" />
        <span className="text-sm font-medium">Yükleniyor...</span>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-stone-900">Menü Yönetimi</h1>
        <p className="text-stone-400 text-sm mt-1 font-medium">Kategori, ürün ve seçenek yönetimi</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <input
          value={newCatName}
          onChange={(e) => setNewCatName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addCategory()}
          placeholder="Yeni kategori adı..."
          className="flex-1 px-4 py-3 rounded-xl border border-stone-200 text-base bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
        />
        <button
          onClick={addCategory}
          disabled={!newCatName.trim()}
          className="flex items-center justify-center gap-1.5 px-5 py-3 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600 disabled:opacity-40 transition shadow-md shadow-amber-200 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> Kategori Ekle
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
            <div
              className="flex items-center gap-3 px-4 py-4 cursor-pointer hover:bg-stone-50 transition"
              onClick={() => toggle(cat.id)}
            >
              {expanded.has(cat.id) ? (
                <ChevronDown className="w-4 h-4 text-stone-400 flex-shrink-0" />
              ) : (
                <ChevronRight className="w-4 h-4 text-stone-400 flex-shrink-0" />
              )}
              <span className={`font-bold flex-1 min-w-0 truncate ${!cat.isActive ? 'line-through text-stone-400' : 'text-stone-900'}`}>
                {cat.name}
              </span>
              <span className="text-xs text-stone-400 font-medium hidden sm:block">{itemsByCategory(cat.id).length} ürün</span>
              <button
                onClick={(e) => { e.stopPropagation(); toggleCatActive(cat) }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition flex-shrink-0 ${
                  cat.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-500'
                }`}
              >
                {cat.isActive ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{cat.isActive ? 'Aktif' : 'Pasif'}</span>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); removeCategory(cat.id) }}
                className="flex items-center justify-center w-8 h-8 rounded-lg text-stone-300 hover:bg-red-50 hover:text-red-500 transition flex-shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {expanded.has(cat.id) && (
              <div className="border-t border-stone-100">
                {itemsByCategory(cat.id).map((item) => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    onToggle={() => toggleItemActive(item)}
                    onDelete={() => removeItem(item.id)}
                    newGroup={newGroup[item.id] ?? { name: '', min: '0', max: '1', required: false }}
                    onNewGroupChange={(v) => setNewGroup((p) => ({ ...p, [item.id]: { ...p[item.id], ...v } }))}
                    onAddGroup={() => addGroup(item.id)}
                    onDeleteGroup={removeGroup}
                    newMod={newMod}
                    onNewModChange={(gid, v) => setNewMod((p) => ({ ...p, [gid]: { ...p[gid], ...v } }))}
                    onAddMod={addModifier}
                    onDeleteMod={removeMod}
                  />
                ))}

                <div className="px-4 py-4 bg-stone-50 border-t border-stone-100">
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">Ürün Ekle</p>
                  <div className="flex flex-col sm:flex-row flex-wrap gap-2">
                    <input
                      placeholder="Ürün adı"
                      value={newItem[cat.id]?.name ?? ''}
                      onChange={(e) => setNewItem((p) => ({ ...p, [cat.id]: { ...p[cat.id], name: e.target.value } }))}
                      className="flex-1 min-w-0 px-3 py-2.5 rounded-xl border border-stone-200 text-base bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
                    />
                    <input
                      placeholder="Fiyat (₺)"
                      type="number"
                      value={newItem[cat.id]?.price ?? ''}
                      onChange={(e) => setNewItem((p) => ({ ...p, [cat.id]: { ...p[cat.id], price: e.target.value } }))}
                      className="w-full sm:w-28 px-3 py-2.5 rounded-xl border border-stone-200 text-base bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
                    />
                    <select
                      value={newItem[cat.id]?.station ?? 'kitchen'}
                      onChange={(e) => setNewItem((p) => ({ ...p, [cat.id]: { ...p[cat.id], station: e.target.value } }))}
                      className="w-full sm:w-auto px-3 py-2.5 rounded-xl border border-stone-200 text-base bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
                    >
                      <option value="kitchen">Mutfak</option>
                      <option value="bar">Bar</option>
                    </select>
                    <button
                      onClick={() => addItem(cat.id)}
                      disabled={!newItem[cat.id]?.name?.trim() || !newItem[cat.id]?.price}
                      className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600 disabled:opacity-40 transition shadow-sm shadow-amber-200"
                    >
                      <Plus className="w-3.5 h-3.5" /> Ekle
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {categories.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-stone-400">
            <span className="text-4xl">🍽️</span>
            <p className="font-semibold">Henüz kategori eklenmemiş</p>
          </div>
        )}
      </div>
    </div>
  )
}

interface ItemRowProps {
  item: MenuItem
  onToggle: () => void
  onDelete: () => void
  newGroup: { name: string; min: string; max: string; required: boolean }
  onNewGroupChange: (v: Partial<{ name: string; min: string; max: string; required: boolean }>) => void
  onAddGroup: () => void
  onDeleteGroup: (id: string) => void
  newMod: Record<string, { name: string; delta: string }>
  onNewModChange: (groupId: string, v: Partial<{ name: string; delta: string }>) => void
  onAddMod: (groupId: string) => void
  onDeleteMod: (id: string) => void
}

function ItemRow({
  item, onToggle, onDelete, newGroup, onNewGroupChange, onAddGroup,
  onDeleteGroup, newMod, onNewModChange, onAddMod, onDeleteMod,
}: ItemRowProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-stone-50 last:border-0">
      <div className="flex items-center gap-3 px-4 py-3">
        <button onClick={() => setOpen((o) => !o)} className="text-stone-400 flex-shrink-0">
          {open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>
        <div className="flex-1 min-w-0">
          <span className={`font-semibold text-sm ${!item.isActive ? 'line-through text-stone-400' : 'text-stone-900'}`}>
            {item.name}
          </span>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <span className="text-xs font-bold text-stone-600">{formatTRY(item.basePrice)}</span>
            <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium">
              {item.prepStation === 'kitchen' ? 'Mutfak' : 'Bar'}
            </span>
            {item.isAlcohol && (
              <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-medium">18+</span>
            )}
          </div>
        </div>
        <button
          onClick={onToggle}
          className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition flex-shrink-0 ${
            item.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-500'
          }`}
        >
          {item.isActive ? 'Aktif' : 'Pasif'}
        </button>
        <button onClick={onDelete} className="text-stone-300 hover:text-red-500 transition flex-shrink-0">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {open && (
        <div className="px-4 pb-4 ml-7">
          {item.modifierGroups.map((group: ModifierGroup) => (
            <div key={group.id} className="mb-3 bg-stone-50 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="font-bold text-sm text-stone-800">{group.name}</span>
                <span className="text-xs text-stone-400">({group.minSelect}–{group.maxSelect})</span>
                {group.isRequired && (
                  <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-semibold">Zorunlu</span>
                )}
                <button onClick={() => onDeleteGroup(group.id)} className="ml-auto text-stone-300 hover:text-red-500 transition">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              {group.modifiers.map((mod: Modifier) => (
                <div key={mod.id} className="flex items-center gap-2 py-1.5 border-b border-stone-100 last:border-0">
                  <span className="text-sm flex-1 text-stone-700">{mod.name}</span>
                  {Number(mod.priceDelta) !== 0 && (
                    <span className={`text-xs font-bold ${Number(mod.priceDelta) > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {Number(mod.priceDelta) > 0 ? '+' : ''}{formatTRY(Number(mod.priceDelta))}
                    </span>
                  )}
                  <button onClick={() => onDeleteMod(mod.id)} className="text-stone-300 hover:text-red-500 transition">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <div className="flex flex-col sm:flex-row gap-2 mt-2.5">
                <input
                  placeholder="Seçenek adı"
                  value={newMod[group.id]?.name ?? ''}
                  onChange={(e) => onNewModChange(group.id, { name: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-lg border border-stone-200 text-base bg-white focus:outline-none focus:ring-1 focus:ring-amber-400 focus:border-transparent transition"
                />
                <input
                  placeholder="±Fiyat"
                  type="number"
                  value={newMod[group.id]?.delta ?? ''}
                  onChange={(e) => onNewModChange(group.id, { delta: e.target.value })}
                  className="w-full sm:w-20 px-3 py-2 rounded-lg border border-stone-200 text-base bg-white focus:outline-none focus:ring-1 focus:ring-amber-400 focus:border-transparent transition"
                />
                <button
                  onClick={() => onAddMod(group.id)}
                  disabled={!newMod[group.id]?.name?.trim()}
                  className="px-3 py-2 bg-amber-500 text-white rounded-lg text-sm font-bold hover:bg-amber-600 disabled:opacity-40 transition"
                >
                  + Ekle
                </button>
              </div>
            </div>
          ))}

          <div className="border border-dashed border-stone-200 rounded-xl p-3 mt-2">
            <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2.5">Seçenek Grubu Ekle</p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-2">
              <input
                placeholder="Grup adı"
                value={newGroup.name}
                onChange={(e) => onNewGroupChange({ name: e.target.value })}
                className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-stone-200 text-base bg-white focus:outline-none focus:ring-1 focus:ring-amber-400 focus:border-transparent transition"
              />
              <input
                placeholder="Min"
                type="number"
                value={newGroup.min}
                onChange={(e) => onNewGroupChange({ min: e.target.value })}
                className="w-full sm:w-16 px-3 py-2 rounded-lg border border-stone-200 text-base bg-white focus:outline-none focus:ring-1 focus:ring-amber-400 focus:border-transparent transition"
              />
              <input
                placeholder="Max"
                type="number"
                value={newGroup.max}
                onChange={(e) => onNewGroupChange({ max: e.target.value })}
                className="w-full sm:w-16 px-3 py-2 rounded-lg border border-stone-200 text-base bg-white focus:outline-none focus:ring-1 focus:ring-amber-400 focus:border-transparent transition"
              />
              <label className="flex items-center gap-2 text-sm text-stone-600 cursor-pointer py-2">
                <input
                  type="checkbox"
                  checked={newGroup.required}
                  onChange={(e) => onNewGroupChange({ required: e.target.checked })}
                  className="w-4 h-4 rounded accent-amber-500"
                />
                Zorunlu
              </label>
              <button
                onClick={onAddGroup}
                disabled={!newGroup.name.trim()}
                className="px-3 py-2 bg-amber-500 text-white rounded-lg text-sm font-bold hover:bg-amber-600 disabled:opacity-40 transition"
              >
                + Ekle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
