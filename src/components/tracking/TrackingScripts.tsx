
import { useState, useEffect } from 'react';
import { getActiveTrackingScripts, TrackingSettings } from '@/services/settingsService';

export const TrackingScripts = () => {
  const [scripts, setScripts] = useState<TrackingSettings[]>([]);
  
  useEffect(() => {
    const loadScripts = async () => {
      const activeScripts = await getActiveTrackingScripts();
      setScripts(activeScripts);
    };
    
    loadScripts();
  }, []);

  useEffect(() => {
    // Clean up any previously injected scripts
    const cleanup = () => {
      document.querySelectorAll('script[data-tracking]').forEach(script => {
        script.remove();
      });
    };

    // Add scripts to the page
    const injectScripts = () => {
      // Facebook Pixel
      const fbPixel = scripts.find(s => s.key === 'facebook_pixel' && s.value);
      if (fbPixel?.value) {
        // Add Facebook Pixel base code
        const fbPixelScript = document.createElement('script');
        fbPixelScript.setAttribute('data-tracking', 'facebook_pixel');
        fbPixelScript.innerHTML = `
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${fbPixel.value}');
          fbq('track', 'PageView');
        `;
        document.head.appendChild(fbPixelScript);
        
        // Add Facebook Pixel noscript code
        const fbPixelNoscript = document.createElement('noscript');
        fbPixelNoscript.setAttribute('data-tracking', 'facebook_pixel_noscript');
        const fbPixelImg = document.createElement('img');
        fbPixelImg.height = 1;
        fbPixelImg.width = 1;
        fbPixelImg.style.display = 'none';
        fbPixelImg.src = `https://www.facebook.com/tr?id=${fbPixel.value}&ev=PageView&noscript=1`;
        fbPixelNoscript.appendChild(fbPixelImg);
        document.body.appendChild(fbPixelNoscript);
      }

      // Google Tag Manager
      const gtm = scripts.find(s => s.key === 'gtm' && s.value);
      if (gtm?.value) {
        // Add GTM script
        const gtmScript = document.createElement('script');
        gtmScript.setAttribute('data-tracking', 'gtm');
        gtmScript.innerHTML = `
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${gtm.value}');
        `;
        document.head.appendChild(gtmScript);
        
        // Add GTM noscript iframe
        const gtmNoscript = document.createElement('noscript');
        gtmNoscript.setAttribute('data-tracking', 'gtm_noscript');
        const gtmIframe = document.createElement('iframe');
        gtmIframe.src = `https://www.googletagmanager.com/ns.html?id=${gtm.value}`;
        gtmIframe.height = '0';
        gtmIframe.width = '0';
        gtmIframe.style.display = 'none';
        gtmIframe.style.visibility = 'hidden';
        gtmNoscript.appendChild(gtmIframe);
        document.body.prepend(gtmNoscript);
      }

      // Hotjar
      const hotjar = scripts.find(s => s.key === 'hotjar' && s.value);
      if (hotjar?.value) {
        const hotjarScript = document.createElement('script');
        hotjarScript.setAttribute('data-tracking', 'hotjar');
        hotjarScript.innerHTML = `
          (function(h,o,t,j,a,r){
            h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
            h._hjSettings={hjid:${hotjar.value},hjsv:6};
            a=o.getElementsByTagName('head')[0];
            r=o.createElement('script');r.async=1;
            r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
            a.appendChild(r);
          })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
        `;
        document.head.appendChild(hotjarScript);
      }

      // Custom script
      const customScript = scripts.find(s => s.key === 'custom_script' && s.script);
      if (customScript?.script) {
        const scriptEl = document.createElement('script');
        scriptEl.setAttribute('data-tracking', 'custom_script');
        scriptEl.innerHTML = customScript.script;
        document.body.appendChild(scriptEl);
      }
    };

    cleanup();
    if (scripts.length > 0) {
      injectScripts();
    }

    return cleanup;
  }, [scripts]);

  return null; // This is a non-visual component
};
