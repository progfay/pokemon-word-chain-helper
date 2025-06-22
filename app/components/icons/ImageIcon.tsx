import type { SVGProps } from "react";

export function ImageIcon(props: SVGProps<SVGSVGElement>) {
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
			<title>Image Icon</title>
			<rect x="2.25" y="2.25" width="13.5" height="13.5" rx="1.5" />
			<circle cx="6.75" cy="6.75" r="1.5" />
			<path d="M15.75 11.25 12 7.5l-3.75 3.75-1.5-1.5L2.25 14.25" />
		</svg>
	);
}
