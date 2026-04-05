import PcNavbar from "@/Components/PcNavbar";

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <main className="flex flex-col-reverse md:flex-row min-h-screen">
            <aside className="border-t border-foreground/10 md:border-t-0 md:border-r md:w-20 lg:w-64 shrink-0 overflow-hidden">
                <PcNavbar />
            </aside>
            <section className="flex-1 pb-20 md:pb-0">
                <div className="mx-auto max-w-5xl p-4 md:px-8">
                    {children}
                </div>
            </section>
        </main>
    );
}
