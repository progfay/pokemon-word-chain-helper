import { type SVGProps, useId } from "react";

export function TypeIcon(props: SVGProps<SVGSVGElement>) {
	const id = useId();
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
			<g clipPath={`url(#${id})`}>
				<path
					d="M9.4395 1.9395C9.15826 1.65818 8.77679 1.50008 8.379 1.5H3C2.60218 1.5 2.22064 1.65804 1.93934 1.93934C1.65804 2.22064 1.5 2.60218 1.5 3V8.379C1.50008 8.77679 1.65818 9.15826 1.9395 9.4395L8.4675 15.9675C8.80839 16.3062 9.26943 16.4964 9.75 16.4964C10.2306 16.4964 10.6916 16.3062 11.0325 15.9675L15.9675 11.0325C16.3062 10.6916 16.4964 10.2306 16.4964 9.75C16.4964 9.26943 16.3062 8.80839 15.9675 8.4675L9.4395 1.9395Z"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M5.625 6C5.83211 6 6 5.83211 6 5.625C6 5.41789 5.83211 5.25 5.625 5.25C5.41789 5.25 5.25 5.41789 5.25 5.625C5.25 5.83211 5.41789 6 5.625 6Z"
					fill="black"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</g>
			<defs>
				<clipPath id={id}>
					<path d="M0 0H18V18H0V0Z" fill="white" />
				</clipPath>
			</defs>
		</svg>
	);
}
