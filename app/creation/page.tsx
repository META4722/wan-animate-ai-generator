import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo/config';
import CreationClient from './creation-client';

export const metadata: Metadata = generatePageMetadata('/creation');

export default function CreationPage() {
  return <CreationClient />;
}