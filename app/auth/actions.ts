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
  try {
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

    // Always convert _id to string before putting in JWT payload
    // Raw Mongoose ObjectId in JWT causes toString() errors downstream
    const token = await signToken({ userId: user._id.toString(), email: user.email, role: user.role })

    const cookieStore = await cookies()
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })

    revalidatePath('/', 'layout')
    redirect('/dashboard')
  } catch (error) {
    // Next.js redirects throw an error with this message — must re-throw them
    if (error instanceof Error && error.message.startsWith('NEXT_REDIRECT')) throw error
    redirect('/auth/error?message=An unexpected error occurred during sign in')
  }
}

export async function signUp(
  email: string,
  password: string,
  fullName: string
) {
  try {
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

    // Let MongoDB auto-generate a proper ObjectId for _id.
    // NEVER set _id to a UUID string — it causes BSON cast errors on every User.findById() call.
    const newUser = await User.create({
      email,
      full_name: fullName,
      password_hash: passwordHash,
      role: 'viewer'
    })

    // Always convert _id to string before putting in JWT payload
    const token = await signToken({ userId: newUser._id.toString(), email: newUser.email, role: newUser.role })

    const cookieStore = await cookies()
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })

    redirect('/auth/sign-up-success')
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('NEXT_REDIRECT')) throw error
    redirect('/auth/error?message=An unexpected error occurred during sign up')
  }
}
