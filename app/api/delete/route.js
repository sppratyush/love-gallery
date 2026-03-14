import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Memory from '@/models/Memory';
import cloudinary from '@/lib/cloudinary';
import { jwtVerify } from 'jose';

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

export async function DELETE(req) {
  try {
    const username = await getUser(req);
    if (!username) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
       return NextResponse.json({ error: 'Memory ID required' }, { status: 400 });
    }

    const memory = await Memory.findById(id);

    if (!memory) {
      return NextResponse.json({ error: 'Memory not found' }, { status: 404 });
    }

    // Attempt to delete from Cloudinary by extracting public_id from file_url
    // Optional enhancement for prod. For now we will just delete the DB record.
    // E.g. Cloudinary url format: https://res.cloudinary.com/.../upload/v1234/public_id.jpg
    const urlParts = memory.file_url.split('/');
    const fileWithExt = urlParts[urlParts.length - 1];
    const publicId = fileWithExt.split('.')[0];
    
    if (publicId) {
       await cloudinary.uploader.destroy(`love-gallery/${publicId}`, {
           resource_type: memory.type === 'video' ? 'video' : 'image'
       }).catch(console.error); // Do not fail the DB deletion if Cloudinary deletion fails
    }

    await Memory.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Delete Memory Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
