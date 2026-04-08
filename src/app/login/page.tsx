'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import axios from 'axios'
import { toast } from 'sonner'
import { FlaskConical, Loader2, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    try {
      await axios.post('/api/auth/login', data)
      toast.success('Signed in successfully')
      router.push('/')
      router.refresh()
    } catch (err: unknown) {
      const msg =
        axios.isAxiosError(err) && err.response?.data?.error?.message
          ? err.response.data.error.message
          : 'Login failed. Please try again.'
      toast.error(msg)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="rounded-2xl border bg-white shadow-xl p-8">
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 mb-4 shadow-lg shadow-blue-200">
              <FlaskConical className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">MCA Research Tracker</h1>
            <p className="mt-1 text-sm text-gray-500">NMIET Pune · Sign in to continue</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@nmiet.edu"
                autoComplete="email"
                {...register('email')}
                className={errors.email ? 'border-red-400' : ''}
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...register('password')}
                  className={errors.password ? 'border-red-400 pr-10' : 'pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 rounded-lg bg-gray-50 p-4 text-xs text-gray-500 space-y-1">
            <p className="font-semibold text-gray-600 mb-2">Demo credentials</p>
            <p>Admin: <span className="font-mono">admin@nmiet.edu</span> / <span className="font-mono">password123</span></p>
            <p>Coord: <span className="font-mono">coordinator@nmiet.edu</span> / <span className="font-mono">password123</span></p>
            <p>Faculty: <span className="font-mono">varsha.salve@nmiet.edu</span> / <span className="font-mono">password123</span></p>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-gray-400">
          © 2026 NMIET Pune · MCA Department
        </p>
      </div>
    </div>
  )
}
