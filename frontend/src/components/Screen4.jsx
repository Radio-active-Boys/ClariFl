import { useState, useEffect } from 'react'
import { AlertCircle, Loader2, Lightbulb, Heart, ArrowRight, RefreshCw } from 'lucide-react'
import Header from './Header.jsx'

function formatINR(num) {
  if (num === undefined || num === null) return '₹0'
  const n = Number(num)
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
  return `₹${n.toLocaleString('en-IN')}`
}

function verdictConfig(verdictColor) {
  if (verdictColor === 'green') {
    return {
      bg: 'bg-emerald-500',
      light: 'bg-emerald-50 border-emerald-200',
      text: 'text-emerald-700',
      border: 'border-emerald-500',
      emoji: '✅',
      badge: 'bg-emerald-100 text-emerald-700',
    }
  }
  if (verdictColor === 'yellow') {
    return {
      bg: 'bg-amber-500',
      light: 'bg-amber-50 border-amber-200',
      text: 'text-amber-700',
      border: 'border-amber-500',
      emoji: '⚠️',
      badge: 'bg-amber-100 text-amber-700',
    }
  }
  return {
    bg: 'bg-red-500',
    light: 'bg-red-50 border-red-200',
    text: 'text-red-700',
    border: 'border-red-500',
    emoji: '❌',
    badge: 'bg-red-100 text-red-700',
  }
}

export default function Screen4({ financialData, educationData, roadmapData, onBack, userData, onOpenAccount }) {
  const [expenseName, setExpenseName] = useState('')
  const [expenseAmount, setExpenseAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleAnalyze = async () => {
    if (!expenseName.trim()) { setError('Please enter the expense name.'); return }
    if (!expenseAmount || Number(expenseAmount) <= 0) { setError('Please enter a valid expense amount.'); return }
    setError('')
    setLoading(true)
    setResult(null)
    try {
      const response = await fetch('/api/analyze-expense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expenseName,
          expenseAmount,
          financialData,
          roadmapData,
        }),
      })
      const res = await response.json()
      if (!res.success) throw new Error(res.error || 'Analysis failed')
      setResult(res.data)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setExpenseName('')
    setExpenseAmount('')
    setResult(null)
    setError('')
  }

  const vc = result ? verdictConfig(result.verdictColor) : null

  return (
    <div className="min-h-screen bg-gray-50">
      <Header userData={userData} onOpenAccount={onOpenAccount} />

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 font-medium mb-6 transition-colors"
        >
          ← Back to Roadmap
        </button>

        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Expense Impact Analyzer</h1>
          <p className="text-gray-500">See how a major purchase affects {educationData.childName}'s education plan.</p>
        </div>

        {/* Input Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 animate-slide-up">
          <h2 className="text-base font-semibold text-gray-800 mb-4">What are you thinking of buying?</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expense Name</label>
              <input
                type="text"
                value={expenseName}
                onChange={(e) => { setExpenseName(e.target.value); setError('') }}
                placeholder='e.g., "MacBook Pro", "Family vacation", "New car"'
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expense Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-lg">₹</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={expenseAmount}
                  onChange={(e) => { setExpenseAmount(e.target.value.replace(/[^0-9]/g, '')); setError('') }}
                  placeholder="150000"
                  className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white text-gray-900 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>
              {expenseAmount && (
                <p className="mt-1 text-sm text-indigo-600 font-medium">{formatINR(expenseAmount)}</p>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full clarifi-gradient text-white font-semibold py-4 rounded-2xl shadow-lg hover:shadow-xl hover:opacity-95 transition-all duration-200 text-base disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Calculating impact on your child's future...
                </>
              ) : (
                <>Analyze Impact <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </div>
        </div>

        {/* Loading overlay message */}
        {loading && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 text-center animate-pulse mb-6">
            <div className="text-2xl mb-2">🤔</div>
            <p className="text-indigo-700 font-medium">Calculating impact on your child's future...</p>
            <p className="text-indigo-400 text-sm mt-1">Our AI is thinking deeply about your specific situation</p>
          </div>
        )}

        {/* Results */}
        {result && vc && (
          <div className="space-y-6 animate-slide-up">
            {/* Verdict Banner */}
            <div className={`${vc.bg} text-white rounded-2xl p-6 shadow-lg`}>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{vc.emoji}</span>
                  <div>
                    <div className="text-xs text-white/70 font-medium uppercase tracking-wider">Verdict</div>
                    <div className="text-2xl font-extrabold">{result.verdictLabel}</div>
                  </div>
                </div>
                <div className="bg-white/20 backdrop-blur rounded-xl px-4 py-2 text-center">
                  <div className="text-xs text-white/70">Impact Score</div>
                  <div className="text-2xl font-bold">{result.impactScore}<span className="text-sm font-normal">/10</span></div>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                <div className="text-xs text-gray-500 font-medium mb-1">Goal Delay</div>
                <div className="text-base font-bold text-gray-800">{result.goalDelayText || 'None'}</div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                <div className="text-xs text-gray-500 font-medium mb-1">Savings Setback</div>
                <div className="text-base font-bold text-gray-800">{formatINR(result.savingsSetback)}</div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                <div className="text-xs text-gray-500 font-medium mb-1">% Annual Education Savings</div>
                <div className="text-base font-bold text-gray-800">{result.percentOfAnnualSavings}%</div>
              </div>
            </div>

            {/* Immediate Impact */}
            {result.immediateImpact && (
              <div className={`${vc.light} border rounded-2xl p-5`}>
                <div className={`text-xs font-semibold uppercase tracking-wider ${vc.text} mb-2`}>Immediate Impact</div>
                <p className="text-gray-700 text-sm leading-relaxed">{result.immediateImpact}</p>
              </div>
            )}

            {/* Emotional Context */}
            {result.emotionalContext && (
              <div className="bg-purple-50 border border-purple-100 rounded-2xl p-5 flex items-start gap-3">
                <Heart className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <p className="text-purple-800 text-sm leading-relaxed italic">{result.emotionalContext}</p>
              </div>
            )}

            {/* Alternatives */}
            {result.alternatives && result.alternatives.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-bold text-gray-800 mb-4 text-base">Smarter Alternatives</h3>
                <div className="space-y-3">
                  {result.alternatives.map((alt, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <p className="font-semibold text-gray-800 text-sm">{alt.option}</p>
                        {alt.saving > 0 && (
                          <span className="text-emerald-600 font-bold text-sm whitespace-nowrap shrink-0">
                            Save {formatINR(alt.saving)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{alt.tradeoff}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Smarter Approach */}
            {result.smarterApproach && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Smarter Approach</div>
                  <p className="text-blue-800 text-sm leading-relaxed">{result.smarterApproach}</p>
                </div>
              </div>
            )}

            {/* Recommendation */}
            {result.recommendation && (
              <div className="bg-gray-900 rounded-2xl p-5">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Our Recommendation</div>
                <p className="text-white font-semibold text-sm leading-relaxed">{result.recommendation}</p>
              </div>
            )}

            {/* Silver Lining */}
            {result.silverLining && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
                <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1.5">Silver Lining ✨</div>
                <p className="text-emerald-800 text-sm leading-relaxed">{result.silverLining}</p>
              </div>
            )}

            {/* Another Expense Button */}
            <button
              onClick={handleReset}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-indigo-200 text-indigo-600 font-semibold hover:bg-indigo-50 transition-all duration-200"
            >
              <RefreshCw className="w-5 h-5" /> Analyze Another Expense
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
