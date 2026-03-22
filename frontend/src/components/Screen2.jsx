import { useState, useEffect } from 'react'
import { TrendingUp, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import Header from './Header.jsx'

function ProgressBar({ currentStep }) {
  const steps = [
    { label: 'Financial Profile', step: 1 },
    { label: 'Education Plan', step: 2 },
    { label: 'Your Roadmap', step: 3 },
    { label: 'Expense Analyzer', step: 4 },
  ]
  return (
    <div className="bg-white border-b border-gray-100 py-4">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 z-0" />
          {steps.map((s) => {
            const isCompleted = s.step < currentStep
            const isActive = s.step === currentStep
            return (
              <div key={s.step} className="flex flex-col items-center z-10 flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300
                    ${isCompleted ? 'bg-emerald-500 text-white shadow-md' : ''}
                    ${isActive ? 'bg-indigo-600 text-white shadow-lg ring-4 ring-indigo-100' : ''}
                    ${!isCompleted && !isActive ? 'bg-white border-2 border-gray-200 text-gray-400' : ''}
                  `}
                >
                  {isCompleted ? <CheckCircle className="w-4 h-4" /> : s.step}
                </div>
                <span
                  className={`mt-1.5 text-xs font-medium hidden sm:block
                    ${isActive ? 'text-indigo-600' : ''}
                    ${isCompleted ? 'text-emerald-600' : ''}
                    ${!isCompleted && !isActive ? 'text-gray-400' : ''}
                  `}
                >
                  {s.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

const SCHOOL_OPTIONS = [
  {
    id: 'Government School (CBSE/State Board)',
    emoji: '🏛️',
    name: 'Government School',
    subtitle: 'CBSE / State Board',
    desc: 'Affordable & quality',
    cost: '₹20K–50K/yr',
  },
  {
    id: 'Private School (CBSE)',
    emoji: '📚',
    name: 'Private School',
    subtitle: 'CBSE',
    desc: 'Most popular choice',
    cost: '₹80K–2L/yr',
  },
  {
    id: 'Private School (ICSE)',
    emoji: '🎯',
    name: 'Private School',
    subtitle: 'ICSE',
    desc: 'Academic excellence',
    cost: '₹1L–3L/yr',
  },
  {
    id: 'International School (IB/Cambridge)',
    emoji: '🌍',
    name: 'International School',
    subtitle: 'IB / Cambridge',
    desc: 'Global curriculum',
    cost: '₹5L–15L/yr',
  },
]

const UNIVERSITY_OPTIONS = [
  {
    id: 'Government College (State/Central University)',
    emoji: '🏛️',
    name: 'Government College',
    subtitle: 'State / Central University',
    desc: 'Cost-effective option',
    cost: '₹30K–1.5L/yr',
  },
  {
    id: 'Premier Institute (IIT/NIT/AIIMS)',
    emoji: '⚡',
    name: 'Premier Institute',
    subtitle: 'IIT / NIT / AIIMS',
    desc: 'Best in India',
    cost: '₹1L–3L/yr',
  },
  {
    id: 'Private University in India',
    emoji: '🎓',
    name: 'Private University',
    subtitle: 'In India',
    desc: 'Good infrastructure',
    cost: '₹3L–8L/yr',
  },
  {
    id: 'Foreign University (US/UK/Australia)',
    emoji: '✈️',
    name: 'Foreign University',
    subtitle: 'US / UK / Australia',
    desc: 'International degree',
    cost: '₹25L–60L/yr',
  },
]

function SelectionCard({ option, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(option.id)}
      className={`relative w-full text-left p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md
        ${selected ? 'border-indigo-500 bg-indigo-50 shadow-md' : 'border-gray-200 bg-white hover:border-indigo-200'}`}
    >
      {selected && (
        <div className="absolute top-2 right-2 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
          <CheckCircle className="w-3 h-3 text-white" />
        </div>
      )}
      <div className="text-2xl mb-2">{option.emoji}</div>
      <div className={`font-semibold text-sm ${selected ? 'text-indigo-700' : 'text-gray-800'}`}>{option.name}</div>
      <div className={`text-xs font-medium ${selected ? 'text-indigo-500' : 'text-gray-400'}`}>{option.subtitle}</div>
      <div className="text-xs text-gray-500 mt-1">{option.desc}</div>
      <div className={`text-xs font-semibold mt-1.5 ${selected ? 'text-indigo-600' : 'text-gray-400'}`}>{option.cost}</div>
    </button>
  )
}

export default function Screen2({ financialData, educationData, onBack, onRoadmapGenerated, userData, onOpenAccount }) {
  const [childName, setChildName] = useState(educationData.childName || '')
  const [childAge, setChildAge] = useState(educationData.childAge || '')
  const [schoolType, setSchoolType] = useState(educationData.schoolType || '')
  const [universityType, setUniversityType] = useState(educationData.universityType || '')
  const [context, setContext] = useState(educationData.context || '')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const validate = () => {
    const errs = {}
    if (!childName.trim()) errs.childName = 'Please enter your child\'s name.'
    if (!childAge || Number(childAge) < 1 || Number(childAge) > 17) errs.childAge = 'Please enter a valid age between 1 and 17.'
    if (!schoolType) errs.schoolType = 'Please select a school type.'
    if (!universityType) errs.universityType = 'Please select a university type.'
    return errs
  }

  const handleGenerate = async () => {
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setLoading(true)
    setApiError('')
    try {
      const response = await fetch('/api/generate-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          income: financialData.income,
          liabilities: financialData.liabilities,
          savings: financialData.savings,
          schoolType,
          universityType,
          context,
          childAge,
          childName,
        }),
      })
      const result = await response.json()
      if (!result.success) throw new Error(result.error || 'Failed to generate roadmap')
      onRoadmapGenerated(result.data, { childName, childAge, schoolType, universityType, context })
    } catch (err) {
      setApiError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header userData={userData} onOpenAccount={onOpenAccount} />
      <ProgressBar currentStep={2} />

      {loading && (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-5">
          <div className="w-16 h-16 rounded-2xl clarifi-gradient flex items-center justify-center shadow-xl animate-pulse">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <div className="text-center">
            <p className="text-xl font-bold text-gray-800">Crafting your personalized roadmap...</p>
            <p className="text-gray-500 mt-1">This may take a moment while our AI thinks deeply</p>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Child's Education Journey</h1>
          <p className="text-gray-500">Tell us about your child and your education aspirations.</p>
        </div>

        <div className="space-y-8 animate-slide-up">
          {/* Child Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Child Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Child's Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={childName}
                  onChange={(e) => { setChildName(e.target.value); setErrors((p) => ({ ...p, childName: undefined })) }}
                  placeholder="e.g., Aarav"
                  className={`w-full px-4 py-3 border rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition
                    ${errors.childName ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'}`}
                />
                {errors.childName && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.childName}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Age <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="17"
                  value={childAge}
                  onChange={(e) => { setChildAge(e.target.value); setErrors((p) => ({ ...p, childAge: undefined })) }}
                  placeholder="e.g., 8"
                  className={`w-full px-4 py-3 border rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition
                    ${errors.childAge ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'}`}
                />
                {errors.childAge && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.childAge}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* School Type */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">
              What kind of school does/will your child attend?
            </h2>
            <p className="text-sm text-gray-400 mb-4">Select the option that best describes your preference</p>
            <div className="grid grid-cols-2 gap-3">
              {SCHOOL_OPTIONS.map((opt) => (
                <SelectionCard
                  key={opt.id}
                  option={opt}
                  selected={schoolType === opt.id}
                  onSelect={(id) => { setSchoolType(id); setErrors((p) => ({ ...p, schoolType: undefined })) }}
                />
              ))}
            </div>
            {errors.schoolType && (
              <p className="mt-3 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {errors.schoolType}
              </p>
            )}
          </div>

          {/* University Type */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">
              Which university path are you planning?
            </h2>
            <p className="text-sm text-gray-400 mb-4">Choose the type of higher education you're aiming for</p>
            <div className="grid grid-cols-2 gap-3">
              {UNIVERSITY_OPTIONS.map((opt) => (
                <SelectionCard
                  key={opt.id}
                  option={opt}
                  selected={universityType === opt.id}
                  onSelect={(id) => { setUniversityType(id); setErrors((p) => ({ ...p, universityType: undefined })) }}
                />
              ))}
            </div>
            {errors.universityType && (
              <p className="mt-3 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {errors.universityType}
              </p>
            )}
          </div>

          {/* Context */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <label className="block text-lg font-semibold text-gray-800 mb-1">
              Tell us about your family's current situation and goals
            </label>
            <p className="text-sm text-gray-400 mb-3">
              The more you share, the more personalized your roadmap will be
            </p>
            <textarea
              rows={5}
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="E.g., We are a family of 4 with aging parents to support. We have ₹2L in FD as emergency fund and ₹50K in PPF. My child is very interested in engineering and we want to send her to an IIT. We're concerned about education inflation and would like to know if we should also consider education loans as a backup..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none text-sm leading-relaxed"
            />
          </div>

          {apiError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-red-700 font-medium text-sm">Failed to generate roadmap</p>
                <p className="text-red-600 text-sm mt-0.5">{apiError}</p>
              </div>
            </div>
          )}

          {Object.values(errors).filter(Boolean).length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-2 animate-fade-in">
              <p className="text-red-700 font-semibold text-sm mb-2">Please fix the following errors:</p>
              <ul className="text-sm text-red-600 space-y-1 pl-1">
                {Object.values(errors).filter(Boolean).map((err, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{err}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 py-4 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-100 transition-all duration-200"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className="flex-2 flex-grow-[2] clarifi-gradient text-white font-semibold py-4 rounded-2xl shadow-lg hover:shadow-xl hover:opacity-95 transition-all duration-200 text-lg disabled:opacity-70"
            >
              {loading ? 'Generating...' : 'Generate My Roadmap ✨'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
