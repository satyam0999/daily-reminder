import { useState, useEffect } from 'react'

export default function JournalEntry({ initialValue, onSave }) {
  const [text, setText] = useState(initialValue || '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setText(initialValue || '')
  }, [initialValue])

  const handleSave = async () => {
    setSaving(true)
    await onSave(text)
    setSaving(false)
  }

  return (
    <div className="bg-white p-4 rounded shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Journal Entry</h3>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write about your day, reflections, or anything on your mind..."
        className="w-full h-32 p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      />
      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save Journal'}
      </button>
    </div>
  )
}
