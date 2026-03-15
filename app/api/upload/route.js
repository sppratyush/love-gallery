import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import dbConnect from '@/lib/mongodb';
import Memory from '@/models/Memory';
import { jwtVerify } from 'jose';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function getUser(req) {
  const token = req.cookies.get('auth_token')?.value;
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload.username;
  } catch (err) {
    return null;
  }
}

const uploadToCloudinary = (fileBuffer, resourceType) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'love-gallery', resource_type: resourceType },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

export async function POST(req) {
  try {
    const username = await getUser(req);
    if (!username) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const files = formData.getAll('file');
    const caption = formData.get('caption') || '';

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const memories = [];

    for (const file of files) {
      // Checking file type limits (500MB)
      const MAX_SIZE = 500 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        return NextResponse.json({ error: `File ${file.name} exceeds 500MB limit` }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Determine type: 'image' or 'video'
      const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.m4v', '.webm', '.3gp', '.avc', '.h264'];
      const isVideo = file.type.startsWith('video') || 
                    videoExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
      const resourceType = isVideo ? 'video' : 'image';

      // Upload to Cloudinary
      const result = await uploadToCloudinary(buffer, resourceType);

      // Save to Database
      await dbConnect();
      const memory = await Memory.create({
        file_url: result.secure_url,
        type: resourceType,
        caption,
        uploaded_by: username,
      });
      memories.push(memory);
    }

    return NextResponse.json({ success: true, memories }, { status: 201 });
  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: 'Upload process failed' }, { status: 500 });
  }
}
