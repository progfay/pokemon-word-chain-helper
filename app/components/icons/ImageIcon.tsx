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
			<path
				d="M14.25 2.25H3.75C2.92157 2.25 2.25 2.92157 2.25 3.75V14.25C2.25 15.0784 2.92157 15.75 3.75 15.75H14.25C15.0784 15.75 15.75 15.0784 15.75 14.25V3.75C15.75 2.92157 15.0784 2.25 14.25 2.25Z"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M6.75 8.25C7.57843 8.25 8.25 7.57843 8.25 6.75C8.25 5.92157 7.57843 5.25 6.75 5.25C5.92157 5.25 5.25 5.92157 5.25 6.75C5.25 7.57843 5.92157 8.25 6.75 8.25Z"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M15.75 11.25L13.4355 8.93552C13.1542 8.65431 12.7727 8.49634 12.375 8.49634C11.9773 8.49634 11.5958 8.65431 11.3145 8.93552L4.5 15.75"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}
