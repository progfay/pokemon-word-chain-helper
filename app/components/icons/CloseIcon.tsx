import type { SVGProps } from "react";

export function CloseIcon(props: SVGProps<SVGSVGElement>) {
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
			<title>Close Icon</title>
			<path d="m18 6-12 12" />
			<path d="m6 6 12 12" />
		</svg>
	);
}
