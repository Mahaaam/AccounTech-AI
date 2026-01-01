import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { ocrApi } from '@/lib/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/Card'
import { Button } from '@/components/Button'
import { Camera, Upload, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatCurrency } from '@/lib/utils'

export default function OCREntry() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [ocrResult, setOcrResult] = useState<any>(null)
  // const queryClient = useQueryClient()

  const uploadMutation = useMutation({
    mutationFn: (file: File) => ocrApi.processReceipt(file),
    onSuccess: (response) => {
      setOcrResult(response.data)
      if (response.data.success) {
        toast.success('فیش با موفقیت پردازش شد')
      } else {
        toast.error('برخی اطلاعات استخراج نشد')
      }
    },
    onError: () => {
      toast.error('خطا در پردازش فیش')
    },
  })

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('لطفاً یک تصویر انتخاب کنید')
      return
    }

    setSelectedFile(file)
    setOcrResult(null)

    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = () => {
    if (!selectedFile) {
      toast.error('لطفاً ابتدا یک تصویر انتخاب کنید')
      return
    }
    uploadMutation.mutate(selectedFile)
  }

  const handleReset = () => {
    setSelectedFile(null)
    setPreview('')
    setOcrResult(null)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">اسکن فیش</h1>
        <p className="text-white/80">تشخیص خودکار اطلاعات از فیش و رسید</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>📸 آپلود تصویر فیش</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {!preview ? (
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Camera className="w-16 h-16 text-gray-400 mb-4" />
                  <p className="mb-2 text-lg font-medium text-gray-700">
                    کلیک کنید یا تصویر را بکشید
                  </p>
                  <p className="text-sm text-gray-500">
                    PNG, JPG, JPEG (حداکثر 10MB)
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileSelect}
                />
              </label>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full max-h-96 object-contain rounded-lg border-2 border-gray-200"
                  />
                </div>

                {!ocrResult ? (
                  <div className="flex gap-3">
                    <Button
                      onClick={handleUpload}
                      disabled={uploadMutation.isPending}
                      variant="primary"
                      size="lg"
                      className="flex-1"
                    >
                      <Upload className="w-5 h-5 ml-2" />
                      {uploadMutation.isPending ? 'در حال پردازش...' : 'پردازش تصویر'}
                    </Button>
                    <Button
                      onClick={handleReset}
                      variant="secondary"
                      size="lg"
                    >
                      انتخاب مجدد
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={handleReset}
                    variant="secondary"
                    size="lg"
                    className="w-full"
                  >
                    تصویر جدید
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {ocrResult && (
        <Card>
          <CardHeader>
            <CardTitle>
              {ocrResult.success ? (
                <span className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-6 h-6" />
                  اطلاعات استخراج شده
                </span>
              ) : (
                <span className="text-orange-600">اطلاعات ناقص</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ocrResult.amount && (
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                  <span className="font-medium text-gray-700">مبلغ:</span>
                  <span className="text-xl font-bold text-green-600">
                    {formatCurrency(ocrResult.amount)}
                  </span>
                </div>
              )}

              {ocrResult.date && (
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                  <span className="font-medium text-gray-700">تاریخ:</span>
                  <span className="text-lg font-medium text-blue-600">
                    {ocrResult.date}
                  </span>
                </div>
              )}

              {ocrResult.vendor && (
                <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                  <span className="font-medium text-gray-700">فروشنده:</span>
                  <span className="text-lg font-medium text-purple-600">
                    {ocrResult.vendor}
                  </span>
                </div>
              )}

              {ocrResult.extracted_text && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">متن کامل:</p>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {ocrResult.extracted_text}
                  </p>
                </div>
              )}

              <Button
                variant="success"
                size="lg"
                className="w-full"
                onClick={() => toast.success('قابلیت ثبت سند به زودی اضافه می‌شود')}
              >
                ثبت به عنوان سند حسابداری
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>💡 نکات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-gray-700">
            <p>• تصویر را واضح و با نور کافی بگیرید</p>
            <p>• از زاویه مستقیم عکس بگیرید</p>
            <p>• متن فیش باید خوانا باشد</p>
            <p>• سیستم خودکار مبلغ، تاریخ و فروشنده را تشخیص می‌دهد</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
