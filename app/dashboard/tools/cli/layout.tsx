import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terminal Hub | Ganapathi Mentor AI',
    description: 'Master your codebase from the command line with Ganapathi Neural CLI.',
};

export default function TerminalHubLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
