interface PageHeaderProps {
  title: string;
  subtitle: string;
}

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">
        {title}
      </h2>
      <p className="text-sm text-gray-400 mt-1.5 font-medium">{subtitle}</p>
    </div>
  );
}
