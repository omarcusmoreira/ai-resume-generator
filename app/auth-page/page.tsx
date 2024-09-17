'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Timestamp } from 'firebase/firestore'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BrainCircuit, Mail, Lock, User, HeartHandshake } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [cpf, setCpf] = useState('')
  const [plan, setPlan] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [cpfError, setCpfError] = useState('')
  const [planError, setPlanError] = useState('')

  const router = useRouter()

  const {
    saveUser,
  } = useFirestore()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      )

      console.log('Login successful')

      router.push('/')
    } catch (error) {
      console.error('Login error', error)
      // Optionally, set an error state to display to the user
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setPasswordError('As senhas não coincidem')
      return
    }
    setPasswordError('')

    if (!validateCPF(cpf)) {
      setCpfError('CPF inválido')
      return
    }
    setCpfError('')

    if (!plan) {
      setPlanError('Por favor, selecione um plano')
      return
    }
    setPlanError('')

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      )
      const user = userCredential.user

      console.log('Sign-up successful')

      // Initialize AdminInfo
      const adminInfo: AdminInfoType = {
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        plan: plan,
      }

      // Initialize PersonalInfo
      const personalInfo: PersonalInfoType = {
        name: name,
        cpf: cpf,
        birthDate: '',
        linkedinURL: '',
        email: email,
        phone: '',
        city: '',
        profilePicture: '',
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
    } catch (error) {
      console.error('Sign-up error', error)
      // Optionally, set an error state to display to the user
    }
  }

  const validateCPF = (cpf: string) => {
    const cleanCPF = cpf.replace(/[^\d]+/g, '')
    if (cleanCPF.length !== 11 || !!cleanCPF.match(/(\d)\1{10}/))
      return false
    // Here you can add a more robust CPF validation if needed
    return true
  }

  const formatCPF = (value: string) => {
    const cleanCPF = value.replace(/\D/g, '')
    return cleanCPF.replace(
      /(\d{3})(\d{3})(\d{3})(\d{2})/,
      '$1.$2.$3-$4'
    )
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
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="email"
                        placeholder="m@exemplo.com"
                        type="email"
                        value={email}
                        onChange={(e) =>
                          setEmail(e.target.value)
                        }
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) =>
                          setPassword(e.target.value)
                        }
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
                    <Label
                      htmlFor="rememberMe"
                      className="ml-2"
                    >
                      Lembrar-me
                    </Label>
                  </div>
                  <Button type="submit" className="w-full">
                    Entrar
                  </Button>
                </div>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={handleSignUp}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="name"
                        placeholder="Seu nome"
                        type="text"
                        value={name}
                        onChange={(e) =>
                          setName(e.target.value)
                        }
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="email"
                        placeholder="m@exemplo.com"
                        type="email"
                        value={email}
                        onChange={(e) =>
                          setEmail(e.target.value)
                        }
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="cpf"
                        placeholder="123.456.789-00"
                        type="text"
                        value={cpf}
                        onChange={(e) =>
                          setCpf(formatCPF(e.target.value))
                        }
                        className="pl-10"
                        required
                      />
                    </div>
                    {cpfError && (
                      <p className="text-red-500 text-sm">
                        {cpfError}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="plan">Plano</Label>
                    <Select
                      onValueChange={(value) => setPlan(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um plano" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Básico</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="pro">Pro</SelectItem>
                      </SelectContent>
                    </Select>
                    {planError && (
                      <p className="text-red-500 text-sm">
                        {planError}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) =>
                          setPassword(e.target.value)
                        }
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      Confirmar Senha
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) =>
                          setConfirmPassword(e.target.value)
                        }
                        className="pl-10"
                        required
                      />
                    </div>
                    {passwordError && (
                      <p className="text-red-500 text-sm">
                        {passwordError}
                      </p>
                    )}
                  </div>
                  <Button type="submit" className="w-full">
                    Cadastrar
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
