interface Props {
  className?: string;
}

export function DorioLogo({ className = '' }: Props) {
  return (
    <span className={`text-4xl font-black tracking-tight ${className}`}>
      <span className="text-primary-600">Do</span><span className="text-gray-800">rio</span>
    </span>
  );
}
