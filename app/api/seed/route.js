import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  try {
    await dbConnect();

    const usersToSeed = [
      { username: 'Pratyush', password: 'password123' },
      { username: 'Shmruti', password: 'password123' },
    ];

    for (const u of usersToSeed) {
      const existingUser = await User.findOne({ username: u.username });
      if (!existingUser) {
        const password_hash = await bcrypt.hash(u.password, 10);
        await User.create({
          username: u.username,
          password_hash,
        });
      }
    }

    return NextResponse.json({ message: 'Users seeded successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
