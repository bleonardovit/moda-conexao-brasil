
import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Instagram, Link as LinkIcon } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface SupplierActionsProps {
  supplierId: string;
  instagram: string | null;
  website: string | null;
}

export const SupplierActions = memo(function SupplierActions({ 
  supplierId, 
  instagram, 
  website 
}: SupplierActionsProps) {
  const isMobile = useIsMobile();

  return (
    <div className={`flex flex-wrap gap-2 ${isMobile ? 'flex-col' : ''}`}>
      <div className={`flex gap-2 ${isMobile ? 'mb-2' : ''}`}>
        {instagram && (
          <Button size="sm" variant="outline" asChild className={isMobile ? 'flex-1' : ''}>
            <a
              href={`https://instagram.com/${instagram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Instagram className="mr-1 h-4 w-4" />
              Instagram
            </a>
          </Button>
        )}
        {website && (
          <Button size="sm" variant="outline" asChild className={isMobile ? 'flex-1' : ''}>
            <a href={website} target="_blank" rel="noopener noreferrer">
              <LinkIcon className="mr-1 h-4 w-4" />
              Site
            </a>
          </Button>
        )}
      </div>
      <Button size="sm" asChild className={isMobile ? 'w-full' : ''}>
        <Link to={`/suppliers/${supplierId}`}>Ver detalhes</Link>
      </Button>
    </div>
  );
});
