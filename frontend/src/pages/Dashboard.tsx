import { useQuery } from '@tanstack/react-query'
import { reportsApi } from '@/lib/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/Card'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { TrendingUp, TrendingDown, FileText, Wallet, BarChart3, PieChart } from 'lucide-react'
import { LineChart, Line, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b']

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await reportsApi.getDashboard()
      return response.data
    },
  })

  const chartData = [
    { name: 'فروردین', بدهکار: 4000, بستانکار: 2400 },
    { name: 'اردیبهشت', بدهکار: 3000, بستانکار: 1398 },
    { name: 'خرداد', بدهکار: 2000, بستانکار: 9800 },
    { name: 'تیر', بدهکار: 2780, بستانکار: 3908 },
    { name: 'مرداد', بدهکار: 1890, بستانکار: 4800 },
    { name: 'شهریور', بدهکار: 2390, بستانکار: 3800 },
  ]

  const pieData = [
    { name: 'خرید کالا', value: 400 },
    { name: 'حقوق', value: 300 },
    { name: 'اجاره', value: 200 },
    { name: 'آب و برق', value: 100 },
    { name: 'سایر', value: 150 },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-xl text-white">در حال بارگذاری...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="animate-slide-up">
        <h1 className="text-4xl font-bold text-white mb-2 gradient-text">داشبورد</h1>
        <p className="text-white/90 text-lg">خلاصه وضعیت مالی</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card hover>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 dark:text-gray-500">کل اسناد</p>
                <p className="text-3xl font-bold text-white dark:text-white mt-2">
                  {stats?.total_entries || 0}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl shadow-lg">
                <FileText className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card hover>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 dark:text-gray-500">تعداد حساب‌ها</p>
                <p className="text-3xl font-bold text-white dark:text-white mt-2">
                  {stats?.total_accounts || 0}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                <Wallet className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card hover>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 dark:text-gray-500">کل بدهکار</p>
                <p className="text-2xl font-bold text-emerald-400 mt-2">
                  {formatCurrency(stats?.total_debit || 0)}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-emerald-400 to-green-600 rounded-2xl shadow-lg">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card hover>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 dark:text-gray-500">کل بستانکار</p>
                <p className="text-2xl font-bold text-rose-400 mt-2">
                  {formatCurrency(stats?.total_credit || 0)}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-rose-400 to-red-600 rounded-2xl shadow-lg">
                <TrendingDown className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white dark:text-white">
              <BarChart3 className="w-5 h-5" />
              روند مالی ماهانه
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }} 
                />
                <Legend />
                <Line type="monotone" dataKey="بدهکار" stroke="#10b981" strokeWidth={3} />
                <Line type="monotone" dataKey="بستانکار" stroke="#f43f5e" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white dark:text-white">
              <PieChart className="w-5 h-5" />
              توزیع هزینه‌ها
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RePieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }} 
                />
              </RePieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>آخرین اسناد ثبت شده</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats?.recent_entries?.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                هنوز سندی ثبت نشده است
              </p>
            ) : (
              stats?.recent_entries?.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-800">
                      {entry.entry_number}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {entry.description}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-gray-500">
                      {formatDateTime(entry.date)}
                    </p>
                    <span className="inline-block mt-1 px-2 py-1 text-xs rounded-full bg-primary-100 text-primary-700">
                      {entry.source === 'voice' ? '🎤 صوتی' : 
                       entry.source === 'ocr' ? '📸 فیش' : '✍️ دستی'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
