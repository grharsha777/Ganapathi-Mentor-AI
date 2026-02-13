import { cn } from "@/lib/utils";

interface GridContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    cols?: 1 | 2 | 3 | 4 | 5;
}

export function GridContainer({ children, cols = 3, className, ...props }: GridContainerProps) {
    const gridCols = {
        1: "grid-cols-1",
        2: "grid-cols-1 md:grid-cols-2",
        3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
        5: "grid-cols-1 md:grid-cols-3 lg:grid-cols-5",
    };

    return (
        <div className={cn("grid gap-6 w-full", gridCols[cols], className)} {...props}>
            {children}
        </div>
    );
}
