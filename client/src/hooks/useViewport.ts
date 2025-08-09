import { useCallback, useEffect } from "react";

export function useViewport() {
	const updateViewport = useCallback(() => {
		// Fallback for browsers without visualViewport
		const vv = window.visualViewport || {
			height: window.innerHeight,
			width: window.innerWidth,
			offsetTop: 0,
			offsetLeft: 0,
			pageTop: 0,
			pageLeft: 0,
			scale: 1,
		};

		// Calculate actual viewport height
		const vh = vv.height * 0.01;
		document.documentElement.style.setProperty("--vh", `${vh}px`);

		// Detect keyboard presence (heuristic)
		const viewportDiff = window.innerHeight - vv.height;
		const hasKeyboard = viewportDiff > 50; // Threshold for keyboard detection

		if (hasKeyboard) {
			document.documentElement.style.setProperty(
				"--keyboard-height",
				`${viewportDiff}px`,
			);
			document.documentElement.classList.add("keyboard-visible");
		} else {
			document.documentElement.style.setProperty("--keyboard-height", "0px");
			document.documentElement.classList.remove("keyboard-visible");
		}

		// Detect if user has zoomed
		if (vv.scale !== 1) {
			document.documentElement.classList.add("user-zoomed");
		} else {
			document.documentElement.classList.remove("user-zoomed");
		}

		// Store viewport dimensions for other uses
		document.documentElement.style.setProperty(
			"--viewport-height",
			`${vv.height}px`,
		);
		document.documentElement.style.setProperty(
			"--viewport-width",
			`${vv.width}px`,
		);
		document.documentElement.style.setProperty(
			"--viewport-scale",
			`${vv.scale}`,
		);
	}, []);

	useEffect(() => {
		// Initial setup
		updateViewport();

		// Debounced update function
		let timeoutId: ReturnType<typeof setTimeout>;
		const debouncedUpdate = () => {
			clearTimeout(timeoutId);
			timeoutId = setTimeout(updateViewport, 100);
		};

		// Event listeners
		const events = ["resize", "scroll", "orientationchange"] as const;
		events.forEach((event) => window.addEventListener(event, debouncedUpdate));

		// Visual Viewport API events (if available)
		if (window.visualViewport) {
			window.visualViewport.addEventListener("resize", updateViewport);
			window.visualViewport.addEventListener("scroll", debouncedUpdate);
		}

		// Handle orientation changes with a delay
		const handleOrientationChange = () => {
			// Wait for orientation animation to complete
			setTimeout(updateViewport, 500);
		};
		window.addEventListener("orientationchange", handleOrientationChange);

		return () => {
			clearTimeout(timeoutId);
			events.forEach((event) =>
				window.removeEventListener(event, debouncedUpdate),
			);
			window.removeEventListener("orientationchange", handleOrientationChange);

			if (window.visualViewport) {
				window.visualViewport.removeEventListener("resize", updateViewport);
				window.visualViewport.removeEventListener("scroll", debouncedUpdate);
			}
		};
	}, [updateViewport]);

	return {
		isKeyboardVisible: () => {
			return document.documentElement.classList.contains("keyboard-visible");
		},
		isUserZoomed: () => {
			return document.documentElement.classList.contains("user-zoomed");
		},
		getViewportHeight: () => {
			return window.visualViewport?.height || window.innerHeight;
		},
		getViewportWidth: () => {
			return window.visualViewport?.width || window.innerWidth;
		},
	};
}
