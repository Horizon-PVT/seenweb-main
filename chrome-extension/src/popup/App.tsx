const App = () => {
    return (
        <div className="w-[320px] bg-seenyt-dark text-white p-4">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-seenyt-gold/30">
                <div className="w-10 h-10 bg-seenyt-gold rounded-full flex items-center justify-center font-bold text-black text-lg">
                    SY
                </div>
                <div>
                    <h1 className="font-bold text-seenyt-gold text-lg">SeenYT</h1>
                    <p className="text-xs text-gray-400">YouTube AI Tools</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2 mb-4">
                <a
                    href="https://seenyt.net/tool/script-writer"
                    target="_blank"
                    className="block w-full bg-seenyt-teal hover:bg-seenyt-teal/80 text-white text-center py-2.5 rounded-lg font-medium transition-colors"
                >
                    ✍️ AI Script Writer
                </a>
                <a
                    href="https://seenyt.net/tool/seo"
                    target="_blank"
                    className="block w-full bg-gray-800 hover:bg-gray-700 text-white text-center py-2.5 rounded-lg font-medium transition-colors"
                >
                    🔍 SEO Optimizer
                </a>
                <a
                    href="https://seenyt.net/tool/niche-engine"
                    target="_blank"
                    className="block w-full bg-gray-800 hover:bg-gray-700 text-white text-center py-2.5 rounded-lg font-medium transition-colors"
                >
                    🎯 Niche Finder
                </a>
            </div>

            {/* Dashboard Link */}
            <a
                href="https://seenyt.net"
                target="_blank"
                className="block text-center text-seenyt-gold hover:text-seenyt-gold/80 text-sm transition-colors"
            >
                Mở Dashboard →
            </a>

            {/* Footer */}
            <p className="text-center text-gray-600 text-[10px] mt-4">
                SeenYT v1.0.0 • Made with ❤️
            </p>
        </div>
    );
};

export default App;
