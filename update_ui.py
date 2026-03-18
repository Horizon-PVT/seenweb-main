import os
import re

file_path = r'c:\Users\ADMIN\Desktop\A Tung\seenweb-main\seenweb-main\components\HiddenChannelFinderTool.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    original = f.read()

# Replace SonarLoader with new RadarVisualizer
sonar_loader_code = """const RadarVisualizer: React.FC = () => (
  <section className="flex flex-col items-center my-12 animate-in fade-in duration-700">
    <div className="relative w-72 h-72 md:w-96 md:h-96 flex items-center justify-center">
      {/* Outer Circles */}
      <div className="absolute inset-0 border border-[#00F3FF]/20 rounded-full"></div>
      <div className="absolute inset-[15%] border border-[#00F3FF]/15 rounded-full"></div>
      <div className="absolute inset-[30%] border border-[#00F3FF]/10 rounded-full"></div>
      <div className="absolute inset-[45%] border border-[#00F3FF]/5 rounded-full"></div>
      
      {/* Rotating Sweep */}
      <div className="absolute inset-0">
        <div className="radar-line absolute top-1/2 left-1/2 h-[2px] w-[50%] origin-left" style={{marginTop: '-1px'}}></div>
      </div>
      
      {/* Detected 'Underdog' Points */}
      <div className="absolute top-[20%] left-[30%] w-2 h-2 bg-[#00F3FF] rounded-full shadow-[0_0_10px_#00F3FF] animate-pulse"></div>
      <div className="absolute bottom-[35%] right-[25%] w-1.5 h-1.5 bg-[#00F3FF]/60 rounded-full shadow-[0_0_8px_#00F3FF] animate-bounce"></div>
      <div className="absolute top-[60%] left-[15%] w-2.5 h-2.5 bg-blue-500 rounded-full shadow-[0_0_12px_#3B82F6] animate-pulse" style={{animationDelay: "1s"}}></div>
      <div className="absolute top-[40%] right-[10%] w-1.5 h-1.5 bg-[#00F3FF] rounded-full animate-ping" style={{animationDuration: "3s"}}></div>
      
      {/* Center Hub */}
      <div className="relative z-10 w-12 h-12 bg-[#0A0B10] border-2 border-[#00F3FF] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,243,255,0.5)]">
        <div className="w-4 h-4 bg-[#00F3FF] rounded-full animate-pulse"></div>
      </div>
    </div>
    <div className="mt-8 text-center">
      <p className="text-xs text-[#00F3FF] uppercase tracking-[0.3em] font-bold animate-pulse">Quét tần số thấp... Đang thu nhận tín hiệu</p>
    </div>
  </section>
);"""

original = re.sub(r'const SonarLoader: React\.FC = \(\) => \(.*?</div>\n\);\n', sonar_loader_code + '\n', original, flags=re.DOTALL)

style_injection = """
      {/* NEW DEEP OCEAN UI: Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        .grid-overlay {
          background-image: radial-gradient(circle at 2px 2px, rgba(0, 243, 255, 0.05) 1px, transparent 0);
          background-size: 40px 40px;
        }
        .glow-text {
          text-shadow: 0 0 20px rgba(0, 243, 255, 0.5);
        }
        .glass-panel-sonar {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(0, 243, 255, 0.2);
          box-shadow: inset 0 0 30px rgba(0, 243, 255, 0.05);
        }
        @keyframes radar-sweep {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .radar-line {
          background: linear-gradient(90deg, rgba(0, 243, 255, 0) 0%, rgba(0, 243, 255, 0.8) 100%);
          animation: radar-sweep 4s linear infinite;
        }
        .scanning-laser {
          background: linear-gradient(90deg, transparent, rgba(0, 243, 255, 0.4), transparent);
          width: 100%;
          height: 100%;
          position: absolute;
          top: 0;
          left: -100%;
          animation: laser-move 2s ease-in-out infinite;
        }
        @keyframes laser-move {
          0% { left: -100%; }
          50% { left: 100%; }
          100% { left: 100%; }
        }
      `}} />

      {/* Deep Sea Background Effects */}
      <div className="fixed inset-0 grid-overlay pointer-events-none z-0"></div>
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,102,255,0.1),transparent)] pointer-events-none z-0"></div>
"""

original = re.sub(
    r'\{/\* Deep Sea Background Effects \*/\}.*?(?=\{/\* HEADER \*/\})',
    style_injection,
    original,
    flags=re.DOTALL
)

