'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function SignInPage() {
  const [email, setEmail] = useState('demo@example.com')

  const handleDemoSignIn = (e: React.FormEvent) => {
    e.preventDefault()
    signIn('credentials', { email, callbackUrl: '/dashboard' })
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>MagniFlowへようこそ</CardTitle>
          <CardDescription>
            サインイン方法を選択してください
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {/* Demo account login */}
          <form onSubmit={handleDemoSignIn} className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">デモアカウント（データベース不要）</p>
              <Input
                type="email"
                placeholder="メールアドレスを入力"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full">
              デモアカウントでサインイン
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}