interface MetaRobotsProps {
  index?: boolean;
  follow?: boolean;
  noarchive?: boolean;
  nosnippet?: boolean;
  noimageindex?: boolean;
  maxSnippet?: number;
  maxImagePreview?: 'none' | 'standard' | 'large';
  maxVideoPreview?: number;
}

export function MetaRobots({
  index = true,
  follow = true,
  noarchive = false,
  nosnippet = false,
  noimageindex = false,
  maxSnippet,
  maxImagePreview = 'large',
  maxVideoPreview = -1
}: MetaRobotsProps) {
  const robots = [];
  
  if (index) {
    robots.push('index');
  } else {
    robots.push('noindex');
  }
  
  if (follow) {
    robots.push('follow');
  } else {
    robots.push('nofollow');
  }
  
  if (noarchive) robots.push('noarchive');
  if (nosnippet) robots.push('nosnippet');
  if (noimageindex) robots.push('noimageindex');
  
  if (maxSnippet !== undefined) {
    robots.push(`max-snippet:${maxSnippet}`);
  }
  
  if (maxImagePreview !== 'large') {
    robots.push(`max-image-preview:${maxImagePreview}`);
  }
  
  if (maxVideoPreview !== -1) {
    robots.push(`max-video-preview:${maxVideoPreview}`);
  }
  
  return (
    <meta name="robots" content={robots.join(', ')} />
  );
}