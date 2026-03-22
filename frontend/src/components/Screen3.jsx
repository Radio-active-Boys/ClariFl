import { useState, useEffect } from 'react'
import {
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  Star,
  Lightbulb,
  Shield,
  Target,
  BookOpen,
  PiggyBank,
} from 'lucide-react'
import Header from './Header.jsx'
import PremiumOverlay from './PremiumOverlay.jsx'

function formatINR(num) {
  if (num === undefined || num === null) return '₹0'
  const n = Number(num)
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
  return `₹${n.toLocaleString('en-IN')}`
}

function HealthGauge({ score, label }) {
  const radius = 54
  const circ = 2 * Math.PI * radius
  const pct = Math.min(Math.max(score, 0), 100)
  const dash = (pct / 100) * circ
  const color =
    score >= 75 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444'
  const bgColor =
    score >= 75 ? 'text-emerald-300' : score >= 50 ? 'text-amber-300' : 'text-red-300'

  return (
    <div className="flex flex-col items-center">
      <svg width="140" height="140" className="drop-shadow-lg">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="10" />
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          strokeDashoffset={circ / 4}
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
        <text x="70" y="65" textAnchor="middle" fill="white" fontSize="28" fontWeight="bold">
          {score}
        </text>
        <text x="70" y="84" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="11">
          / 100
        </text>
      </svg>
      <span className={`text-sm font-semibold mt-1 ${bgColor}`}>{label}</span>
    </div>
  )
}

function MilestoneIcon({ type }) {
  const base = 'w-4 h-4'
  if (type === 'savings') return <PiggyBank className={`${base} text-blue-500`} />
  if (type === 'investment') return <TrendingUp className={`${base} text-purple-500`} />
  if (type === 'education') return <BookOpen className={`${base} text-green-500`} />
  if (type === 'critical') return <AlertTriangle className={`${base} text-red-500`} />
  return <Star className={`${base} text-gray-400`} />
}

function milestoneColor(type) {
  if (type === 'savings') return 'bg-blue-500'
  if (type === 'investment') return 'bg-purple-500'
  if (type === 'education') return 'bg-green-500'
  if (type === 'critical') return 'bg-red-500'
  return 'bg-gray-400'
}



