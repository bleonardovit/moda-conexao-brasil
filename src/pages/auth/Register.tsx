import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useToast } from "@/hooks/use-toast"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/hooks/useAuth"
import { startUserTrial } from '@/services/trialService';

const FormSchema = z.object({
  name: z.string().min(2, {
    message: "Nome deve ter pelo menos 2 caracteres.",
  }),
  email: z.string().email({
    message: "Email inválido.",
  }),
  password: z.string().min(8, {
    message: "Senha deve ter pelo menos 8 caracteres.",
  }),
})

const Register = () => {
  const { toast } = useToast()
  const { supabase } = useAuth()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })

  const handleSubmit = async (values: z.infer<typeof FormSchema>) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.name,
          },
        }
      });
      
      if (error) throw error;
      
      if (data?.user) {
        // Auto-start trial for new user
        await startUserTrial(data.user.id);
        
        toast({
          title: "Conta criada com sucesso!",
          description: "Você receberá um email para confirmar seu cadastro",
        });
        
        navigate("/auth/login");
      }
    } catch (error: any) {
      console.log('Error signing up:', error)
      setError(error.message || "Ocorreu um erro ao criar a conta.");
      toast({
        title: "Erro ao criar a conta",
        description: error.message || "Ocorreu um erro ao criar a conta.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container relative hidden h-[calc(100vh-80px)] flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <Link
        to="/auth/login"
        className={cn(
          "absolute left-4 top-4 md:left-8 md:top-8",
          "text-muted-foreground hover:text-brand-600"
        )}
      >
        <Icons.chevronLeft className="mr-2 h-4 w-4" />
        Voltar
      </Link>
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex">
        <div className="absolute inset-0 bg-zinc-900/80" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Icons.logo className="mr-2 h-6 w-6" />
          Fornecedores
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;Descubra os melhores fornecedores para impulsionar o seu
              negócio.&rdquo;
            </p>
            <footer className="text-sm"></footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <Icons.logo className="mx-auto h-6 w-6" />
            <h1 className="text-2xl font-semibold tracking-tight">
              Crie sua conta
            </h1>
            <p className="text-sm text-muted-foreground">
              Entre com suas credenciais abaixo
            </p>
          </div>
          <form onSubmit={handleSubmit(handleSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                placeholder="Seu nome"
                type="text"
                required
                {...register("name")}
              />
              {errors?.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="seuemail@email.com"
                type="email"
                required
                {...register("email")}
              />
              {errors?.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                placeholder="Senha"
                type="password"
                required
                {...register("password")}
              />
              {errors?.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>
            <Button disabled={isSubmitting} type="submit" className="w-full">
              {isSubmitting && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Criar conta
            </Button>
          </form>
          <Separator />
          <div className="text-center">
            <Link to="/auth/login" className="hover:underline">
              Já tem uma conta?
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
