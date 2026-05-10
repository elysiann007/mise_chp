import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, Pencil, Check, X, QrCode, Download } from 'lucide-react'
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
      QRCode.toCanvas(canvasRef.current, value, {
        width: 160,
        margin: 2,
        color: { dark: '#1c1917', light: '#ffffff' },
      })
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
  const [pageLoading, setPageLoading] = useState(true)

  async function load() {
    if (!accessToken) return
    try {
      setTables(await getTables(accessToken))
    } finally {
      setPageLoading(false)
    }
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

  async function downloadQR(t: Table) {
    const url = qrUrl(t.qrToken)
    const canvas = document.createElement('canvas')
    await QRCode.toCanvas(canvas, url, { width: 400, margin: 3, color: { dark: '#1c1917', light: '#ffffff' } })
    const link = document.createElement('a')
    link.download = `qr-${t.label.replace(/\s+/g, '-')}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  const qrUrl = (token: string) => `${FRONTEND_URL}/?qr=${token}`

  if (pageLoading) {
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
        <h1 className="text-2xl font-black text-stone-900">Masa Yönetimi</h1>
        <p className="text-stone-400 text-sm mt-1 font-medium">QR kod oluştur ve masaları yönet</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-8">
        <input
          placeholder="Masa adı (ör. Masa 4, Teras 2)"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          className="flex-1 px-4 py-3 rounded-xl border border-stone-200 text-base bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
        />
        <button
          onClick={add}
          disabled={loading || !newLabel.trim()}
          className="flex items-center justify-center gap-1.5 px-5 py-3 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600 disabled:opacity-40 transition shadow-md shadow-amber-200 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> Masa Ekle
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tables.map((t) => (
          <div
            key={t.id}
            className={`bg-white rounded-2xl p-5 shadow-sm border transition ${
              t.isActive ? 'border-stone-100' : 'border-dashed border-stone-200 opacity-60'
            }`}
          >
            {editId === t.id ? (
              <div className="flex gap-2 mb-4">
                <input
                  autoFocus
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveEdit(t.id)
                    if (e.key === 'Escape') setEditId(null)
                  }}
                  className="flex-1 px-3 py-2 rounded-xl border border-stone-200 text-base focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
                />
                <button onClick={() => saveEdit(t.id)} className="text-emerald-500 hover:text-emerald-600 transition">
                  <Check className="w-5 h-5" />
                </button>
                <button onClick={() => setEditId(null)} className="text-stone-400 hover:text-stone-600 transition">
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-4">
                <span className="font-black text-stone-900 flex-1 text-lg">{t.label}</span>
                {!t.isActive && (
                  <span className="text-[10px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded-full font-semibold">Pasif</span>
                )}
              </div>
            )}

            <div className="mb-3 bg-stone-50 rounded-xl p-3">
              <QRCanvas value={qrUrl(t.qrToken)} />
            </div>

            <div className="flex items-center gap-1 mb-4">
              <QrCode className="w-3 h-3 text-stone-400 flex-shrink-0" />
              <span className="text-[10px] text-stone-400 font-mono truncate">{t.qrToken}</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => { setEditId(t.id); setEditLabel(t.label) }}
                className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-stone-100 text-stone-600 hover:bg-stone-200 text-xs font-semibold transition"
              >
                <Pencil className="w-3 h-3" />
                <span className="hidden sm:inline">Düzenle</span>
              </button>
              <button
                onClick={() => downloadQR(t)}
                className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-stone-100 text-stone-600 hover:bg-stone-200 text-xs font-semibold transition"
                title="QR İndir"
              >
                <Download className="w-3 h-3" />
                <span className="hidden sm:inline">İndir</span>
              </button>
              <button
                onClick={() => toggleActive(t)}
                className={`flex-1 px-2.5 py-2 rounded-xl text-xs font-bold transition ${
                  t.isActive
                    ? 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                }`}
              >
                {t.isActive ? 'Pasif Yap' : 'Aktif Yap'}
              </button>
              <button
                onClick={() => remove(t.id)}
                className="flex items-center justify-center w-9 h-9 rounded-xl text-stone-300 hover:bg-red-50 hover:text-red-500 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {tables.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-stone-400">
          <QrCode className="w-12 h-12" />
          <p className="font-semibold">Henüz masa eklenmemiş</p>
          <p className="text-sm">Yukarıdan masa ekleyerek başlayın</p>
        </div>
      )}
    </div>
  )
}
