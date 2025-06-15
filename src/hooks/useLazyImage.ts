
import { useEffect, useRef, useState } from "react";

/**
 * useLazyImage - para lazy loading de imagens secundárias (NÃO para a primeira imagem visual do carousel)
 * Retorna { ref, src, loaded, setLoaded }
 */
export function useLazyImage(actualSrc: string | undefined, placeholder = '/placeholder.svg', options?: { loadImmediately?: boolean }) {
  const ref = useRef<HTMLImageElement | null>(null);
  const [src, setSrc] = useState<string | undefined>(
    options?.loadImmediately ? (actualSrc || placeholder) : undefined
  );
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    let didCancel = false;

    // Se for loadImmediately (primeira imagem), já força src e fim
    if (options?.loadImmediately) {
      setSrc(actualSrc || placeholder);
      return () => {};
    }

    const img = ref.current;

    if (!img) return;

    setLoaded(false);

    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !didCancel) {
            setSrc(actualSrc || placeholder);
          }
        },
        { threshold: 0.15 }
      );
      observer.observe(img);
    } else {
      setSrc(actualSrc || placeholder);
      setLoaded(true);
    }

    return () => {
      didCancel = true;
      observer && observer.disconnect();
    };
  }, [actualSrc, placeholder, options?.loadImmediately]);

  return { ref, src: src ?? placeholder, loaded, setLoaded };
}
