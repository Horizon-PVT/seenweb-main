import sys

file_path = r'c:\Users\ADMIN\Desktop\A Tung\seenweb-main\seenweb-main\components\ScriptRefinerTool.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Extract everything up to `return (`
prefix, remainder = content.split('    return (\n', 1)

new_jsx = """        <div className={`min-h-full bg-[#0A0B10] text-[#F8FAFC] font-sans flex flex-col transition-all duration-300 ${isFullScreen ? 'fixed inset-0 z-50' : ''} notranslate selection:bg-emerald-500/30`} translate="no">
            <style dangerouslySetInnerHTML={{ __html: `
              .glass-panel {
                background: rgba(255, 255, 255, 0.02);
                backdrop-filter: blur(24px);
                -webkit-backdrop-filter: blur(24px);
                border: 1px solid rgba(16, 185, 129, 0.1);
              }
              .emerald-glow-text {
                text-shadow: 0 0 15px rgba(16, 185, 129, 0.5);
              }
              .scrollbar-hide::-webkit-scrollbar {
                display: none;
              }
              .diff-content del {
                  background-color: rgba(239, 68, 68, 0.2);
                  text-decoration: line-through;
                  color: #fca5a5;
                  padding: 0 4px;
                  border-radius: 4px;
              }
              .diff-content ins {
                  background-color: rgba(16, 185, 129, 0.2);
                  text-decoration: none;
                  color: #6ee7b7;
                  padding: 0 4px;
                  border-radius: 4px;
              }
            `}} />

            {/* HEADER */}
            <header className="flex items-center justify-between px-4 lg:px-8 py-4 lg:py-6 border-b border-white/5 shrink-0 z-20">
                <div className="flex items-center gap-4 lg:gap-6">
                    {onBack && (
                        <button onClick={onBack} aria-label="Go back" className="p-2 hover:bg-white/5 rounded-full transition-colors group">
                            <svg className="text-slate-400 group-hover:text-[#10b981] transition-colors" fill="none" height="24" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="24"><path d="m15 18-6-6 6-6"></path></svg>
                        </button>
                    )}
                    <div className="flex flex-col">
                        <h1 className="text-lg lg:text-xl font-bold tracking-widest text-white emerald-glow-text uppercase">
                            Script Refiner <span className="text-[#10b981]">AI</span>
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
                        <span className="relative flex h-2 w-2">
                            <span className={`absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 ${isLoading ? 'animate-ping' : ''}`}></span>
                            <span className={`relative inline-flex rounded-full h-2 w-2 ${isLoading ? 'bg-emerald-400' : 'bg-emerald-500'}`}></span>
                        </span>
                        <span className="text-[10px] lg:text-xs font-medium text-emerald-400 tracking-wide uppercase">
                            Status: {isLoading ? 'Processing' : 'Ready'}
                        </span>
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className={`flex-grow flex flex-col lg:flex-row overflow-hidden ${output ? 'w-full' : 'max-w-6xl mx-auto w-full'} p-4 lg:p-6 gap-6`}>
                
                {/* LEFT: INPUT & CONTROLS */}
                <div className={`flex flex-col gap-6 h-full transition-all duration-500 ${output ? 'lg:w-1/2' : 'w-full'}`}>
                    {/* Editor Canvas */}
                    <section className="flex-1 glass-panel rounded-3xl relative flex flex-col overflow-hidden group">
                        <div className="p-4 lg:p-6 flex items-center justify-between border-b border-white/5 shrink-0">
                            <div className="flex items-center gap-2.5">
                                <svg className="text-[#10b981]" fill="none" height="18" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="18"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                                <span className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase">Original Draft</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="file"
                                    accept=".txt,.md,.srt,.vtt"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        const reader = new FileReader();
                                        reader.onload = (event) => {
                                            const text = event.target?.result;
                                            if (typeof text === 'string') setOriginalScript(text);
                                        };
                                        reader.readAsText(file);
                                    }}
                                />
                                <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/5 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all text-slate-300 text-xs font-medium">
                                    <svg fill="none" height="14" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="14"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" x2="12" y1="3" y2="15"></line></svg>
                                    <span className="hidden sm:inline">Import File (.txt)</span>
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 relative p-4 lg:p-8 overflow-hidden flex">
                            <textarea
                                value={originalScript}
                                onChange={e => setOriginalScript(e.target.value)}
                                className="w-full h-full bg-transparent border-none focus:ring-0 text-lg lg:text-xl font-light leading-relaxed text-slate-200 resize-none scrollbar-hide outline-none z-10"
                                placeholder="Dán kịch bản thô hoặc bản thảo của bạn vào đây..."
                                spellCheck="false"
                            ></textarea>
                            <div className="absolute inset-0 pointer-events-none border border-emerald-500/0 group-focus-within:border-emerald-500/10 transition-colors duration-500 rounded-3xl z-0"></div>
                        </div>
                    </section>

                    {/* AI Control Deck */}
                    <section className="shrink-0 flex flex-col gap-4 lg:gap-6">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase px-1 tracking-wider">Rewrite Level</label>
                                <select value={rewriteLevel} onChange={e => setRewriteLevel(e.target.value)} className="bg-black/50 border border-white/10 rounded-xl px-3 lg:px-4 py-2 lg:py-3 text-xs lg:text-sm text-slate-300 focus:border-emerald-500/50 hover:bg-black/70 outline-none transition-all cursor-pointer">
                                    <option value="Minor">Minor Polish (Fix grammar)</option>
                                    <option value="Standard">Standard (Improve flow)</option>
                                    <option value="Complete">Complete Overhaul (Rewrite)</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase px-1 tracking-wider">Goal</label>
                                <select value={optimizeGoal} onChange={e => setOptimizeGoal(e.target.value)} className="bg-black/50 border border-white/10 rounded-xl px-3 lg:px-4 py-2 lg:py-3 text-xs lg:text-sm text-slate-300 focus:border-emerald-500/50 hover:bg-black/70 outline-none transition-all cursor-pointer">
                                    <option value="Engagement">Maximize Engagement</option>
                                    <option value="Clarity">Maximize Clarity</option>
                                    <option value="SEO">SEO Optimization</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase px-1 tracking-wider">Target Language</label>
                                <select value={language} onChange={e => setLanguage(e.target.value)} className="bg-black/50 border border-white/10 rounded-xl px-3 lg:px-4 py-2 lg:py-3 text-xs lg:text-sm text-slate-300 focus:border-emerald-500/50 hover:bg-black/70 outline-none transition-all cursor-pointer">
                                    <option value="Original">Keep Original</option>
                                    <option value="English">English</option>
                                    <option value="Tiếng Việt">Vietnamese</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase px-1 tracking-wider">Custom Instruction</label>
                                <input
                                    type="text"
                                    value={initialChatRequest}
                                    onChange={e => setInitialChatRequest(e.target.value)}
                                    className="bg-black/50 border border-white/10 rounded-xl px-3 lg:px-4 py-2 lg:py-3 text-xs lg:text-sm text-slate-300 placeholder:text-slate-600 focus:border-emerald-500/50 hover:bg-black/70 outline-none transition-all"
                                    placeholder="e.g. TED Talk..."
                                />
                            </div>
                        </div>
                        
                        <div className="flex justify-center mt-2 lg:mt-4">
                            <button
                                onClick={handleSubmit}
                                disabled={isLoading || !originalScript}
                                className="relative group w-full lg:w-auto"
                            >
                                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 peer-disabled:hidden"></div>
                                <div className={`relative flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-500 to-teal-600 px-12 py-4 lg:py-5 rounded-2xl font-bold text-white tracking-widest text-base lg:text-lg shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all ${isLoading || !originalScript ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'}`}>
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <svg className="animate-pulse" fill="none" height="22" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="22"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path></svg>
                                    )}
                                    {isLoading ? 'PROCESSING...' : 'KHỞI ĐỘNG REFINER'}
                                </div>
                            </button>
                        </div>
                        {error && <p className="text-red-400 text-xs text-center">{error}</p>}
                    </section>
                </div>

                {/* RIGHT: OUTPUT */}
                {output && (
                    <div className="flex flex-col lg:w-1/2 h-full glass-panel rounded-3xl animate-in slide-in-from-right duration-500 overflow-hidden">
                        {/* METRICS HEADER */}
                        <div className="bg-black/40 border-b border-white/5 p-4 grid grid-cols-4 gap-2 lg:gap-4 shrink-0">
                            {[
                                { label: 'Uniqueness', value: output.metrics.uniqueness, color: 'text-emerald-400' },
                                { label: 'Similarity', value: output.metrics.similarity, color: 'text-teal-400' },
                                { label: 'Read Time', value: output.metrics.readTime, color: 'text-slate-300' },
                                { label: 'Words', value: output.metrics.wordCount, color: 'text-slate-300' },
                            ].map((m, i) => (
                                <div key={i} className="text-center bg-white/5 rounded-lg py-2">
                                    <div className={`text-sm lg:text-lg font-bold ${m.color}`}>{m.value}</div>
                                    <div className="text-[8px] lg:text-[10px] uppercase text-slate-500 font-bold">{m.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* CONTENT */}
                        <div className="flex-grow relative overflow-hidden flex flex-col bg-transparent">
                            <div className="absolute top-4 right-4 z-10 flex items-center gap-1 lg:gap-2 bg-black/60 backdrop-blur p-1 rounded-full border border-white/10">
                                <button
                                    onClick={() => setDiffView(false)}
                                    className={`px-3 lg:px-4 py-1.5 rounded-full text-xs font-bold transition-all ${!diffView ? 'bg-emerald-500/20 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'text-slate-400 hover:text-white'}`}
                                >
                                    Final
                                </button>
                                <button
                                    onClick={() => setDiffView(true)}
                                    className={`px-3 lg:px-4 py-1.5 rounded-full text-xs font-bold transition-all ${diffView ? 'bg-teal-500/20 text-teal-400 shadow-[0_0_10px_rgba(20,184,166,0.2)]' : 'text-slate-400 hover:text-white'}`}
                                >
                                    Diff View
                                </button>
                            </div>

                            <div ref={outputRef} className="flex-grow overflow-y-auto p-4 lg:p-8 pt-16 font-serif text-base lg:text-lg leading-relaxed text-slate-200 whitespace-pre-wrap relative">
                                {isLoading && (
                                    <div className="absolute inset-0 bg-[#0A0B10]/60 backdrop-blur-sm z-20 flex items-center justify-center">
                                        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                                    </div>
                                )}
                                {diffView ? (
                                    <div
                                        className="diff-content"
                                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(output.diffScript) }}
                                    />
                                ) : output.refinedScript}
                            </div>

                            {/* CHAT BAR */}
                            <div className="p-4 bg-black/60 border-t border-white/5 shrink-0 backdrop-blur-md">
                                <form onSubmit={handleIterativeSubmit} className="flex gap-2 relative mb-3">
                                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                        <MessageSquare size={16} className="text-emerald-500/50" />
                                    </div>
                                    <input
                                        type="text"
                                        value={iterativeChatRequest}
                                        onChange={e => setIterativeChatRequest(e.target.value)}
                                        placeholder="Ask for changes (e.g. 'Shorten the intro', 'Make it funnier')..."
                                        className="pl-10 flex-grow bg-white/5 border border-white/10 rounded-full px-4 py-3 text-sm text-slate-200 focus:border-emerald-500/50 focus:bg-white/10 outline-none transition-all placeholder:text-slate-600"
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!iterativeChatRequest || isLoading}
                                        className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full w-11 h-11 flex items-center justify-center hover:bg-emerald-500/40 hover:text-white transition-colors disabled:opacity-50 disabled:grayscale"
                                    >
                                        <Repeat size={16} />
                                    </button>
                                </form>

                                <div className="flex justify-between items-center">
                                    <div className="flex gap-2">
                                        <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                                            {copySuccess ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} className="text-slate-400" />}
                                            {copySuccess || 'Copy'}
                                        </button>
                                        <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                                            <Download size={14} className="text-slate-400" /> Export
                                        </button>
                                    </div>
                                    <span className="text-[10px] text-emerald-500/50 font-mono tracking-widest uppercase">AI: Gemini 1.5 Pro</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Remove Footer Decoration as it consumes too much space, or we can keep it hidden on output */}
            {!output && (
                <footer className="mt-auto py-6 lg:py-10 opacity-30 pointer-events-none select-none shrink-0">
                    <div className="flex justify-center items-center gap-4 lg:gap-8">
                        <div className="h-px w-20 lg:w-32 bg-gradient-to-r from-transparent to-emerald-500/50"></div>
                        <span className="text-[8px] lg:text-[10px] tracking-[0.4em] uppercase font-medium">Neural Engine active</span>
                        <div className="h-px w-20 lg:w-32 bg-gradient-to-l from-transparent to-emerald-500/50"></div>
                    </div>
                </footer>
            )}

            <AnimatePresence>
                {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
            </AnimatePresence>
        </div>
    );
}"""

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(prefix + new_jsx)

print("ScriptRefinerTool.tsx has been completely rewritten with the new UI.")
