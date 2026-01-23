import React from 'react';

interface LoadingProps {
    text?: string;
    fullScreen?: boolean;
    className?: string;
}

export default function Loading({ text = "Loading...", fullScreen = true, className = "" }: LoadingProps) {
    const containerClasses = fullScreen
        ? "min-h-screen bg-surface flex items-center justify-center fixed inset-0 z-50"
        : "flex items-center justify-center py-20";

    return (
        <div className={`${containerClasses} ${className}`}>
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border border-primary flex items-center justify-center relative">
                    <div className="w-8 h-8 bg-primary animate-pulse" />
                    <div className="absolute inset-0 border border-primary/30 scale-110 animate-pulse delay-75" />
                </div>
                <span className="font-serif text-primary tracking-widest text-xs uppercase animate-pulse">
                    {text}
                </span>
            </div>
        </div>
    );
}
