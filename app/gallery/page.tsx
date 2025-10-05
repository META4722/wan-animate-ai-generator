import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo/config';
import GalleryClient from './gallery-client';

export const metadata: Metadata = generatePageMetadata('/gallery');

export default function GalleryPage() {
  return <GalleryClient />;
}