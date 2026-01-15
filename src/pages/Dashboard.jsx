import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import GoalCheckbox from '../components/GoalCheckbox'
import JournalEntry from '../components/JournalEntry'
import YearProgressBar from '../components/YearProgressBar'

export default function Dashboard() {
  const { user } = useAuth()
  const [goals, setGoals] = useState([])
  const [completedIds, setCompletedIds] = useState(new Set())
  const [journalText, setJournalText] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('daily')

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

  // Calculate remaining daily goals
  const remainingDailyGoals = dailyGoals.filter(g => !completedIds.has(g.id)).length

  // Get goals for active tab
  const getActiveGoals = () => {
    switch(activeTab) {
      case 'daily': return dailyGoals
      case 'weekly': return weeklyGoals
      case 'monthly': return monthlyGoals
      default: return dailyGoals
    }
  }

  const activeGoals = getActiveGoals()

  const tabConfig = [
    { id: 'daily', label: 'Daily', color: 'blue', count: dailyGoals.length },
    { id: 'weekly', label: 'Weekly', color: 'green', count: weeklyGoals.length },
    { id: 'monthly', label: 'Monthly', color: 'purple', count: monthlyGoals.length }
  ]

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
        {/* Year Progress Bar */}
        <div className="mb-6">
          <YearProgressBar year={2026} />
        </div>

        {/* Header with Daily Goals Counter */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">{displayDate}</h1>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-lg text-gray-600">
              You completed {completedCount}/{totalCount} goals today
            </p>
            <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-semibold">
              {remainingDailyGoals} daily {remainingDailyGoals === 1 ? 'goal' : 'goals'} remaining
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex gap-2 border-b border-gray-300">
            {tabConfig.map(tab => {
              const isActive = activeTab === tab.id
              const tabColors = {
                daily: { 
                  active: 'text-blue-600 border-b-2 border-blue-600',
                  badge: 'bg-blue-100 text-blue-700'
                },
                weekly: { 
                  active: 'text-green-600 border-b-2 border-green-600',
                  badge: 'bg-green-100 text-green-700'
                },
                monthly: { 
                  active: 'text-purple-600 border-b-2 border-purple-600',
                  badge: 'bg-purple-100 text-purple-700'
                }
              }
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 font-semibold transition-colors relative ${
                    isActive
                      ? tabColors[tab.id].active
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                  <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                    isActive 
                      ? tabColors[tab.id].badge
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Active Tab Content */}
        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <div className="space-y-3">
            {activeGoals.map(goal => (
              <GoalCheckbox
                key={goal.id}
                goal={goal}
                isChecked={completedIds.has(goal.id)}
                onToggle={toggleGoal}
              />
            ))}
            {activeGoals.length === 0 && (
              <p className="text-gray-500 text-center py-8">
                No {activeTab} goals yet. Add some in the Goals page!
              </p>
            )}
          </div>
        </div>

        <JournalEntry initialValue={journalText} onSave={saveJournal} />
      </div>
    </div>
  )
}
