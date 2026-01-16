import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const APP_URL = Deno.env.get('APP_URL') || 'http://localhost:5173'

async function sendEmailForUser(supabase: any, userId: string, userEmail: string) {
  try {
    // Get active goals for this user
    const { data: goals, error: goalsError } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: true })

    if (goalsError) {
      console.error('Error fetching goals:', goalsError)
      return
    }

    console.log(`User ${userEmail} has ${goals?.length || 0} active goals`)

    const dailyGoals = goals?.filter((g: any) => g.goal_type === 'daily') || []
    const weeklyGoals = goals?.filter((g: any) => g.goal_type === 'weekly') || []
    const monthlyGoals = goals?.filter((g: any) => g.goal_type === 'monthly') || []

    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    // Build email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          h1 { color: #1f2937; }
          h2 { color: #374151; margin-top: 20px; }
          .daily { color: #3b82f6; }
          .weekly { color: #22c55e; }
          .monthly { color: #a855f7; }
          ul { padding-left: 20px; }
          li { margin: 8px 0; }
          .cta { display: inline-block; margin-top: 20px; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Good morning! 🌟</h1>
          <p>Here are your goals for <strong>${today}</strong></p>
          
          ${dailyGoals.length > 0 ? `
            <h2 class="daily">Daily Goals</h2>
            <ul>
              ${dailyGoals.map((g: any) => `<li>${g.goal_text}</li>`).join('')}
            </ul>
          ` : ''}
          
          ${weeklyGoals.length > 0 ? `
            <h2 class="weekly">Weekly Goals</h2>
            <ul>
              ${weeklyGoals.map((g: any) => `<li>${g.goal_text}</li>`).join('')}
            </ul>
          ` : ''}
          
          ${monthlyGoals.length > 0 ? `
            <h2 class="monthly">Monthly Goals</h2>
            <ul>
              ${monthlyGoals.map((g: any) => `<li>${g.goal_text}</li>`).join('')}
            </ul>
          ` : ''}
          
          <a href="${APP_URL}" class="cta">Open Dashboard</a>
          
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            Have a productive day!
          </p>
        </div>
      </body>
      </html>
    `

    console.log(`Sending email to ${userEmail}...`)

    // Send email via SendGrid
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: userEmail }]
        }],
        from: { email: 'satyamsingh9541@outlook.com', name: 'Goal Tracker' },
        subject: `Your Goals for ${today}`,
        content: [{
          type: 'text/html',
          value: emailHtml
        }]
      })
    })

    const responseText = await response.text()
    console.log(`SendGrid response for ${userEmail}: status=${response.status}, body=${responseText || '(empty)'}`)
    
    if (!response.ok) {
      console.error('SendGrid error:', response.status, responseText)
    } else {
      console.log(`Email queued for ${userEmail}`)
    }
  } catch (error) {
    console.error(`Error sending email to ${userEmail}:`, error)
  }
}

serve(async (req) => {
  try {
    console.log('Starting daily email function...')
    console.log('SENDGRID_API_KEY exists:', !!SENDGRID_API_KEY)
    console.log('SUPABASE_URL:', SUPABASE_URL)
    
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    // Get all user settings
    const { data: settings, error: settingsError } = await supabase
      .from('user_settings')
      .select('*')

    if (settingsError) {
      console.error('Error fetching user_settings:', settingsError)
      throw settingsError
    }

    console.log(`Found ${settings?.length || 0} user settings`)

    if (!settings || settings.length === 0) {
      console.log('No user settings found, checking for users with goals...')
      
      // Fallback: get all users who have goals
      const { data: usersWithGoals, error: usersError } = await supabase
        .from('goals')
        .select('user_id')
        .eq('is_active', true)
      
      if (usersError) {
        console.error('Error fetching users with goals:', usersError)
        throw usersError
      }

      const uniqueUserIds = [...new Set(usersWithGoals?.map((g: any) => g.user_id) || [])]
      console.log(`Found ${uniqueUserIds.length} users with active goals`)

      // Get email addresses from auth.users
      for (const userId of uniqueUserIds) {
        const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId as string)
        
        if (authError || !authUser.user) {
          console.error(`Error fetching auth user ${userId}:`, authError)
          continue
        }

        console.log(`Processing user ${authUser.user.email}`)
        await sendEmailForUser(supabase, userId as string, authUser.user.email!)
      }
    } else {
      for (const userSettings of settings) {
        console.log(`Processing user settings for ${userSettings.user_email}`)
        await sendEmailForUser(supabase, userSettings.user_id, userSettings.user_email)
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error: any) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
