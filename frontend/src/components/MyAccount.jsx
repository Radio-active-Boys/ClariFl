import { X, CheckCircle, Mail, Crown, Zap, RefreshCw } from 'lucide-react'
import { useState } from 'react'

export default function MyAccount({ userData, onClose, onUpgrade, onRefresh }) {
  const [refreshing, setRefreshing] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendStatus, setResendStatus] = useState('')

  const handleRefresh = async () => {
    setRefreshing(true)
    await onRefresh()
    setRefreshing(false)
  }

  const handleResend = async () => {
    setResending(true)
    setResendStatus('')
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: userData.name, email: userData.email }),
      })
      const result = await response.json()
      if (result.success) {
        setResendStatus('sent')
        setTimeout(() => setResendStatus(''), 5000)
      } else {
        setResendStatus('error')
      }
    } catch (err) {
      setResendStatus('error')
    } finally {
      setResending(false)
    }
  }

  if (!userData) return null

  const isPremium = userData.payment === true
  const isVerified = userData.verified

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-slide-up">
        {/* Header */}
        <div className="clarifi-gradient p-6 rounded-t-2xl">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold text-white border-2 border-white/30">
              {userData.name[0].toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{userData.name}</h2>
              <p className="text-white/70 text-sm">{userData.email}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Tier Badge */}
          <div className={`rounded-xl p-4 flex items-center justify-between
            ${isPremium ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50 border border-gray-200'}`}>
            <div className="flex items-center gap-3">
              {isPremium
                ? <Crown className="w-5 h-5 text-amber-500" />
                : <Zap className="w-5 h-5 text-gray-400" />}
              <div>
                <p className={`font-bold text-sm ${isPremium ? 'text-amber-700' : 'text-gray-700'}`}>
                  {isPremium ? 'Premium Plan' : 'Free Plan'}
                </p>
                <p className="text-xs text-gray-500">
                  {isPremium ? 'All features unlocked' : 'Basic access'}
                </p>
              </div>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full
              ${isPremium ? 'bg-amber-100 text-amber-700' : 'bg-gray-200 text-gray-600'}`}>
              {isPremium ? 'PREMIUM' : 'FREE'}
            </span>
          </div>

          {/* Email Verification Status */}
          <div className={`rounded-xl p-4 flex items-start gap-3
            ${isVerified ? 'bg-emerald-50 border border-emerald-200' : 'bg-yellow-50 border border-yellow-200'}`}>
            {isVerified
              ? <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
              : <Mail className="w-5 h-5 text-yellow-500 mt-0.5 shrink-0" />}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${isVerified ? 'text-emerald-700' : 'text-yellow-700'}`}>
                {isVerified ? 'Email Verified' : 'Email Not Verified'}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {isVerified
                  ? 'Your account is fully verified.'
                  : 'Check your inbox and click the verification link we sent you.'}
              </p>
              {!isVerified && (
                <div className="mt-3 flex flex-col gap-2">
                  <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="text-xs font-semibold text-yellow-700 flex items-center gap-1.5 hover:bg-yellow-100/50 p-1 -ml-1 rounded transition"
                  >
                    <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
                    {refreshing ? 'Checking...' : "I've verified, refresh status"}
                  </button>
                  
                  <button
                    onClick={handleResend}
                    disabled={resending || resendStatus === 'sent'}
                    className={`text-xs font-semibold flex items-center gap-1.5 p-1 -ml-1 rounded transition
                      ${resendStatus === 'sent' ? 'text-emerald-600' : 
                        resendStatus === 'error' ? 'text-red-600' : 'text-indigo-600 hover:bg-indigo-50'}`}
                  >
                    <Mail className="w-3 h-3" />
                    {resending ? 'Sending...' : 
                     resendStatus === 'sent' ? 'Email Sent! Check again' :
                     resendStatus === 'error' ? 'Failed to resend. Try later' : 'Resend verification email'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Upgrade Button (only for free users) */}
          {!isPremium && (
            <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-cyan-50 border border-indigo-100 p-4">
              <div className="flex items-start gap-2 mb-3">
                <Crown className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-indigo-700">Upgrade to Premium</p>
                  <ul className="text-xs text-gray-500 mt-1 space-y-0.5">
                    <li>✓ Unlimited roadmap regenerations</li>
                    <li>✓ Priority AI analysis</li>
                    <li>✓ Detailed investment reports</li>
                    <li>✓ Multi-child planning</li>
                  </ul>
                </div>
              </div>
              <button
                onClick={onUpgrade}
                className="w-full clarifi-gradient text-white font-bold py-2.5 rounded-xl text-sm shadow hover:opacity-90 transition"
              >
                Upgrade Now →
              </button>
            </div>
          )}

          {isPremium && (
            <div className="text-center text-xs text-gray-400 py-1">
              Thank you for supporting ClariFi!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
