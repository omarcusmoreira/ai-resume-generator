'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Timestamp } from 'firebase/firestore'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth'
import { auth } from '@/firebaseConfig'

import { useFirestore } from '@/hooks/useFirestore'
import {
  AdminInfoType,
  PersonalInfoType,
  UserDataType,
} from '@/types'

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
import { Mail, Lock, User, HeartHandshake } from 'lucide-react'
import { Button } from '@/components/ui/button'

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={props.width}
    height={props.height}
    viewBox="0 0 48 48"
    {...props}
  >
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
  </svg>
)

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

  const { saveUser } = useFirestore()

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

      // Initialize AdminInfo without 'plan'
      const adminInfo: AdminInfoType = {
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        plan: 'free',
      }

      // Initialize PersonalInfo without 'cpf'
      const personalInfo: PersonalInfoType = {
        name: signupName,
        birthDate: '',
        linkedinURL: '',
        email: signupEmail,
        phone: '',
        city: '',
        profilePicture: '',
        cpf: '',
      }

      // Initialize UserState
      const userState: UserDataType = {
        userId: user.uid,
        adminInfo: adminInfo,
        personalInfo: personalInfo,
      }

      console.log('newAppState', user)
      // Save AppState to Firestore and localStorage
      await saveUser(userState)

      router.push('/')
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

      console.log('Google sign-in successful')


        // Initialize AdminInfo
        const adminInfo: AdminInfoType = {
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          plan: 'free',
        }

        // Initialize PersonalInfo
        const personalInfo: PersonalInfoType = {
          name: user.displayName || '',
          birthDate: '',
          linkedinURL: '',
          email: user.email || '',
          phone: '',
          city: '',
          profilePicture: user.photoURL || '',
          cpf: '',
        }

        // Initialize UserState
        const userState: UserDataType = {
          userId: user.uid,
          adminInfo: adminInfo,
          personalInfo: personalInfo,
        }

        // Save to Firestore
        await saveUser(userState)


      router.push('/')
    } catch (error: any) {
      console.error('Google sign-in error', error)
      // Optionally, set an error state to display to the user
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <HeartHandshake className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            MeContrata.Ai
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
