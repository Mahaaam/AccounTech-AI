import { useQuery } from '@tanstack/react-query'
import { reportsApi } from '@/lib/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/Card'
import { formatCurrency } from '@/lib/utils'

export default function Reports() {
  const { data: trialBalance, isLoading } = useQuery({
    queryKey: ['trial-balance'],
    queryFn: async () => {
      const response = await reportsApi.getTrialBalance()
      return response.data
    },
  })

  if (isLoading) {
    return <div className="flex items-center justify-center h-96">
      <div className="text-xl text-gray-600">در حال بارگذاری...</div>
    </div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">گزارش‌ها</h1>
        <p className="text-white/80">تراز آزمایشی و گزارشات مالی</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>تراز آزمایشی</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-right py-3 px-4 font-bold text-gray-700">کد</th>
                  <th className="text-right py-3 px-4 font-bold text-gray-700">نام حساب</th>
                  <th className="text-right py-3 px-4 font-bold text-gray-700">بدهکار</th>
                  <th className="text-right py-3 px-4 font-bold text-gray-700">بستانکار</th>
                  <th className="text-right py-3 px-4 font-bold text-gray-700">مانده</th>
                </tr>
              </thead>
              <tbody>
                {trialBalance?.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-600">{item.account_code}</td>
                    <td className="py-3 px-4 font-medium">{item.account_name}</td>
                    <td className="py-3 px-4 text-green-600">{formatCurrency(item.debit)}</td>
                    <td className="py-3 px-4 text-red-600">{formatCurrency(item.credit)}</td>
                    <td className="py-3 px-4 font-bold">{formatCurrency(item.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
