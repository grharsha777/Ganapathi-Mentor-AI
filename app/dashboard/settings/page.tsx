'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Settings, Bell, Lock, User } from 'lucide-react'
import { signOut } from '@/app/auth/actions'

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and preferences
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <div>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Manage your account information</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email</label>
                <p className="text-muted-foreground">
                  Contact Vercel support to change your email
                </p>
              </div>
              <Button variant="outline">Edit Profile</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5" />
              <div>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>
                  Manage alert preferences
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  Email Alerts
                </label>
                <input type="checkbox" defaultChecked className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  Critical Alerts Only
                </label>
                <input type="checkbox" className="w-4 h-4" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Lock className="w-5 h-5" />
              <div>
                <CardTitle>Security</CardTitle>
                <CardDescription>Manage your password and sessions</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline">Change Password</Button>
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Danger Zone</CardTitle>
            <CardDescription>
              Irreversible and destructive actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={async () => {
                await signOut()
              }}
            >
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
