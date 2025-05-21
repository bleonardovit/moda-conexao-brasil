import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, Building, UserPlus, Loader2 } from "lucide-react"; // Changed from Icons
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
// import { useAuth } from "@/hooks/useAuth" // supabase will be imported directly
import { supabase } from "@/integrations/supabase/client"; // Import supabase directly
import { startUserTrial } from '@/services/trialService';
const FormSchema = z.object({
  name: z.string().min(2, {
    message: "Nome deve ter pelo menos 2 caracteres."
  }),
  email: z.string().email({
    message: "Email inválido."
  }),
  password: z.string().min(8, {
    message: "Senha deve ter pelo menos 8 caracteres."
  })
});
const Register = () => {
  const {
    toast
  } = useToast();
  // const { supabase } = useAuth() // Removed: supabase not exposed by useAuth
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null); // Keep local error state for direct Supabase calls

  const {
    register,
    handleSubmit: reactHookFormHandleSubmit,
    // Renamed to avoid conflict
    formState: {
      errors
    }
  } = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: ""
    }
  });

  // Renamed this function to avoid conflict with react-hook-form's handleSubmit
  const onFormSubmit = async (values: z.infer<typeof FormSchema>) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const {
        data,
        error: signUpError
      } = await supabase.auth.signUp({
        // Use supabase directly
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.name
          }
        }
      });
      if (signUpError) throw signUpError;
      if (data?.user) {
        // Auto-start trial for new user
        await startUserTrial(data.user.id);
        toast({
          title: "Conta criada com sucesso!",
          description: "Você receberá um email para confirmar seu cadastro"
        });
        navigate("/auth/login");
      } else if (!data.session && !data.user) {
        // Handle cases like user already exists but email not confirmed if needed
        // For now, assuming any non-error without user means something unexpected
        throw new Error("Não foi possível criar a conta. O usuário pode já existir ou o email precisa ser confirmado.");
      }
    } catch (err: any) {
      console.log('Error signing up:', err);
      const errorMessage = err.message || "Ocorreu um erro ao criar a conta.";
      setError(errorMessage);
      toast({
        title: "Erro ao criar a conta",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return <div className="container relative hidden h-[calc(100vh-80px)] flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0 bg-violet-500">
      <Link to="/auth/login" className={cn("absolute left-4 top-4 md:left-8 md:top-8", "text-muted-foreground hover:text-brand-600")}>
        <ChevronLeft className="mr-2 h-4 w-4" /> {/* Changed from Icons.chevronLeft */}
        Voltar
      </Link>
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex">
        <div className="absolute inset-0 bg-gray-950" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Building className="mr-2 h-6 w-6" /> {/* Changed from Icons.logo */}
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
            <UserPlus className="mx-auto h-6 w-6" /> {/* Changed from Icons.logo */}
            <h1 className="text-2xl font-semibold tracking-tight">
              Crie sua conta
            </h1>
            <p className="text-sm text-muted-foreground">
              Entre com suas credenciais abaixo
            </p>
          </div>
          {/* Updated form onSubmit to use the renamed reactHookFormHandleSubmit and onFormSubmit */}
          <form onSubmit={reactHookFormHandleSubmit(onFormSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" placeholder="Seu nome" type="text" autoComplete="name" required {...register("name")} />
              {errors?.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" placeholder="seuemail@email.com" type="email" autoComplete="email" required {...register("email")} />
              {errors?.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" placeholder="Senha" type="password" autoComplete="new-password" required {...register("password")} />
              {errors?.password && <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>}
            </div>
            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
            <Button disabled={isSubmitting} type="submit" className="w-full">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" /> /* Changed from Icons.spinner */}
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
    </div>;
};
export default Register;