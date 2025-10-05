import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo/config';
import CommunityClient from './community-client';

export const metadata: Metadata = generatePageMetadata('/community');

export default function CommunityPage() {
  return <CommunityClient />;
}