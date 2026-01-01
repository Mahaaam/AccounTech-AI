import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { accountsApi, Account } from '@/lib/api'
import { Card, CardContent } from '@/components/Card'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import Modal from '@/components/Modal'
import { Plus, Edit, Trash2, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatCurrency } from '@/lib/utils'

export default function Accounts() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    account_type: 'دارایی‌ها',
    parent_id: null as number | null,
  })
  const queryClient = useQueryClient()

  const { data: accounts, isLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const response = await accountsApi.getAll()
      return response.data
    },
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => accountsApi.create(data),
    onSuccess: () => {
      toast.success('حساب با موفقیت ایجاد شد')
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      handleCloseModal()
    },
    onError: () => {
      toast.error('خطا در ایجاد حساب')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => accountsApi.update(id, data),
    onSuccess: () => {
      toast.success('حساب با موفقیت ویرایش شد')
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      handleCloseModal()
    },
    onError: () => {
      toast.error('خطا در ویرایش حساب')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => accountsApi.delete(id),
    onSuccess: () => {
      toast.success('حساب با موفقیت حذف شد')
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    },
    onError: () => {
      toast.error('خطا در حذف حساب')
    },
  })

  const filteredAccounts = accounts?.filter((account) =>
    account.name.includes(searchTerm) || account.code.includes(searchTerm)
  )

  const handleDelete = (id: number) => {
    if (confirm('آیا از حذف این حساب اطمینان دارید؟')) {
      deleteMutation.mutate(id)
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingAccount(null)
    setFormData({
      name: '',
      account_type: 'دارایی‌ها',
      parent_id: null,
    })
  }

  const handleOpenModal = (account?: Account) => {
    if (account) {
      setEditingAccount(account)
      setFormData({
        name: account.name,
        account_type: account.account_type,
        parent_id: null,
      })
    }
    setShowModal(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingAccount) {
      updateMutation.mutate({ id: editingAccount.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const accountTypes = {
    'دارایی‌ها': 'bg-green-100 text-green-700',
    'بدهی‌ها': 'bg-red-100 text-red-700',
    'حقوق صاحبان سهام': 'bg-blue-100 text-blue-700',
    'درآمدها': 'bg-purple-100 text-purple-700',
    'هزینه‌ها': 'bg-orange-100 text-orange-700',
    'بدهکاران': 'bg-cyan-100 text-cyan-700',
    'بستانکاران': 'bg-pink-100 text-pink-700',
  }

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
          <h1 className="text-3xl font-bold text-white mb-2">حساب‌ها</h1>
          <p className="text-white/80">مدیریت حساب‌های حسابداری</p>
        </div>
        <Button onClick={() => handleOpenModal()} size="lg" className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          حساب جدید
        </Button>
      </div>

      <Card>
        <CardContent>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="جستجو بر اساس نام یا کد حساب..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {filteredAccounts?.filter(acc => !acc.parent_id).map((account) => {
          const isMainCategory = account.code.length === 1
          return (
          <div key={account.id}>
            <Card hover>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <p className="text-sm text-cyan-400 font-mono w-16">{account.code}</p>
                    <h3 className="text-base font-bold text-white">
                      {account.name}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${accountTypes[account.account_type as keyof typeof accountTypes]}`}>
                      {account.account_type}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-left">
                      <p className="text-xs text-gray-400">موجودی</p>
                      <p className="text-base font-bold text-cyan-400">
                        {formatCurrency(account.balance)}
                      </p>
                    </div>
                    {!isMainCategory && (
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleOpenModal(account)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(account.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Sub-accounts */}
            {filteredAccounts?.filter(sub => sub.parent_id === account.id).length > 0 && (
              <div className="mr-8 mt-1 space-y-1">
                {filteredAccounts?.filter(sub => sub.parent_id === account.id).map((subAccount) => (
                  <Card key={subAccount.id} className="bg-gray-800/30">
                    <CardContent className="py-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-gray-500 text-sm">└─</span>
                          <p className="text-xs text-cyan-400 font-mono w-16">{subAccount.code}</p>
                          <h4 className="text-sm font-medium text-gray-300">
                            {subAccount.name}
                          </h4>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="text-sm font-bold text-cyan-400 min-w-[100px] text-left">
                            {formatCurrency(subAccount.balance)}
                          </p>
                          <div className="flex gap-1">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleOpenModal(subAccount)}
                              className="p-2"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDelete(subAccount.id)}
                              className="p-2"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )})}
      </div>

      {filteredAccounts?.length === 0 && (
        <Card>
          <CardContent>
            <p className="text-center text-gray-500 py-8">
              حسابی یافت نشد
            </p>
          </CardContent>
        </Card>
      )}

      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingAccount ? 'ویرایش حساب' : 'حساب جدید'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3 mb-4">
            <p className="text-sm text-cyan-400">
              💡 کد حساب به صورت خودکار توسط سیستم ایجاد می‌شود
            </p>
          </div>
          <Input
            label="نام حساب"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="مثال: حساب بانک ملی، هزینه اجاره دفتر"
          />
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              نوع حساب
            </label>
            <select
              value={formData.account_type}
              onChange={(e) => setFormData({ ...formData, account_type: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-400 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <optgroup label="حساب‌های ترازنامه" className="bg-gray-900">
                <option value="دارایی‌ها" className="bg-gray-800 py-2">💰 دارایی‌ها (Assets)</option>
                <option value="بدهی‌ها" className="bg-gray-800 py-2">📊 بدهی‌ها (Liabilities)</option>
                <option value="حقوق صاحبان سهام" className="bg-gray-800 py-2">👥 حقوق صاحبان سهام (Equity)</option>
              </optgroup>
              <optgroup label="حساب‌های سود و زیان" className="bg-gray-900">
                <option value="درآمدها" className="bg-gray-800 py-2">📈 درآمدها (Revenue)</option>
                <option value="هزینه‌ها" className="bg-gray-800 py-2">📉 هزینه‌ها (Expenses)</option>
              </optgroup>
              <optgroup label="حساب‌های اشخاص" className="bg-gray-900">
                <option value="بدهکاران" className="bg-gray-800 py-2">👤 بدهکاران (Debtors/Receivables)</option>
                <option value="بستانکاران" className="bg-gray-800 py-2">🏢 بستانکاران (Creditors/Payables)</option>
              </optgroup>
            </select>
            <p className="mt-2 text-xs text-gray-400">
              {formData.account_type === 'دارایی‌ها' && '• منابعی که شرکت مالک آن است (نقد، موجودی کالا، املاک)'}
              {formData.account_type === 'بدهی‌ها' && '• تعهدات مالی شرکت به دیگران (وام، حساب‌های پرداختنی)'}
              {formData.account_type === 'حقوق صاحبان سهام' && '• سرمایه و سود انباشته متعلق به صاحبان'}
              {formData.account_type === 'درآمدها' && '• درآمد حاصل از فروش کالا یا خدمات'}
              {formData.account_type === 'هزینه‌ها' && '• هزینه‌های عملیاتی و اداری شرکت'}
              {formData.account_type === 'بدهکاران' && '• مشتریان و اشخاصی که به شرکت بدهکار هستند'}
              {formData.account_type === 'بستانکاران' && '• تامین‌کنندگان و اشخاصی که شرکت به آنها بدهکار است'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              حساب سرفصل (اختیاری)
            </label>
            <select
              value={formData.parent_id || ''}
              onChange={(e) => setFormData({ ...formData, parent_id: e.target.value ? parseInt(e.target.value) : null })}
              className="w-full px-4 py-3 rounded-lg border border-gray-400 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="">بدون سرفصل (حساب اصلی)</option>
              {accounts?.filter(acc => acc.account_type === formData.account_type && acc.id !== editingAccount?.id).map(acc => (
                <option key={acc.id} value={acc.id} className="bg-gray-800">
                  {acc.code} - {acc.name}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-gray-400">
              • اگر این حساب زیرمجموعه حساب دیگری است، سرفصل آن را انتخاب کنید
            </p>
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              {editingAccount ? 'ذخیره تغییرات' : 'ایجاد حساب'}
            </Button>
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              انصراف
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
