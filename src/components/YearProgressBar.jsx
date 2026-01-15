import { useState, useEffect } from 'react'

export default function YearProgressBar({ year = 2026 }) {
  const [percentage, setPercentage] = useState(0)

  useEffect(() => {
    const calculateProgress = () => {
      const now = new Date()
      const currentYear = now.getFullYear()
      
      // Only calculate if we're in the target year
      if (currentYear !== year) {
        setPercentage(currentYear > year ? 100 : 0)
        return
      }

      const startOfYear = new Date(year, 0, 1)
      const endOfYear = new Date(year, 11, 31, 23, 59, 59)
      const totalMs = endOfYear - startOfYear
      const elapsedMs = now - startOfYear
      
      const percent = (elapsedMs / totalMs) * 100
      setPercentage(Math.min(100, Math.max(0, percent)).toFixed(2))
    }

    calculateProgress()
    // Update every hour
    const interval = setInterval(calculateProgress, 3600000)
    
    return () => clearInterval(interval)
  }, [year])

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-700">Year {year} Progress</h3>
        <span className="text-sm font-bold text-blue-600">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
