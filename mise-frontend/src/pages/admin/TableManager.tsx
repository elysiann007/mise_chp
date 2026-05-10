import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, Pencil, Check, X, QrCode } from 'lucide-react'
import QRCode from 'qrcode'
import { toast } from 'sonner'
import { getTables, createTable, updateTable, deleteTable } from '../../services/api/admin.api'
import { useAuthStore } from '../../store/authStore'
import type { Table } from '../../types/entity.types'

const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173'

function QRCanvas({ value }: { value: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, value, { width: 140, margin: 1, color: { dark: '#111827', light: '#fff' } })
    }
  }, [value])

  return <canvas ref={canvasRef} className="block mx-auto rounded-xl" />
}

export default function TableManager() {
  const { accessToken } = useAuthStore()
  const navigate = useNavigate()
  const [tables, setTables] = useState<Table[]>([])
  const [newLabel, setNewLabel] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [editLabel, setEditLabel] = useState('')
  const [loading, setLoading] = useState(false)

  async function load() {
    if (!accessToken) return
    setTables(await getTables(accessToken))
  }

  useEffect(() => {
    if (!accessToken) { navigate('/login'); return }
    load()
  }, [accessToken])

  async function add() {
    if (!newLabel.trim() || !accessToken) return
    setLoading(true)
    try {
      await createTable(accessToken, { label: newLabel.trim() })
      setNewLabel('')
      await load()
      toast.success('Masa eklendi')
    } catch { toast.error('Masa eklenemedi') } finally { setLoading(false) }
  }

  async function saveEdit(id: string) {
    if (!accessToken || !editLabel.trim()) return
    try {
      await updateTable(accessToken, id, { label: editLabel.trim() })
      setEditId(null)
      await load()
    } catch { toast.error('Güncellenemedi') }
  }

  async function toggleActive(t: Table) {
    if (!accessToken) return
    try {
      await updateTable(accessToken, t.id, { isActive: !t.isActive })
      await load()
    } catch { toast.error('Güncellenemedi') }
  }

  async function remove(id: string) {
    if (!accessToken || !confirm('Bu masayı silmek istiyor musunuz?')) return
    try {
      await deleteTable(accessToken, id)
      await load()
      toast.success('Masa silindi')
    } catch { toast.error('Silinemedi') }
  }

  const qrUrl = (token: string) => `${FRONTEND_URL}/?qr=${token}`

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Masa Yönetimi</h1>
        <p className="text-gray-500 text-sm mt-1">QR kod oluştur ve masaları yönet</p>
      </div>

      {/* Add table */}
      <div className="flex gap-3 mb-8">
        <input
          placeholder="Masa adı (ör. Masa 4, Teras 2)"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          className="flex-1 max-w-xs px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
        <button
          onClick={add}
          disabled={loading || !newLabel.trim()}
          className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-700 disabled:opacity-40 transition"
        >
          <Plus className="w-3.5 h-3.5" /> Masa Ekle
        </button>
      </div>

      {/* Tables grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tables.map((t) => (
          <div
            key={t.id}
            className={`bg-white rounded-2xl p-5 shadow-sm border transition ${
              t.isActive ? 'border-gray-100' : 'border-dashed border-gray-200 opacity-60'
            }`}
          >
            {/* Label */}
            {editId === t.id ? (
              <div className="flex gap-2 mb-3">
                <input
                  autoFocus
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveEdit(t.id)
                    if (e.key === 'Escape') setEditId(null)
                  }}
                  className="flex-1 px-2 py-1 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <button onClick={() => saveEdit(t.id)} className="text-emerald-600 hover:text-emerald-700">
                  <Check className="w-4 h-4" />
                </button>
                <button onClick={() => setEditId(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-3">
                <span className="font-bold text-gray-900 flex-1">{t.label}</span>
                {!t.isActive && (
                  <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full font-medium">Pasif</span>
                )}
              </div>
            )}

            {/* QR code */}
            <div className="mb-3">
              <QRCanvas value={qrUrl(t.qrToken)} />
            </div>

            <div className="flex items-center gap-1 mb-3">
              <QrCode className="w-3 h-3 text-gray-400 flex-shrink-0" />
              <span className="text-[10px] text-gray-400 font-mono truncate">{t.qrToken}</span>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => { setEditId(t.id); setEditLabel(t.label) }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 text-xs font-medium transition"
              >
                <Pencil className="w-3 h-3" /> Düzenle
              </button>
              <button
                onClick={() => toggleActive(t)}
                className={`flex-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  t.isActive
                    ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                }`}
              >
                {t.isActive ? 'Pasif Yap' : 'Aktif Yap'}
              </button>
              <button
                onClick={() => remove(t.id)}
                className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-300 hover:bg-red-50 hover:text-red-500 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {tables.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
          <QrCode className="w-12 h-12" />
          <p className="font-medium">Henüz masa eklenmemiş</p>
        </div>
      )}
    </div>
  )
}
