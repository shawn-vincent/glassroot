import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface PageLayoutProps {
	title: string;
	description?: string;
	icon?: LucideIcon;
	children: ReactNode;
	maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl" | "6xl" | "full";
}

const maxWidthClasses = {
	sm: "max-w-sm",
	md: "max-w-md",
	lg: "max-w-lg",
	xl: "max-w-xl",
	"2xl": "max-w-2xl",
	"4xl": "max-w-4xl",
	"6xl": "max-w-6xl",
	full: "max-w-full",
};

export function PageLayout({ 
	title, 
	description, 
	icon: Icon, 
	children, 
	maxWidth = "2xl" 
}: PageLayoutProps) {
	return (
		<div className="h-full flex flex-col">
			<div className="flex-1 overflow-y-auto">
				<div className={`${maxWidthClasses[maxWidth]} mx-auto p-6 space-y-6`}>
					<div>
						<h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
							{Icon && <Icon className="w-6 h-6" />}
							{title}
						</h1>
						{description && (
							<p className="text-muted-foreground">{description}</p>
						)}
					</div>
					{children}
				</div>
			</div>
		</div>
	);
}