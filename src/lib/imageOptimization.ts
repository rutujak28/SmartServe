/**
 * Generate srcset for responsive images
 */
export const generateSrcSet = (baseUrl: string, sizes: number[] = [320, 640, 960, 1280]): string => {
  return sizes.map(size => `${baseUrl}?w=${size} ${size}w`).join(', ');
};

/**
 * Lazy load images with Intersection Observer
 */
export const setupLazyLoading = () => {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach((img) => {
      imageObserver.observe(img);
    });

    return imageObserver;
  }
};

/**
 * Preload critical images
 */
export const preloadImage = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = url;
  });
};

/**
 * Get optimized image URL based on device pixel ratio
 */
export const getOptimizedImageUrl = (url: string, width: number): string => {
  const dpr = window.devicePixelRatio || 1;
  const targetWidth = Math.round(width * dpr);
  return `${url}?w=${targetWidth}&q=80`;
};
