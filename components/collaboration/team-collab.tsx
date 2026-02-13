"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Share2, Users, Lightbulb } from 'lucide-react';

export default function TeamCollaboration() {
    return (
        <div className="space-y-6">
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-yellow-500" /> Knowledge Silo Detection
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-start gap-4">
                        <div className="flex-1">
                            <p className="text-sm font-medium">Critical Risk: Only 1 person knows "Payment Gateway Legacy"</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                @Dave is the sole contributor to `payments/legacy/*.ts` in the last 6 months.
                            </p>
                        </div>
                        <Button size="sm" variant="secondary">Propose Shadowing</Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Skill Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[1, 2, 3].map((_, i) => (
                            <div key={i} className="flex items-center justify-between p-3 border rounded bg-card">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8"><AvatarFallback>JD</AvatarFallback></Avatar>
                                    <div>
                                        <div className="text-sm font-medium">John Doe</div>
                                        <div className="text-xs text-muted-foreground">Should learn: GraphQL</div>
                                    </div>
                                </div>
                                <Badge variant="outline">High Impact</Badge>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Share2 className="h-5 w-5" /> Resource Sharing</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-sm text-muted-foreground">
                            Recommended resources based on team activity:
                        </div>
                        <div className="space-y-2">
                            <div className="p-2 bg-muted rounded text-sm flex justify-between cursor-pointer hover:bg-muted/80">
                                <span>Docker Optimization Guide</span>
                                <span className="text-xs opacity-70">Shared by @Sarah</span>
                            </div>
                            <div className="p-2 bg-muted rounded text-sm flex justify-between cursor-pointer hover:bg-muted/80">
                                <span>React 19 Server Actions</span>
                                <span className="text-xs opacity-70">Trending in Team</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
