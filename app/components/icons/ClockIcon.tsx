import type { SVGProps } from "react";

export function ClockIcon(props: SVGProps<SVGSVGElement>) {
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
			<title>Clock Icon</title>
			<circle cx="12" cy="12" r="10" />
			<path d="m12 6 0 6 4 0" />
		</svg>
	);
}
