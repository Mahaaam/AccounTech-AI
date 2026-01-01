import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { voiceApi } from '@/lib/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/Card'
import { Button } from '@/components/Button'
import { Mic, MicOff, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function VoiceEntry() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [recognition, setRecognition] = useState<any>(null)
  const queryClient = useQueryClient()

  const processMutation = useMutation({
    mutationFn: (text: string) => voiceApi.process(text),
    onSuccess: (response) => {
      if (response.data.success) {
        toast.success(response.data.message)
        queryClient.invalidateQueries({ queryKey: ['journal'] })
        queryClient.invalidateQueries({ queryKey: ['dashboard'] })
        setTranscript('')
      } else {
        toast.error(response.data.message)
      }
    },
    onError: () => {
      toast.error('خطا در پردازش دستور')
    },
  })

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast.error('مرورگر شما از تشخیص گفتار پشتیبانی نمی‌کند')
      return
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition
    const recognitionInstance = new SpeechRecognition()
    
    recognitionInstance.lang = 'fa-IR'
    recognitionInstance.continuous = false
    recognitionInstance.interimResults = false

    recognitionInstance.onstart = () => {
      setIsListening(true)
      toast.success('در حال گوش دادن...')
    }

    recognitionInstance.onresult = (event: any) => {
      const text = event.results[0][0].transcript
      setTranscript(text)
      setIsListening(false)
    }

    recognitionInstance.onerror = () => {
      setIsListening(false)
      toast.error('خطا در تشخیص صدا')
    }

    recognitionInstance.onend = () => {
      setIsListening(false)
    }

    setRecognition(recognitionInstance)
    recognitionInstance.start()
  }

  const stopListening = () => {
    if (recognition) {
      recognition.stop()
      setIsListening(false)
    }
  }

  const handleSubmit = () => {
    if (!transcript.trim()) {
      toast.error('لطفاً ابتدا دستور صوتی را ضبط کنید')
      return
    }
    processMutation.mutate(transcript)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">ثبت صوتی</h1>
        <p className="text-white/80">ثبت تراکنش با دستور صوتی</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>🎤 دستور صوتی</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <button
                onClick={isListening ? stopListening : startListening}
                disabled={processMutation.isPending}
                className={`
                  w-32 h-32 rounded-full flex items-center justify-center
                  transition-all transform hover:scale-105
                  ${isListening 
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                    : 'bg-primary-600 hover:bg-primary-700'
                  }
                  shadow-2xl
                `}
              >
                {isListening ? (
                  <MicOff className="w-16 h-16 text-white" />
                ) : (
                  <Mic className="w-16 h-16 text-white" />
                )}
              </button>
            </div>

            <div>
              <p className="text-lg font-medium text-gray-700">
                {isListening ? 'در حال گوش دادن...' : 'برای شروع ضبط کلیک کنید'}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                مثال: "پرداخت پانصد هزار تومان به علی‌آقا بابت خرید کالا"
              </p>
            </div>

            {transcript && (
              <div className="bg-gray-50 p-4 rounded-lg text-right">
                <p className="text-sm text-gray-600 mb-2">متن دریافت شده:</p>
                <p className="text-lg text-gray-800 font-medium">{transcript}</p>
              </div>
            )}

            {transcript && (
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={handleSubmit}
                  disabled={processMutation.isPending}
                  variant="success"
                  size="lg"
                >
                  <CheckCircle className="w-5 h-5 ml-2" />
                  {processMutation.isPending ? 'در حال پردازش...' : 'تأیید و ثبت'}
                </Button>
                <Button
                  onClick={() => setTranscript('')}
                  variant="secondary"
                  size="lg"
                >
                  <XCircle className="w-5 h-5 ml-2" />
                  لغو
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>💡 راهنما</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-gray-700">
            <p>• برای پرداخت: "پرداخت [مبلغ] به [نام] بابت [توضیحات]"</p>
            <p>• برای دریافت: "دریافت [مبلغ] از [نام] بابت [توضیحات]"</p>
            <p>• مبلغ را به صورت عددی یا حروفی بگویید</p>
            <p>• سیستم خودکار حساب‌های مناسب را انتخاب می‌کند</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
