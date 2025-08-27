// lib/loadGifJs.ts
let loading: Promise<void> | null = null;

export async function loadGifJs() {
  if ((window as any).GIF) return;
  if (loading) return loading;

  loading = new Promise<void>((resolve, reject) => {
    // First load the gif.worker.js
    const worker = document.createElement("script");
    worker.src = "https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.worker.js";
    worker.async = true;
    
    worker.onload = () => {
      // Store worker code for later use
      fetch(worker.src)
        .then(r => r.text())
        .then(workerCode => {
          (window as any).GIF_WORKER_CODE = workerCode;
          
          // Now load main gif.js library  
          const script = document.createElement("script");
          script.src = "https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.js";
          script.async = true;
          
          script.onload = () => {
            // Override the worker script URL to use blob URL
            const GIF = (window as any).GIF;
            if (GIF && (window as any).GIF_WORKER_CODE) {
              const blob = new Blob([(window as any).GIF_WORKER_CODE], { type: 'application/javascript' });
              const workerUrl = URL.createObjectURL(blob);
              
              // Monkey-patch GIF constructor to use our blob URL
              const OriginalGIF = GIF;
              (window as any).GIF = function(options: any) {
                if (!options.workerScript) {
                  options.workerScript = workerUrl;
                }
                return new OriginalGIF(options);
              };
              (window as any).GIF.prototype = OriginalGIF.prototype;
            }
            resolve();
          };
          
          script.onerror = () => reject(new Error("Failed to load gif.js"));
          document.head.appendChild(script);
        })
        .catch(() => {
          // Fallback: just load gif.js and hope default worker works
          const script = document.createElement("script");
          script.src = "https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.js";
          script.async = true;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Failed to load gif.js"));
          document.head.appendChild(script);
        });
    };
    
    worker.onerror = () => {
      // If worker fails to load, try just gif.js
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load gif.js"));
      document.head.appendChild(script);
    };
    
    document.head.appendChild(worker);
  });

  return loading;
}
