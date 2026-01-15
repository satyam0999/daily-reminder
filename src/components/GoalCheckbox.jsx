const typeColors = {
  daily: 'bg-blue-500',
  weekly: 'bg-green-500',
  monthly: 'bg-purple-500'
}

export default function GoalCheckbox({ goal, isChecked, onToggle }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded shadow-sm">
      <input
        type="checkbox"
        checked={isChecked}
        onChange={() => onToggle(goal.id)}
        className="w-5 h-5 cursor-pointer"
      />
      <span className={`px-2 py-1 text-xs text-white rounded ${typeColors[goal.goal_type]}`}>
        {goal.goal_type}
      </span>
      <span className={isChecked ? 'line-through text-gray-400' : 'text-gray-800'}>
        {goal.goal_text}
      </span>
    </div>
  )
}
