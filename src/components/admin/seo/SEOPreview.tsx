
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SEOSettings } from '@/types/seo';

interface SEOPreviewProps {
  settings: SEOSettings;
}

export const SEOPreview: React.FC<SEOPreviewProps> = ({ settings }) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Preview do Compartilhamento</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Facebook/LinkedIn Preview */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h3 className="text-sm font-medium text-gray-600 mb-3">Facebook / LinkedIn</h3>
          <div className="border border-gray-200 rounded-lg overflow-hidden bg-white max-w-lg">
            {settings.site_image_url && (
              <div className="aspect-video bg-gray-100">
                <img 
                  src={settings.site_image_url} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-3">
              <div className="text-xs text-gray-500 uppercase mb-1">
                {new URL(settings.site_url).hostname}
              </div>
              <div className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                {settings.site_title}
              </div>
              <div className="text-xs text-gray-600 line-clamp-2">
                {settings.site_description}
              </div>
            </div>
          </div>
        </div>

        {/* Twitter Preview */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h3 className="text-sm font-medium text-gray-600 mb-3">Twitter</h3>
          <div className="border border-gray-200 rounded-lg overflow-hidden bg-white max-w-lg">
            {settings.site_image_url && (
              <div className="aspect-video bg-gray-100">
                <img 
                  src={settings.site_image_url} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-3">
              <div className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                {settings.site_title}
              </div>
              <div className="text-xs text-gray-600 line-clamp-2 mb-2">
                {settings.site_description}
              </div>
              <div className="text-xs text-gray-500">
                {new URL(settings.site_url).hostname}
              </div>
            </div>
          </div>
        </div>

        {/* WhatsApp Preview */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h3 className="text-sm font-medium text-gray-600 mb-3">WhatsApp</h3>
          <div className="border border-gray-200 rounded-lg overflow-hidden bg-white max-w-lg">
            {settings.site_image_url && (
              <div className="aspect-video bg-gray-100">
                <img 
                  src={settings.site_image_url} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-3">
              <div className="font-bold text-gray-900 text-sm mb-1">
                {settings.site_title}
              </div>
              <div className="text-xs text-gray-600 mb-2">
                {settings.site_description}
              </div>
              <div className="text-xs text-blue-600">
                {settings.site_url}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
