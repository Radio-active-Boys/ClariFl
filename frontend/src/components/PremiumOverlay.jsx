import { Lock } from 'lucide-react'

export default function PremiumOverlay({ isPaid, onPaymentSuccess, title, children }) {
  if (isPaid) return (
    <>
      {title}
      {children}
    </>
  )

  return (
    <div className="animate-slide-up">
      {/* Heading stays visible */}
      {title}

      {/* Blurred content with overlay */}
      <div className="relative">
        <div className="blur-md select-none pointer-events-none">
          {children}
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="bg-white/80 backdrop-blur-sm border border-indigo-200 rounded-2xl shadow-xl px-8 py-6 text-center max-w-xs">
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-3">
              <Lock className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Premium Feature</h3>
            <p className="text-sm text-gray-500 mb-4">Unlock detailed strategies and action steps tailored for your plan.</p>
            <button
              onClick={onPaymentSuccess}
              className="w-full clarifi-gradient text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl hover:opacity-95 transition-all duration-200 text-sm flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" /> Unlock Premium — ₹99
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
