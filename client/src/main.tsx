import {
	MutationCache,
	QueryCache,
	QueryClient,
	QueryClientProvider,
} from "@tanstack/react-query";
import React from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import App from "./App";
import DocumentNewPage from "./pages/DocumentNewPage";
import DocumentViewPage from "./pages/DocumentViewPage";
import DocumentsPage from "./pages/DocumentsPage";
import HomePage from "./pages/HomePage";
import SearchPage from "./pages/SearchPage";
import SettingsPage from "./pages/SettingsPage";
import "./styles.css";
const router = createBrowserRouter(
	[
		{
			path: "/",
			element: <App />,
			children: [
				{ index: true, element: <HomePage /> },
				{ path: "documents", element: <DocumentsPage /> },
				{ path: "documents/new", element: <DocumentNewPage /> },
				{ path: "documents/:id", element: <DocumentViewPage /> },
				{ path: "search", element: <SearchPage /> },
				{ path: "settings", element: <SettingsPage /> },
			],
		},
	],
	{
		future: {
			v7_relativeSplatPath: true,
			v7_fetcherPersist: true,
			v7_normalizeFormMethod: true,
			v7_partialHydration: true,
			v7_skipActionErrorRevalidation: true,
		},
	},
);

import { pushError } from "./lib/errors";

const qc = new QueryClient({
	queryCache: new QueryCache({
		onError: (err) => pushError(err),
	}),
	mutationCache: new MutationCache({
		onError: (err) => pushError(err),
	}),
	defaultOptions: { queries: { retry: false } },
});

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Root element #root not found");
createRoot(rootEl).render(
	<React.StrictMode>
		<QueryClientProvider client={qc}>
			<RouterProvider router={router} />
		</QueryClientProvider>
	</React.StrictMode>,
);
