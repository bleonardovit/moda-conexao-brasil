
import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getArticles, createArticle, deleteArticle } from '@/services/articleService';
import { Article, ArticleCategory, CATEGORY_LABELS } from '@/types/article';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Plus, Trash } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export default function ArticlesManagement() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const { toast } = useToast();
  
  // Form state
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<ArticleCategory>('entrepreneurship');
  const [author, setAuthor] = useState('');
  
  useEffect(() => {
    // Load articles
    const loadedArticles = getArticles();
    setArticles(loadedArticles);
  }, []);
  
  const resetForm = () => {
    setTitle('');
    setSummary('');
    setContent('');
    setCategory('entrepreneurship');
    setAuthor('');
  };
  
  const handleCreateArticle = () => {
    if (!title || !summary || !content || !category || !author) {
      toast({
        title: "Campos obrigatórios",
        description: "Todos os campos são obrigatórios",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const newArticle = createArticle({
        title,
        summary,
        content,
        category,
        author
      });
      
      setArticles([...articles, newArticle]);
      
      toast({
        title: "Artigo criado",
        description: "O artigo foi criado com sucesso!"
      });
      
      setOpenDialog(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao criar o artigo",
        variant: "destructive"
      });
    }
  };
  
  const handleDeleteArticle = (id: string) => {
    try {
      const success = deleteArticle(id);
      
      if (success) {
        setArticles(articles.filter(article => article.id !== id));
        
        toast({
          title: "Artigo excluído",
          description: "O artigo foi excluído com sucesso!"
        });
      } else {
        toast({
          title: "Erro",
          description: "Artigo não encontrado",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao excluir o artigo",
        variant: "destructive"
      });
    }
  };
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Gerenciamento de Artigos</h1>
            <p className="text-muted-foreground">Crie, edite e exclua artigos para o conteúdo exclusivo</p>
          </div>
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button className="bg-brand-purple hover:bg-brand-purple/90">
                <Plus className="mr-2 h-4 w-4" /> Novo Artigo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Criar Artigo</DialogTitle>
                <DialogDescription>
                  Preencha os campos abaixo para criar um novo artigo.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Título</Label>
                  <Input 
                    id="title" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    placeholder="Título do artigo" 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select 
                    value={category} 
                    onValueChange={(value) => setCategory(value as ArticleCategory)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="author">Autor</Label>
                  <Input 
                    id="author" 
                    value={author} 
                    onChange={(e) => setAuthor(e.target.value)} 
                    placeholder="Nome do autor" 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="summary">Resumo</Label>
                  <Textarea 
                    id="summary" 
                    value={summary} 
                    onChange={(e) => setSummary(e.target.value)} 
                    placeholder="Breve resumo do artigo"
                    className="resize-none"
                    rows={2}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="content">Conteúdo (HTML)</Label>
                  <Textarea 
                    id="content" 
                    value={content} 
                    onChange={(e) => setContent(e.target.value)} 
                    placeholder="Conteúdo em HTML do artigo"
                    className="resize-none font-mono text-sm"
                    rows={10}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenDialog(false)}>Cancelar</Button>
                <Button onClick={handleCreateArticle}>Criar Artigo</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="list">Lista de Artigos</TabsTrigger>
            <TabsTrigger value="categories">Categorias</TabsTrigger>
          </TabsList>
          <TabsContent value="list" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {articles.map(article => (
                <Card key={article.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <div>
                        <div className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-secondary mb-2">
                          {CATEGORY_LABELS[article.category]}
                        </div>
                        <CardTitle className="text-xl line-clamp-1">{article.title}</CardTitle>
                      </div>
                    </div>
                    <CardDescription>{article.author}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm line-clamp-2 mb-4">{article.summary}</p>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Edit className="mr-2 h-4 w-4" /> Editar
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive" className="flex-1">
                            <Trash className="mr-2 h-4 w-4" /> Excluir
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir este artigo? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteArticle(article.id)}>
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {articles.length === 0 && (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">Nenhum artigo cadastrado.</p>
                <Button 
                  className="mt-4" 
                  onClick={() => setOpenDialog(true)}
                >
                  <Plus className="mr-2 h-4 w-4" /> Criar primeiro artigo
                </Button>
              </div>
            )}
          </TabsContent>
          <TabsContent value="categories" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(CATEGORY_LABELS).map(([key, value]) => (
                <Card key={key}>
                  <CardHeader>
                    <CardTitle>{value}</CardTitle>
                    <CardDescription>
                      {articles.filter(a => a.category === key).length} artigos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">
                      Ver artigos
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
