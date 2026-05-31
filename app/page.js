'use client'

import { useState, useEffect } from 'react'

export default function Home() {
  // ── Estado principal ────────────────────────────────────────────────────────
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // ── Estado del formulario de creación ──────────────────────────────────────
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [createError, setCreateError] = useState('')
  const [creating, setCreating] = useState(false)

  // ── Estado de edición inline ───────────────────────────────────────────────
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editCompleted, setEditCompleted] = useState(false)
  const [editError, setEditError] = useState('')
  const [saving, setSaving] = useState(false)

  // ── Cargar tareas al montar ────────────────────────────────────────────────
  useEffect(() => {
    fetchTasks()
  }, [])

  async function fetchTasks() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/tasks')
      if (!res.ok) throw new Error('No se pudieron cargar las tareas.')
      const data = await res.json()
      // Ordenar por fecha de creación descendente
      const sorted = (data.tasks ?? []).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      )
      setTasks(sorted)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ── Crear tarea ────────────────────────────────────────────────────────────
  async function handleCreate(e) {
    e.preventDefault()
    setCreateError('')

    if (!newTitle.trim()) {
      setCreateError('El título es obligatorio.')
      return
    }

    setCreating(true)
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, description: newDesc }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error al crear la tarea.')
      setTasks((prev) => [data.task, ...prev])
      setNewTitle('')
      setNewDesc('')
    } catch (err) {
      setCreateError(err.message)
    } finally {
      setCreating(false)
    }
  }

  // ── Iniciar edición ────────────────────────────────────────────────────────
  function startEdit(task) {
    setEditingId(task.id)
    setEditTitle(task.title)
    setEditDesc(task.description ?? '')
    setEditCompleted(task.completed)
    setEditError('')
  }

  function cancelEdit() {
    setEditingId(null)
    setEditTitle('')
    setEditDesc('')
    setEditCompleted(false)
    setEditError('')
  }

  // ── Guardar edición ────────────────────────────────────────────────────────
  async function handleSave(id) {
    setEditError('')

    if (!editTitle.trim()) {
      setEditError('El título es obligatorio.')
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          description: editDesc,
          completed: editCompleted,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error al actualizar la tarea.')
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? data.task : t))
      )
      cancelEdit()
    } catch (err) {
      setEditError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // ── Eliminar tarea ─────────────────────────────────────────────────────────
  async function handleDelete(id) {
    const confirmed = confirm('¿Estás seguro de que deseas eliminar esta tarea?')
    if (!confirmed) return

    try {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error al eliminar la tarea.')
      setTasks((prev) => prev.filter((t) => t.id !== id))
    } catch (err) {
      alert(`Error: ${err.message}`)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <main className="max-w-2xl mx-auto py-10 px-4">
      {/* Encabezado */}
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        Gestor de Tareas
      </h1>

      {/* Formulario de creación */}
      <section className="bg-white rounded-2xl shadow p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Nueva Tarea
        </h2>
        <form onSubmit={handleCreate} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Título <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Ej. Comprar leche"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Descripción
            </label>
            <textarea
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Detalles opcionales..."
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
          </div>

          {createError && (
            <p className="text-red-500 text-sm">{createError}</p>
          )}

          <button
            type="submit"
            disabled={creating}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold rounded-lg py-2 text-sm transition-colors"
          >
            {creating ? 'Creando...' : 'Crear Tarea'}
          </button>
        </form>
      </section>

      {/* Estado de carga / error global */}
      {loading && (
        <p className="text-center text-gray-500 text-sm">Cargando tareas...</p>
      )}
      {!loading && error && (
        <p className="text-center text-red-500 text-sm">{error}</p>
      )}

      {/* Lista de tareas */}
      {!loading && !error && tasks.length === 0 && (
        <p className="text-center text-gray-400 text-sm">
          No hay tareas. ¡Crea la primera!
        </p>
      )}

      <ul className="space-y-4">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="bg-white rounded-2xl shadow p-5"
          >
            {editingId === task.id ? (
              /* ── Modo edición inline ── */
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Título <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    rows={2}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                  />
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editCompleted}
                    onChange={(e) => setEditCompleted(e.target.checked)}
                    className="w-4 h-4 accent-blue-600"
                  />
                  Marcar como completada
                </label>

                {editError && (
                  <p className="text-red-500 text-sm">{editError}</p>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => handleSave(task.id)}
                    disabled={saving}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold rounded-lg py-2 text-sm transition-colors"
                  >
                    {saving ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button
                    onClick={cancelEdit}
                    disabled={saving}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg py-2 text-sm transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              /* ── Modo visualización ── */
              <div>
                <div className="flex items-start justify-between gap-3 mb-1">
                  <h3
                    className={`font-semibold text-gray-800 text-base ${
                      task.completed ? 'line-through text-gray-400' : ''
                    }`}
                  >
                    {task.title}
                  </h3>
                  <span
                    className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${
                      task.completed
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {task.completed ? 'Completada' : 'Pendiente'}
                  </span>
                </div>

                {task.description && (
                  <p className="text-sm text-gray-500 mb-3">
                    {task.description}
                  </p>
                )}

                <p className="text-xs text-gray-400 mb-3">
                  Creada:{' '}
                  {new Date(task.createdAt).toLocaleString('es-MX', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(task)}
                    className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded-lg py-1.5 text-sm transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 font-medium rounded-lg py-1.5 text-sm transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </main>
  )
}
