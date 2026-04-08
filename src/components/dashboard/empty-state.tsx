import { type LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-12 text-center">
      <div className="w-14 h-14 rounded-full bg-[#F3F4F6] flex items-center justify-center mx-auto mb-4">
        <Icon className="w-7 h-7 text-[#9CA3AF]" />
      </div>
      <h3 className="font-semibold text-lg text-[#111827]">{title}</h3>
      <p className="text-[#6B7280] mt-1 max-w-sm mx-auto">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 bg-[#22C55E] hover:bg-[#16A34A] text-white px-5 py-2 rounded-lg font-medium text-sm transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
