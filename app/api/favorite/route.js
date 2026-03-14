import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Memory from '@/models/Memory';
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

export async function POST(req) {
  try {
    const username = await getUser(req);
    if (!username) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { id, favorite } = await req.json();

    if (!id) {
       return NextResponse.json({ error: 'Memory ID required' }, { status: 400 });
    }

    const memory = await Memory.findByIdAndUpdate(
      id,
      { favorite },
      { new: true }
    );

    if (!memory) {
      return NextResponse.json({ error: 'Memory not found' }, { status: 404 });
    }

    return NextResponse.json(memory, { status: 200 });
  } catch (error) {
    console.error('Favorite Toggle Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
