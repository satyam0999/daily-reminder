import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex gap-6">
          <Link to="/" className="hover:text-gray-300">Dashboard</Link>
          <Link to="/goals" className="hover:text-gray-300">Goals</Link>
          <Link to="/history" className="hover:text-gray-300">History</Link>
          <Link to="/settings" className="hover:text-gray-300">Settings</Link>
        </div>
        <button 
          onClick={handleLogout}
          className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600"
        >
          Logout
        </button>
      </div>
    </nav>
  )
}
