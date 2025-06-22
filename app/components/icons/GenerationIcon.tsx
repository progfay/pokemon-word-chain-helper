import type { SVGProps } from "react";

export function GenerationIcon(props: SVGProps<SVGSVGElement>) {
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
			<title>Generation Icon</title>
			<path d="M2.25 4.5h13.5v9a1.5 1.5 0 0 1-1.5 1.5H3.75a1.5 1.5 0 0 1-1.5-1.5v-9Z" />
			<path d="M2.25 2.25h13.5v2.25H2.25v-2.25ZM6 8.25h6M6 11.25h6" />
		</svg>
	);
}
