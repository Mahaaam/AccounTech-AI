import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Lock } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function Login() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await axios.post('/api/auth/login', { password })
      if (response.data.success) {
        localStorage.setItem('authenticated', 'true')
        toast.success('ورود موفقیت‌آمیز')
        navigate('/')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'رمز عبور اشتباه است')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-black"></div>
      
      <div className="relative z-10 w-full max-w-md p-8">
        <div className="glass rounded-2xl p-8 animate-scale-in">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center shadow-xl shadow-cyan-400/50 mb-4">
              <span className="text-white text-3xl font-bold">AI</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
              AccounTech AI
            </h1>
            <p className="text-gray-400">حسابداری هوشمند</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                type="password"
                label="رمز عبور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="رمز عبور خود را وارد کنید"
                required
                className="text-center"
              />
            </div>

            <Button
              type="submit"
              className="w-full flex items-center justify-center gap-2"
              disabled={loading}
            >
              <Lock className="w-5 h-5" />
              {loading ? 'در حال ورود...' : 'ورود به سیستم'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              برای تغییر رمز عبور، از منوی تنظیمات استفاده کنید
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
