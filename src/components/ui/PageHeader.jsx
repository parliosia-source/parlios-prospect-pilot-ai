export default function PageHeader({ title, description, actions }) {
  return (
    <div className="flex items-start justify-between px-8 py-7 border-b border-border">
      <div>
        <h1 className="text-xl font-semibold text-foreground tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}