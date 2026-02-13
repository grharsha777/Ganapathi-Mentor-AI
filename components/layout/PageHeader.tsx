import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface PageHeaderProps {
    title: string;
    description?: string;
    icon?: LucideIcon;
    actions?: React.ReactNode;
    className?: string;
}

export function PageHeader({ title, description, icon: Icon, actions, className }: PageHeaderProps) {
    return (
        <div className={cn("flex flex-col md:flex-row md:items-center justify-between gap-4 w-full border-b border-border/40 pb-6", className)}>
            <div className="space-y-1.5">
                {Icon && (
                    <div className="mb-4 inline-flex items-center justify-center p-2 rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
                        <Icon className="w-8 h-8" />
                    </div>
                )}
                <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                    {title}
                </h1>
                {description && (
                    <p className="text-lg text-muted-foreground md:text-xl max-w-3xl leading-relaxed">
                        {description}
                    </p>
                )}
            </div>
            {actions && (
                <div className="flex items-center gap-3">
                    {actions}
                </div>
            )}
        </div>
    );
}
