import { cn } from "@/lib/utils";

interface SectionProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string;
    description?: string;
    children: React.ReactNode;
    action?: React.ReactNode;
}

export function Section({ title, description, children, action, className, ...props }: SectionProps) {
    return (
        <section className={cn("space-y-6 w-full", className)} {...props}>
            {(title || description || action) && (
                <div className="flex items-end justify-between gap-4 border-l-4 border-primary/50 pl-4 py-1">
                    <div className="space-y-1">
                        {title && <h3 className="text-2xl font-bold tracking-tight text-foreground">{title}</h3>}
                        {description && <p className="text-muted-foreground text-sm">{description}</p>}
                    </div>
                    {action && <div>{action}</div>}
                </div>
            )}
            <div className="w-full">
                {children}
            </div>
        </section>
    );
}
