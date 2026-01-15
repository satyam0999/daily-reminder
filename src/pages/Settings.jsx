import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

export default function Settings() {
  const { user } = useAuth()
  const [emailTime, setEmailTime] = useState('09:00')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSettings()
  }, [user])

  const fetchSettings = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data) {
        setEmailTime(data.email_time || '09:00')
      }
    } catch (err) {
      console.error('Error fetching settings:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')

    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          email_time: emailTime,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          user_email: user.email,
          user_id: user.id
        }, { onConflict: 'user_id' })

      if (error) throw error
      setMessage('Settings saved successfully!')
    } catch (err) {
      console.error('Error saving settings:', err)
      setMessage('Error saving settings')
    } finally {
      setSaving(false)
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
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>

        <div className="bg-white p-6 rounded shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Email Reminders</h2>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">
              Preferred Email Time
            </label>
            <input
              type="time"
              value={emailTime}
              onChange={(e) => setEmailTime(e.target.value)}
              className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500 mt-1">
              You'll receive a daily email with your goals at this time
            </p>
          </div>

          <div className="mb-4">
            <p className="text-gray-600">
              <span className="font-medium">Your timezone:</span>{' '}
              {Intl.DateTimeFormat().resolvedOptions().timeZone}
            </p>
          </div>

          {message && (
            <div className={`mb-4 p-3 rounded ${
              message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}>
              {message}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  )
}
