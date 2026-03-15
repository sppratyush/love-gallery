import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { jwtVerify } from 'jose';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req) {
  try {
    const { currentPassword, newPassword } = await req.json();
    const token = req.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current and new passwords are required' }, { status: 400 });
    }

    // Verify JWT
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId;

    await dbConnect();
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(newPassword, salt);
    await user.save();

    return NextResponse.json({ success: true, message: 'Password updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 });
  }
}
