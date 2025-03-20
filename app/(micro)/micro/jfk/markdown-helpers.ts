/**
 * Helper functions for working with Markdown content
 */

/**
 * Replace image references in markdown with their base64 encoded versions
 * 
 * @param markdownStr The markdown string to process
 * @param imagesDict Dictionary of image IDs to base64 strings
 * @returns Processed markdown with image references replaced
 */
export function replaceImagesInMarkdown(markdownStr: string, imagesDict: Record<string, string>): string {
  let processedMarkdown = markdownStr;
  
  // Process each image in the map
  Object.entries(imagesDict).forEach(([imgId, base64Data]) => {
    // Ensure base64 data has proper prefix if not already there
    const imgSrc = base64Data.startsWith('data:') 
      ? base64Data 
      : `data:image/jpeg;base64,${base64Data}`;
    
    // Replace image references with base64 data
    const pattern = `![${imgId}](${imgId})`;
    processedMarkdown = processedMarkdown.replace(pattern, `![${imgId}](${imgSrc})`);
  });
  
  return processedMarkdown;
}

/**
 * Combine multiple markdown pages into a single document
 * 
 * @param pages Array of markdown strings, one per page
 * @returns Combined markdown string
 */
export function combineMarkdownPages(pages: string[]): string {
  return pages.join('\n\n---\n\n');
}

/**
 * Extract and process markdown from a JFK document JSON response
 * 
 * @param jsonData The JSON data from the JFK API
 * @returns Processed markdown string with embedded images
 */
export function processJFKMarkdown(jsonData: any): string {
  if (!jsonData || !jsonData.pages || !Array.isArray(jsonData.pages)) {
    return '**No document content available**';
  }
  
  const markdownPages = jsonData.pages.map((page: any) => {
    // Create image dictionary
    const imageData: Record<string, string> = {};
    if (page.images && Array.isArray(page.images)) {
      page.images.forEach((img: any) => {
        if (img && img.id && img.image_base64) {
          imageData[img.id] = img.image_base64;
        }
      });
    }
    
    // Replace images in markdown
    return replaceImagesInMarkdown(page.markdown || '', imageData);
  });
  
  return combineMarkdownPages(markdownPages);
}
