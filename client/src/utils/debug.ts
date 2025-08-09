interface DebugConfig {
	position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
	fontSize?: number;
	opacity?: number;
	showPlatformInfo?: boolean;
	showTouchInfo?: boolean;
	updateInterval?: number;
}

class ViewportDebugger {
	private panel: HTMLDivElement | null = null;
	private intervalId: ReturnType<typeof setInterval> | null = null;
	private touchCount = 0;
	private lastTouchTime = 0;
	private config: Required<DebugConfig>;

	constructor(config: DebugConfig = {}) {
		this.config = {
			position: config.position || "bottom-left",
			fontSize: config.fontSize || 12,
			opacity: config.opacity || 0.9,
			showPlatformInfo: config.showPlatformInfo !== false,
			showTouchInfo: config.showTouchInfo !== false,
			updateInterval: config.updateInterval || 100,
		};
	}

	enable(): void {
		if (this.panel) return;

		// Create debug panel
		this.panel = document.createElement("div");
		this.panel.id = "viewport-debug";
		this.applyStyles();

		document.body.appendChild(this.panel);

		// Start updating
		this.startUpdating();

		// Add touch event tracking
		if (this.config.showTouchInfo) {
			this.setupTouchTracking();
		}

		console.log("Viewport debugger enabled");
	}

	disable(): void {
		if (this.intervalId) {
			clearInterval(this.intervalId);
			this.intervalId = null;
		}

		if (this.panel) {
			this.panel.remove();
			this.panel = null;
		}

		console.log("Viewport debugger disabled");
	}

	private applyStyles(): void {
		if (!this.panel) return;

		const positions = {
			"top-left": "top: 10px; left: 10px;",
			"top-right": "top: 10px; right: 10px;",
			"bottom-left": "bottom: 10px; left: 10px;",
			"bottom-right": "bottom: 10px; right: 10px;",
		};

		this.panel.style.cssText = `
      position: fixed;
      ${positions[this.config.position]}
      background: rgba(0, 0, 0, ${this.config.opacity});
      color: #00ff00;
      padding: 10px;
      font-size: ${this.config.fontSize}px;
      font-family: 'Courier New', monospace;
      z-index: 999999;
      pointer-events: none;
      border-radius: 4px;
      border: 1px solid rgba(0, 255, 0, 0.3);
      backdrop-filter: blur(5px);
      max-width: 300px;
      line-height: 1.4;
    `;
	}

	private startUpdating(): void {
		const update = () => {
			if (!this.panel) return;

			const vv = window.visualViewport || {
				height: window.innerHeight,
				width: window.innerWidth,
				offsetTop: 0,
				offsetLeft: 0,
				scale: 1,
			};

			const info: string[] = [];

			// Viewport dimensions
			info.push("═══ VIEWPORT ═══");
			info.push(`Window: ${window.innerWidth}×${window.innerHeight}`);
			info.push(`Visual: ${Math.round(vv.width)}×${Math.round(vv.height)}`);
			info.push(`Scale: ${vv.scale?.toFixed(2) || "1.00"}`);

			if (vv.offsetTop || vv.offsetLeft) {
				info.push(
					`Offset: ${Math.round(vv.offsetLeft)},${Math.round(vv.offsetTop)}`,
				);
			}

			// Screen info
			info.push("");
			info.push("═══ SCREEN ═══");
			info.push(`Screen: ${window.screen.width}×${window.screen.height}`);
			info.push(`DPR: ${window.devicePixelRatio.toFixed(2)}`);
			info.push(`Orientation: ${this.getOrientation()}`);

			// CSS custom properties
			const rootStyles = getComputedStyle(document.documentElement);
			const keyboardHeight = rootStyles.getPropertyValue("--keyboard-height");
			const vh = rootStyles.getPropertyValue("--vh");

			if (keyboardHeight && keyboardHeight !== "0px") {
				info.push("");
				info.push("═══ KEYBOARD ═══");
				info.push(`Height: ${keyboardHeight}`);
			}

			// States
			const states: string[] = [];
			if (document.documentElement.classList.contains("keyboard-visible")) {
				states.push("⌨️ Keyboard");
			}
			if (document.documentElement.classList.contains("user-zoomed")) {
				states.push("🔍 Zoomed");
			}
			if (document.documentElement.classList.contains("input-focused")) {
				states.push("✏️ Input");
			}

			if (states.length > 0) {
				info.push("");
				info.push("═══ STATES ═══");
				info.push(states.join(" | "));
			}

			// Platform info
			if (this.config.showPlatformInfo) {
				const classes = Array.from(document.documentElement.classList);
				const platformClasses = classes.filter((c) =>
					[
						"ios",
						"android",
						"safari",
						"chrome",
						"capacitor",
						"standalone",
					].includes(c),
				);

				if (platformClasses.length > 0) {
					info.push("");
					info.push("═══ PLATFORM ═══");
					info.push(platformClasses.join(", "));
				}
			}

			// Touch info
			if (this.config.showTouchInfo && this.touchCount > 0) {
				info.push("");
				info.push("═══ TOUCH ═══");
				info.push(`Touches: ${this.touchCount}`);
				const timeSinceTouch = Date.now() - this.lastTouchTime;
				if (timeSinceTouch < 1000) {
					info.push(`Last: ${timeSinceTouch}ms ago`);
				}
			}

			// Safe areas
			const safeTop = rootStyles.getPropertyValue("--safe-top");
			const safeBottom = rootStyles.getPropertyValue("--safe-bottom");
			if (
				(safeTop && safeTop !== "0px") ||
				(safeBottom && safeBottom !== "0px")
			) {
				info.push("");
				info.push("═══ SAFE AREAS ═══");
				if (safeTop && safeTop !== "0px") info.push(`Top: ${safeTop}`);
				if (safeBottom && safeBottom !== "0px")
					info.push(`Bottom: ${safeBottom}`);
			}

			this.panel.innerHTML = info.join("<br>");
		};

		// Initial update
		update();

		// Set up interval
		this.intervalId = setInterval(update, this.config.updateInterval);
	}

