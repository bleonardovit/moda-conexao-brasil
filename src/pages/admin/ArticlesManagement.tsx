import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  getArticles, 
  getCategories,
  createArticle, 
  deleteArticle, 
  updateArticle, 
  publishArticle, 
  unpublishArticle 
} from '@/services/articleService';
import { Article, ArticleCategory, getCategoryLabel, getCategoryColors } from '@/types/article';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { AlertCircle, Edit, Eye, EyeOff, Loader2, Plus, Trash, Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ArticleCategoryManager } from '@/components/admin/ArticleCategoryManager';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { Switch } from '@/components/ui/switch';

export default function ArticlesManagement() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [imageUploaderOpen, setImageUploaderOpen] = useState(false);
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false);
  const { toast } = useToast();

  // Form state
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<string>('entrepreneurship');
  const [author, setAuthor] = useState('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [publishImmediately, setPublishImmediately] = useState(true);
  
  // Carregar categorias ao iniciar
  useEffect(() => {
    loadCategories();
  }, []);

  // Carregar artigos ao iniciar ou quando a categoria selecionada mudar
  useEffect(() => {
    loadArticles();
  }, [selectedCategory]);
  
  // Carregar categorias
  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const loadedCategories = await getCategories();
      setCategories(loadedCategories);
      
      // Se não houver categorias, definir categoria padrão
      if (loadedCategories.length > 0) {
        setCategory(loadedCategories[0].id);
      }
    } catch (error) {
      toast({
        title: "Erro ao carregar categorias",
        description: "Não foi possível carregar as categorias",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Carregar artigos
  const loadArticles = async () => {
    setIsLoading(true);
    try {
      const loadedArticles = await getArticles(selectedCategory);
      setArticles(loadedArticles);
    } catch (error) {
      toast({
        title: "Erro ao carregar artigos",
        description: "Não foi possível carregar a lista de artigos",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Reset do formulário
  const resetForm = () => {
    setTitle('');
    setSummary('');
    setContent('');
    setCategory(categories.length > 0 ? categories[0].id : 'entrepreneurship');
    setAuthor('');
    setImageUrl('');
    setPublishImmediately(true);
    setEditingArticle(null);
    setShowPreview(false);
  };
  
  // Abrir dialog para editar artigo
  const handleOpenEditDialog = (article: Article) => {
    setEditingArticle(article);
    setTitle(article.title);
    setSummary(article.summary);
    setContent(article.content);
    setCategory(article.category);
    setAuthor(article.author);
    setImageUrl(article.image_url || '');
    setPublishImmediately(article.published);
    setOpenDialog(true);
  };
  
  // Salvar artigo
  const handleSaveArticle = async () => {
    if (!title || !summary || !content || !category || !author) {
      toast({
        title: "Campos obrigatórios",
        description: "Todos os campos são obrigatórios",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const articleData = {
        title,
        summary,
        content,
        category,
        author,
        image_url: imageUrl,
        published: publishImmediately
      };

      let updatedArticle;
      
      if (editingArticle) {
        // Atualizar artigo existente
        updatedArticle = await updateArticle(editingArticle.id, articleData);
        
        if (updatedArticle) {
          // Atualizar lista local
          setArticles(articles.map(a => a.id === updatedArticle!.id ? updatedArticle! : a));
          
          toast({
            title: updatedArticle.published ? "Artigo atualizado e publicado" : "Rascunho atualizado",
            description: updatedArticle.published 
              ? "O artigo foi atualizado e está visível para os usuários" 
              : "O rascunho foi atualizado mas não está visível para os usuários"
          });
        }
      } else {
        // Criar novo artigo
        const newArticle = await createArticle(articleData);
        
        if (newArticle) {
          // Adicionar à lista local
          setArticles([...articles, newArticle]);
          
          toast({
            title: newArticle.published ? "Artigo publicado" : "Rascunho salvo",
            description: newArticle.published 
              ? "O artigo foi criado e está visível para os usuários" 
              : "O rascunho foi salvo mas não está visível para os usuários"
          });
        }
      }
      
      setOpenDialog(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Erro",
        description: `Ocorreu um erro ao ${editingArticle ? 'atualizar' : 'criar'} o artigo`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Excluir artigo
  const handleDeleteArticle = async (id: string) => {
    setIsLoading(true);
    try {
      const success = await deleteArticle(id);
      
      if (success) {
        // Atualizar lista local
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
    } finally {
      setIsLoading(false);
    }
  };
  
  // Alternar publicação do artigo
  const handleTogglePublish = async (article: Article) => {
    setIsLoading(true);
    try {
      let updatedArticle;
      
      if (article.published) {
        updatedArticle = await unpublishArticle(article.id);
        if (updatedArticle) {
          toast({
            title: "Artigo despublicado",
            description: "O artigo foi movido para rascunhos e não está mais visível para os usuários."
          });
        }
      } else {
        updatedArticle = await publishArticle(article.id);
        if (updatedArticle) {
          toast({
            title: "Artigo publicado",
            description: "O artigo foi publicado e agora está visível para os usuários."
          });
        }
      }
      
      if (updatedArticle) {
        // Atualizar lista local
        setArticles(articles.map(a => a.id === updatedArticle!.id ? updatedArticle! : a));
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao alterar o status de publicação do artigo",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filtrar artigos pela categoria selecionada
  const getFilteredArticles = () => {
    if (!selectedCategory) return articles;
    return articles.filter(article => article.category === selectedCategory);
  };

  // Handler para quando uma imagem é selecionada no ImageUploader
  const handleSelectImage = (url: string) => {
    setImageUrl(url);
    setImageUploaderOpen(false);
  };

  // Handler para quando as categorias são atualizadas
  const handleCategoriesUpdate = async (updatedCategories: ArticleCategory[]) => {
    setCategories(updatedCategories);
    // Recarregar artigos após atualização de categorias
    await loadArticles();
  };
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Gerenciamento de Artigos</h1>
            <p className="text-muted-foreground">Crie, edite e exclua artigos para o conteúdo exclusivo</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setCategoryManagerOpen(true)}
            >
              <Settings className="mr-2 h-4 w-4" /> Categorias
            </Button>
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger asChild>
                <Button className="bg-brand-purple hover:bg-brand-purple/90">
                  <Plus className="mr-2 h-4 w-4" /> Novo Artigo
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingArticle ? 'Editar' : 'Criar'} Artigo</DialogTitle>
                  <DialogDescription>
                    Preencha os campos abaixo para {editingArticle ? 'editar o' : 'criar um novo'} artigo.
                  </DialogDescription>
                </DialogHeader>
                
                <Tabs defaultValue="editor">
                  <div className="flex justify-between items-center mb-4">
                    <TabsList>
                      <TabsTrigger value="editor" onClick={() => setShowPreview(false)}>
                        <Edit className="h-4 w-4 mr-2" /> Editor
                      </TabsTrigger>
                      <TabsTrigger value="preview" onClick={() => setShowPreview(true)}>
                        <Eye className="h-4 w-4 mr-2" /> Preview
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value="editor" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="title">Título*</Label>
                        <Input 
                          id="title" 
                          value={title} 
                          onChange={(e) => setTitle(e.target.value)} 
                          placeholder="Título do artigo" 
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="category">Categoria*</Label>
                        <Select 
                          value={category} 
                          onValueChange={(value) => setCategory(value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                <span className={`inline-block w-2 h-2 rounded-full ${cat.color.split(' ')[0]} mr-2`}></span>
                                {cat.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="author">Autor*</Label>
                      <Input 
                        id="author" 
                        value={author} 
                        onChange={(e) => setAuthor(e.target.value)} 
                        placeholder="Nome do autor" 
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="image">Imagem de capa</Label>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setImageUploaderOpen(true)}
                        >
                          <Plus className="h-4 w-4 mr-2" /> Selecionar imagem
                        </Button>
                      </div>
                      {imageUrl && (
                        <div className="relative aspect-video rounded-md overflow-hidden border border-border">
                          <img 
                            src={imageUrl} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                            onError={() => {
                              toast({
                                title: "Erro ao carregar imagem",
                                description: "Verifique se a URL da imagem está correta",
                                variant: "destructive"
                              });
                            }}
                          />
                          <Button 
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 opacity-70 hover:opacity-100"
                            onClick={() => setImageUrl('')}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="summary">Resumo*</Label>
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
                      <Label htmlFor="content">Conteúdo (HTML)*</Label>
                      <Textarea 
                        id="content" 
                        value={content} 
                        onChange={(e) => setContent(e.target.value)} 
                        placeholder="Conteúdo em HTML do artigo"
                        className="resize-none font-mono text-sm"
                        rows={10}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="publish" 
                        checked={publishImmediately} 
                        onCheckedChange={setPublishImmediately} 
                      />
                      <Label htmlFor="publish" className="cursor-pointer">
                        {publishImmediately ? 'Publicar imediatamente' : 'Salvar como rascunho'}
                      </Label>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="preview">
                    {content ? (
                      <div className="border rounded-lg p-6 prose prose-sm max-w-none">
                        <h1 className="text-2xl font-bold mb-4">{title || 'Título do Artigo'}</h1>
                        {imageUrl && (
                          <img src={imageUrl} alt={title} className="w-full rounded-lg mb-4 max-h-80 object-cover" />
                        )}
                        <div dangerouslySetInnerHTML={{ __html: content }} />
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <AlertCircle className="mx-auto h-12 w-12 mb-4" />
                        <p>Sem conteúdo para visualizar.</p>
                        <p>Adicione algum conteúdo HTML para ver o preview.</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
                
                <DialogFooter className="mt-4">
                  <Button variant="outline" onClick={() => setOpenDialog(false)} disabled={isLoading}>Cancelar</Button>
                  <Button onClick={handleSaveArticle} disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {publishImmediately 
                      ? (editingArticle ? 'Atualizar e publicar' : 'Criar e publicar') 
                      : (editingArticle ? 'Salvar rascunho' : 'Salvar como rascunho')
                    }
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="list">Lista de Artigos</TabsTrigger>
            <TabsTrigger value="categories">Categorias</TabsTrigger>
          </TabsList>
          
          <TabsContent value="list" className="mt-6">
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Filtrar por categoria</h3>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant={!selectedCategory ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(undefined)}
                  className={!selectedCategory ? "bg-brand-purple text-white" : ""}
                >
                  Todos ({articles.length})
                </Button>
                
                {categories.map((category) => {
                  const count = articles.filter(a => a.category === category.id).length;
                  return (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                      className={selectedCategory === category.id ? "bg-brand-purple text-white" : ""}
                    >
                      {category.label} ({count})
                    </Button>
                  );
                })}
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-brand-purple" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getFilteredArticles().map(article => (
                    <Card key={article.id} className="group hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <div className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getCategoryColors(article.category, categories)}`}>
                                {getCategoryLabel(article.category, categories)}
                              </div>
                              <div className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                                article.published 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {article.published 
                                  ? <><Eye className="mr-1 h-3 w-3" />Publicado</>
                                  : <><EyeOff className="mr-1 h-3 w-3" />Rascunho</>
                                }
                              </div>
                            </div>
                            <CardTitle className="text-xl line-clamp-1">{article.title}</CardTitle>
                          </div>
                        </div>
                        <CardDescription className="flex justify-between">
                          <span>{article.author}</span>
                          <span className="text-xs opacity-70">
                            {new Date(article.created_at).toLocaleDateString('pt-BR')}
                          </span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {article.image_url && (
                          <div className="w-full h-32 mb-3 rounded-md overflow-hidden">
                            <img 
                              src={article.image_url} 
                              alt={article.title} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <p className="text-sm line-clamp-2 mb-4">{article.summary}</p>
                      </CardContent>
                      <CardFooter className="flex flex-wrap gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1" 
                          onClick={() => handleOpenEditDialog(article)}
                        >
                          <Edit className="mr-2 h-4 w-4" /> Editar
                        </Button>
                        
                        <Button
                          size="sm"
                          variant={article.published ? "outline" : "default"}
                          className={`flex-1 ${article.published ? "" : "bg-green-600 hover:bg-green-700"}`}
                          onClick={() => handleTogglePublish(article)}
                        >
                          {article.published ? (
                            <><EyeOff className="mr-2 h-4 w-4" />Despublicar</>
                          ) : (
                            <><Eye className="mr-2 h-4 w-4" />Publicar</>
                          )}
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
                                Tem certeza que deseja excluir o artigo "{article.title}"? Esta ação não pode ser desfeita.
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
                      </CardFooter>
                    </Card>
                  ))}
                </div>
                
                {getFilteredArticles().length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-lg text-muted-foreground mb-2">
                      {selectedCategory 
                        ? `Nenhum artigo encontrado na categoria ${getCategoryLabel(selectedCategory, categories)}.` 
                        : 'Nenhum artigo cadastrado.'}
                    </p>
                    <Button 
                      className="mt-4" 
                      onClick={() => setOpenDialog(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Criar novo artigo
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>
          
          <TabsContent value="categories" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => {
                const categoryArticles = articles.filter(a => a.category === cat.id);
                const publishedCount = categoryArticles.filter(a => a.published).length;
                const draftCount = categoryArticles.length - publishedCount;
                
                return (
                  <Card key={cat.id}>
                    <CardHeader>
                      <div className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${cat.color} mb-2`}>
                        {cat.label}
                      </div>
                      <CardTitle className="flex justify-between items-center">
                        <span>{cat.label}</span>
                        <span className="text-lg font-normal bg-secondary rounded-full w-8 h-8 flex items-center justify-center">
                          {categoryArticles.length}
                        </span>
                      </CardTitle>
                      <CardDescription>
                        {categoryArticles.length === 1
                          ? '1 artigo nesta categoria'
                          : `${categoryArticles.length} artigos nesta categoria`}
                        {categoryArticles.length > 0 && (
                          <div className="mt-1 text-xs">
                            <span className="text-green-600 flex items-center">
                              <Eye className="h-3 w-3 mr-1" /> {publishedCount} publicados
                            </span>
                            <span className="text-amber-600 flex items-center">
                              <EyeOff className="h-3 w-3 mr-1" /> {draftCount} rascunhos
                            </span>
                          </div>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {categoryArticles.length > 0 ? (
                        <ul className="space-y-1 text-sm">
                          {categoryArticles.slice(0, 3).map(article => (
                            <li key={article.id} className="truncate flex items-center">
                              <span className={`w-2 h-2 rounded-full mr-2 ${article.published ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                              {article.title}
                            </li>
                          ))}
                          {categoryArticles.length > 3 && (
                            <li className="text-muted-foreground text-xs">
                              + {categoryArticles.length - 3} outros artigos...
                            </li>
                          )}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">Nenhum artigo nesta categoria.</p>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => setSelectedCategory(cat.id)}
                      >
                        Ver artigos
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal de gerenciamento de categorias */}
      <Dialog open={categoryManagerOpen} onOpenChange={setCategoryManagerOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Gerenciar categorias</DialogTitle>
            <DialogDescription>
              Adicione, edite ou remova categorias para os artigos.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <ArticleCategoryManager 
              categories={categories} 
              onCategoriesChange={handleCategoriesUpdate} 
              onClose={() => setCategoryManagerOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de upload/seleção de imagem */}
      <ImageUploader
        open={imageUploaderOpen}
        onClose={() => setImageUploaderOpen(false)}
        onSelectImage={handleSelectImage}
        currentImageUrl={imageUrl}
      />
    </AdminLayout>
  );
}
