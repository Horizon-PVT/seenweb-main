import sys
import re

file_path = r'c:\Users\ADMIN\Desktop\A Tung\seenweb-main\seenweb-main\components\TextToSpeechTool.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    target_content = f.read()

# I need to match the return statement from `return (` and replace everything up to the first VoiceGalleryModal.
# The Modals logic starts with: {/* Voice Gallery Modal */}

new_render_ui = """return (
        <div className="fixed inset-0 z-50 bg-[#0A0B10] text-slate-200 font-sans flex flex-col overflow-y-auto overflow-x-hidden md:overflow-hidden">
            {/* INJECT CUSTOM CSS FROM STITCH */}
            <style dangerouslySetInnerHTML={{ __html: `
              .glass-panel {
                background: rgba(255, 255, 255, 0.03);
                backdrop-filter: blur(24px);
                -webkit-backdrop-filter: blur(24px);
                border: 1px solid rgba(255, 255, 255, 0.1);
              }
              .glass-input {
                background: rgba(255, 255, 255, 0.02);
                border: 1px solid rgba(255, 255, 255, 0.08);
                transition: all 0.3s ease;
              }
              .glass-input:focus-within {
                border-color: rgba(205, 173, 90, 0.5);
                box-shadow: 0 0 15px rgba(205, 173, 90, 0.3);
              }
              .glow-gold {
                text-shadow: 0 0 15px rgba(205, 173, 90, 0.6);
              }
              .btn-gradient {
                background: linear-gradient(135deg, #CDAD5A 0%, #B8860B 100%);
                box-shadow: 0 4px 20px rgba(205, 173, 90, 0.4);
                transition: transform 0.2s ease, box-shadow 0.2s ease;
              }
              .btn-gradient:hover:not(:disabled) {
                transform: translateY(-1px);
                box-shadow: 0 6px 25px rgba(205, 173, 90, 0.5);
              }
              .btn-gradient:disabled {
                opacity: 0.5;
                filter: grayscale(1);
                cursor: not-allowed;
              }
            `}} />

            <div className="flex flex-col h-full w-full max-w-[1600px] mx-auto p-4 md:p-6 md:space-y-6">
                {/* Header */}
                <header className="flex items-center justify-between px-2 md:px-4 shrink-0 mb-4 md:mb-0" data-purpose="navigation-header">
                    <div className="flex items-center md:gap-4 gap-2">
                        <button onClick={onBack} className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center text-white backdrop-blur-sm shadow-[0_0_15px_rgba(205,173,90,0.2)]">
                            ←
                        </button>
                        <div className="flex items-center gap-2 md:gap-3">
                            <div className="hidden md:flex w-10 h-10 rounded-xl bg-[#CDAD5A] items-center justify-center shadow-[0_0_15px_rgba(205,173,90,0.5)]">
                                <svg className="w-6 h-6 text-[#0A0B10]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" x2="12" y1="19" y2="22"></line></svg>
                            </div>
                            <h1 className="text-lg md:text-2xl font-black tracking-widest text-white glow-gold uppercase">AI Voice Studio</h1>
                        </div>
                    </div>

                    {/* Segmented Control */}
                    <div className="hidden md:flex bg-white/5 p-1 rounded-full border border-white/10" data-purpose="toggle-switch">
                        <button
                            onClick={() => setActiveTab('text')}
                            className={`px-6 py-2 flex items-center gap-2 rounded-full text-sm font-bold transition-all ${activeTab === 'text' ? 'bg-white/10 text-white shadow-inner' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            📝 {t('tts_tool.tab_text')}
                        </button>
                        <button
                            onClick={() => setActiveTab('file')}
                            className={`px-6 py-2 flex items-center gap-2 rounded-full text-sm font-bold transition-all ${activeTab === 'file' ? 'bg-white/10 text-white shadow-inner' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            📄 {t('tts_tool.tab_file')}
                        </button>
                    </div>

                    <div className="md:w-48"></div>{/* Balance */}
                </header>

                <div className="flex md:hidden bg-white/5 p-1 rounded-xl border border-white/10 mb-4 mx-2">
                    <button onClick={() => setActiveTab('text')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'text' ? 'bg-white/10 text-white shadow-inner' : 'text-slate-400 hover:text-slate-200'}`}>📝 {t('tts_tool.tab_text')}</button>
                    <button onClick={() => setActiveTab('file')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'file' ? 'bg-white/10 text-white shadow-inner' : 'text-slate-400 hover:text-slate-200'}`}>📄 {t('tts_tool.tab_file')}</button>
                </div>

                {/* Dashboard Content */}
                <main className="flex-1 flex flex-col md:flex-row gap-6 min-h-0 pb-20 md:pb-0">
                    {/* Left Column 70% */}
                    <section className="w-full md:w-[70%] flex flex-col space-y-4 h-full min-h-[400px]">
                        <div className="glass-panel rounded-3xl p-4 md:p-6 flex-1 flex flex-col relative overflow-hidden h-full">
                            {activeTab === 'text' ? (
                                <>
                                    <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-4">
                                        <span className="text-[10px] md:text-xs font-semibold text-slate-500 uppercase tracking-widest hidden md:inline">Workspace / Text Editor</span>
                                        <span className="text-[10px] md:text-xs font-semibold text-slate-500 uppercase tracking-widest md:hidden">Text Editor</span>
                                        <input type="file" ref={importInputRef} accept=".txt" className="hidden" onChange={handleImportText} />
                                        <button onClick={() => importInputRef.current?.click()} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-all">
                                            <svg fill="none" height="14" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="14"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" x2="12" y1="3" y2="15"></line></svg>
                                            <span className="hidden md:inline">Import (.txt)</span>
                                            <span className="md:hidden">Nhập (.txt)</span>
                                        </button>
                                    </div>
                                    <div className="relative flex-1 flex flex-col">
                                        <textarea
                                            value={scriptText}
                                            onChange={(e) => setScriptText(e.target.value)}
                                            placeholder="Nhập hoặc dán nội dung văn bản của bạn vào đây..."
                                            className="w-full h-full bg-transparent border-none focus:ring-0 text-base md:text-lg leading-relaxed text-slate-200 placeholder-slate-600 resize-none font-light p-0 m-0 outline-none"
                                        ></textarea>
                                        <div className="flex items-center justify-between pt-4 mt-auto border-t border-white/5">
                                            <span className="text-xs text-[#CDAD5A] font-mono pointer-events-auto bg-[#CDAD5A]/10 px-2 py-1 rounded">{scriptText.length} {t('tts_tool.char_count')}</span>
                                            {dialogueMode && <span className="text-xs text-[#CDAD5A] font-bold tracking-widest uppercase flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#CDAD5A] animate-pulse"></span> {t('tts_tool.dialogue_on')}</span>}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center relative hover:bg-white/[0.01] transition-colors overflow-hidden p-4">
                                    <input type="file" ref={srtInputRef} accept=".srt,.txt" className="hidden" onChange={(e) => setSrtFile(e.target.files?.[0] || null)} />
                                    {srtFile ? (
                                        <div className="text-center">
                                            <div className="text-6xl mb-4 opacity-80">📄</div>
                                            <p className="text-lg md:text-xl font-bold text-slate-200 mb-2 truncate max-w-xs">{srtFile.name}</p>
                                            <p className="text-[#CDAD5A] font-mono mb-6">{(srtFile.size / 1024).toFixed(1)} KB</p>
                                            <button onClick={() => setSrtFile(null)} className="px-4 py-2 bg-red-950/50 text-red-400 border border-red-900/50 rounded-lg text-sm font-bold hover:bg-red-900/50 transition-colors">✕ {t('tts_tool.remove_file')}</button>
                                        </div>
                                    ) : (
                                        <div className="text-center flex flex-col items-center w-full">
                                            <div className="text-5xl md:text-6xl mb-6 opacity-40 translate-x-2">📄</div>
                                            <p className="text-slate-400 mb-6 font-light hidden md:block">{t('tts_tool.drag_drop')}</p>
                                            <button onClick={() => srtInputRef.current?.click()} className="px-6 md:px-8 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-bold transition-all whitespace-nowrap">
                                                {t('tts_tool.select_file')}
                                            </button>
                                            <p className="text-slate-600 text-[10px] md:text-xs mt-4 uppercase tracking-widest">{t('tts_tool.supported')}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="p-4 bg-red-950/30 border border-red-900/50 rounded-xl text-red-400 text-sm flex items-center gap-2">
                                ⚠️ {error}
                            </div>
                        )}

                        <div className="flex justify-center pt-2">
                            <button
                                onClick={activeTab === 'text' ? handleGenerate : handleSRTGenerate}
                                disabled={isLoading || (activeTab === 'text' ? !scriptText : !srtFile)}
                                className="btn-gradient w-full max-w-xl py-4 md:py-5 rounded-2xl flex items-center justify-center gap-3 text-abyssal font-black text-base md:text-lg tracking-widest uppercase group shrink-0"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin h-6 w-6 text-abyssal" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        <span>{statusMessage || t('tts_tool.processing')} {progress > 0 ? `${progress}%` : ''}</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-6 h-6 fill-[#0A0B10] animate-pulse" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                        {t('tts_tool.generate_btn')}
                                    </>
                                )}
                            </button>
                        </div>
                    </section>

                    {/* Right Column 30% */}
                    <aside className="w-full md:w-[30%] flex flex-col gap-4">
                        <div className="glass-panel flex-1 rounded-3xl p-4 md:p-6 flex flex-col gap-6 overflow-y-auto">
                            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest border-b border-white/5 pb-4">Cấu hình âm thanh</h2>
                            
                            {/* Dialogue Toggle */}
                            <div className="flex items-center justify-between p-4 glass-input rounded-xl border-l-4 border-l-[#CDAD5A]">
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-white">Hội thoại 2 người</span>
                                    <span className="text-[10px] text-slate-400 mt-1">Tự động phân vai nhân vật</span>
                                </div>
                                <button
                                    onClick={() => setDialogueMode(!dialogueMode)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${dialogueMode ? 'bg-[#CDAD5A]' : 'bg-white/10'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${dialogueMode ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>

                            {/* Voice Setup */}
                            <div className="space-y-3">
                                <div>
                                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1.5 block">{dialogueMode ? t('tts_tool.voice_label_a') : t('tts_tool.voice_label')}</label>
                                    <button 
                                        onClick={() => { setGalleryTarget('voice1'); setShowVoiceGallery(true); }}
                                        className="w-full glass-input rounded-xl p-3 flex items-center justify-between text-sm hover:border-[#CDAD5A]/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-[#CDAD5A]/20 border border-[#CDAD5A]/30 flex items-center justify-center text-xs">🎙️</div>
                                            <span className="font-bold text-white max-w-[120px] truncate md:max-w-[160px] text-left">{getVoiceName(voice1)}</span>
                                        </div>
                                        <span className="text-slate-500 text-xs">Thay đổi</span>
                                    </button>
                                </div>

                                {dialogueMode && (
                                    <div className="animate-in slide-in-from-top-4 duration-300">
                                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1.5 block">{t('tts_tool.voice_label_b')}</label>
                                        <button 
                                            onClick={() => { setGalleryTarget('voice2'); setShowVoiceGallery(true); }}
                                            className="w-full glass-input rounded-xl p-3 flex items-center justify-between text-sm hover:border-blue-500/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-xs">🎙️</div>
                                                <span className="font-bold text-white max-w-[120px] truncate md:max-w-[160px] text-left">{getVoiceName(voice2)}</span>
                                            </div>
                                            <span className="text-slate-500 text-xs">Thay đổi</span>
                                        </button>
                                    </div>
                                )}

                                <button 
                                    onClick={() => setShowCloneModal(true)}
                                    className="w-full py-2.5 mt-2 rounded-xl border border-dashed border-white/20 text-xs font-bold uppercase tracking-widest text-[#CDAD5A] hover:bg-[#CDAD5A]/10 hover:border-[#CDAD5A]/50 transition-all flex items-center justify-center gap-2"
                                >
                                    <svg fill="none" height="14" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="14"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
                                    Clone Giọng Mới
                                </button>
                            </div>

                            {/* Speed Control */}
                            <div className="space-y-3 pt-4 border-t border-white/5">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Tốc độ đọc</label>
                                    <span className="text-xs text-[#CDAD5A] font-mono font-bold bg-[#CDAD5A]/10 px-2 py-1 rounded">{speed.toFixed(2)}x</span>
                                </div>
                                <input
                                    type="range" min="0.5" max="2.0" step="0.1" value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))}
                                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#CDAD5A]"
                                />
                                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                                    <span>0.5x</span>
                                    <span>2.0x</span>
                                </div>
                            </div>

                            {/* Result Area */}
                            <div className="mt-auto pt-6 border-t border-white/5 space-y-4">
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <svg className="w-3 h-3 text-[#CDAD5A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
                                    Kết quả
                                </h3>
                                
                                {audioUrl ? (
                                    <div className="glass-input rounded-2xl p-4 border-[#CDAD5A]/30 shadow-[0_0_15px_rgba(205,173,90,0.1)] relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-gradient-to-r from-[#CDAD5A]/5 to-transparent pointer-events-none"></div>
                                        <audio controls src={audioUrl} className="w-full mb-3 h-10 outline-none grayscale invert contrast-200 hue-rotate-180 opacity-80" autoPlay />
                                        <div className="flex justify-end">
                                            <a
                                                href={audioUrl} download={`audio_${Date.now()}.wav`}
                                                className="text-xs font-bold text-white hover:text-[#CDAD5A] transition-colors flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg border border-white/10"
                                            >
                                                <svg fill="none" height="14" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="14"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" x2="12" y1="15" y2="3"></line></svg>
                                                TẢI VỀ
                                            </a>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center p-6 glass-input rounded-2xl border-dashed border-white/10 opacity-50">
                                        <svg className="w-6 h-6 text-slate-600 mb-2" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M2 10v3"></path><path d="M6 6v11"></path><path d="M10 3v18"></path><path d="M14 8v7"></path><path d="M18 5v13"></path><path d="M22 10v3"></path></svg>
                                        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Chưa có bản thu</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </aside>
                </main>
            </div>

            {/* Voice Gallery Modal */}
            <VoiceGalleryModal
"""

