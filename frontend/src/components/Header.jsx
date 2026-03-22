import { TrendingUp, User } from 'lucide-react'

export default function Header({ onOpenAccount, userData }) {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl clarifi-gradient flex items-center justify-center shadow-md">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-extrabold bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
              ClariFi
            </span>
            <p className="text-xs text-gray-400 leading-none mt-0.5">See the future before you spend.</p>
          </div>
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
