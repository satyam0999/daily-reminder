import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const APP_URL = Deno.env.get('APP_URL') || 'http://localhost:5173'

serve(async (_req) => {
  try {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    // Get all user settings
    const { data: settings, error: settingsError } = await supabase
      .from('user_settings')
      .select('*')

    if (settingsError) throw settingsError

    for (const userSettings of settings || []) {
      // Get active goals for this user
      const { data: goals, error: goalsError } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userSettings.user_id)
        .eq('is_active', true)
        .order('created_at', { ascending: true })

      if (goalsError) {
        console.error('Error fetching goals:', goalsError)
        continue
      }

      const dailyGoals = goals?.filter((g: { goal_type: string }) => g.goal_type === 'daily') || []
      const weeklyGoals = goals?.filter((g: { goal_type: string }) => g.goal_type === 'weekly') || []
      const monthlyGoals = goals?.filter((g: { goal_type: string }) => g.goal_type === 'monthly') || []

      const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })

      // Build evening reflection email HTML
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
            .reflection-box { background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .question { font-size: 18px; color: #1f2937; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Good evening! 🌙</h1>
            
            <div class="reflection-box">
              <p class="question">What did you get done today?</p>
              <p>Take a moment to reflect on your progress and mark your completed goals.</p>
            </div>
            
            <p>Here are the goals you needed to complete for <strong>${today}</strong>:</p>
            
            ${dailyGoals.length > 0 ? `
              <h2 class="daily">Daily Goals</h2>
              <ul>
                ${dailyGoals.map((g: { goal_text: string }) => `<li>☐ ${g.goal_text}</li>`).join('')}
              </ul>
            ` : ''}
            
            ${weeklyGoals.length > 0 ? `
              <h2 class="weekly">Weekly Goals</h2>
              <ul>
                ${weeklyGoals.map((g: { goal_text: string }) => `<li>☐ ${g.goal_text}</li>`).join('')}
              </ul>
            ` : ''}
            
            ${monthlyGoals.length > 0 ? `
              <h2 class="monthly">Monthly Goals</h2>
              <ul>
                ${monthlyGoals.map((g: { goal_text: string }) => `<li>☐ ${g.goal_text}</li>`).join('')}
              </ul>
            ` : ''}
            
            <a href="${APP_URL}" class="cta">Update Your Progress</a>
            
            <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
              Remember: Progress, not perfection. Every step counts! 💪
            </p>
          </div>
        </body>
        </html>
      `

      // Send email via SendGrid
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SENDGRID_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: userSettings.user_email }]
          }],
          from: { email: 'satyamsingh9541@outlook.com', name: 'Goal Tracker' },
          subject: `Evening Reflection - What did you accomplish today?`,
          content: [{
            type: 'text/html',
            value: emailHtml
          }]
        })
      })

      const responseText = await response.text()
      console.log(`SendGrid response for ${userSettings.user_email}: status=${response.status}, body=${responseText || '(empty)'}`)
      
      if (!response.ok) {
        console.error('SendGrid error:', response.status, responseText)
      } else {
        console.log(`Evening email queued for ${userSettings.user_email}`)
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
