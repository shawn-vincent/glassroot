import {
	Keyboard,
	type KeyboardInfo,
	type KeyboardResize,
} from "@capacitor/keyboard";
import { platform } from "./platform";

interface KeyboardConfig {
	scroll?: boolean;
	resizeMode?: "native" | "ionic" | "body" | "none";
	onShow?: (info: KeyboardInfo) => void;
	onHide?: () => void;
}

class KeyboardManager {
	private isInitialized = false;
	private listeners: Array<() => void> = [];
	private keyboardHeight = 0;
	private isVisible = false;

	async initialize(config: KeyboardConfig = {}): Promise<void> {
		if (!platform.isCapacitor || this.isInitialized) {
			return;
		}

		try {
			// Configure keyboard behavior
			if (config.scroll !== undefined) {
				await Keyboard.setScroll({ isDisabled: !config.scroll });
			}

			// Set resize mode
			const resizeMode = config.resizeMode || "none";
			await Keyboard.setResizeMode({ mode: resizeMode as KeyboardResize });

			// Set up event listeners
			const showListener = await Keyboard.addListener(
				"keyboardWillShow",
				(info) => {
					this.handleKeyboardShow(info);
					config.onShow?.(info);
				},
			);

			const hideListener = await Keyboard.addListener(
				"keyboardWillHide",
				() => {
					this.handleKeyboardHide();
					config.onHide?.();
				},
			);

			// Store listeners for cleanup
			this.listeners.push(
				() => showListener.remove(),
				() => hideListener.remove(),
			);

			// Also listen to did show/hide for Android compatibility
			if (platform.isAndroid) {
				const didShowListener = await Keyboard.addListener(
					"keyboardDidShow",
					(info) => {
						this.handleKeyboardShow(info);
					},
				);

				const didHideListener = await Keyboard.addListener(
					"keyboardDidHide",
					() => {
						this.handleKeyboardHide();
					},
				);

				this.listeners.push(
					() => didShowListener.remove(),
					() => didHideListener.remove(),
				);
			}

			this.isInitialized = true;
		} catch (error) {
			console.warn("Failed to initialize keyboard manager:", error);
		}
	}

	private handleKeyboardShow(info: KeyboardInfo): void {
		this.keyboardHeight = info.keyboardHeight;
		this.isVisible = true;

		// Update CSS custom properties
		document.documentElement.style.setProperty(
			"--keyboard-height",
			`${info.keyboardHeight}px`,
		);
		document.documentElement.classList.add("keyboard-visible");

		// Store keyboard state in session storage for persistence
		sessionStorage.setItem("keyboard-height", String(info.keyboardHeight));
	}

	private handleKeyboardHide(): void {
		this.keyboardHeight = 0;
		this.isVisible = false;

		// Update CSS custom properties
		document.documentElement.style.setProperty("--keyboard-height", "0px");
		document.documentElement.classList.remove("keyboard-visible");

		// Clear keyboard state
		sessionStorage.removeItem("keyboard-height");
	}

	async show(): Promise<void> {
		if (!platform.isCapacitor) return;

		try {
			await Keyboard.show();
		} catch (error) {
			console.warn("Failed to show keyboard:", error);
		}
	}

	async hide(): Promise<void> {
		if (!platform.isCapacitor) return;

		try {
			await Keyboard.hide();
		} catch (error) {
			console.warn("Failed to hide keyboard:", error);
		}
	}

	async setAccessoryBarVisible(visible: boolean): Promise<void> {
		if (!platform.isCapacitor || !platform.isIOS) return;

		try {
			await Keyboard.setAccessoryBarVisible({ isVisible: visible });
		} catch (error) {
			console.warn("Failed to set accessory bar visibility:", error);
		}
	}

	getHeight(): number {
		return this.keyboardHeight;
	}

	getIsVisible(): boolean {
		return this.isVisible;
	}

	cleanup(): void {
		this.listeners.forEach((remove) => remove());
		this.listeners = [];
		this.isInitialized = false;
	}
}

// Create singleton instance
export const keyboardManager = new KeyboardManager();

// React hook for keyboard management
import { useEffect, useState } from "react";

export function useKeyboard(config?: KeyboardConfig) {
	const [keyboardHeight, setKeyboardHeight] = useState(0);
	const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

	useEffect(() => {
		if (!platform.isCapacitor) return;

		const setup = async () => {
			await keyboardManager.initialize({
				...config,
				onShow: (info) => {
					setKeyboardHeight(info.keyboardHeight);
					setIsKeyboardVisible(true);
					config?.onShow?.(info);
				},
				onHide: () => {
					setKeyboardHeight(0);
					setIsKeyboardVisible(false);
					config?.onHide?.();
				},
			});
		};

		setup();

		return () => {
			// Don't cleanup singleton, just remove this component's config
		};
	}, []);

	return {
		keyboardHeight,
		isKeyboardVisible,
		showKeyboard: () => keyboardManager.show(),
		hideKeyboard: () => keyboardManager.hide(),
		setAccessoryBarVisible: (visible: boolean) =>
			keyboardManager.setAccessoryBarVisible(visible),
	};
}

// Utility function to setup keyboard for the entire app
export async function setupKeyboard(): Promise<void> {
	if (!platform.isCapacitor) return;

	await keyboardManager.initialize({
		scroll: false, // We handle scrolling ourselves
		resizeMode: "none", // We handle resizing ourselves
		onShow: (info) => {
			console.log(`Keyboard shown: ${info.keyboardHeight}px`);
		},
		onHide: () => {
			console.log("Keyboard hidden");
		},
	});

	// Set accessory bar visibility based on platform
	if (platform.isIOS) {
		await keyboardManager.setAccessoryBarVisible(false);
	}
}

// Utility to handle keyboard in forms
export function useFormKeyboard() {
	const { hideKeyboard } = useKeyboard();

	const handleSubmit = (e: React.FormEvent) => {
		// Hide keyboard on form submission
		hideKeyboard();
	};

	const handleInputReturn = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			// Find next input or submit form
			const target = e.target as HTMLElement;
			const form = target.closest("form");

			if (form) {
				const inputs = Array.from(
					form.querySelectorAll("input, textarea, select, button"),
				);
				const currentIndex = inputs.indexOf(target);

				if (currentIndex < inputs.length - 1) {
					// Focus next input
					const nextInput = inputs[currentIndex + 1] as HTMLElement;
					nextInput.focus();
				} else {
					// Submit form and hide keyboard
					form.requestSubmit();
					hideKeyboard();
				}
			}
		}
	};

	return {
		handleSubmit,
		handleInputReturn,
		hideKeyboard,
	};
}
