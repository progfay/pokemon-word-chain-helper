import { ChevronIcon } from "../icons/ChevronIcon";

interface HintProps {
	icon: React.ReactNode;
	label: string;
	children: React.ReactNode;
}

export function Hint({ icon, label, children }: HintProps) {
	return (
		<details className="hint border rounded-lg border-border">
			<summary className="w-full flex justify-between items-center p-3 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
				<div className="flex items-center gap-3">
					{icon}
					<span className="text-sm font-medium text-muted-foreground">
						{label}
					</span>
				</div>
				<ChevronIcon className="w-4.5 h-4.5 stroke-muted-foreground transition-transform [details.hint[open]_&]:rotate-180" />
			</summary>
			{children}
		</details>
	);
}
