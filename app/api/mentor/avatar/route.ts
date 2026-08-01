import { createHash } from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const AVATAR_FOLDER = 'interviewai/mentor-avatars';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'mentor' && profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Mentor access is required' }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get('file');
  if (!(file instanceof File) || !file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Please select an image file.' }, { status: 400 });
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return NextResponse.json({ error: 'Image size must be 5 MB or less.' }, { status: 400 });
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json({ error: 'Image uploads are not configured.' }, { status: 503 });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = createHash('sha1')
    .update(`folder=${AVATAR_FOLDER}&timestamp=${timestamp}${apiSecret}`)
    .digest('hex');

  const uploadData = new FormData();
  uploadData.append('file', file);
  uploadData.append('api_key', apiKey);
  uploadData.append('timestamp', String(timestamp));
  uploadData.append('folder', AVATAR_FOLDER);
  uploadData.append('signature', signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: uploadData,
  });
  const result = await response.json() as { secure_url?: string; error?: { message?: string } };
  if (!response.ok || !result.secure_url) {
    return NextResponse.json({ error: result.error?.message ?? 'Image upload failed.' }, { status: 502 });
  }

  return NextResponse.json({ url: result.secure_url });
}
