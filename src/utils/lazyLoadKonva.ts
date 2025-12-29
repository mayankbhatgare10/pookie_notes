/**
 * Lazy-load Konva.js to keep initial bundle size small
 * Only loads when a handwriting block is created or opened
 */

let konvaModule: any = null;

export async function loadKonva() {
    if (!konvaModule) {
        console.log('🎨 Loading Konva.js...');
        const module = await import('konva');
        // Konva uses default export
        konvaModule = module.default || module;
        console.log('✅ Konva.js loaded', konvaModule);
    }
    return konvaModule;
}

export async function loadKonvaModules() {
    const konva = await loadKonva();
    return { konva };
}

export function isKonvaLoaded(): boolean {
    return konvaModule !== null;
}
