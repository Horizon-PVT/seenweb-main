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
const GENERATION_MAX_WAIT = 300000; // 5 Mins

let promptsQueue: string[] = [];
let currentPromptIndex = 0;
let isStopped = false;

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
        const input = el as HTMLInputElement;
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
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
    detectCompletion(): Promise<boolean>;
}

// --- DRIVER 1: GOOGLE VEO ---
class VeoDriver implements AutomationDriver {
    name = "Google Veo";
    // ... Legacy Logic ...
    async injectPrompt(prompt: string) {
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
            showNotification("✍️ Veo Prompt Injected");
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
            showNotification("🚀 Veo Generating...");
            return true;
        }
        return false;
    }

    async detectCompletion() {
        const all = getAllElements(document);
        const trigger = all.find(el => {
            const e = el as HTMLElement;
            const t = clean(e.innerText || '');
            const l = clean(e.getAttribute('aria-label') || '');
            const isDownloadKw = t.includes('tải xuống') || t.includes('download') || l.includes('download');
            const isQuality = t.includes('1080') || t.includes('720');
            const isBtn = e.tagName === 'BUTTON' || e.getAttribute('role') === 'button' || e.tagName === 'A' || e.getAttribute('data-tooltip');
            return isBtn && isDownloadKw && !isQuality;
        });
        if (trigger) {
            showNotification("✅ Veo Task Done");
            return true;
        }
        return false;
    }
}

// --- DRIVER 2: META AI ---
class MetaDriver implements AutomationDriver {
    name = "Meta AI";

    async injectPrompt(prompt: string) {
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
            showNotification("✍️ Meta Prompt Injected");
            await sleep(500); // Wait for value to settle
            return true;
        }
        showNotification("❌ Meta Input Not Found");
        return false;
    }

    async clickGenerate() {
        console.log("Meta Generate Strategy: ENTER KEY + Button Search");

        // 1. Try ENTER Key on Active Element
        const active = document.activeElement as HTMLElement;
        if (active) {
            console.log("Pressing Enter on:", active);
            const events = [
                new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Enter', code: 'Enter', keyCode: 13 }),
                new KeyboardEvent('keypress', { bubbles: true, cancelable: true, key: 'Enter', code: 'Enter', keyCode: 13 }),
                new KeyboardEvent('keyup', { bubbles: true, cancelable: true, key: 'Enter', code: 'Enter', keyCode: 13 })
            ];
            events.forEach(e => active.dispatchEvent(e));

            showNotification("🚀 Meta Pressed Hit Enter");
            await sleep(1000);

            // If enter worked, detectCompletion will pick it up
            // But we should continue to button search if it didn't work immediately?
            // Let's assume Enter works for now, but also run button search just in case.
        }

        // 2. Button Search (Backup)
        for (let i = 0; i < 5; i++) {
            const all = getAllElements(document);
            const textNode = all.find(e => {
                const t = clean((e as HTMLElement).innerText || '');
                return t.includes('tạo hoạt ảnh') || t.includes('create animation');
            });

            if (textNode) {
                const rect = (textNode as HTMLElement).getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0) {
                    const x = rect.left + rect.width / 2;
                    const y = rect.top + rect.height / 2;
                    if (clickAtCoords(x, y)) {
                        showNotification("🚀 Meta Clicked (Sniper)...");
                        return true;
                    }
                }
            }

            const sendBtn = all.find(e => {
                const l = clean(e.getAttribute('aria-label') || '');
                return l === 'send' || l === 'gửi';
            });
            if (sendBtn) {
                (sendBtn as HTMLElement).click();
                return true;
            }
            await sleep(500);
        }

        // If we pressed Enter, we return true anyway to let the loop wait and see
        if (active) return true;

        showNotification("❌ Meta Gen Failed");
        return false;
    }

    async detectCompletion() {
        const stopBtn = Array.from(document.querySelectorAll('button')).find(b => {
            const label = clean(b.getAttribute('aria-label') || '');
            const text = clean(b.innerText || '');
            return label.includes('stop') || label.includes('dừng') || text.includes('dừng');
        });

        if (stopBtn) return false;

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
            showNotification("✅ Meta Task Done");
            return true;
        }
        return false;
    }
}

// --- FACTORY ---
const getDriver = (): AutomationDriver => {
    const host = window.location.hostname;
    // Handle both meta.ai and www.meta.ai
    if (host.includes('meta.ai')) return new MetaDriver();
    return new VeoDriver();
};

// --- MAIN LOOP ---
async function runBatch() {
    if (isStopped) return;
    if (currentPromptIndex >= promptsQueue.length) {
        showNotification("✅ All Done!");
        chrome.runtime.sendMessage({ action: 'batchCompleted' });
        return;
    }
    const driver = getDriver();
    try {
        const injected = await driver.injectPrompt(promptsQueue[currentPromptIndex]);
        if (!injected) throw new Error("Input Not Found");
        await sleep(1000);
        const generated = await driver.clickGenerate();
        if (!generated) throw new Error("Gen Button Not Found");
        let waited = 0;
        let jobDone = false;
        await sleep(3000);
        while (waited < GENERATION_MAX_WAIT && !isStopped) {
            await sleep(2000);
            waited += 2000;
            jobDone = await driver.detectCompletion();
            if (jobDone) {
                console.log("[Engine] Job Done.");
                await sleep(2000);
                break;
            }
        }
        if (!isStopped && currentPromptIndex < promptsQueue.length - 1) {
            const cooldown = Math.floor(Math.random() * (BATCH_CONFIG.COOLDOWN_MAX - BATCH_CONFIG.COOLDOWN_MIN + 1)) + BATCH_CONFIG.COOLDOWN_MIN;
            console.log(`[Engine] CD: ${cooldown / 1000}s`);
            await sleep(cooldown);
        }
    } catch (e: any) {
        console.error("[Engine] Error:", e);
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
        runBatch();
        sendResponse({ status: 'ok' });
    }
    if (msg.type === 'STOP_AUTOMATION') {
        isStopped = true;
        showNotification("🛑 Stopped");
        sendResponse({ status: 'stopped' });
    }
});
