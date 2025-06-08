
import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, Eye, EyeOff } from 'lucide-react';
import { useSEOSettings } from '@/hooks/use-seo-settings';
import { SEOPreview } from '@/components/admin/seo/SEOPreview';
import { SEOUpdateData } from '@/types/seo';

const SEOManagement: React.FC = () => {
  const { seoSettings, isLoading, updateSEOSettings, isUpdating } = useSEOSettings();
  const [showPreview, setShowPreview] = useState(true);
  const [formData, setFormData] = useState<SEOUpdateData>({
    site_title: '',
    site_description: '',
    site_image_url: '',
    site_url: '',
    site_name: '',
    author: '',
    keywords: [],
    twitter_handle: '',
    facebook_app_id: '',
  });

  useEffect(() => {
    if (seoSettings) {
      setFormData({
        site_title: seoSettings.site_title,
        site_description: seoSettings.site_description,
        site_image_url: seoSettings.site_image_url || '',
        site_url: seoSettings.site_url,
        site_name: seoSettings.site_name,
        author: seoSettings.author || '',
        keywords: seoSettings.keywords,
        twitter_handle: seoSettings.twitter_handle || '',
        facebook_app_id: seoSettings.facebook_app_id || '',
      });
    }
  }, [seoSettings]);

  const handleInputChange = (field: keyof SEOUpdateData, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleKeywordsChange = (value: string) => {
    const keywords = value.split(',').map(keyword => keyword.trim()).filter(Boolean);
    handleInputChange('keywords', keywords);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSEOSettings(formData);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Configurações de SEO</h1>
            <p className="text-muted-foreground">
              Gerencie como seu site aparece quando compartilhado em redes sociais
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2"
          >
            {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showPreview ? 'Ocultar Preview' : 'Mostrar Preview'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulário */}
          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
              <CardDescription>
                Configure as informações que aparecerão quando seu site for compartilhado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="site_title">Título do Site</Label>
                  <Input
                    id="site_title"
                    value={formData.site_title}
                    onChange={(e) => handleInputChange('site_title', e.target.value)}
                    placeholder="Título que aparecerá no compartilhamento"
                    maxLength={60}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.site_title.length}/60 caracteres (recomendado até 60)
                  </p>
                </div>

                <div>
                  <Label htmlFor="site_description">Descrição do Site</Label>
                  <Textarea
                    id="site_description"
                    value={formData.site_description}
                    onChange={(e) => handleInputChange('site_description', e.target.value)}
                    placeholder="Descrição que aparecerá no compartilhamento"
                    maxLength={160}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.site_description.length}/160 caracteres (recomendado até 160)
                  </p>
                </div>

                <div>
                  <Label htmlFor="site_image_url">URL da Imagem</Label>
                  <Input
                    id="site_image_url"
                    type="url"
                    value={formData.site_image_url}
                    onChange={(e) => handleInputChange('site_image_url', e.target.value)}
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Imagem que aparecerá no compartilhamento (recomendado 1200x630px)
                  </p>
                </div>

                <div>
                  <Label htmlFor="site_url">URL do Site</Label>
                  <Input
                    id="site_url"
                    type="url"
                    value={formData.site_url}
                    onChange={(e) => handleInputChange('site_url', e.target.value)}
                    placeholder="https://seusite.com"
                  />
                </div>

                <div>
                  <Label htmlFor="site_name">Nome do Site</Label>
                  <Input
                    id="site_name"
                    value={formData.site_name}
                    onChange={(e) => handleInputChange('site_name', e.target.value)}
                    placeholder="Nome da sua marca/empresa"
                  />
                </div>

                <div>
                  <Label htmlFor="keywords">Palavras-chave</Label>
                  <Input
                    id="keywords"
                    value={formData.keywords.join(', ')}
                    onChange={(e) => handleKeywordsChange(e.target.value)}
                    placeholder="palavra1, palavra2, palavra3"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Separe as palavras-chave com vírgulas
                  </p>
                </div>

                <div>
                  <Label htmlFor="author">Autor</Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) => handleInputChange('author', e.target.value)}
                    placeholder="Nome do autor/empresa"
                  />
                </div>

                <div>
                  <Label htmlFor="twitter_handle">Handle do Twitter</Label>
                  <Input
                    id="twitter_handle"
                    value={formData.twitter_handle}
                    onChange={(e) => handleInputChange('twitter_handle', e.target.value)}
                    placeholder="@seutwitter"
                  />
                </div>

                <div>
                  <Label htmlFor="facebook_app_id">Facebook App ID</Label>
                  <Input
                    id="facebook_app_id"
                    value={formData.facebook_app_id}
                    onChange={(e) => handleInputChange('facebook_app_id', e.target.value)}
                    placeholder="123456789"
                  />
                </div>

                <Button type="submit" disabled={isUpdating} className="w-full">
                  {isUpdating ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Salvar Configurações
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Preview */}
          {showPreview && seoSettings && (
            <SEOPreview settings={{...seoSettings, ...formData}} />
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default SEOManagement;
