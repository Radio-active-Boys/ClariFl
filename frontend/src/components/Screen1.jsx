import { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle, Mail } from 'lucide-react'
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
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300
                  ${isCompleted ? 'bg-emerald-500 text-white shadow-md' : ''}
                  ${isActive ? 'bg-indigo-600 text-white shadow-lg ring-4 ring-indigo-100' : ''}
                  ${!isCompleted && !isActive ? 'bg-white border-2 border-gray-200 text-gray-400' : ''}`}
                >
                  {isCompleted ? <CheckCircle className="w-4 h-4" /> : s.step}
                </div>
                <span className={`mt-1.5 text-xs font-medium hidden sm:block
                  ${isActive ? 'text-indigo-600' : ''}
                  ${isCompleted ? 'text-emerald-600' : ''}
                  ${!isCompleted && !isActive ? 'text-gray-400' : ''}`}
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

function formatIndian(num) {
  if (!num && num !== 0) return ''
  return Number(num).toLocaleString('en-IN')
}

export default function Screen1({ financialData, onSubmit, onUserRegistered, userData, onOpenAccount }) {
  const [name, setName] = useState(userData?.name || '')
  const [email, setEmail] = useState(userData?.email || '')
  const [income, setIncome] = useState(financialData.income || '')
  const [liabilities, setLiabilities] = useState(financialData.liabilities || '')
  const [savings, setSavings] = useState(financialData.savings || '')
  const [errors, setErrors] = useState({})
  const [registering, setRegistering] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const numIncome = Number(income) || 0
  const numLiabilities = Number(liabilities) || 0
  const numSavings = Number(savings) || 0
  const surplus = numIncome - numLiabilities - numSavings

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const validate = () => {
    const errs = {}
    if (!name.trim()) errs.name = 'Please enter your name.'
    if (!email.trim()) errs.email = 'Please enter your email.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Please enter a valid email.'
    if (!income || numIncome <= 0) errs.income = 'Please enter a valid monthly income.'
    if (numLiabilities < 0) errs.liabilities = 'Liabilities cannot be negative.'
    if (!savings || numSavings <= 0) errs.savings = 'Please enter a valid savings amount.'
    if (numIncome > 0 && (numLiabilities + numSavings) >= numIncome) {
      errs.savings = 'Liabilities + Savings must be less than your income.'
    }
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    // Register user (or re-verify) if not already verified
    if (!userData?.verified || userData.email !== email) {
      setRegistering(true)
      try {
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name.trim(), email: email.trim() }),
        })
        const json = await res.json()
        if (!res.ok) {
          setErrors({ email: json.error || 'Registration failed. Check email config.' })
          setRegistering(false)
          return
        }
        onUserRegistered(json.user)
        if (!json.alreadyVerified) setEmailSent(true)
      } catch {
        setErrors({ email: 'Could not connect to server.' })
        setRegistering(false)
        return
      }
      setRegistering(false)
    }

    onSubmit({ income, liabilities: liabilities || '0', savings })
  }

  const handleNumericChange = (setter, field) => (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '')
    setter(val)
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header userData={userData} onOpenAccount={onOpenAccount} />
      <ProgressBar currentStep={1} />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Financial Picture</h1>
          <p className="text-gray-500">Let's understand your current finances to build an accurate education roadmap.</p>
        </div>

        {emailSent && (
          <div className="mb-6 bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex items-start gap-3 animate-fade-in">
            <Mail className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-indigo-700">Verification email sent!</p>
              <p className="text-xs text-indigo-600 mt-0.5">Check <strong>{email}</strong> and click the link to verify your account. You can continue using ClariFi in the meantime.</p>
            </div>
          </div>
        )}
        

        <form onSubmit={handleSubmit} className="space-y-6 animate-slide-up">
          {/* Name + Email */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Your Details</h2>

            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: undefined })) }}
                placeholder="Rahul Sharma"
                className={`w-full px-4 py-3 border rounded-xl text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition
                  ${errors.name ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'}`}
              />
              {errors.name && (
                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {errors.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-400 mb-2">A verification link will be sent to this email</p>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })) }}
                placeholder="rahul@example.com"
                className={`w-full px-4 py-3 border rounded-xl text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition
                  ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'}`}
              />
              {errors.email && (
                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {errors.email}
                </p>
              )}
              {userData?.verified && userData.email === email && (
                <p className="mt-1.5 text-sm text-emerald-600 flex items-center gap-1 font-medium">
                  <CheckCircle className="w-4 h-4" /> Verified account
                </p>
              )}
            </div>
          </div>

          {/* Income */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Monthly Net Income <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-400 mb-3">Your take-home pay after taxes and deductions</p>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-lg">₹</span>
              <input
                type="text"
                inputMode="numeric"
                value={income}
                onChange={handleNumericChange(setIncome, 'income')}
                placeholder="85000"
                className={`w-full pl-9 pr-4 py-3.5 border rounded-xl text-gray-900 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition
                  ${errors.income ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'}`}
              />
            </div>
            {errors.income && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {errors.income}
              </p>
            )}
            {income && !errors.income && (
              <p className="mt-1.5 text-sm text-indigo-600 font-medium">₹{formatIndian(income)} per month</p>
            )}
          </div>

          {/* Liabilities */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Monthly Liabilities — EMIs, loans{' '}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <p className="text-xs text-gray-400 mb-3">Home loan EMI, car loan, personal loans, etc.</p>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-lg">₹</span>
              <input
                type="text"
                inputMode="numeric"
                value={liabilities}
                onChange={handleNumericChange(setLiabilities, 'liabilities')}
                placeholder="0"
                className={`w-full pl-9 pr-4 py-3.5 border rounded-xl text-gray-900 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition
                  ${errors.liabilities ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'}`}
              />
            </div>
            {errors.liabilities && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {errors.liabilities}
              </p>
            )}
            {liabilities && !errors.liabilities && (
              <p className="mt-1.5 text-sm text-gray-500 font-medium">₹{formatIndian(liabilities)} per month</p>
            )}
          </div>

          {/* Savings */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Monthly Savings — what you set aside <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-400 mb-3">Amount you currently save or invest each month</p>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-lg">₹</span>
              <input
                type="text"
                inputMode="numeric"
                value={savings}
                onChange={handleNumericChange(setSavings, 'savings')}
                placeholder="15000"
                className={`w-full pl-9 pr-4 py-3.5 border rounded-xl text-gray-900 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition
                  ${errors.savings ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'}`}
              />
            </div>
            {errors.savings && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {errors.savings}
              </p>
            )}
            {savings && !errors.savings && (
              <p className="mt-1.5 text-sm text-emerald-600 font-medium">₹{formatIndian(savings)} per month</p>
            )}
          </div>

          {/* Surplus */}
          {numIncome > 0 && numSavings > 0 && (
            <div className={`rounded-2xl p-5 border animate-fade-in
              ${surplus >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-semibold ${surplus >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                    Monthly Surplus
                  </p>
                  <p className={`text-xs mt-0.5 ${surplus >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {surplus >= 0 ? 'Available after savings & liabilities' : 'Warning: expenses exceed income!'}
                  </p>
                </div>
                <div className={`text-2xl font-bold ${surplus >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                  {surplus >= 0 ? '+' : ''}₹{formatIndian(Math.abs(surplus))}
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={registering}
            className="w-full clarifi-gradient text-white font-semibold py-4 rounded-2xl shadow-lg hover:shadow-xl hover:opacity-95 transition-all duration-200 text-lg disabled:opacity-60"
          >
            {registering ? 'Setting up your account...' : 'Continue to Education Plan →'}
          </button>
        </form>
      </div>
    </div>
  )
}
