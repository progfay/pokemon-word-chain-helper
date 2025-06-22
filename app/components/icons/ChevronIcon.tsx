import type { SVGProps } from "react";

export function ChevronIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth="2"
			{...props}
		>
			<title>Chevron Icon</title>
			<path d="m6 9 6 6 6-6" />
		</svg>
	);
}
