import { WifiOff } from 'lucide-react'
import Link from 'next/link'

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center space-y-4 max-w-sm px-4">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
            <WifiOff className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        <h1 className="text-xl font-semibold text-gray-900">You&apos;re offline</h1>
        <p className="text-sm text-gray-500">
          Please check your internet connection. The MCA Research Tracker needs a network connection to load live data.
        </p>
        <Link
          href="/"
          className="inline-block rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          Try again
        </Link>
      </div>
    </div>
  )
}
