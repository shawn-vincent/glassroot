import { platform, platformQuirks } from "@/utils/platform";
import { useEffect, useRef } from "react";

interface UseInputFocusOptions {
	scrollBehavior?: ScrollBehavior;
	scrollDelay?: number;
	preventZoom?: boolean;
	restoreScrollOnBlur?: boolean;
}

export function useInputFocus(options: UseInputFocusOptions = {}) {
	const {
		scrollBehavior = "smooth",
		scrollDelay = 300,
		preventZoom = true,
		restoreScrollOnBlur = true,
	} = options;

	const lastScrollPosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
	const focusedElement = useRef<HTMLElement | null>(null);

	useEffect(() => {
		// Only apply on touch devices
		if (!platform.hasTouch) return;

		const handleFocus = (e: FocusEvent) => {
			const target = e.target as HTMLElement;

			// Check if it's an input element
			if (!target.matches("input, textarea, select")) return;

			focusedElement.current = target;

			// Store current scroll position
			lastScrollPosition.current = {
				x: window.scrollX,
				y: window.scrollY,
			};

			// Ensure input is visible when keyboard appears
			if (platform.isIOS || platformQuirks.needsKeyboardHeightCalculation()) {
				setTimeout(() => {
					// Only scroll if element is still focused
					if (document.activeElement === target) {
						// Calculate the ideal scroll position
						const rect = target.getBoundingClientRect();
						const viewportHeight =
							window.visualViewport?.height || window.innerHeight;

						// Check if element is below the midpoint of visible viewport
						if (rect.bottom > viewportHeight * 0.5) {
							target.scrollIntoView({
								behavior: scrollBehavior,
								block: "center",
								inline: "nearest",
							});
						}
					}
				}, scrollDelay);
			}

			// Add class to body for styling purposes
			document.body.classList.add("input-focused");

			// Prevent zoom on double-tap
			if (preventZoom && platform.isIOS) {
				target.style.fontSize = "16px";
			}
		};

		const handleBlur = (e: FocusEvent) => {
			const target = e.target as HTMLElement;

			if (!target.matches("input, textarea, select")) return;

			focusedElement.current = null;

			// Remove focus class
			document.body.classList.remove("input-focused");

			// Reset scroll position on iOS to prevent stuck viewport
			if (restoreScrollOnBlur && platform.isIOS) {
				// Small delay to let keyboard animation start
				setTimeout(() => {
					// Check if no other input is focused
					const activeElement = document.activeElement;
					const isInputFocused = activeElement?.matches(
						"input, textarea, select",
					);

					if (!isInputFocused) {
						window.scrollTo({
							top: 0,
							left: 0,
							behavior: "instant" as ScrollBehavior,
						});

						// Also reset body scroll for good measure
						document.body.scrollTop = 0;
						document.documentElement.scrollTop = 0;
					}
				}, 100);
			}

			// Restore font size if it was modified
			if (preventZoom && platform.isIOS && target instanceof HTMLInputElement) {
				target.style.fontSize = "";
			}
		};

		// Handle form submission (blur all inputs)
		const handleSubmit = (e: Event) => {
			const form = e.target as HTMLFormElement;
			const inputs = form.querySelectorAll("input, textarea, select");

			inputs.forEach((input) => {
				if (input instanceof HTMLElement) {
					input.blur();
				}
			});
		};

		// Prevent zoom on double-tap for iOS
		let lastTouchEnd = 0;
		const handleTouchEnd = (e: TouchEvent) => {
			if (!platform.isIOS || !preventZoom) return;

			const now = Date.now();
			if (now - lastTouchEnd <= 300) {
				e.preventDefault();
			}
			lastTouchEnd = now;
		};

		// Add event listeners
		document.addEventListener("focusin", handleFocus, { passive: true });
		document.addEventListener("focusout", handleBlur, { passive: true });
		document.addEventListener("submit", handleSubmit, { passive: true });

		if (platform.isIOS && preventZoom) {
			document.addEventListener("touchend", handleTouchEnd, { passive: false });
		}

		// Cleanup
		return () => {
			document.removeEventListener("focusin", handleFocus);
			document.removeEventListener("focusout", handleBlur);
			document.removeEventListener("submit", handleSubmit);

			if (platform.isIOS && preventZoom) {
				document.removeEventListener("touchend", handleTouchEnd);
			}

			// Clean up any remaining classes
			document.body.classList.remove("input-focused");
		};
	}, [scrollBehavior, scrollDelay, preventZoom, restoreScrollOnBlur]);

	return {
		getFocusedElement: () => focusedElement.current,
		isInputFocused: () => focusedElement.current !== null,
		blurActiveInput: () => {
			if (focusedElement.current) {
				focusedElement.current.blur();
			} else if (document.activeElement instanceof HTMLElement) {
				document.activeElement.blur();
			}
		},
		scrollToInput: (element: HTMLElement) => {
			element.scrollIntoView({
				behavior: scrollBehavior,
				block: "center",
				inline: "nearest",
			});
		},
	};
}

// Hook for managing focus within a specific container
export function useContainerFocus(containerRef: React.RefObject<HTMLElement>) {
	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		// Trap focus within container on mobile
		const handleFocusIn = (e: FocusEvent) => {
			const target = e.target as HTMLElement;

			// Check if focus is outside container
			if (!container.contains(target)) {
				// Find first focusable element in container
				const focusable = container.querySelector<HTMLElement>(
					'input, textarea, select, button, a[href], [tabindex]:not([tabindex="-1"])',
				);

				if (focusable) {
					e.preventDefault();
					focusable.focus();
				}
			}
		};

		if (platform.hasTouch) {
			document.addEventListener("focusin", handleFocusIn);
		}

		return () => {
			if (platform.hasTouch) {
				document.removeEventListener("focusin", handleFocusIn);
			}
		};
	}, [containerRef]);
}
