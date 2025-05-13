
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Pencil, RotateCcw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useImageEditor, LandingPageImages } from '@/hooks/use-image-editor';

// Mocking the ImageUploader component since we can't modify it
// In a real situation, this should be imported from the admin components
const ImageUploader = ({ 
  open, 
  onClose, 
  onSelectImage, 
  currentImageUrl 
}: { 
  open: boolean;
  onClose: () => void;
  onSelectImage: (url: string) => void;
  currentImageUrl?: string;
}) => {
  // This is a simple mock implementation
  return open ? (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Image</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2">
            {['https://images.unsplash.com/photo-1557804506-669a67965ba0', 
              'https://images.unsplash.com/photo-1551650975-87deedd944c3',
              'https://images.unsplash.com/photo-1618761714954-0b8cd0026356',
              'https://images.unsplash.com/photo-1616469829941-c7200edec809'].map(url => (
              <div 
                key={url} 
                className="cursor-pointer border rounded-md overflow-hidden"
                onClick={() => onSelectImage(url)}
              >
                <img src={url} alt="Sample" className="w-full h-32 object-cover" />
              </div>
            ))}
          </div>
          <Button onClick={onClose} variant="outline">Cancel</Button>
        </div>
      </DialogContent>
    </Dialog>
  ) : null;
};

interface ImageEditorProps {
  isAdmin?: boolean;
}

export const ImageEditor = ({ isAdmin = false }: ImageEditorProps) => {
  const { getImages, updateImage, resetToDefaults, isLoading } = useImageEditor();
  const [open, setOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<keyof LandingPageImages | null>(null);
  const [imageUploaderOpen, setImageUploaderOpen] = useState(false);
  const { user } = useAuth();
  
  // Make sure user is defined before checking its properties
  const userIsAdmin = user?.role === 'admin';
  
  // If not admin, don't render the editor button
  if (!userIsAdmin && isAdmin) return null;
  
  const images = getImages();
  
  const handleOpenChangeUploader = (open: boolean) => {
    if (!open) {
      setImageUploaderOpen(false);
    }
  };
  
  const handleUpdateImage = (url: string) => {
    if (editingKey) {
      updateImage(editingKey, url);
      setImageUploaderOpen(false);
      setEditingKey(null);
    }
  };
  
  const handleEditImage = (key: keyof LandingPageImages) => {
    setEditingKey(key);
    setImageUploaderOpen(true);
  };
  
  const imageLabels: Record<keyof LandingPageImages, string> = {
    hero: "Imagem Principal (Hero)",
    app1: "Aplicativo 1",
    app2: "Aplicativo 2",
    app3: "Aplicativo 3",
    testimonial1: "Depoimento 1",
    testimonial2: "Depoimento 2"
  };
  
  return (
    <>
      {userIsAdmin && isAdmin && (
        <Button 
          onClick={() => setOpen(true)} 
          className="fixed bottom-4 right-4 z-50 bg-gradient-to-r from-[#9b87f5] to-[#D946EF] hover:opacity-90"
        >
          <Pencil className="mr-2 h-4 w-4" /> 
          Editar Imagens
        </Button>
      )}
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Editor de Imagens da Landing Page</DialogTitle>
            <DialogDescription>
              Selecione uma imagem para editar. As alterações serão salvas automaticamente.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4 max-h-[60vh] overflow-y-auto p-1">
            {Object.entries(images).map(([key, url]) => (
              <Card key={key} className="overflow-hidden">
                <div className="aspect-video relative">
                  <img 
                    src={url} 
                    alt={imageLabels[key as keyof LandingPageImages]} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158';
                    }}
                  />
                  <Button 
                    size="sm" 
                    className="absolute bottom-2 right-2 bg-black/60 hover:bg-black/80"
                    onClick={() => handleEditImage(key as keyof LandingPageImages)}
                    disabled={isLoading}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
                <CardContent className="p-3">
                  <p className="text-sm font-medium truncate">
                    {imageLabels[key as keyof LandingPageImages]}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="flex justify-between mt-4">
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)}
            >
              Fechar
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                resetToDefaults();
                setOpen(false);
              }}
              className="flex items-center"
              disabled={isLoading}
            >
              <RotateCcw className="mr-2 h-4 w-4" /> 
              Restaurar Padrão
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Image uploader dialog */}
      {editingKey && (
        <ImageUploader
          open={imageUploaderOpen}
          onClose={() => {
            setImageUploaderOpen(false);
            setEditingKey(null);
          }}
          onSelectImage={handleUpdateImage}
          currentImageUrl={editingKey ? images[editingKey] : undefined}
        />
      )}
    </>
  );
};
