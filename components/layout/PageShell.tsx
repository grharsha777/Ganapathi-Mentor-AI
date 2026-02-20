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
                "flex flex-col flex-1 w-full min-h-full space-y-4 sm:space-y-6 md:space-y-8 p-3 sm:p-5 md:p-6 lg:p-8 xl:p-10 animate-in fade-in duration-500",
                variant === "centered" && "items-center",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
