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
import DocumentNew from "./pages/DocumentNew";
import DocumentView from "./pages/DocumentView";
import Documents from "./pages/Documents";
import Home from "./pages/Home";
import Search from "./pages/Search";
import "./styles.css";

const router = createBrowserRouter([
	{
		path: "/",
		element: <App />,
		children: [
			{ index: true, element: <Home /> },
			{ path: "documents", element: <Documents /> },
			{ path: "documents/new", element: <DocumentNew /> },
			{ path: "documents/:id", element: <DocumentView /> },
			{ path: "search", element: <Search /> },
		],
	},
]);

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
