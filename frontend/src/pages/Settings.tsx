import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Lock, LogOut } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

export default function Settings() {
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast.error('رمز عبور جدید و تکرار آن یکسان نیستند')
      return
    }

    if (newPassword.length < 4) {
      toast.error('رمز عبور باید حداقل 4 کاراکتر باشد')
      return
    }

    setLoading(true)

    try {
      const response = await axios.post('/api/auth/change-password', {
        old_password: oldPassword,
        new_password: newPassword,
      })

      if (response.data.success) {
        toast.success('رمز عبور با موفقیت تغییر کرد')
        setOldPassword('')
        setNewPassword('')
        setConfirmPassword('')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'خطا در تغییر رمز عبور')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('authenticated')
    toast.success('با موفقیت خارج شدید')
    navigate('/login')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">تنظیمات</h1>
        <p className="text-white/80">مدیریت تنظیمات سیستم</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-cyan-400" />
              تغییر رمز عبور
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <Input
                type="password"
                label="رمز عبور فعلی"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
              <Input
                type="password"
                label="رمز عبور جدید"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <Input
                type="password"
                label="تکرار رمز عبور جدید"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'در حال تغییر...' : 'تغییر رمز عبور'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LogOut className="w-5 h-5 text-red-400" />
              خروج از سیستم
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 mb-4">
              برای خروج از سیستم و بازگشت به صفحه ورود، دکمه زیر را کلیک کنید.
            </p>
            <Button variant="danger" onClick={handleLogout} className="w-full">
              خروج از حساب کاربری
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
