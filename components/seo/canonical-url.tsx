import { headers } from 'next/headers';

interface CanonicalUrlProps {
  path?: string;
}

export function CanonicalUrl({ path }: CanonicalUrlProps) {
  const headersList = headers();
  const host = headersList.get('host') || 'www.wanimate.io';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  
  // 确保使用正确的域名
  const canonicalHost = host.includes('wanimate.io') ? 'www.wanimate.io' : 'www.wanimate.io';
  const canonicalUrl = `${protocol}://${canonicalHost}${path || ''}`;

  return (
    <link rel="canonical" href={canonicalUrl} />
  );
}