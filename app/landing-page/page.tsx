import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CardContent, Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, History, BarChart, User, CheckCircle, X } from "lucide-react"
import Link from "next/link"
import logoImg from '../../public/assets/images/logo_horizontal.png'
import Image from 'next/image'

type Features = {
  "Geração do CV com interações": string;
  "Criação de perfis": string;
  "Número de CVs": string;
  "Sugestão de palavras chave": boolean;
  "Histórico de CVs enviados": boolean;
  "Lembrete de feedback": boolean;
  "Criar página de CVs compartilhável": boolean;
  "Exportar CV": string;
  "Recomendação de preparação para entrevista": boolean;
  "Tradução do CV": string | boolean;
};

type PricingPlan = {
  name: string;
  price: string;
  features: Features;
};

const pricingPlans: PricingPlan[] = [
  {
    name: "Free",
    price: "R$0",
    features: {
      "Geração do CV com interações": "Limitado",
      "Criação de perfis": "1",
      "Número de CVs": "1",
      "Sugestão de palavras chave": true,
      "Histórico de CVs enviados": false,
      "Lembrete de feedback": false,
      "Criar página de CVs compartilhável": false,
      "Exportar CV": "PDF",
      "Recomendação de preparação para entrevista": false,
      "Tradução do CV": false
    }
  },
  {
    name: "Basic",
    price: "R$29,99/mês",
    features: {
      "Geração do CV com interações": "Ilimitado",
      "Criação de perfis": "3",
      "Número de CVs": "5",
      "Sugestão de palavras chave": true,
      "Histórico de CVs enviados": true,
      "Lembrete de feedback": true,
      "Criar página de CVs compartilhável": false,
      "Exportar CV": "PDF, Word",
      "Recomendação de preparação para entrevista": false,
      "Tradução do CV": false
    }
  },
  {
    name: "Plus",
    price: "R$49,99/mês",
    features: {
      "Geração do CV com interações": "Ilimitado",
      "Criação de perfis": "5",
      "Número de CVs": "10",
      "Sugestão de palavras chave": true,
      "Histórico de CVs enviados": true,
      "Lembrete de feedback": true,
      "Criar página de CVs compartilhável": true,
      "Exportar CV": "PDF, Word, TXT",
      "Recomendação de preparação para entrevista": true,
      "Tradução do CV": "1 idioma"
    }
  },
  {
    name: "Premium",
    price: "R$79,99/mês",
    features: {
      "Geração do CV com interações": "Ilimitado",
      "Criação de perfis": "Ilimitado",
      "Número de CVs": "Ilimitado",
      "Sugestão de palavras chave": true,
      "Histórico de CVs enviados": true,
      "Lembrete de feedback": true,
      "Criar página de CVs compartilhável": true,
      "Exportar CV": "Todos os formatos",
      "Recomendação de preparação para entrevista": true,
      "Tradução do CV": "Múltiplos idiomas"
    }
  }
]

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center">
        <Link className="flex items-center justify-center" href="#">
          <Image src={logoImg} alt="Logo" width={150} height={40} />
        </Link>
        <nav className="ml-auto flex items-center gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4 hidden sm:inline-block" href="#features">
            Features
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4 hidden sm:inline-block" href="#testimonials">
            Testimonials
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4 hidden sm:inline-block" href="#pricing">
            Pricing
          </Link>
          <Link href="/auth-page">
            <Button size="sm">Register/Login</Button>
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 flex justify-center bg-cover bg-center" style={{ backgroundImage: "url('/hero_image.jpg')" }}>
          <div className="container px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-white">
                Potencialize sua busca de emprego com IA
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-200 md:text-xl">
                Crie currículos personalizados, gerencie seu perfil e acompanhe suas candidaturas com o poder da IA.
                </p>
              </div>
              <div className="space-x-4">
                <Button className="bg-white text-black hover:bg-gray-200">Get Started</Button>
                <Button variant="outline" className="text-white border-white hover:bg-white hover:text-black">Learn More</Button>
              </div>
            </div>
          </div>
        </section>
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 light:bg-gray-800 flex justify-center">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12">
              Features
            </h2>
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardContent className="flex flex-col items-center space-y-4 p-6">
                  <FileText className="h-12 w-12 text-primary" />
                  <h3 className="text-xl font-bold">AI-Powered Resume Generation</h3>
                  <p className="text-center text-gray-500 dark:text-gray-400">
                    Create tailored resumes for each job opportunity with our advanced AI technology.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center space-y-4 p-6">
                  <User className="h-12 w-12 text-primary" />
                  <h3 className="text-xl font-bold">Profile Management</h3>
                  <p className="text-center text-gray-500 dark:text-gray-400">
                    Easily manage and update your professional profile to stay current in your job search.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center space-y-4 p-6">
                  <History className="h-12 w-12 text-primary" />
                  <h3 className="text-xl font-bold">Application Tracking</h3>
                  <p className="text-center text-gray-500 dark:text-gray-400">
                    Keep track of all your job applications and their statuses in one place.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center space-y-4 p-6">
                  <BarChart className="h-12 w-12 text-primary" />
                  <h3 className="text-xl font-bold">Performance Analytics</h3>
                  <p className="text-center text-gray-500 dark:text-gray-400">
                    Gain insights into your job search performance with detailed statistics and data visualization.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32 flex justify-center">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12">
              What Our Users Say
            </h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  name: "Alex Johnson",
                  role: "Software Engineer",
                  content: "AI Resume Pro helped me land my dream job! The tailored resumes made all the difference."
                },
                {
                  name: "Sarah Lee",
                  role: "Marketing Specialist",
                  content: "The application tracking feature is a game-changer. I'm more organized than ever in my job search."
                },
                {
                  name: "Michael Chen",
                  role: "Data Analyst",
                  content: "The performance analytics gave me insights that helped me improve my job search strategy significantly."
                }
              ].map((testimonial, index) => (
                <Card key={index}>
                  <CardContent className="flex flex-col items-center space-y-4 p-6">
                    <CheckCircle className="h-12 w-12 text-green-500" />
                    <p className="text-center italic">{`"${testimonial.content}"`}</p>
                    <div className="text-center">
                      <h4 className="font-bold">{testimonial.name}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
        <section id="pricing" className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800 flex justify-center">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12">
              Choose Your Plan
            </h2>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Feature</TableHead>
                    {pricingPlans.map((plan) => (
                      <TableHead key={plan.name} className="text-center">
                        {plan.name}
                        <br />
                        <span className="font-normal">{plan.price}</span>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.keys(pricingPlans[0].features).map((feature) => (
                    <TableRow key={feature}>
                      <TableCell className="font-medium">{feature}</TableCell>
                      {pricingPlans.map((plan) => (
                        <TableCell key={`${plan.name}-${feature}`} className="text-center">
                          {typeof plan.features[feature as keyof Features] === 'boolean' ? (
                            plan.features[feature as keyof Features] ? (
                              <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                            ) : (
                              <X className="h-5 w-5 text-red-500 mx-auto" />
                            )
                          ) : (
                            plan.features[feature as keyof Features]
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-10 flex justify-center space-x-4">
              {pricingPlans.map((plan) => (
                <Button key={plan.name} variant={plan.name === "Plus" ? "default" : "outline"}>
                  Choose {plan.name}
                </Button>
              ))}
            </div>
          </div>
        </section>
        <section id="cta" className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground flex justify-center">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Ready to Revolutionize Your Job Search?
                </h2>
                <p className="mx-auto max-w-[600px] text-primary-foreground/90 md:text-xl">
                  Join AI Resume Pro today and take the first step towards your dream career.
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <form className="flex space-x-2">
                  <Input className="max-w-lg flex-1 bg-primary-foreground text-primary" placeholder="Enter your email" type="email" />
                  <Button type="submit" variant="secondary">
                    Get Started
                  </Button>
                </form>
                <p className="text-xs text-primary-foreground/90">
                  By signing up, you agree to our{" "}
                  <Link className="underline underline-offset-2" href="#">
                    Terms & Conditions
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">© 2023 AI Resume Pro. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}