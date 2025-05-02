
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Camera, 
  ImagePlus, 
  Link as LinkIcon, 
  Upload, 
  X, 
  Image as ImageIcon 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// URLs de imagens simuladas que já estão na "biblioteca"
const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1649972904349-6e44c42644a7',
  'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b',
  'https://images.unsplash.com/photo-1518770660439-4636190af475',
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6',
  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158'
];

interface ImageUploaderProps {
  open: boolean;
  onClose: () => void;
  onSelectImage: (url: string) => void;
  currentImageUrl?: string;
}

export function ImageUploader({ open, onClose, onSelectImage, currentImageUrl }: ImageUploaderProps) {
  const [activeTab, setActiveTab] = useState('upload');
  const [urlInput, setUrlInput] = useState(currentImageUrl || '');
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [uploadedImageBase64, setUploadedImageBase64] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Reset state when dialog opens
  React.useEffect(() => {
    if (open) {
      setUrlInput(currentImageUrl || '');
      setPreviewUrl(currentImageUrl || null);
      setUploadedImageBase64(null);
      setActiveTab(currentImageUrl ? 'url' : 'upload');
    }
  }, [open, currentImageUrl]);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrlInput(e.target.value);
  };

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) {
      toast({
        title: "URL inválida",
        description: "Por favor, insira uma URL válida",
        variant: "destructive",
      });
      return;
    }

    // Simula o teste da URL
    setPreviewUrl(urlInput);
  };

  const handleConfirmSelection = () => {
    let finalImageUrl = '';
    
    if (activeTab === 'upload' && uploadedImageBase64) {
      finalImageUrl = uploadedImageBase64;
    } else if (activeTab === 'url' && previewUrl) {
      finalImageUrl = previewUrl;
    } else if (activeTab === 'library' && previewUrl) {
      finalImageUrl = previewUrl;
    }
    
    if (finalImageUrl) {
      onSelectImage(finalImageUrl);
      onClose();
    } else {
      toast({
        title: "Nenhuma imagem selecionada",
        description: "Por favor, selecione uma imagem antes de confirmar",
        variant: "destructive",
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Verifica se é uma imagem
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Formato inválido",
        description: "Por favor, selecione um arquivo de imagem válido",
        variant: "destructive",
      });
      return;
    }
    
    // Verifica o tamanho do arquivo (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB em bytes
    if (file.size > maxSize) {
      toast({
        title: "Arquivo muito grande",
        description: "O tamanho máximo permitido é 5MB",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    
    // Simula o upload convertendo para base64
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImageBase64(event.target?.result as string);
      setPreviewUrl(event.target?.result as string);
      setIsUploading(false);
      
      toast({
        title: "Upload concluído",
        description: "Sua imagem foi carregada com sucesso",
      });
    };
    reader.onerror = () => {
      toast({
        title: "Erro no upload",
        description: "Ocorreu um erro ao processar a imagem",
        variant: "destructive",
      });
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleLibrarySelect = (url: string) => {
    setPreviewUrl(url);
  };

  const clearPreview = () => {
    setPreviewUrl(null);
    setUploadedImageBase64(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>Selecionar imagem</DialogTitle>
          <DialogDescription>
            Faça upload de uma imagem, insira uma URL ou selecione da biblioteca.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={activeTab} className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="upload">
              <Upload className="h-4 w-4 mr-2" /> Upload
            </TabsTrigger>
            <TabsTrigger value="url">
              <LinkIcon className="h-4 w-4 mr-2" /> URL
            </TabsTrigger>
            <TabsTrigger value="library">
              <ImageIcon className="h-4 w-4 mr-2" /> Biblioteca
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <div 
              className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept="image/*"
                ref={fileInputRef}
              />
              <Camera className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm font-medium mb-1">Clique para fazer upload</p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG ou GIF (máximo 5MB)
              </p>
              {isUploading && <div className="mt-4 text-sm">Processando...</div>}
            </div>
          </TabsContent>

          <TabsContent value="url" className="space-y-4">
            <div className="flex items-center space-x-2">
              <Input
                value={urlInput}
                onChange={handleUrlChange}
                placeholder="https://exemplo.com/imagem.jpg"
              />
              <Button onClick={handleUrlSubmit} type="button">Testar</Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Insira a URL de uma imagem pública. Certifique-se de ter permissão para usá-la.
            </p>
          </TabsContent>
          
          <TabsContent value="library" className="space-y-4">
            <ScrollArea className="h-[200px]">
              <div className="grid grid-cols-3 gap-4">
                {SAMPLE_IMAGES.map((url, index) => (
                  <div 
                    key={index}
                    className={`aspect-video rounded-md overflow-hidden cursor-pointer border-2 ${previewUrl === url ? 'border-brand-purple' : 'border-transparent'}`}
                    onClick={() => handleLibrarySelect(url)}
                  >
                    <img 
                      src={url} 
                      alt={`Imagem biblioteca ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>
            <p className="text-xs text-muted-foreground">
              Selecione uma imagem da biblioteca de exemplo.
            </p>
          </TabsContent>
        </Tabs>

        {previewUrl && (
          <div className="mt-4">
            <div className="text-sm font-medium mb-2">Preview:</div>
            <div className="relative aspect-video rounded-md overflow-hidden border">
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="w-full h-full object-cover"
                onError={() => {
                  toast({
                    title: "Erro ao carregar imagem",
                    description: "A URL fornecida não é válida ou a imagem não está acessível",
                    variant: "destructive",
                  });
                  setPreviewUrl(null);
                }}
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8"
                onClick={clearPreview}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button 
            onClick={handleConfirmSelection}
            disabled={!previewUrl || isUploading}
          >
            Selecionar imagem
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
