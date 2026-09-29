import { zodResolver } from '@hookform/resolvers/zod'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { DEMO_ACCOUNT } from '@/config/auth'
import { loginFn } from '@/server/auth'

const loginSchema = z.object({
  email: z.string().min(1, '이메일을 입력해주세요.').email('올바른 이메일 형식이 아니에요.'),
  password: z.string().min(1, '비밀번호를 입력해주세요.'),
})

type LoginValues = z.infer<typeof loginSchema>

export const Route = createFileRoute('/login')({ component: Login })

function Login() {
  const router = useRouter()
  const [serverError, setServerError] = useState('')
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(values: LoginValues) {
    setServerError('')

    const result = await loginFn({ data: values })

    if (!result.ok) {
      setServerError(result.error)
      return
    }

    await router.invalidate()
    await router.navigate({ to: '/' })
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>관리자 로그인</CardTitle>
          <CardDescription>계정 정보를 입력해주세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>이메일</FormLabel>
                    <FormControl>
                      <Input type="email" autoComplete="username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>비밀번호</FormLabel>
                    <FormControl>
                      <Input type="password" autoComplete="current-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {serverError && <p className="text-sm text-destructive">{serverError}</p>}
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? '로그인 중...' : '로그인'}
              </Button>
            </form>
          </Form>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            데모 계정: {DEMO_ACCOUNT.email} / {DEMO_ACCOUNT.password}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
