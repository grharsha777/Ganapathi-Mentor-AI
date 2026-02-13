'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import connectToDatabase from '@/lib/mongoose'
import User from '@/models/User'
import bcrypt from 'bcryptjs'
import { signToken } from '@/lib/auth'

export async function signOut() {
  const cookieStore = await cookies()
  cookieStore.delete('token')
  revalidatePath('/', 'layout')
  redirect('/auth/login')
}

export async function signIn(email: string, password: string) {
  await connectToDatabase()

  if (!email || !password) {
    redirect('/auth/error?message=Missing credentials')
  }

  const user = await User.findOne({ email }).select('+password_hash')

  if (!user || !user.password_hash) {
    redirect('/auth/error?message=Invalid credentials')
  }

  const isMatch = await bcrypt.compare(password, user.password_hash)

  if (!isMatch) {
    redirect('/auth/error?message=Invalid credentials')
  }

  const token = await signToken({ userId: user._id, email: user.email, role: user.role })

  const cookieStore = await cookies()
  cookieStore.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 // 7 days
  })

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signUp(
  email: string,
  password: string,
  fullName: string
) {
  await connectToDatabase()

  if (!email || !password) {
    redirect('/auth/error?message=Missing required fields')
  }

  const existingUser = await User.findOne({ email })
  if (existingUser) {
    redirect('/auth/error?message=User already exists')
  }

  const salt = await bcrypt.genSalt(10)
  const passwordHash = await bcrypt.hash(password, salt)
  const userId = crypto.randomUUID()

  const newUser = await User.create({
    _id: userId,
    email,
    full_name: fullName,
    password_hash: passwordHash,
    role: 'viewer'
  })

  const token = await signToken({ userId: newUser._id, email: newUser.email, role: newUser.role })

  const cookieStore = await cookies()
  cookieStore.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 // 7 days
  })

  redirect('/auth/sign-up-success')
}