# Replace HERO SEARCH
hero_search_new_code = """        {/* HERO SEARCH */}
        <div className="max-w-4xl mx-auto mb-16 relative z-20">
          <header className="relative z-10 pt-8 pb-10 text-center px-4">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter uppercase mb-4 glow-text bg-clip-text text-transparent bg-gradient-to-r from-[#00F3FF] via-[#0066FF] to-blue-600 drop-shadow-none">
              {t('toolUI.hiddenChannel.hero_title')}
            </h2>
            <p className="text-blue-300/80 text-lg md:text-xl font-light tracking-wide max-w-3xl mx-auto">
              {t('toolUI.hiddenChannel.hero_desc')}
            </p>
          </header>

          <form onSubmit={handleSubmit} className="glass-panel-sonar w-full max-w-4xl p-8 rounded-3xl relative overflow-hidden mb-12 shadow-2xl">
            {/* Glow decoration */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#00F3FF]/10 blur-[100px] rounded-full pointer-events-none"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end relative z-10">
              {/* Keyword Search Input */}
              <div className="md:col-span-7 flex flex-col gap-2">
                <label className="text-xs uppercase tracking-widest text-[#00F3FF]/60 font-bold ml-1">
                  {t('toolUI.hiddenChannel.target_label')}
                </label>
                <div className="relative group">
                  <input 
                    type="text"
                    value={seedQuery}
                    onChange={(e) => setSeedQuery(e.target.value)}
                    className="w-full bg-black/40 border-slate-700 text-white rounded-xl py-4 px-6 focus:ring-[#00F3FF] focus:border-[#00F3FF] transition-all duration-500 placeholder:text-slate-600 outline-none" 
                    placeholder="Ví dụ: Solo Camping, AI Art, Tech Reviews..."
                  />
                  <div className="scanning-laser pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>
              
              {/* Language Dropdown */}
              <div className="md:col-span-3 flex flex-col gap-2">
                <label className="text-xs uppercase tracking-widest text-[#00F3FF]/60 font-bold ml-1">
                  {t('toolUI.hiddenChannel.language_label')}
                </label>
                <select 
                  value={outputLanguage}
                  onChange={(e) => setOutputLanguage(e.target.value)}
                  className="w-full bg-black/40 border-slate-700 text-white rounded-xl py-4 px-6 focus:ring-[#00F3FF] focus:border-[#00F3FF] appearance-none cursor-pointer outline-none"
                >
                  <option value="Tiếng Việt">Tiếng Việt (VN)</option>
                  <option value="English">English (US)</option>
                  <option value="Global">Toàn Cầu (Global)</option>
                </select>
              </div>
              
              {/* Action Button */}
              <div className="md:col-span-2">
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-[60px] bg-gradient-to-br from-[#0066FF] to-[#00F3FF] rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_25px_rgba(0,243,255,0.4)] group relative overflow-hidden disabled:opacity-50 disabled:grayscale"
                >
                  <span className="absolute inset-0 bg-white/20 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite] rounded-xl opacity-0 hover:opacity-100 peer-disabled:hidden"></span>
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  ) : (
                    <Radar size={20} className="text-white mr-2" />
                  )}
                  <span className="font-bold text-white text-sm uppercase tracking-tighter">
                    {isLoading ? t('toolUI.hiddenChannel.scanning') : t('toolUI.hiddenChannel.scan_btn')}
                  </span>
                </button>
              </div>
            </div>
            
            <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-[10px] uppercase tracking-[0.2em] text-cyan-700 font-medium z-10 relative">
              <span>Sonar Status: {isLoading ? 'Scanning...' : 'Ready'}</span>
              <span className={`w-1 h-1 rounded-full bg-[#00F3FF] ${isLoading ? 'animate-ping' : 'animate-pulse'}`}></span>
              <span>Depth: 10,000m</span>
              <span className="w-1 h-1 rounded-full bg-cyan-900"></span>
              <span>Encryption: Active</span>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-950/50 border border-red-900/50 rounded text-red-400 text-sm font-medium z-10 relative">
                ⚠️ {error}
              </div>
            )}
          </form>
        </div>"""

original = re.sub(
    r'\{/\* HERO SEARCH \*/\}.*?(?=\{/\* RESULTS \*/\})',
    hero_search_new_code + '\n\n        ',
    original,
    flags=re.DOTALL
)

# And finally replace `<SonarLoader />` with `<RadarVisualizer />`
original = original.replace('<SonarLoader />', '<RadarVisualizer />')

# Update background wrapper class for better theme integration
original = original.replace(
    'bg-[#020617] text-cyan-50',
    'bg-[#0A0B10] text-cyan-50'
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(original)
print("Updated successfully!")
