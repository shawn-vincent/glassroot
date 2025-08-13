import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export interface IconButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	selected?: boolean;
	variant?: "default" | "ghost" | "outline";
	size?: "sm" | "md" | "lg";
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
	({ className, children, selected, variant = "ghost", size = "md", ...props }, ref) => {
		const sizeClasses = {
			sm: "h-8 w-8",
			md: "h-10 w-10",
			lg: "h-12 w-12",
		};

		const variantClasses = {
			default: "bg-primary text-primary-foreground hover:bg-primary/90",
			ghost: selected 
				? "bg-primary/10 text-primary hover:bg-primary/20" 
				: "hover:bg-secondary",
			outline: selected
				? "border border-primary bg-primary/10 text-primary hover:bg-primary/20"
				: "border border-input bg-background hover:bg-secondary",
		};

		return (
			<button
				ref={ref}
				className={cn(
					"inline-flex items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
					sizeClasses[size],
					variantClasses[variant],
					className
				)}
				{...props}
			>
				{children}
			</button>
		);
	}
);
IconButton.displayName = "IconButton";

export { IconButton };