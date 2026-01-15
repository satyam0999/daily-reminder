import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import GoalCheckbox from '../components/GoalCheckbox'
import JournalEntry from '../components/JournalEntry'

export default function Dashboard() {
  const { user } = useAuth()
  const [goals, setGoals] = useState([])
  const [completedIds, setCompletedIds] = useState(new Set())
  const [journalText, setJournalText] = useState('')
  const [loading, setLoading] = useState(true)

  const today = new Date().toISOString().split('T')[0]
  const displayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  useEffect(() => {
    fetchData()
  }, [user])

  const fetchData = async () => {
    if (!user) return
    
    try {
      // Fetch active goals
      const { data: goalsData, error: goalsError } = await supabase
        .from('goals')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true })

      if (goalsError) throw goalsError
      setGoals(goalsData || [])

      // Fetch today's check-in
      const { data: checkIn, error: checkInError } = await supabase
        .from('check_ins')
        .select('*')
        .eq('check_in_date', today)
        .eq('user_id', user.id)
        .single()

      if (checkIn) {
        setCompletedIds(new Set(checkIn.completed_goal_ids || []))
        setJournalText(checkIn.journal_entry || '')
      }
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleGoal = async (goalId) => {
    const newCompleted = new Set(completedIds)
    if (newCompleted.has(goalId)) {
      newCompleted.delete(goalId)
    } else {
      newCompleted.add(goalId)
    }
    setCompletedIds(newCompleted)

    try {
      await supabase.from('check_ins').upsert({
        check_in_date: today,
        completed_goal_ids: Array.from(newCompleted),
        journal_entry: journalText,
        user_id: user.id
      }, { onConflict: 'user_id,check_in_date' })
    } catch (err) {
      console.error('Error saving check-in:', err)
    }
  }

  const saveJournal = async (text) => {
    setJournalText(text)
    try {
      await supabase.from('check_ins').upsert({
        check_in_date: today,
        completed_goal_ids: Array.from(completedIds),
        journal_entry: text,
        user_id: user.id
      }, { onConflict: 'user_id,check_in_date' })
    } catch (err) {
      console.error('Error saving journal:', err)
    }
  }

  const dailyGoals = goals.filter(g => g.goal_type === 'daily')
  const weeklyGoals = goals.filter(g => g.goal_type === 'weekly')
  const monthlyGoals = goals.filter(g => g.goal_type === 'monthly')
  const completedCount = completedIds.size
  const totalCount = goals.length

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
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">{displayDate}</h1>
          <p className="text-lg text-gray-600 mt-2">
            You completed {completedCount}/{totalCount} goals today
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Daily Goals */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold text-blue-600 mb-4">Daily Goals</h2>
            <div className="space-y-2">
              {dailyGoals.map(goal => (
                <GoalCheckbox
                  key={goal.id}
                  goal={goal}
                  isChecked={completedIds.has(goal.id)}
                  onToggle={toggleGoal}
                />
              ))}
              {dailyGoals.length === 0 && (
                <p className="text-gray-500 text-sm">No daily goals</p>
              )}
            </div>
          </div>

          {/* Weekly Goals */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold text-green-600 mb-4">Weekly Goals</h2>
            <div className="space-y-2">
              {weeklyGoals.map(goal => (
                <GoalCheckbox
                  key={goal.id}
                  goal={goal}
                  isChecked={completedIds.has(goal.id)}
                  onToggle={toggleGoal}
                />
              ))}
              {weeklyGoals.length === 0 && (
                <p className="text-gray-500 text-sm">No weekly goals</p>
              )}
            </div>
          </div>

          {/* Monthly Goals */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold text-purple-600 mb-4">Monthly Goals</h2>
            <div className="space-y-2">
              {monthlyGoals.map(goal => (
                <GoalCheckbox
                  key={goal.id}
                  goal={goal}
                  isChecked={completedIds.has(goal.id)}
                  onToggle={toggleGoal}
                />
              ))}
              {monthlyGoals.length === 0 && (
                <p className="text-gray-500 text-sm">No monthly goals</p>
              )}
            </div>
          </div>
        </div>

        <JournalEntry initialValue={journalText} onSave={saveJournal} />
      </div>
    </div>
  )
}
