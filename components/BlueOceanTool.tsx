import React from 'react';

interface BlueOceanToolProps {
    onBack: () => void;
    tools?: any[];
    onToolSelect?: (id: string) => void;
}

const BlueOceanTool: React.FC<BlueOceanToolProps> = ({ onBack }) => {
    return (
        <div className="h-full flex flex-col p-6 text-white overflow-hidden bg-[#0f0f0f]">
            <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-900/30 rounded-lg">
                        <span className="text-3xl">🌊</span>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-blue-400">Tìm Ngách Xanh (Blue Ocean)</h2>
                        <p className="text-gray-400 text-sm">Chiến lược đại dương xanh, tìm kiếm thị trường ít cạnh tranh.</p>
                    </div>
                </div>
                <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700">
                    QUAY LẠI
                </button>
            </div>

            <div className="flex-grow flex items-center justify-center bg-[#1a1a1a] rounded-2xl border border-gray-800 border-dashed">
                <div className="text-center">
                    <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-4xl">🌊</span>
                    </div>
                    <h3 className="text-xl font-bold text-blue-400 mb-2">Công cụ đang được phát triển</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                        Tính năng tìm kiếm "Đại Dương Xanh" sẽ sớm ra mắt với khả năng phân tích dữ liệu chuyên sâu để tìm ra cơ hội chưa được khai thác.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default BlueOceanTool;
