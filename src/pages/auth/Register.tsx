import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form"; // Adicionado Controller
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, UserPlus, Loader2, Mail, Lock, User, Phone, MapPin, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { startUserTrial } from '@/services/trialService';
import { brazilianStates } from "@/data/brazilian-states";
const FormSchema = z.object({
  name: z.string().min(2, {
    message: "Nome deve ter pelo menos 2 caracteres."
  }),
  email: z.string().email({
    message: "Email inválido."
  }),
  password: z.string().min(8, {
    message: "Senha deve ter pelo menos 8 caracteres."
  }),
  confirmPassword: z.string().min(8, {
    message: "Confirmação de senha deve ter pelo menos 8 caracteres."
  }),
  phone: z.string().min(10, {
    message: "Telefone inválido. Use (XX) XXXXX-XXXX."
  }).regex(/^\(\d{2}\) \d{5}-\d{4}$/, {
    message: "Formato de telefone inválido. Use (XX) XXXXX-XXXX."
  }),
  city: z.string().min(2, {
    message: "Cidade deve ter pelo menos 2 caracteres."
  }),
  state: z.string().min(2, {
    message: "Selecione um estado."
  })
}).refine(data => data.password === data.confirmPassword, {
  message: "As senhas não coincidem.",
  path: ["confirmPassword"]
});
const Register = () => {
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      city: "",
      state: ""
    }
  });
  const {
    register,
    handleSubmit,
    control,
    formState: {
      errors
    }
  } = form;

  // Mask for phone input (XX) XXXXX-XXXX
  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.substring(0, 11);
    let maskedValue = '';
    if (value.length > 0) {
      maskedValue = '(' + value.substring(0, 2);
    }
    if (value.length > 2) {
      maskedValue += ') ' + value.substring(2, 7);
    }
    if (value.length > 7) {
      maskedValue += '-' + value.substring(7, 11);
    }
    event.target.value = maskedValue;
    form.setValue('phone', maskedValue, {
      shouldValidate: true
    });
  };
  const onFormSubmit = async (values: z.infer<typeof FormSchema>) => {
    setIsSubmitting(true);
    setApiError(null);
    try {
      const {
        data,
        error: signUpError
      } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.name,
            phone: values.phone,
            city: values.city,
            state: values.state
          }
        }
      });
      if (signUpError) throw signUpError;
      if (data?.user) {
        await startUserTrial(data.user.id);
        toast({
          title: "Conta criada com sucesso!",
          description: "Você receberá um email para confirmar seu cadastro."
        });
        navigate("/auth/select-plan"); // Navigate to plan selection
      } else {
        throw new Error("Não foi possível criar a conta. Verifique os dados ou tente novamente.");
      }
    } catch (err: any) {
      console.error('Error signing up:', err);
      const errorMessage = err.message?.includes("User already registered") ? "Este email já está cadastrado. Tente fazer login." : err.message || "Ocorreu um erro ao criar a conta.";
      setApiError(errorMessage);
      toast({
        title: "Erro ao criar a conta",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return <div style={{
    backgroundColor: '#6d28d9' /* purple-700 */
  }} className="flex min-h-screen items-center justify-center px-4 py-12 bg-[#a164f1]">
      <Link to="/auth/login" className="absolute left-4 top-4 text-slate-200 hover:text-white md:left-8 md:top-8 flex items-center">
        <ChevronLeft className="mr-2 h-4 w-4" />
        Voltar para Login
      </Link>
      <Card className="w-full max-w-lg bg-slate-900 shadow-2xl rounded-xl border-slate-700">
        <CardHeader className="space-y-1 text-center p-6 sm:p-8">
          <UserPlus className="mx-auto h-8 w-8 text-brand-purple" />
          <CardTitle className="text-3xl font-bold text-slate-50">Crie sua Conta</CardTitle>
          <CardDescription className="text-base text-slate-400">
            Preencha os campos abaixo para se registrar.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onFormSubmit)}>
          <CardContent className="space-y-4 p-6 sm:p-8">
            {apiError && <div className="bg-red-700/30 border border-red-600/50 text-red-200 px-4 py-3 rounded-md text-sm text-center">
                {apiError}
              </div>}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-300">Nome Completo</Label>
              <div className="relative flex items-center">
                <User className="absolute left-3 h-5 w-5 text-slate-400" />
                <Input id="name" placeholder="Seu nome completo" {...register("name")} className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-brand-purple/50" />
              </div>
              {errors.name && <p className="text-sm text-red-400">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">Email</Label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3 h-5 w-5 text-slate-400" />
                <Input id="email" type="email" placeholder="seu@email.com" {...register("email")} className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-brand-purple/50" />
              </div>
              {errors.email && <p className="text-sm text-red-400">{errors.email.message}</p>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">Senha</Label>
                 <div className="relative flex items-center">
                  <Lock className="absolute left-3 h-5 w-5 text-slate-400" />
                  <Input id="password" type="password" placeholder="Crie uma senha forte" {...register("password")} className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-brand-purple/50" />
                </div>
                {errors.password && <p className="text-sm text-red-400">{errors.password.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-300">Confirmar Senha</Label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3 h-5 w-5 text-slate-400" />
                  <Input id="confirmPassword" type="password" placeholder="Confirme sua senha" {...register("confirmPassword")} className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-brand-purple/50" />
                </div>
                {errors.confirmPassword && <p className="text-sm text-red-400">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-slate-300">Telefone</Label>
              <div className="relative flex items-center">
                <Phone className="absolute left-3 h-5 w-5 text-slate-400" />
                <Input id="phone" placeholder="(XX) XXXXX-XXXX" {...register("phone")} onChange={handlePhoneChange} className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-brand-purple/50" />
              </div>
              {errors.phone && <p className="text-sm text-red-400">{errors.phone.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-slate-300">Cidade</Label>
                <div className="relative flex items-center">
                  <MapPin className="absolute left-3 h-5 w-5 text-slate-400" />
                  <Input id="city" placeholder="Sua cidade" {...register("city")} className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-brand-purple/50" />
                </div>
                {errors.city && <p className="text-sm text-red-400">{errors.city.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="state" className="text-slate-300">Estado</Label>
                 <Controller name="state" control={control} render={({
                field
              }) => <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger className="w-full bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:ring-brand-purple/50 data-[placeholder]:text-slate-500">
                           <div className="flex items-center">
                            <Building className="absolute left-3 h-5 w-5 text-slate-400" /> {/* Icon */}
                            <SelectValue placeholder="Selecione seu estado" className="pl-8" /> {/* Adjusted pl for icon */}
                           </div>
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700 text-white">
                          {brazilianStates.map(s => <SelectItem key={s.value} value={s.value} className="hover:bg-slate-700 focus:bg-slate-700">
                              {s.label}
                            </SelectItem>)}
                        </SelectContent>
                      </Select>} />
                {errors.state && <p className="text-sm text-red-400">{errors.state.message}</p>}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 p-6 sm:p-8">
            <Button type="submit" className="w-full bg-gradient-to-r from-brand-purple to-brand-pink hover:opacity-90 transition-opacity text-white" disabled={isSubmitting}>
              {isSubmitting ? <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando conta...
                </> : "Criar Conta"}
            </Button>
            <div className="text-center text-sm text-slate-400">
              Já tem uma conta?{' '}
              <Link to="/auth/login" className="font-semibold text-brand-purple hover:text-brand-pink transition-colors">
                Faça Login
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>;
};
export default Register;