import { redirectIfAuthenticated } from '@/lib/auth-guard'
import LoginClient from './login-client'

export default async function LoginPage() {
  await redirectIfAuthenticated()
  
  return <LoginClient />
}