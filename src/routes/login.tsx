import { zodResolver } from '@hookform/resolvers/zod'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
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
import { useTranslation } from '@/i18n/use-translation'

interface LoginSchemaMessages {
  emailRequired: string
  emailInvalid: string
  passwordRequired: string
}

// zod 에러 메시지가 로케일에 따라 바뀌어야 해서, 스키마를 모듈 스코프 상수가 아니라
// t(현재 로케일의 메시지)를 받는 팩토리로 만들고 컴포넌트 안에서 useMemo로 만든다.
// 매개변수 타입은 Messages['login']을 그대로 쓰지 않고 string으로 넓혀서 선언한다 —
// `as const` 딕셔너리의 ko/en 리터럴 유니언 타입이 그대로 들어오면 서로 대입 불가능해진다.
function createLoginSchema(t: LoginSchemaMessages) {
  return z.object({
    email: z.string().min(1, t.emailRequired).email(t.emailInvalid),
    password: z.string().min(1, t.passwordRequired),
  })
}

type LoginValues = z.infer<ReturnType<typeof createLoginSchema>>

export const Route = createFileRoute('/login')({ component: Login })

function Login() {
  const t = useTranslation().login
  const router = useRouter()
  const [serverError, setServerError] = useState('')
  const loginSchema = useMemo(() => createLoginSchema(t), [t])
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
          <CardTitle>{t.title}</CardTitle>
          <CardDescription>{t.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.emailLabel}</FormLabel>
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
                    <FormLabel>{t.passwordLabel}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="current-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {serverError && (
                <p className="text-sm text-destructive">{serverError}</p>
              )}
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? t.submitting : t.submit}
              </Button>
            </form>
          </Form>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            {t.demoAccountPrefix} {DEMO_ACCOUNT.email} / {DEMO_ACCOUNT.password}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
