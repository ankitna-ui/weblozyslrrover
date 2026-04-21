export default function SkeletonDashboard() {
    return (
        <div className="min-h-screen animate-pulse" style={{ backgroundColor: 'var(--void)', paddingTop: '48px' }}>
            <div className="px-4 lg:px-8" style={{ paddingBottom: '2rem', minHeight: '180px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <div className="h-[4rem] lg:h-[6rem] w-3/4 max-w-[600px] mb-4 rounded" style={{ backgroundColor: 'var(--surface)' }} />
                <div className="flex gap-2">
                    <div className="h-6 w-24 rounded" style={{ backgroundColor: 'var(--surface)' }} />
                    <div className="h-6 w-28 rounded" style={{ backgroundColor: 'var(--surface)' }} />
                    <div className="h-6 w-32 rounded" style={{ backgroundColor: 'var(--surface)' }} />
                </div>
            </div>
            <div className="px-4 lg:px-8">
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="card-surface p-5 flex flex-col items-center justify-center text-center" style={{ minHeight: '100px' }}>
                            <div className="h-3 w-16 mb-4 rounded" style={{ backgroundColor: 'var(--border-color)' }} />
                            <div className="h-8 w-24 mb-3 rounded" style={{ backgroundColor: 'var(--border-color)' }} />
                            <div className="h-2 w-12 rounded" style={{ backgroundColor: 'var(--border-color)' }} />
                        </div>
                    ))}
                </div>
            </div>
            <div className="px-4 lg:px-8 mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-4" style={{ height: '500px' }}>
                    <div className="card-surface rounded" />
                    <div className="card-surface flex flex-col">
                        <div className="p-3 border-b border-border-color h-12" />
                        <div className="flex-1 p-4 flex flex-col gap-3">
                            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                                <div key={i} className="h-8 w-full rounded" style={{ backgroundColor: 'var(--surface-hover)' }} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
