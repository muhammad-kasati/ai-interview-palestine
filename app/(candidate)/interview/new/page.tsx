import type { Metadata } from 'next';
import NewInterviewClient from './NewInterviewClient';

export const metadata: Metadata = { title: 'New Interview', description: 'Configure and start an AI mock interview.' };

export default function NewInterviewPage() {
  return <NewInterviewClient />;
}
