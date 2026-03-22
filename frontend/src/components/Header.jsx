import { User } from 'lucide-react'

export default function Header({ onOpenAccount, userData }) {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <img src="/clarifi-logo.svg" alt="ClariFi" className="h-10 w-auto" />
        </div>

        <button
          onClick={onOpenAccount}
          className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 transition border border-gray-100 shadow-sm"
        >
          <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
            {userData?.name ? (
              <span className="text-xs font-bold text-indigo-600">{userData.name[0].toUpperCase()}</span>
            ) : (
              <User className="w-4 h-4 text-indigo-500" />
            )}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-gray-700 leading-tight">
              {userData?.name || 'My Account'}
            </p>
            {userData?.tier && (
              <span className={`text-[10px] font-bold uppercase tracking-wide leading-tight
                ${userData.tier === 'premium' ? 'text-amber-500' : 'text-gray-400'}`}>
                {userData.tier === 'premium' ? '★ Premium' : 'Free'}
              </span>
            )}
          </div>
        </button>
      </div>
    </header>
  )
}
