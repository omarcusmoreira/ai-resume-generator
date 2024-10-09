import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, Zap, Target, Rocket, Star, Bug, Menu } from "lucide-react"
import logo_horizontal from '../../public/assets/images/logo_horizontal.png'
import InstallAppButton from "@/components/InstallAppButton"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-purple-100 to-white">
      <header className="px-4 lg:px-6 h-16 flex items-center justify-between sticky top-0 bg-white bg-opacity-90 backdrop-blur-sm z-50">
        <div className="container mx-auto flex justify-between items-center">
          <Link className="flex items-center justify-center" href="#">
            <Image src={logo_horizontal} alt="MeContrata.ai Logo" width={150} height={40} />
          </Link>
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-4 sm:gap-6">
              <Link className="text-sm font-medium hover:underline underline-offset-4" href="#features">
                Recursos
              </Link>
              <Link className="text-sm font-medium hover:underline underline-offset-4" href="#how-it-works">
                Como Funciona
              </Link>
              <Link className="text-sm font-medium hover:underline underline-offset-4" href="#pricing">
                Preços
              </Link>
              <Link href="https://forms.gle/9KKkaRSKpsaHNqz67" target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="outline" className="text-purple-600 border-purple-600 hover:bg-purple-100">
                  <Bug className="h-4 w-4 mr-2" />
                  Reportar Bug
                </Button>
              </Link>
            </nav>
            <Link href="/auth-page">
              <Button size="sm" className="bg-purple-600 hover:bg-purple-700">Entrar / Registrar</Button>
            </Link>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-white">
                <nav className="flex flex-col gap-4">
                  <Link className="text-sm font-medium hover:underline underline-offset-4" href="#features">
                    Recursos
                  </Link>
                  <Link className="text-sm font-medium hover:underline underline-offset-4" href="#how-it-works">
                    Como Funciona
                  </Link>
                  <Link className="text-sm font-medium hover:underline underline-offset-4" href="#pricing">
                    Preços
                  </Link>
                  <Link href="https://forms.gle/9KKkaRSKpsaHNqz67" target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="text-purple-600 border-purple-600 hover:bg-purple-100">
                      <Bug className="h-4 w-4 mr-2" />
                      Reportar Bug
                    </Button>
                  </Link>
                  <InstallAppButton />
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <main className="flex-1 w-full">
        <section className="w-full pt-12 md:pt-24 lg:pt-32 xl:pt-48">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-purple-800">
                  Encontre seu emprego dos sonhos com IA
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Gerencie suas candidaturas, crie currículos personalizados com IA e aumente suas chances de sucesso com o poder da Inteligência Artificial.
                </p>
              </div>
              <div className="space-x-4">
                <Button className="bg-purple-600 hover:bg-purple-700">Comece Grátis</Button>
                <Button variant="outline">Veja Como Funciona</Button>
              </div>
            </div>
          </div>
        </section>
        <section className="py-6">
          <div className="relative w-full aspect-[1.57] max-h-[80vh] max-h-[80svh] overflow-hidden">
            <iframe 
              src="https://app.supademo.com/embed/cm21v9u9o1vu613b31lkbz8ri?embed_v=2" 
              loading="lazy" 
              title="mecontrata.ai" 
              allow="clipboard-write" 
              className="absolute top-0 left-0 w-full h-full border-0"
              allowFullScreen
            />
          </div>
        </section>  
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12 text-purple-800">
              Recursos Incríveis
            </h2>
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardContent className="flex flex-col items-center space-y-4 p-6">
                  <Zap className="h-12 w-12 text-purple-600" />
                  <h3 className="text-xl font-bold">Geração de Currículo com IA</h3>
                  <p className="text-center text-gray-500 dark:text-gray-400">
                    Crie currículos personalizados para cada vaga com um clique, usando nossa IA avançada.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center space-y-4 p-6">
                  <Target className="h-12 w-12 text-purple-600" />
                  <h3 className="text-xl font-bold">Rastreamento de Candidaturas</h3>
                  <p className="text-center text-gray-500 dark:text-gray-400">
                    Acompanhe todas as suas candidaturas e status em um só lugar, nunca perca uma oportunidade.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center space-y-4 p-6">
                  <Rocket className="h-12 w-12 text-purple-600" />
                  <h3 className="text-xl font-bold">Otimização para ATS</h3>
                  <p className="text-center text-gray-500 dark:text-gray-400">
                    Aumente suas chances de passar pelos sistemas de rastreamento de candidatos (ATS) com currículos otimizados.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32 bg-purple-50">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12 text-purple-800">
              Como Funciona
            </h2>
            <div className="grid gap-8 items-center justify-center md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-purple-100 p-3 mb-4">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">1. Crie seu Perfil</h3>
                <p className="text-gray-600">Adicione suas informações profissionais e experiências.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-purple-100 p-3 mb-4">
                  <Zap className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">2. Gere Currículos com IA</h3>
                <p className="text-gray-600">Nossa IA cria currículos personalizados para cada vaga.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-purple-100 p-3 mb-4">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">3. Acompanhe seu Sucesso</h3>
                <p className="text-gray-600">Gerencie suas candidaturas e aumente suas chances de contratação.</p>
              </div>
            </div>
          </div>
        </section>
        <section id="pricing" className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12 text-purple-800">
              Planos e Preços
            </h2>
            <div className="max-w-3xl mx-auto text-center mb-8">
              <p className="text-lg text-gray-600 mb-4">
                Comece com um período de teste gratuito de 7 dias e escolha o plano que melhor atende às suas necessidades.
              </p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Recurso</TableHead>
                    <TableHead>Básico</TableHead>
                    <TableHead>Premium</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Currículos</TableCell>
                    <TableCell>10/mês</TableCell>
                    <TableCell>20/mês</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Perfis</TableCell>
                    <TableCell>3</TableCell>
                    <TableCell>Ilimitado</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Interações IA</TableCell>
                    <TableCell>10/mês</TableCell>
                    <TableCell>50/mês</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Acompanhamento de vagas</TableCell>
                    <TableCell>15/mês</TableCell>
                    <TableCell>Ilimitado</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Contatos</TableCell>
                    <TableCell>5/mês</TableCell>
                    <TableCell>Ilimitado</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-center space-x-4">
              <Button className="bg-purple-600 hover:bg-purple-700">Escolher Plano Básico</Button>
              <Button className="bg-purple-800 hover:bg-purple-900">Escolher Plano Premium</Button>
            </div>
          </div>
        </section>
        <section id="cta" className="w-full py-12 md:py-24 lg:py-32 bg-purple-600 text-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Pronto para impulsionar sua carreira?
                </h2>
                <p className="mx-auto max-w-[600px] text-purple-100 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Junte-se ao MeContrata.ai hoje e dê o primeiro passo em direção ao seu emprego dos sonhos.
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <form className="flex space-x-2">
                  <Input className="max-w-lg flex-1 bg-purple-50 text-purple-900" placeholder="Seu melhor email" type="email" />
                  <Link href="/auth-page">
                    <Button type="submit" className="bg-white text-purple-600 hover:bg-purple-100">
                      Criar sua conta grátis
                    </Button>
                  </Link>
                </form>
                <p className="text-xs text-purple-100">
                  Ao se inscrever, você concorda com nossos{" "}
                  <Link className="underline underline-offset-2" href="#">
                    Termos e Condições
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full py-6 bg-purple-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col gap-2 sm:flex-row items-center justify-between">
            <p className="text-xs text-gray-500">© 2024 MeContrata.ai - Todos os direitos reservados.</p>
            <nav className="flex gap-4 sm:gap-6">
              <Link className="text-xs hover:underline underline-offset-4" href="#">
                Termos de Serviço
              </Link>
              <Link className="text-xs hover:underline underline-offset-4" href="#">
                Privacidade
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  )
}