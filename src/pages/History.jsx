import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

export default function History() {
  const { user } = useAuth()
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [checkIn, setCheckIn] = useState(null)
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGoals()
  }, [user])

  useEffect(() => {
    if (user) fetchCheckIn()
  }, [selectedDate, user])

  const fetchGoals = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) throw error
      setGoals(data || [])
    } catch (err) {
      console.error('Error fetching goals:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchCheckIn = async () => {
    try {
      const { data, error } = await supabase
        .from('check_ins')
        .select('*')
        .eq('check_in_date', selectedDate)
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      setCheckIn(data || null)
    } catch (err) {
      console.error('Error fetching check-in:', err)
      setCheckIn(null)
    }
  }

  const completedGoals = checkIn
    ? goals.filter(g => checkIn.completed_goal_ids?.includes(g.id))
    : []

  const activeGoalsCount = goals.filter(g => g.is_active).length
  const completionPercentage = activeGoalsCount > 0
    ? Math.round((completedGoals.length / activeGoalsCount) * 100)
    : 0

  const displayDate = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

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
        <h1 className="text-2xl font-bold text-gray-800 mb-6">History</h1>

        {/* Date Picker */}
        <div className="bg-white p-4 rounded shadow-sm mb-6">
          <label className="block text-gray-700 mb-2">Select Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Selected Date Info */}
        <div className="bg-white p-4 rounded shadow-sm mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{displayDate}</h2>
          
          {checkIn ? (
            <>
              <p className="text-lg text-gray-600 mb-4">
                Completion: {completionPercentage}% ({completedGoals.length} goals completed)
              </p>

              {/* Completed Goals */}
              <div className="mb-4">
                <h3 className="font-semibold text-gray-700 mb-2">Completed Goals</h3>
                {completedGoals.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1">
                    {completedGoals.map(goal => (
                      <li key={goal.id} className="text-gray-600">
                        <span className={`inline-block px-2 py-0.5 text-xs text-white rounded mr-2 ${
                          goal.goal_type === 'daily' ? 'bg-blue-500' :
                          goal.goal_type === 'weekly' ? 'bg-green-500' : 'bg-purple-500'
                        }`}>
                          {goal.goal_type}
                        </span>
                        {goal.goal_text}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No goals completed</p>
                )}
              </div>

              {/* Journal Entry */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Journal Entry</h3>
                {checkIn.journal_entry ? (
                  <p className="text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded">
                    {checkIn.journal_entry}
                  </p>
                ) : (
                  <p className="text-gray-500">No journal entry</p>
                )}
              </div>
            </>
          ) : (
            <p className="text-gray-500">No data available for this date</p>
          )}
        </div>
      </div>
    </div>
  )
}
