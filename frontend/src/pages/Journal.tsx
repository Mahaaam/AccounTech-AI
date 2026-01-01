import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { journalApi } from '@/lib/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/Card'
import { Button } from '@/components/Button'
import Modal from '@/components/Modal'
import { Plus, Eye } from 'lucide-react'
import { formatCurrency, formatDateTime } from '@/lib/utils'
// import toast from 'react-hot-toast'

export default function Journal() {
  const [selectedEntry, setSelectedEntry] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)

  const { data: entries, isLoading } = useQuery({
    queryKey: ['journal'],
    queryFn: async () => {
      const response = await journalApi.getAll()
      return response.data
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-xl text-gray-600">در حال بارگذاری...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">دفتر روزنامه</h1>
          <p className="text-white/80">مشاهده و مدیریت اسناد حسابداری</p>
        </div>
        <Button onClick={() => setShowModal(true)} size="lg" className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          سند جدید
        </Button>
      </div>

      <Card>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-right py-3 px-4 font-medium text-gray-700">شماره سند</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">تاریخ</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">شرح</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">منبع</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {entries?.map((entry: any) => (
                  <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-800">
                      {entry.entry_number}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {formatDateTime(entry.date)}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {entry.description}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`
                        inline-block px-2 py-1 text-xs rounded-full
                        ${entry.source === 'voice' ? 'bg-blue-100 text-blue-700' :
                          entry.source === 'ocr' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'}
                      `}>
                        {entry.source === 'voice' ? '🎤 صوتی' :
                         entry.source === 'ocr' ? '📸 فیش' : '✍️ دستی'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedEntry(entry)}
                      >
                        <Eye className="w-4 h-4 ml-1" />
                        مشاهده
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {entries?.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                هنوز سندی ثبت نشده است
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedEntry && (
        <Card>
          <CardHeader>
            <CardTitle>جزئیات سند {selectedEntry.entry_number}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">تاریخ:</p>
                  <p className="font-medium">{formatDateTime(selectedEntry.date)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">منبع:</p>
                  <p className="font-medium">{selectedEntry.source}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">شرح:</p>
                <p className="font-medium">{selectedEntry.description}</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-right py-2 px-3 text-sm font-medium text-gray-700">حساب</th>
                      <th className="text-right py-2 px-3 text-sm font-medium text-gray-700">بدهکار</th>
                      <th className="text-right py-2 px-3 text-sm font-medium text-gray-700">بستانکار</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedEntry.transactions?.map((trans: any) => (
                      <tr key={trans.id} className="border-b border-gray-100">
                        <td className="py-2 px-3 text-sm">{trans.description || '-'}</td>
                        <td className="py-2 px-3 text-sm text-green-600">
                          {trans.transaction_type === 'بدهکار' ? formatCurrency(trans.amount) : '-'}
                        </td>
                        <td className="py-2 px-3 text-sm text-red-600">
                          {trans.transaction_type === 'بستانکار' ? formatCurrency(trans.amount) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Button
                variant="secondary"
                onClick={() => setSelectedEntry(null)}
                className="w-full"
              >
                بستن
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="سند جدید"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-gray-300">
            برای ثبت سند جدید، می‌توانید از روش‌های زیر استفاده کنید:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={() => {
                setShowModal(false)
                window.location.href = '/voice'
              }}
              className="flex items-center justify-center gap-2 py-6"
            >
              <span className="text-2xl">🎤</span>
              <div className="text-right">
                <div className="font-bold">ثبت صوتی</div>
                <div className="text-sm opacity-80">با استفاده از صدا</div>
              </div>
            </Button>
            <Button
              onClick={() => {
                setShowModal(false)
                window.location.href = '/ocr'
              }}
              className="flex items-center justify-center gap-2 py-6"
            >
              <span className="text-2xl">📸</span>
              <div className="text-right">
                <div className="font-bold">اسکن فیش</div>
                <div className="text-sm opacity-80">با عکس گرفتن از رسید</div>
              </div>
            </Button>
          </div>
          <div className="pt-4 border-t border-white/10">
            <p className="text-sm text-gray-400 text-center">
              یا می‌توانید به صورت دستی از طریق API سند ایجاد کنید
            </p>
          </div>
        </div>
      </Modal>
    </div>
  )
}
