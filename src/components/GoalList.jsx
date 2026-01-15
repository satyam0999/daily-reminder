import { useState } from 'react'

const typeColors = {
  daily: 'bg-blue-500',
  weekly: 'bg-green-500',
  monthly: 'bg-purple-500'
}

export default function GoalList({ goals, onEdit, onDelete }) {
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')

  const startEdit = (goal) => {
    setEditingId(goal.id)
    setEditText(goal.goal_text)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditText('')
  }

  const saveEdit = (id) => {
    if (editText.trim()) {
      onEdit(id, editText.trim())
      setEditingId(null)
      setEditText('')
    }
  }

  const handleKeyDown = (e, id) => {
    if (e.key === 'Enter') saveEdit(id)
    if (e.key === 'Escape') cancelEdit()
  }

  return (
    <div className="space-y-3">
      {goals.map((goal) => (
        <div key={goal.id} className="flex items-center gap-3 p-3 bg-white rounded shadow-sm">
          <span className={`px-2 py-1 text-xs text-white rounded ${typeColors[goal.goal_type]}`}>
            {goal.goal_type}
          </span>
          
          {editingId === goal.id ? (
            <input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, goal.id)}
              className="flex-1 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          ) : (
            <span className="flex-1 text-gray-800">{goal.goal_text}</span>
          )}

          <div className="flex gap-2">
            {editingId === goal.id ? (
              <>
                <button
                  onClick={() => saveEdit(goal.id)}
                  className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Save
                </button>
                <button
                  onClick={cancelEdit}
                  className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => startEdit(goal)}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(goal.id)}
                  className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      ))}
      {goals.length === 0 && (
        <p className="text-gray-500 text-center py-4">No goals yet. Add one above!</p>
      )}
    </div>
  )
}
