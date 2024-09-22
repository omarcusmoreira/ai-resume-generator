'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth'
import { auth } from '@/firebaseConfig'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Mail, Lock, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import logoHorizontal from '../../public/assets/images/logo_horizontal.png'
import { PersonalInfoType, UserDataType } from '@/types/users'
import { addUser } from '@/services/userServices'
import { addPlanHistory } from '@/services/planHistoryService'
import { GoogleIcon } from '@/components/ui/google-icon'
import { PlanChangeType, PlanHistory, PlanType } from '@/types/planHistory'
import { v4 } from 'uuid'
export default function AuthPage() {
  // State Variables for Login
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  // State Variables for Sign Up
  const [signupName, setSignupName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('')
  const [signupError, setSignupError] = useState('')

  const [rememberMe, setRememberMe] = useState(false)

  const router = useRouter()

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('') // Reset error state

    if (!loginEmail || !loginPassword) {
      setLoginError('Por favor, preencha todos os campos.')
      return
    }

    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword)

      console.log('Login successful')

      router.push('/')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Login error', error)
      setLoginError(error.message || 'Erro ao fazer login.')
    }
  }

  // Handle Sign Up
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setSignupError('') // Reset error state

    // Basic Validation
    if (!signupName || !signupEmail || !signupPassword || !signupConfirmPassword) {
      setSignupError('Por favor, preencha todos os campos.')
      return
    }

    if (signupPassword !== signupConfirmPassword) {
      setSignupError('As senhas não coincidem.')
      return
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        signupEmail,
        signupPassword
      )
      const user = userCredential.user

      console.log('Sign-up successful')

      // Initialize PersonalInfo without 'cpf'
      const initialPersonalInfo: PersonalInfoType = {
        name: signupName,
        email: signupEmail,
        }

      // Initialize UserState
      const initialUserData: UserDataType = {
        userId: user.uid,
        personalInfo: initialPersonalInfo,
      }

      // Save AppState to Firestore and localStorage
      await addUser(initialUserData)
      const planHistoryId = v4()
      const planHistoryInstance = new PlanHistory({
        plan: PlanType.FREE,
        changeType: PlanChangeType.NEW,
        amountPaid: 0,
      })

      const planHistoryObject: PlanHistory   = {
        plan: planHistoryInstance.plan,
        changeType: planHistoryInstance.changeType,
        planChangeDate: planHistoryInstance.planChangeDate,
        quotas: planHistoryInstance.quotas,
        amountPaid: planHistoryInstance.amountPaid
      }
      await addPlanHistory(planHistoryId, planHistoryObject)

      router.push('/')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Sign-up error', error)
      setSignupError(error.message || 'Erro ao criar conta.')
    }
  }

  // Handle Google Sign-In
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider()
    try {
      const result = await signInWithPopup(auth, provider)
      const user = result.user
      const personalInfo: PersonalInfoType = {
          name: user.displayName || '',
          email: user.email || '',
      }
      const userState: UserDataType = {
        userId: user.uid,
        personalInfo: personalInfo,
      }
      await addUser(userState)
      router.push('/')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Google sign-in error', error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold flex justify-center">
            <Image src={logoHorizontal} alt="MeContrata.Ai" width={300} className='my-8'/>
          </CardTitle>
          <CardDescription className="text-center">
            Faça login ou crie uma conta para começar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Cadastrar</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={handleLogin}>
                <div className="space-y-4">
                  {loginError && (
                    <p className="text-red-500 text-sm">{loginError}</p>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="loginEmail">E-mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="loginEmail"
                        placeholder="m@exemplo.com"
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="loginPassword">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="loginPassword"
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Checkbox
                      id="rememberMe"
                      checked={rememberMe}
                      onCheckedChange={(checked) =>
                        setRememberMe(checked as boolean)
                      }
                    />
                    <Label htmlFor="rememberMe" className="ml-2">
                      Lembrar-me
                    </Label>
                  </div>
                  <Button type="submit" className="w-full">
                    Entrar
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full flex items-center justify-center"
                    onClick={handleGoogleSignIn}
                  >
                    <GoogleIcon className="mr-2 h-5 w-5" />
                    Entrar com Google
                  </Button>
                </div>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={handleSignUp}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signupName">Nome</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="signupName"
                        placeholder="Seu nome"
                        type="text"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signupEmail">E-mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="signupEmail"
                        placeholder="m@exemplo.com"
                        type="email"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signupPassword">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="signupPassword"
                        type="password"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signupConfirmPassword">
                      Confirmar Senha
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="signupConfirmPassword"
                        type="password"
                        value={signupConfirmPassword}
                        onChange={(e) => setSignupConfirmPassword(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  {signupError && (
                    <p className="text-red-500 text-sm">{signupError}</p>
                  )}
                  <Button type="submit" className="w-full">
                    Cadastrar
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full flex items-center justify-center"
                    onClick={handleGoogleSignIn}
                  >
                    <GoogleIcon className="mr-2 h-5 w-5" />
                    Cadastrar com Google
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link
            href="/forgot-password"
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Esqueceu a senha?
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
