import { useState, useEffect } from 'react'
import Screen1 from './components/Screen1.jsx'
import Screen2 from './components/Screen2.jsx'
import Screen3 from './components/Screen3.jsx'
import Screen4 from './components/Screen4.jsx'
import MyAccount from './components/MyAccount.jsx'

export default function App() {
  const [currentScreen, setCurrentScreen] = useState(1)
  const [financialData, setFinancialData] = useState({ income: '', liabilities: '', savings: '' })
  const [educationData, setEducationData] = useState({
    childName: '', childAge: '', schoolType: '', universityType: '', context: '',
  })
  const [roadmapData, setRoadmapData] = useState(null)
  const [userData, setUserData] = useState(() => {
    try { return JSON.parse(localStorage.getItem('clarifi_user')) || null }
    catch { return null }
  })
  const [showAccount, setShowAccount] = useState(false)

  // Persist user to localStorage whenever it changes
  useEffect(() => {
    if (userData) localStorage.setItem('clarifi_user', JSON.stringify(userData))
    else localStorage.removeItem('clarifi_user')
  }, [userData])

  const goToScreen = (screen) => setCurrentScreen(screen)

  const handleFinancialDataSubmit = (data) => {
    setFinancialData(data)
    setCurrentScreen(2)
  }

  const handleRoadmapGenerated = (data, eduData) => {
    setEducationData(eduData)
    setRoadmapData(data)
    setCurrentScreen(3)
  }

  const handleUserRegistered = (user) => {
    setUserData(user)
  }

  // Refresh user status from backend (e.g., after email verification or payment)
  const handleRefreshUser = async () => {
    if (!userData?.email) return
    try {
      const res = await fetch(`/api/user/${encodeURIComponent(userData.email)}`)
      const json = await res.json()
      if (json.success) setUserData(json.user)
    } catch { /* ignore */ }
  }

  // Auto-sync user data with backend on load
  useEffect(() => {
    if (userData?.email) {
      handleRefreshUser()
    }
  }, []) // Empty dependency array so it only fetches exactly once when the app starts up

  const isPaid = userData?.payment === true

  // Razorpay payment flow: create order → open checkout → verify payment → update state
  const initiateRazorpayPayment = async () => {
    if (!userData?.email) {
      alert('Please register first before upgrading.')
      return
    }

    try {
      // 1. Create order on backend
      const orderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userData.email }),
      })
      const orderJson = await orderRes.json()

      if (!orderJson.success) {
        alert(orderJson.error || 'Failed to create order')
        return
      }

      const { order, key } = orderJson

      // 2. Open Razorpay Checkout
      const options = {
        key,
        amount: order.amount,
        currency: order.currency,
        name: 'ClariFi',
        description: 'Premium Upgrade',
        order_id: order.id,
        prefill: {
          name: userData.name,
          email: userData.email,
        },
        theme: { color: '#4F46E5' },
        handler: async (response) => {
          // 3. Verify payment on backend
          try {
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: userData.email,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            })
            const verifyJson = await verifyRes.json()

            if (verifyJson.success) {
              // 4. Update local state — unblur premium content
              setUserData(prev => ({ ...prev, payment: true }))
            } else {
              alert('Payment verification failed. Please contact support.')
            }
          } catch {
            alert('Could not verify payment. Please contact support.')
          }
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', (response) => {
        alert(`Payment failed: ${response.error.description}`)
      })
      rzp.open()
    } catch {
      alert('Could not connect to server. Please try again.')
    }
  }

  const screenProps = { userData, onOpenAccount: () => setShowAccount(true) }

  return (
    <div className="min-h-screen bg-gray-50">
      {currentScreen === 1 && (
        <Screen1
          financialData={financialData}
          onSubmit={handleFinancialDataSubmit}
          onUserRegistered={handleUserRegistered}
          {...screenProps}
        />
      )}
      {currentScreen === 2 && (
        <Screen2
          financialData={financialData}
          educationData={educationData}
          onBack={() => goToScreen(1)}
          onRoadmapGenerated={handleRoadmapGenerated}
          {...screenProps}
        />
      )}
      {currentScreen === 3 && (
        <Screen3
          financialData={financialData}
          educationData={educationData}
          roadmapData={roadmapData}
          onGoToExpenseAnalyzer={() => goToScreen(4)}
          onEditPlan={() => goToScreen(2)}
          isPaid={isPaid}
          onPaymentSuccess={initiateRazorpayPayment}
          {...screenProps}
        />
      )}
      {currentScreen === 4 && (
        <Screen4
          financialData={financialData}
          educationData={educationData}
          roadmapData={roadmapData}
          onBack={() => goToScreen(3)}
          {...screenProps}
        />
      )}

      {showAccount && userData && (
        <MyAccount
          userData={userData}
          onClose={() => setShowAccount(false)}
          onUpgrade={initiateRazorpayPayment}
          onRefresh={handleRefreshUser}
        />
      )}
    </div>
  )
}
