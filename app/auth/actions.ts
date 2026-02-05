'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/auth/login')
}

export async function signIn(email: string, password: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    redirect('/auth/error?message=' + error.message)
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signUp(
  email: string,
  password: string,
  fullName: string
) {
  const supabase = await createClient()

  const { error, data } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/protected`,
    },
  })

  if (error) {
    redirect('/auth/error?message=' + error.message)
  }

  if (data.user) {
    try {
      // Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: data.user.id,
            email,
            full_name: fullName,
            role: 'viewer',
          },
        ])

      if (profileError) {
        console.error('Error creating profile:', profileError)
      }
    } catch (error) {
      console.error('Error in signUp:', error)
    }
  }

  redirect('/auth/sign-up-success')
}
