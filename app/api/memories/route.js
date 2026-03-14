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

export async function GET(req) {
  try {
    const username = await getUser(req);
    if (!username) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const url = new URL(req.url);
    const search = url.searchParams.get('search');
    const sort = url.searchParams.get('sort') || 'desc';
    const favoritesOnly = url.searchParams.get('favorites') === 'true';

    let query = {};
    
    if (search) {
      query.caption = { $regex: search, $options: 'i' };
    }
    
    if (favoritesOnly) {
      query.favorite = true;
    }

    const sortOpt = sort === 'asc' ? { created_at: 1 } : { created_at: -1 };

    const memories = await Memory.find(query).sort(sortOpt);

    return NextResponse.json(memories, { status: 200 });
  } catch (error) {
    console.error('Memories Fetch Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
