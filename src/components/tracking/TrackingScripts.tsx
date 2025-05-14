
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Helmet } from 'react-helmet';

interface TrackingSetting {
  id: string;
  key: string;
  name: string;
  value: string | null;
  script: string | null;
  is_active: boolean;
}

export function TrackingScripts() {
  const [trackingSettings, setTrackingSettings] = useState<TrackingSetting[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Load tracking settings from database
    const loadTrackingSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('tracking_settings')
          .select('*')
          .eq('is_active', true);
        
        if (error) {
          console.error('Error loading tracking settings:', error);
          return;
        }
        
        setTrackingSettings(data);
      } catch (err) {
        console.error('Failed to load tracking settings:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadTrackingSettings();
  }, []);
  
  // Don't render anything while loading
  if (loading) return null;
  
  // Find specific tracking settings
  const facebookPixel = trackingSettings.find(setting => setting.key === 'facebook_pixel');
  const googleTagManager = trackingSettings.find(setting => setting.key === 'google_tag_manager');
  const hotjar = trackingSettings.find(setting => setting.key === 'hotjar');
  const customScript = trackingSettings.find(setting => setting.key === 'custom_script');
  
  return (
    <Helmet>
      {/* Facebook Pixel */}
      {facebookPixel && facebookPixel.value && (
        <script>
          {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${facebookPixel.value}');
          fbq('track', 'PageView');
          `}
        </script>
      )}
      
      {/* Google Tag Manager */}
      {googleTagManager && googleTagManager.value && (
        <script>
          {`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${googleTagManager.value}');
          `}
        </script>
      )}
      
      {/* Hotjar */}
      {hotjar && hotjar.value && (
        <script>
          {`
          (function(h,o,t,j,a,r){
            h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
            h._hjSettings={hjid:${hotjar.value},hjsv:6};
            a=o.getElementsByTagName('head')[0];
            r=o.createElement('script');r.async=1;
            r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
            a.appendChild(r);
          })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
          `}
        </script>
      )}
      
      {/* Custom Script - Added as dangerouslySetInnerHTML */}
      {customScript && customScript.script && (
        <div dangerouslySetInnerHTML={{ __html: customScript.script }} />
      )}
    </Helmet>
  );
}
