import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  size: number;
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  buttonDescription?: string;
  onButtonClick?: () => void;
}

export default function EmptyState({
  size,
  icon: Icon,
  title,
  subtitle,
  buttonDescription,
  onButtonClick,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 text-sm text-zinc-400">
      <Icon size={size} className="" />
      <p className="text-lg">{title}</p>
      <p className="text-sm">{subtitle}</p>
      {buttonDescription && (
        <button
          onClick={onButtonClick}
          className="mt-4 rounded-full bg-black px-4 py-1.5 text-sm text-white hover:bg-zinc-700 hover:cursor-pointer"
        >
          {buttonDescription}
        </button>
      )}
    </div>
  );
}
