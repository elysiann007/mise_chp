import { useMemo, useState } from 'react'
import { X, Minus, Plus } from 'lucide-react'
import { toast } from 'sonner'
import type { MenuItem, Modifier } from '../../../types/entity.types'
import { useCartStore } from '../../../store/cartStore'
import type { CartModifier } from '../../../store/cartStore'
import { formatTRY } from '../../../utils/formatCurrency'

interface Props {
  item: MenuItem
  onClose: () => void
}

export default function ItemDetail({ item, onClose }: Props) {
  const addItem = useCartStore((s) => s.addItem)
  const [quantity, setQuantity] = useState(1)
  const [selectedModifiers, setSelectedModifiers] = useState<Map<string, Modifier>>(new Map())
  const [note, setNote] = useState('')

  function toggleModifier(groupId: string, modifier: Modifier, maxSelect: number) {
    setSelectedModifiers((prev) => {
      const next = new Map(prev)
      const key = `${groupId}-${modifier.id}`
      if (next.has(key)) {
        next.delete(key)
      } else {
        if (maxSelect === 1) {
          for (const k of next.keys()) {
            if (k.startsWith(`${groupId}-`)) next.delete(k)
          }
        }
        next.set(key, modifier)
      }
      return next
    })
  }

  const modifierTotal = useMemo(
    () => Array.from(selectedModifiers.values()).reduce((s, m) => s + Number(m.priceDelta), 0),
    [selectedModifiers],
  )
  const lineTotal = (Number(item.basePrice) + modifierTotal) * quantity

  function handleAdd() {
    const requiredGroups = item.modifierGroups.filter((g) => g.isRequired)
    for (const group of requiredGroups) {
      const hasSelection = group.modifiers.some((m) =>
        selectedModifiers.has(`${group.id}-${m.id}`)
      )
      if (!hasSelection) {
        toast.error(`"${group.name}" seçimi zorunludur.`)
        return
      }
    }

    const mods: CartModifier[] = Array.from(selectedModifiers.values()).map((m) => ({
      modifierId: m.id,
      name: m.name,
      priceDelta: Number(m.priceDelta),
    }))
    addItem(item, quantity, mods, note)
    toast.success(`${item.name} sepete eklendi`)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-end"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-t-3xl w-full max-h-[92svh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 flex items-center justify-center w-8 h-8 bg-black/10 hover:bg-black/20 rounded-full transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Image */}
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="w-full h-56 object-cover" />
        ) : (
          <div className="w-full h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <span className="text-5xl">🍽️</span>
          </div>
        )}

        <div className="p-5">
          {/* Item info */}
          <div className="mb-4">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h2 className="text-xl font-bold text-gray-900">{item.name}</h2>
              {item.isAlcohol && (
                <span className="flex-shrink-0 text-xs font-bold bg-red-100 text-red-600 px-2 py-1 rounded-full">18+</span>
              )}
            </div>
            {item.description && (
              <p className="text-sm text-gray-500 leading-relaxed mb-2">{item.description}</p>
            )}
            <p className="text-lg font-bold text-gray-900">{formatTRY(Number(item.basePrice))}</p>
          </div>

          {/* Modifier groups */}
          {[...item.modifierGroups]
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((group) => (
              <div key={group.id} className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900 text-sm">{group.name}</span>
                  {group.isRequired ? (
                    <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Zorunlu</span>
                  ) : (
                    <span className="text-xs text-gray-400">İsteğe bağlı</span>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  {[...group.modifiers]
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((mod) => {
                      const selected = selectedModifiers.has(`${group.id}-${mod.id}`)
                      return (
                        <label
                          key={mod.id}
                          className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition ${
                            selected ? 'bg-gray-900 text-white' : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                        >
                          <input
                            type={group.maxSelect === 1 ? 'radio' : 'checkbox'}
                            name={group.id}
                            checked={selected}
                            onChange={() => toggleModifier(group.id, mod, group.maxSelect)}
                            data-testid={`modifier-option-${mod.id}`}
                            className="sr-only"
                          />
                          <span className={`flex-1 text-sm font-medium ${selected ? 'text-white' : 'text-gray-700'}`}>
                            {mod.name}
                          </span>
                          {Number(mod.priceDelta) !== 0 && (
                            <span className={`text-sm font-semibold ${selected ? 'text-amber-300' : 'text-gray-500'}`}>
                              {Number(mod.priceDelta) > 0 ? '+' : ''}{formatTRY(Number(mod.priceDelta))}
                            </span>
                          )}
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            selected ? 'border-amber-400 bg-amber-400' : 'border-gray-300'
                          }`}>
                            {selected && <div className="w-2 h-2 bg-white rounded-full" />}
                          </div>
                        </label>
                      )
                    })}
                </div>
              </div>
            ))}

          {/* Note */}
          <textarea
            placeholder="Not ekleyin (isteğe bağlı)..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-gray-900 mb-5"
          />

          {/* Footer */}
          <div className="flex items-center gap-3">
            {/* Quantity */}
            <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-3 py-2">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="text-gray-500 hover:text-gray-900 transition"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-bold text-base w-5 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="text-gray-500 hover:text-gray-900 transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {/* Add to cart */}
            <button
              data-testid="add-to-cart"
              onClick={handleAdd}
              className="flex-1 py-3 rounded-xl bg-gray-900 text-white font-semibold text-sm hover:bg-gray-700 active:scale-95 transition"
            >
              Sepete Ekle · {formatTRY(lineTotal)}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
