import type { SVGProps } from "react";

export function TypeIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<svg
			viewBox="0 0 18 18"
			fill="none"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth="1.5"
			{...props}
		>
			<title>Type Icon</title>
			<rect x="3" y="3" width="12" height="12" rx="1.5" />
			<circle cx="9" cy="9" r="3" />
		</svg>
	);
}
