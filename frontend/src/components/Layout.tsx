import { Outlet, Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Wallet, 
  BookOpen, 
  BarChart3, 
  Mic, 
  Camera,
  Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'
import ParticlesBackground from './ParticlesBackground'

const navigation = [
  { name: 'داشبورد', href: '/', icon: LayoutDashboard },
  { name: 'حساب‌ها', href: '/accounts', icon: Wallet },
  { name: 'دفتر روزنامه', href: '/journal', icon: BookOpen },
  { name: 'گزارش‌ها', href: '/reports', icon: BarChart3 },
  { name: 'ثبت صوتی', href: '/voice', icon: Mic },
  { name: 'اسکن فیش', href: '/ocr', icon: Camera },
  { name: 'تنظیمات', href: '/settings', icon: Settings },
]

export default function Layout() {
  const location = useLocation()

  return (
    <div className="min-h-screen flex relative">
      <ParticlesBackground />
      
      <aside className="fixed right-0 top-0 h-screen w-64 glass border-l-2 border-cyan-400 animate-slide-up z-50">
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center shadow-xl shadow-cyan-400/50 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent animate-pulse"></div>
              <span className="text-white text-2xl font-bold relative z-10">AI</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">AccounTech AI</h1>
              <p className="text-xs text-cyan-400/70">حسابداری هوشمند</p>
            </div>
          </div>
          
          <nav className="px-3 py-4 space-y-2">
            {navigation.map((item, index) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300',
                    'animate-fade-in',
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/50 scale-105'
                      : 'text-gray-300 hover:text-cyan-400 hover:bg-cyan-400/10',
                  )}
                >
                  <item.icon className={cn(
                    "w-5 h-5 transition-transform",
                    isActive && "animate-float text-cyan-400"
                  )} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>

      <main className="flex-1 p-8 mr-64 overflow-auto relative z-10">
        <div className="animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
