
import React from 'react';

class ErrorBoundary extends React.Component<any, { hasError: boolean }> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: any) {
        return { hasError: true };
    }

    componentDidCatch(error: any, errorInfo: any) {
        console.error("ErrorBoundary caught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0F1E] text-white p-4 text-center">
                    <h2 className="text-2xl font-bold mb-4 text-[#CDAD5A]">Đã có lỗi xảy ra</h2>
                    <p className="text-gray-400 mb-6">Hệ thống gặp sự cố khi tải giao diện.</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 bg-[#008080] rounded hover:bg-[#006666] transition-colors"
                    >
                        Tải lại trang
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