# Extract everything before `return (`
try:
    prefix, remainder = target_content.split('return (', 1)
    # The remainder contains everything. We want to find where `{/* Voice Gallery Modal */}` starts.
    _mid, suffix = remainder.split('{/* Voice Gallery Modal */}', 1)
    
    # We stitch them together.
    final_code = prefix + new_render_ui + suffix
    
    # Apply dark mode to Clone Modal
    final_code = final_code.replace(
        '<div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-2xl">',
        '<div className="bg-[#0A0B10] border border-white/10 w-full max-w-md p-6 rounded-2xl shadow-[0_0_30px_rgba(205,173,90,0.15)] text-slate-200">'
    )
    final_code = final_code.replace(
        '<h3 className="text-xl font-bold text-gray-800 mb-4">',
        '<h3 className="text-xl font-bold text-white mb-4 glow-gold">'
    )
    final_code = final_code.replace(
        '<div className="mb-4 p-3 bg-blue-50 text-blue-800 text-sm rounded-lg border border-blue-200">',
        '<div className="mb-4 p-3 bg-white/5 text-slate-300 text-sm rounded-lg border border-[#CDAD5A]/50">'
    )
    final_code = final_code.replace(
        'className="w-full border-2 border-gray-200 rounded-lg p-3 mb-4 focus:border-red-400 outline-none"',
        'className="w-full bg-[#0A0B10] border border-white/20 text-white rounded-lg p-3 mb-4 focus:border-[#CDAD5A] outline-none"'
    )
    final_code = final_code.replace('text-gray-600', 'text-slate-400')
    final_code = final_code.replace('text-gray-500', 'text-slate-500')
    final_code = final_code.replace(
        'className="flex-1 py-3 border-2 border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"',
        'className="flex-1 py-3 border border-white/10 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"'
    )
    final_code = final_code.replace(
        'className="flex-1 py-3 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 disabled:bg-gray-300"',
        'className="flex-1 py-3 btn-gradient text-[#0A0B10] rounded-lg font-bold disabled:bg-slate-700 disabled:opacity-50 tracking-widest uppercase"'
    )
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(final_code)
    print("UI rewrite completed successfully.")
except Exception as e:
    print("Error:", str(e))
