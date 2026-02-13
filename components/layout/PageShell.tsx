import { cn } from "@/lib/utils";

interface PageShellProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
    variant?: "default" | "centered";
}

export function PageShell({ children, className, variant = "default", ...props }: PageShellProps) {
    return (
        <div
            className={cn(
                "flex flex-col flex-1 w-full min-h-full space-y-8 p-6 md:p-8 lg:p-10 animate-in fade-in duration-500",
                variant === "centered" && "items-center",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
