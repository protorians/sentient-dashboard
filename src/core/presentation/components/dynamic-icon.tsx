import * as LucideIcons from "lucide-react";
import { LucideProps } from "lucide-react";

interface DynamicIconProps extends LucideProps {
  name: string;
}

export function DynamicIcon({ name, ...props }: DynamicIconProps) {
  const Icon = (LucideIcons as any)[name];

  if (!Icon) {
    return <LucideIcons.HelpCircleIcon {...props} />;
  }

  return <Icon {...props} />;
}
