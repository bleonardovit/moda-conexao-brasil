
import { useEffect, useRef, useState } from "react";

/**
 * useLazyImage carrega a imagem apenas quando aparece na tela.
 * Retorna o ref, src (ou undefined até carregar), e estado loaded.
 */
export function useLazyImage(actualSrc: string | undefined, placeholder = '/placeholder.svg') {
  const ref = useRef<HTMLImageElement | null>(null);
  const [src, setSrc] = useState<string | undefined>(undefined);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    let didCancel = false;
    const img = ref.current;

    if (!img) return;

    // Reset to placeholder always at start
    setSrc(undefined);
    setLoaded(false);

    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting && !didCancel) {
          setSrc(actualSrc || placeholder);
        }
      }, { threshold: 0.1 });

      observer.observe(img);
    } else {
      // fallback sem IntersectionObserver
      setSrc(actualSrc || placeholder);
      setLoaded(true);
    }

    return () => {
      didCancel = true;
      observer && observer.disconnect();
    };
  }, [actualSrc, placeholder]);

  return { ref, src: src ?? placeholder, loaded, setLoaded };
}
