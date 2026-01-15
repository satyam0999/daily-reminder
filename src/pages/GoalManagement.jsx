import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import GoalList from '../components/GoalList'

export default function GoalManagement() {
  const { user } = useAuth()
  const [goals, setGoals] = useState([])
  const [goalText, setGoalText] = useState('')
  const [goalType, setGoalType] = useState('daily')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGoals()
  }, [user])

  const fetchGoals = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true })

      if (error) throw error
      setGoals(data || [])
    } catch (err) {
      console.error('Error fetching goals:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!goalText.trim()) return

    try {
      const { data, error } = await supabase
        .from('goals')
        .insert({
          goal_text: goalText.trim(),
          goal_type: goalType,
          user_id: user.id
        })
        .select()
        .single()

      if (error) throw error
      setGoals([...goals, data])
      setGoalText('')
    } catch (err) {
      console.error('Error creating goal:', err)
    }
  }

  const handleEdit = async (id, newText) => {
    try {
      const { error } = await supabase
        .from('goals')
        .update({ goal_text: newText })
        .eq('id', id)

      if (error) throw error
      setGoals(goals.map(g => g.id === id ? { ...g, goal_text: newText } : g))
    } catch (err) {
      console.error('Error updating goal:', err)
    }
  }

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from('goals')
        .update({ is_active: false })
        .eq('id', id)

      if (error) throw error
      setGoals(goals.filter(g => g.id !== id))
    } catch (err) {
      console.error('Error deleting goal:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Manage Goals</h1>

        {/* Add Goal Form */}
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow-sm mb-6">
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Goal Description</label>
            <input
              type="text"
              value={goalText}
              onChange={(e) => setGoalText(e.target.value)}
              placeholder="Enter your goal..."
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Goal Type</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="goalType"
                  value="daily"
                  checked={goalType === 'daily'}
                  onChange={(e) => setGoalType(e.target.value)}
                />
                <span className="text-blue-600">Daily</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="goalType"
                  value="weekly"
                  checked={goalType === 'weekly'}
                  onChange={(e) => setGoalType(e.target.value)}
                />
                <span className="text-green-600">Weekly</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="goalType"
                  value="monthly"
                  checked={goalType === 'monthly'}
                  onChange={(e) => setGoalType(e.target.value)}
                />
                <span className="text-purple-600">Monthly</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Goal
          </button>
        </form>

        {/* Goals List */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Goals</h2>
          <GoalList goals={goals} onEdit={handleEdit} onDelete={handleDelete} />
        </div>
      </div>
    </div>
  )
}
