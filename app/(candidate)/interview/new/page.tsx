import { redirect } from 'next/navigation';

// /interview/new → redirect user back to dashboard where the SetupWizard lives
export default function NewInterviewPage() {
  redirect('/dashboard');
}