export default function Screen3({ financialData, educationData, roadmapData, onGoToExpenseAnalyzer, onEditPlan, userData, onOpenAccount, isPaid, onPaymentSuccess }) {
  const [feedbackGiven, setFeedbackGiven] = useState(null)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  if (!roadmapData) return null

  const d = roadmapData
  const mb = d.monthlyBreakdown || {}
  const ec = d.educationCosts || {}
  const proj = d.projections || {}
  const milestones = d.milestones || []
  const strategy = d.investmentStrategy || []
  const risks = d.risks || []
  const nextSteps = d.nextSteps || []

  return (
    <div className="min-h-screen bg-gray-50">
      <Header userData={userData} onOpenAccount={onOpenAccount} />

      {/* Hero Section */}
      <div className="clarifi-gradient text-white">
        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <HealthGauge score={d.healthScore || 0} label={d.healthLabel || ''} />
            <div className="flex-1 text-center sm:text-left">
              <p className="text-cyan-200 text-sm font-semibold uppercase tracking-wider mb-1">
                {educationData.childName}'s Education Roadmap
              </p>
              <h1 className="text-3xl font-extrabold mb-3 leading-tight">
                Financial Health: {d.healthLabel}
              </h1>
              <p className="text-indigo-100 text-sm leading-relaxed mb-5">{d.summary}</p>
              <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                <div className="bg-white/15 backdrop-blur rounded-xl px-4 py-2.5 text-center">
                  <div className="text-xs text-indigo-200 font-medium">Monthly Needed</div>
                  <div className="text-lg font-bold">{formatINR(mb.recommendedEducationInvestment)}</div>
                </div>
                <div className="bg-white/15 backdrop-blur rounded-xl px-4 py-2.5 text-center">
                  <div className="text-xs text-indigo-200 font-medium">Total Education Cost</div>
                  <div className="text-lg font-bold">{formatINR(ec.totalEducationCost)}</div>
                </div>
                <div className="bg-white/15 backdrop-blur rounded-xl px-4 py-2.5 text-center">
                  <div className="text-xs text-indigo-200 font-medium">Funding Gap</div>
                  <div className="text-lg font-bold">{formatINR(proj.fundingGap)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Financial Snapshot */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-slide-up">
          <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-500" /> Financial Snapshot
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-xs text-gray-500 font-medium mb-1">Monthly Income</div>
              <div className="text-lg font-bold text-gray-800">{formatINR(mb.income)}</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-xs text-gray-500 font-medium mb-1">Liabilities</div>
              <div className="text-lg font-bold text-red-500">{formatINR(mb.liabilities)}</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-xs text-gray-500 font-medium mb-1">Savings</div>
              <div className="text-lg font-bold text-emerald-600">{formatINR(mb.currentSavings)}</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-xs text-gray-500 font-medium mb-1">Surplus</div>
              <div className={`text-lg font-bold ${mb.surplus >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {formatINR(mb.surplus)}
              </div>
            </div>
          </div>
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="text-sm text-indigo-600 font-semibold">Recommended Education Investment</div>
              <div className="text-xs text-indigo-400 mt-0.5">Monthly contribution needed to meet your goals</div>
            </div>
            <div className="text-2xl font-extrabold text-indigo-700">{formatINR(mb.recommendedEducationInvestment)}</div>
          </div>
        </div>

        {/* Education Cost Breakdown */}
        <div className="animate-slide-up">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-500" /> Education Cost Breakdown
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* School */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-lg">🏫</div>
                <div>
                  <div className="text-xs text-gray-400 font-medium">School</div>
                  <div className="text-sm font-semibold text-gray-700 leading-tight">{ec.school?.type}</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Annual Cost (today)</span>
                  <span className="font-semibold text-gray-800">{formatINR(ec.school?.currentAnnualCost)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Years Remaining</span>
                  <span className="font-semibold text-gray-800">{ec.school?.yearsRemaining} yrs</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="text-gray-600 font-medium text-sm">Total (inflation-adj.)</span>
                  <span className="text-blue-600 font-bold">{formatINR(ec.school?.totalCost)}</span>
                </div>
              </div>
            </div>

            {/* University */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-lg">🎓</div>
                <div>
                  <div className="text-xs text-gray-400 font-medium">University</div>
                  <div className="text-sm font-semibold text-gray-700 leading-tight">{ec.university?.type}</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Annual Cost (at admission)</span>
                  <span className="font-semibold text-gray-800">{formatINR(ec.university?.estimatedAnnualCost)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Duration</span>
                  <span className="font-semibold text-gray-800">{ec.university?.duration} yrs</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="text-gray-600 font-medium text-sm">Total University Cost</span>
                  <span className="text-purple-600 font-bold">{formatINR(ec.university?.totalCost)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Milestones Timeline */}
        {milestones.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-slide-up">
            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-500" /> Milestone Timeline
            </h2>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-100" />
              <div className="space-y-6">
                {milestones.map((m, i) => (
                  <div key={i} className="relative flex gap-5 pl-12">
                    <div
                      className={`absolute left-0 w-9 h-9 rounded-full flex items-center justify-center ${milestoneColor(m.type)} shadow-md`}
                    >
                      <MilestoneIcon type={m.type} />
                    </div>
                    <div className="flex-1 pb-2">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-xs bg-gray-100 text-gray-600 font-semibold px-2 py-0.5 rounded-full">
                          {m.year}
                        </span>
                        <span className="text-xs bg-indigo-100 text-indigo-600 font-semibold px-2 py-0.5 rounded-full">
                          Age {m.childAge}
                        </span>
                      </div>
                      <p className="font-semibold text-gray-800 text-sm mb-0.5">{m.milestone}</p>
                      {m.targetAmount > 0 && (
                        <p className="text-base font-bold text-indigo-600">{formatINR(m.targetAmount)}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-0.5">{m.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Investment Strategy */}
        {strategy.length > 0 && (
          <PremiumOverlay
            isPaid={isPaid}
            onPaymentSuccess={onPaymentSuccess}
            title={
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-500" /> Recommended Investment Strategy
              </h2>
            }
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {strategy.map((s, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-bold text-gray-800">{s.instrument}</div>
                      <div className="text-xs text-emerald-600 font-semibold mt-0.5">{s.expectedReturn} return</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400 font-medium">Monthly</div>
                      <div className="text-xl font-extrabold text-indigo-600">{formatINR(s.monthlyAmount)}</div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{s.rationale}</p>
                </div>
              ))}
            </div>
          </PremiumOverlay>
        )}

        {/* Risks */}
        {risks.length > 0 && (
          <PremiumOverlay
            isPaid={isPaid}
            onPaymentSuccess={onPaymentSuccess}
            title={
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" /> Key Risks to Watch
              </h2>
            }
          >
            <div className="space-y-3">
              {risks.slice(0, 3).map((risk, i) => (
                <div key={i} className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800">{risk}</p>
                </div>
              ))}
            </div>
          </PremiumOverlay>
        )}

        {/* Next Steps */}
        {nextSteps.length > 0 && (
          <PremiumOverlay
            isPaid={isPaid}
            onPaymentSuccess={onPaymentSuccess}
            title={
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <ChevronRight className="w-5 h-5 text-indigo-500" /> Your Next 3 Actions
              </h2>
            }
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="space-y-3">
                {nextSteps.slice(0, 3).map((step, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
                      {i + 1}
                    </div>
                    <p className="text-sm text-gray-700 pt-1.5 leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </PremiumOverlay>
        )}

        {/* Motivational Message */}
        {d.motivationalMessage && (
          <PremiumOverlay
            isPaid={isPaid}
            onPaymentSuccess={onPaymentSuccess}
            title={
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center justify-center gap-2">
                <Lightbulb className="w-5 h-5 text-indigo-500" /> Final Thoughts
              </h2>
            }
          >
            <div className="relative bg-gradient-to-br from-indigo-50 to-cyan-50 border border-indigo-100 rounded-2xl p-6 text-center">
              <div className="absolute top-4 left-6 text-5xl text-indigo-200 font-serif leading-none">"</div>
              <p className="text-gray-700 text-sm leading-relaxed italic font-medium max-w-xl mx-auto px-4">
                {d.motivationalMessage}
              </p>
              <div className="absolute bottom-4 right-6 text-5xl text-indigo-200 font-serif leading-none">"</div>
            </div>
          </PremiumOverlay>
        )}

        {/* In-app feedback */}
        {feedbackGiven === null ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm animate-fade-in">
            <p className="text-sm font-medium text-gray-700">Did this roadmap help you make a decision?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setFeedbackGiven('yes')}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-semibold hover:bg-emerald-100 transition"
              >
                <ThumbsUp className="w-4 h-4" /> Yes, it did!
              </button>
              <button
                onClick={() => setFeedbackGiven('no')}
                className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-100 transition"
              >
                <ThumbsDown className="w-4 h-4" /> Not really
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center animate-fade-in">
            <p className="text-emerald-700 font-semibold text-sm">
              {feedbackGiven === 'yes'
                ? 'Thank you! We\'re glad ClariFi is helping you plan better. 🎉'
                : 'Thank you for the feedback! We\'ll keep improving ClariFi for you.'}
            </p>
          </div>
        )}

        {/* CTAs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-8">
          <button
            onClick={onGoToExpenseAnalyzer}
            className="clarifi-gradient text-white font-semibold py-4 rounded-2xl shadow-lg hover:shadow-xl hover:opacity-95 transition-all duration-200 text-base flex items-center justify-center gap-2"
          >
            🔍 Analyze an Expense Impact
          </button>
          <button
            onClick={onEditPlan}
            className="py-4 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-100 transition-all duration-200 text-base"
          >
            ← Edit Plan
          </button>
        </div>
      </div>
    </div>
  )
}
