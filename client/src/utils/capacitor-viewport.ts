import { Capacitor } from "@capacitor/core";

// Extend TouchEvent to include our custom property
interface TouchEventWithLastY extends TouchEvent {
	lastY?: number;
}

/**
 * Prevents viewport bouncing on iOS and ensures proper scrolling behavior
 * in Capacitor-wrapped applications
 */
export function setupCapacitorViewport() {
	// Only apply these fixes on native platforms
	if (!Capacitor.isNativePlatform()) {
		return;
	}

	// Prevent viewport bouncing on iOS
	if (Capacitor.getPlatform() === "ios") {
		// Disable bounce scrolling on the document
		document.addEventListener(
			"touchmove",
			(e: TouchEventWithLastY) => {
				// Allow scrolling within scrollable elements
				let element = e.target as HTMLElement | null;
				while (element) {
					// Check if element is scrollable
					const style = window.getComputedStyle(element);
					if (
						style.overflowY === "auto" ||
						style.overflowY === "scroll" ||
						element.classList.contains("scrollable-content")
					) {
						// Check if element can scroll
						if (element.scrollHeight > element.clientHeight) {
							// Allow scrolling if not at boundaries
							const isAtTop = element.scrollTop === 0;
							const isAtBottom =
								element.scrollTop + element.clientHeight >= element.scrollHeight;

							// Prevent bounce at boundaries
							if (
								(isAtTop && e.touches[0].clientY > (e.lastY ?? 0)) ||
								(isAtBottom && e.touches[0].clientY < (e.lastY ?? 0))
							) {
								e.preventDefault();
							}
							// Store last Y position
							e.lastY = e.touches[0].clientY;
							return;
						}
					}
					element = element.parentElement;
				}
				// Prevent default if no scrollable parent found
				e.preventDefault();
			},
			{ passive: false },
		);

		// Track touch start position
		document.addEventListener(
			"touchstart",
			(e: TouchEventWithLastY) => {
				e.lastY = e.touches[0].clientY;
			},
			{ passive: true },
		);
	}

	// Set viewport height to prevent address bar issues
	const setViewportHeight = () => {
		const vh = window.innerHeight * 0.01;
		document.documentElement.style.setProperty("--vh", `${vh}px`);
	};

	setViewportHeight();
	window.addEventListener("resize", setViewportHeight);
	window.addEventListener("orientationchange", setViewportHeight);

	// Prevent pull-to-refresh
	document.body.style.overscrollBehavior = "none";

	// Additional iOS-specific fixes
	if (Capacitor.getPlatform() === "ios") {
		// Prevent rubber-band scrolling on the body
		document.body.style.position = "fixed";
		document.body.style.width = "100%";
		document.body.style.height = "100%";
		
		// Prevent zoom on input focus
		const preventZoom = () => {
			const viewportMeta = document.querySelector('meta[name="viewport"]');
			if (viewportMeta) {
				viewportMeta.setAttribute(
					"content",
					"width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
				);
			}
		};
		
		// Apply on load and whenever an input gets focus
		preventZoom();
		document.addEventListener("focusin", (e) => {
			if (e.target instanceof HTMLInputElement || 
				e.target instanceof HTMLTextAreaElement) {
				preventZoom();
				// Also ensure the element doesn't trigger zoom
				(e.target as HTMLElement).style.fontSize = "16px";
			}
		});
		
		// Reset after blur to maintain accessibility when possible
		document.addEventListener("focusout", () => {
			// Keep zoom disabled in native app context
			preventZoom();
		});
	}
}