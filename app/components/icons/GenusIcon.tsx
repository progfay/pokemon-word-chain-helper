import type { SVGProps } from "react";

export function GenusIcon(props: SVGProps<SVGSVGElement>) {
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
			<title>Genus Icon</title>
			<rect x="1" y="1" width="7" height="7" rx="2" ry="2" />
			<rect x="1" y="10" width="7" height="7" rx="2" ry="2" />
			<rect x="10" y="1" width="7" height="7" rx="2" ry="2" />
			<rect x="10" y="10" width="7" height="7" rx="2" ry="2" />
		</svg>
	);
}
