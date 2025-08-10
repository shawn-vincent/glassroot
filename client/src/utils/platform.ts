declare global {
	interface Window {
		Capacitor?: unknown;
		MSStream?: unknown;
	}
	interface Navigator {
		standalone?: boolean;
	}
}

export const platform = {
	isIOS:
		/iPhone|iPad|iPod/.test(navigator.userAgent) && !window.MSStream,
	isAndroid: /Android/.test(navigator.userAgent),
	isCapacitor: typeof window !== "undefined" && window.Capacitor !== undefined,
	isSafari: /^((?!chrome|android).)*safari/i.test(navigator.userAgent),
	isChrome:
		/Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor),
	isFirefox: /Firefox/.test(navigator.userAgent),

	// Detect standalone mode (PWA)
	isStandalone:
		window.matchMedia("(display-mode: standalone)").matches ||
		navigator.standalone === true ||
		document.referrer.includes("android-app://"),

	// Detect tablet
	isTablet:
		/iPad/.test(navigator.userAgent) ||
		(navigator.userAgent.includes("Android") &&
			!navigator.userAgent.includes("Mobile")),

	// Detect touch capability
	hasTouch: "ontouchstart" in window || navigator.maxTouchPoints > 0,

	// Get iOS version
	getIOSVersion: (): number | null => {
		const match = navigator.userAgent.match(/OS (\d+)_(\d+)_?(\d+)?/);
		if (match) {
			return Number.parseInt(match[1], 10);
		}
		return null;
	},

	// Get Android version
	getAndroidVersion: (): number | null => {
		const match = navigator.userAgent.match(/Android (\d+)/);
		if (match) {
			return Number.parseInt(match[1], 10);
		}
		return null;
	},

	// Check if device has a notch (iPhone X and later)
	hasNotch: (): boolean => {
		// Check for iPhone X and later models
		const hasIOSNotch =
			platform.isIOS &&
			window.screen.height >= 812 &&
			window.devicePixelRatio >= 2;

		// Check for CSS environment variables support (indicates notch support)
		const hasSafeArea = CSS.supports("padding-top: env(safe-area-inset-top)");

		return hasIOSNotch || hasSafeArea;
	},

	// Check if keyboard is likely to be visible (heuristic)
	isVirtualKeyboardSupported: (): boolean => {
		return platform.isIOS || platform.isAndroid || platform.hasTouch;
	},
};

// Apply platform-specific classes to the document
export function applyPlatformClasses(): void {
	const classes: string[] = [];

	if (platform.isIOS) classes.push("ios");
	if (platform.isAndroid) classes.push("android");
	if (platform.isCapacitor) classes.push("capacitor");
	if (platform.isSafari) classes.push("safari");
	if (platform.isChrome) classes.push("chrome");
	if (platform.isFirefox) classes.push("firefox");
	if (platform.isStandalone) classes.push("standalone");
	if (platform.isTablet) classes.push("tablet");
	if (platform.hasTouch) classes.push("touch");
	if (platform.hasNotch()) classes.push("has-notch");

	// Add iOS version class
	const iosVersion = platform.getIOSVersion();
	if (iosVersion !== null) {
		classes.push(`ios-${iosVersion}`);
	}

	// Add Android version class
	const androidVersion = platform.getAndroidVersion();
	if (androidVersion !== null) {
		classes.push(`android-${androidVersion}`);
	}

	// Apply all classes at once
	document.documentElement.classList.add(...classes);

	// Set CSS custom properties for platform info
	document.documentElement.style.setProperty(
		"--device-pixel-ratio",
		`${window.devicePixelRatio}`,
	);
	document.documentElement.style.setProperty(
		"--screen-width",
		`${window.screen.width}px`,
	);
	document.documentElement.style.setProperty(
		"--screen-height",
		`${window.screen.height}px`,
	);
}

// Utility to detect specific problematic scenarios
export const platformQuirks = {
	// iOS Safari doesn't resize viewport when keyboard appears
	needsKeyboardHeightCalculation: (): boolean => {
		return platform.isIOS && platform.isSafari;
	},

	// Older Android versions have different viewport behavior
	hasLegacyViewport: (): boolean => {
		const version = platform.getAndroidVersion();
		return version !== null && version < 7;
	},

	// iOS 15+ has different safe area behavior
	hasModernSafeArea: (): boolean => {
		const version = platform.getIOSVersion();
		return version !== null && version >= 15;
	},

	// Check if we should use aggressive viewport locking
	needsViewportLock: (): boolean => {
		return platform.isIOS || (platform.isAndroid && platform.isCapacitor);
	},

	// Check if device supports Visual Viewport API
	hasVisualViewport: (): boolean => {
		return "visualViewport" in window;
	},
};

export default platform;
