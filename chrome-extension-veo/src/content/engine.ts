// VE0 AUTOMATION ENGINE - MULTI-PLATFORM DRIVER ARCHITECTURE
// Supported: Google Veo (Labs), Meta AI.

if ((window as any).KODAFLOW_LOADED) throw new Error("Kodaflow already loaded");
(window as any).KODAFLOW_LOADED = true;

// --- CONFIG ---
let BATCH_CONFIG = {
    COOLDOWN_MIN: 30000,
    COOLDOWN_MAX: 60000,
    AUTO_DOWNLOAD: false
};
const GENERATION_MAX_WAIT = 600000; // 10 Mins

let promptsQueue: string[] = [];
let currentPromptIndex = 0;
let isStopped = false;

// --- UI UTILS ---
// Create a visible status panel for user feedback
const createStatusPanel = () => {
    let panel = document.getElementById('kodaflow-status');
    if (!panel) {
        panel = document.createElement('div');
        panel.id = 'kodaflow-status';
        panel.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.9);
            color: #00ff00;
            padding: 15px;
            border-radius: 10px;
            font-family: monospace;
            z-index: 10000;
            pointer-events: none;
            width: 350px;
            max-height: 200px;
            overflow-y: auto;
            font-size: 13px;
            border: 1px solid #444;
            display: flex;
            flex-direction: column-reverse; /* Newest at bottom visually if we append, but let's just preprend */
            white-space: pre-wrap;
        `;
        document.body.appendChild(panel);
    }
    return panel;
};

const updateStatus = (msg: string) => {
    const panel = createStatusPanel();
    const line = document.createElement('div');
    line.style.borderBottom = "1px solid #333";
    line.style.marginBottom = "4px";
    line.style.paddingBottom = "4px";
    line.innerText = `[${new Date().toLocaleTimeString()}] ${msg}`;
    panel.prepend(line); // Add new message to top
    console.log(`[Kodaflow]: ${msg}`);
};

// --- UTILS ---
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const clean = (str: string) => (str || '').toLowerCase().replace(/\s+/g, ' ').trim();
const showNotification = (message: string) => console.log(`[Kodaflow]: ${message}`);

const getAllElements = (root: Document | ShadowRoot | Element): Element[] => {
    let elements: Element[] = [];
    const loop = (parent: Document | ShadowRoot | Element) => {
        const children = parent.querySelectorAll('*');
        children.forEach(el => {
            elements.push(el);
            if (el.shadowRoot) loop(el.shadowRoot);
        });
    };
    loop(root);
    return elements;
};

const simulateInput = (el: HTMLElement, text: string) => {
    el.focus();
    if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
        const input = el as HTMLInputElement | HTMLTextAreaElement;

        // Fix: Use correct prototype for TextArea vs Input to avoid "Illegal Invocation"
        const proto = el.tagName === 'TEXTAREA'
            ? window.HTMLTextAreaElement.prototype
            : window.HTMLInputElement.prototype;

        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(proto, "value")?.set;

        if (nativeInputValueSetter) {
            nativeInputValueSetter.call(input, text);
        } else {
            input.value = text;
        }

        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
        el.focus();
        const success = document.execCommand('insertText', false, text);
        if (!success) {
            el.innerText = text;
            el.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }
};

const clickAtCoords = (x: number, y: number) => {
    const target = document.elementFromPoint(x, y) as HTMLElement;
    if (target) {
        console.log("Sniper Target:", target);
        ['mousedown', 'mouseup', 'click'].forEach(type => {
            const evt = new MouseEvent(type, {
                bubbles: true, cancelable: true, view: window,
                clientX: x, clientY: y, button: 0
            });
            target.dispatchEvent(evt);
        });
        return true;
    }
    return false;
};

// --- DRIVER INTERFACE ---
interface AutomationDriver {
    name: string;
    injectPrompt(prompt: string): Promise<boolean>;
    clickGenerate(): Promise<boolean>;
    snapshot(): Promise<void>; // Capture baseline state
    detectCompletion(): Promise<boolean>;
}

// --- DRIVER 1: GOOGLE VEO ---
class VeoDriver implements AutomationDriver {
    name = "Google Veo";
    baselineCount = 0;

    async injectPrompt(prompt: string) {
        // ... (Same logic as before) ...
        const selectors = ['textarea', 'div[contenteditable="true"]', 'div[role="textbox"]', '.prompt-input'];
        let inputEl: HTMLElement | null = null;
        for (const sel of selectors) {
            inputEl = document.querySelector(sel) as HTMLElement;
            if (inputEl) break;
        }
        if (!inputEl) {
            const placeholders = Array.from(document.querySelectorAll('div, span, p')).filter(e => {
                const t = (e as HTMLElement).innerText.toLowerCase();
                return t.includes('prompt') || t.includes('describe') || t.includes('nhập') || t.includes('mô tả');
            });
            if (placeholders.length > 0) {
                (placeholders[0] as HTMLElement).click();
                await sleep(1000);
                inputEl = document.querySelector('textarea, div[contenteditable="true"]') as HTMLElement;
            }
        }
        if (inputEl) {
            simulateInput(inputEl, prompt);
            updateStatus("✍️ Veo Prompt Injected");
            return true;
        }
        return false;
    }

    async clickGenerate() {
        const candidates = Array.from(document.querySelectorAll('button, div[role="button"]'));
        const genBtn = candidates.find(btn => {
            const el = btn as HTMLElement;
            const text = clean(el.innerText);
            const label = clean(el.getAttribute('aria-label') || '');
            const fullText = (text + " " + label).trim();
            const hasAction = fullText.includes('tạo') || fullText.includes('create') || fullText.includes('generate');
            if (!hasAction) return false;
            const isNavigation = fullText.includes('ảnh') || fullText.includes('video') || fullText.includes('project') || fullText.includes('cảnh');
            return !isNavigation;
        });

        if (genBtn) {
            (genBtn as HTMLElement).click();
            updateStatus("🚀 Veo Generating Clicked...");
            return true;
        }
        return false;
    }

    countSuccessElements(): number {
        const all = getAllElements(document);
        return all.filter(el => {
            const e = el as HTMLElement;
            const t = clean(e.innerText || '');
            const l = clean(e.getAttribute('aria-label') || '');
            const isDownloadKw = t.includes('tải xuống') || t.includes('download') || l.includes('download');
            const isQuality = t.includes('1080') || t.includes('720');
            const isBtn = e.tagName === 'BUTTON' || e.getAttribute('role') === 'button' || e.tagName === 'A' || e.getAttribute('data-tooltip');

            // Check visibility
            const rect = e.getBoundingClientRect();
            const isVisible = rect.width > 0 && rect.height > 0;

            return isBtn && isDownloadKw && !isQuality && isVisible;
        }).length;
    }

    async snapshot() {
        // Wait a bit to ensure UI is stable
        await sleep(2000);
        this.baselineCount = this.countSuccessElements();
        updateStatus(`📸 Baseline Downloads: ${this.baselineCount}`);
    }

    async detectCompletion() {
        const currentCount = this.countSuccessElements();

        // 1. Check for "Generating" state
        const all = getAllElements(document);
        const isGenerating = all.some(el => {
            const t = clean((el as HTMLElement).innerText || '');
            return t.includes('đang tạo') || t.includes('generating') || t.includes('creating');
        });

        updateStatus(`👀 Wait... (${currentCount}/${this.baselineCount}) ${isGenerating ? '[Busy]' : '[Idle]'}`);

        if (isGenerating) {
            return false; // Definitely busy
        }

        // 2. If NOT generating, and count increased -> Done
        if (currentCount > this.baselineCount) {
            updateStatus("✅ Task Done (New Item)");
            return true;
        }

        return false;
    }
}

// --- DRIVER 2: META AI ---
class MetaDriver implements AutomationDriver {
    name = "Meta AI";
    baselineCount = 0;

    async injectPrompt(prompt: string) {
        // ... (Same logic as before) ...
        let inputs = Array.from(document.querySelectorAll('textarea, div[contenteditable="true"], div[role="textbox"]'));
        let target = inputs.find(el => {
            const ph = clean(el.getAttribute('placeholder') || el.getAttribute('aria-placeholder') || '');
            return ph.includes('mô tả') || ph.includes('describe');
        });

        if (!target) {
            const placeholders = Array.from(document.querySelectorAll('div, span, p, label')).filter(e => {
                const t = clean((e as HTMLElement).innerText || '');
                return t.includes('mô tả hoạt ảnh') || t.includes('describe your animation');
            });

            if (placeholders.length > 0) {
                const p = placeholders[placeholders.length - 1] as HTMLElement;
                p.click();
                await sleep(500);
                if (document.activeElement &&
                    (document.activeElement.tagName === 'INPUT' ||
                        document.activeElement.tagName === 'TEXTAREA' ||
                        document.activeElement.getAttribute('contenteditable') === 'true' ||
                        document.activeElement.getAttribute('role') === 'textbox')) {
                    target = document.activeElement as HTMLElement;
                } else {
                    inputs = Array.from(document.querySelectorAll('textarea, div[contenteditable="true"], div[role="textbox"]'));
                    if (inputs.length > 0) target = inputs[0];
                }
            }
        }
        if (!target && inputs.length > 0) target = inputs[0];
        if (target) {
            simulateInput(target as HTMLElement, prompt);
            updateStatus("✍️ Meta Prompt Injected");
            await sleep(500); // Wait for value to settle
            return true;
        }
        updateStatus("❌ Meta Input Not Found");
        return false;
    }

    async clickGenerate() {
        // ... (Same logic - simplified for brevity, assume keys work) ...
        updateStatus("Meta Generating...");
        const active = document.activeElement as HTMLElement;
        if (active) {
            const events = [
                new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Enter', code: 'Enter', keyCode: 13 }),
                new KeyboardEvent('keypress', { bubbles: true, cancelable: true, key: 'Enter', code: 'Enter', keyCode: 13 }),
                new KeyboardEvent('keyup', { bubbles: true, cancelable: true, key: 'Enter', code: 'Enter', keyCode: 13 })
            ];
            events.forEach(e => active.dispatchEvent(e));
            updateStatus("🚀 Meta Hit Enter");
            await sleep(1000);
        }
        return true;
    }

    countSuccessElements(): number {
        const readyBtn = Array.from(document.querySelectorAll('button')).filter(b => {
            const label = clean(b.getAttribute('aria-label') || '');
            const text = clean((b as HTMLElement).innerText || '');
            const full = (label + " " + text).trim();
            const isGen = full.includes('send') || full.includes('gửi') ||
                full.includes('tạo') || full.includes('create') ||
                full.includes('generate');
            return isGen && !(b as HTMLButtonElement).disabled;
        });
        return readyBtn.length;
    }

    async snapshot() {
        // For Meta, logic might be different (wait for 'Ready' state?)
        // The original logic was: wait for "Start/Send" button to be ENABLED (it disables during gen).
        // So checking if "Send" button is enabled is actually a good check for completion.
        // We probably don't need baseline count for Meta if we rely on "Enabled vs Disabled".
        // But to adhere to interface:
        this.baselineCount = 0;
    }

    async detectCompletion() {
        // Original Meta logic: Wait for Send button to respond
        const readyBtn = Array.from(document.querySelectorAll('button')).find(b => {
            const label = clean(b.getAttribute('aria-label') || '');
            const text = clean((b as HTMLElement).innerText || '');
            const full = (label + " " + text).trim();
            const isGen = full.includes('send') || full.includes('gửi') ||
                full.includes('tạo') || full.includes('create') ||
                full.includes('generate');
            return isGen && !(b as HTMLButtonElement).disabled;
        });

        if (readyBtn) {
            updateStatus("✅ Meta Task Done");
            return true;
        }
        updateStatus("⏳ Meta Working...");
        return false;
    }
}

// --- FACTORY ---
const getDriver = (): AutomationDriver => {
    const host = window.location.hostname;
    if (host.includes('meta.ai')) return new MetaDriver();
    return new VeoDriver();
};

// --- MAIN LOOP ---
async function runBatch() {
    if (isStopped) return;

    // Check if queue ended
    if (currentPromptIndex >= promptsQueue.length) {
        updateStatus("✅ All Done! (Queue Empty)");
        await sleep(2000); // Let user see message
        chrome.runtime.sendMessage({ action: 'batchCompleted' });
        return;
    }

    const driver = getDriver();
    updateStatus(`🚀 Processing #${currentPromptIndex + 1}/${promptsQueue.length}...`);

    try {
        await driver.snapshot(); // Capture baseline

        // Retry Loop for Injection
        let injected = false;
        for (let i = 0; i < 3; i++) {
            injected = await driver.injectPrompt(promptsQueue[currentPromptIndex]);
            if (injected) break;
            updateStatus("⚠️ Input not found, retry...");
            await sleep(2000);
        }
        if (!injected) throw new Error("Input Not Found (Check UI)");

        await sleep(2000);

        const generated = await driver.clickGenerate();
        if (!generated) throw new Error("Gen Button Not Found");

        let waited = 0;
        let jobDone = false;
        await sleep(5000); // Initial wait

        while (waited < GENERATION_MAX_WAIT && !isStopped) {
            await sleep(3000);
            waited += 3000;
            jobDone = await driver.detectCompletion();

            if (jobDone) {
                console.log("[Engine] Job Done.");
                await sleep(3000);
                break;
            }
        }

        if (!isStopped && currentPromptIndex < promptsQueue.length - 1) {
            const cooldown = Math.floor(Math.random() * (BATCH_CONFIG.COOLDOWN_MAX - BATCH_CONFIG.COOLDOWN_MIN + 1)) + BATCH_CONFIG.COOLDOWN_MIN;
            updateStatus(`❄️ Cooldown: ${cooldown / 1000}s`);
            await sleep(cooldown);
        }
    } catch (e: any) {
        console.error("[Engine] Error:", e);
        updateStatus(`❌ Error: ${e.message}`);
        updateStatus("⏳ Pausing 5s before next item...");
        await sleep(5000); // Wait for user to read error
    }
    currentPromptIndex++;
    runBatch();
}

// --- LISTENER ---
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === 'START_AUTOMATION') {
        promptsQueue = msg.queue.map((q: any) => q.prompt);
        currentPromptIndex = 0;
        isStopped = false;
        if (msg.config) {
            BATCH_CONFIG.COOLDOWN_MIN = msg.config.minDelay || 30000;
            BATCH_CONFIG.COOLDOWN_MAX = msg.config.maxDelay || 60000;
            BATCH_CONFIG.AUTO_DOWNLOAD = msg.config.autoDownload;
        }
        createStatusPanel();
        updateStatus("🚀 Starting Batch...");
        runBatch();
        sendResponse({ status: 'ok' });
    }
    if (msg.type === 'STOP_AUTOMATION') {
        isStopped = true;
        updateStatus("🛑 Stopped");
        sendResponse({ status: 'stopped' });
    }
});
