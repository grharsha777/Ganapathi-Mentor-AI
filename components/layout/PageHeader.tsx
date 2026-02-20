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
        <div className={cn("flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 w-full border-b border-border/40 pb-4 sm:pb-6", className)}>
            <div className="space-y-1 sm:space-y-1.5 min-w-0">
                {Icon && (
                    <div className="mb-3 sm:mb-4 inline-flex items-center justify-center p-1.5 sm:p-2 rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
                        <Icon className="w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                )}
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 break-words">
                    {title}
                </h1>
                {description && (
                    <p className="text-sm sm:text-base md:text-lg text-muted-foreground lg:text-xl max-w-3xl leading-relaxed">
                        {description}
                    </p>
                )}
            </div>
            {actions && (
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    {actions}
                </div>
            )}
        </div>
    );
}
