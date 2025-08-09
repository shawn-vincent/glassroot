import type { Config } from "tailwindcss";

export default {
	content: [
		"./index.html",
		"./src/**/*.{js,ts,jsx,tsx}",
		"./node_modules/@llamaindex/chat-ui/dist/**/*.{js,ts,jsx,tsx}",
	],
} satisfies Config;