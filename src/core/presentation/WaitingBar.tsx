export function WaitingBar() {
    return (
        <div className="w-full h-2 relative bg-background-900/50 rounded-xl overflow-hidden">
            <div
                className="absolute top-0 left-0 w-md h-full bg-primary animate-progress-infinite delay-100 rounded-xl"></div>
            <div
                className="absolute top-0 left-0 w-full h-full bg-(--chart-2) animate-progress-infinite delay-300 rounded-xl"></div>
            <div
                className="absolute top-0 left-0 w-full h-full bg-(--chart-3) animate-progress-infinite delay-500 rounded-xl"></div>
            <div
                className="absolute top-0 left-0 w-full h-full bg-(--chart-4) animate-progress-infinite delay-700 rounded-xl"></div>
        </div>
    )
}