	private setupTouchTracking(): void {
		document.addEventListener(
			"touchstart",
			(e) => {
				this.touchCount = e.touches.length;
				this.lastTouchTime = Date.now();
			},
			{ passive: true },
		);

		document.addEventListener(
			"touchend",
			() => {
				this.lastTouchTime = Date.now();
			},
			{ passive: true },
		);
	}

	private getOrientation(): string {
		if (window.screen.orientation) {
			return window.screen.orientation.type
				.replace("-primary", "")
				.replace("-secondary", "");
		}
		return window.innerWidth > window.innerHeight ? "landscape" : "portrait";
	}

	toggle(): void {
		if (this.panel) {
			this.disable();
		} else {
			this.enable();
		}
	}
}

// Create singleton instance
const viewportDebugger = new ViewportDebugger();

// Export functions
export function enableViewportDebug(config?: DebugConfig): void {
	if (import.meta.env.DEV === false) {
		console.warn("Viewport debug is only available in development mode");
		return;
	}

	viewportDebugger.enable();
}

export function disableViewportDebug(): void {
	viewportDebugger.disable();
}

export function toggleViewportDebug(): void {
	viewportDebugger.toggle();
}

// React hook for viewport debugging
import { useEffect } from "react";

export function useViewportDebug(enabled = false, config?: DebugConfig): void {
	useEffect(() => {
		if (enabled && import.meta.env.DEV) {
			const debugInstance = new ViewportDebugger(config);
			debugInstance.enable();

			return () => {
				debugInstance.disable();
			};
		}
	}, [enabled, config]);
}

// Keyboard shortcut to toggle debug panel (Ctrl+Shift+D)
if (import.meta.env.DEV) {
	document.addEventListener("keydown", (e) => {
		if (e.ctrlKey && e.shiftKey && e.key === "D") {
			e.preventDefault();
			toggleViewportDebug();
		}
	});
}

// Performance monitoring utilities
export class PerformanceMonitor {
	private marks: Map<string, number> = new Map();

	mark(name: string): void {
		this.marks.set(name, performance.now());
	}

	measure(name: string, startMark: string, endMark?: string): number {
		const start = this.marks.get(startMark);
		const end = endMark ? this.marks.get(endMark) : performance.now();

		if (!start) {
			console.warn(`Mark '${startMark}' not found`);
			return 0;
		}

		const duration = (end || performance.now()) - start;
		console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
		return duration;
	}

	clear(): void {
		this.marks.clear();
	}
}

export const perfMonitor = new PerformanceMonitor();

// Log viewport changes
if (import.meta.env.DEV) {
	let lastHeight = window.innerHeight;
	let lastWidth = window.innerWidth;

	const logViewportChange = () => {
		const newHeight = window.innerHeight;
		const newWidth = window.innerWidth;

		if (newHeight !== lastHeight || newWidth !== lastWidth) {
			console.log(
				`[Viewport] Changed from ${lastWidth}×${lastHeight} to ${newWidth}×${newHeight} ` +
					`(Δw: ${newWidth - lastWidth}, Δh: ${newHeight - lastHeight})`,
			);

			lastHeight = newHeight;
			lastWidth = newWidth;
		}
	};

	window.addEventListener("resize", logViewportChange);

	if (window.visualViewport) {
		window.visualViewport.addEventListener("resize", () => {
			console.log("[Visual Viewport] Resized:", {
				width: window.visualViewport?.width,
				height: window.visualViewport?.height,
				scale: window.visualViewport?.scale,
			});
		});
	}
}
