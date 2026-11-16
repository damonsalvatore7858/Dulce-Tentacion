type Props = { title: string; intro?: string };

export function PageHeader({ title, intro }: Props) {
  return (
    <header className="page-container flex flex-col gap-3 pb-6 pt-12 sm:pt-16">
      <h1 className="font-display text-4xl leading-tight text-primary text-neon sm:text-5xl">
        {title}
      </h1>
      {intro ? <p className="max-w-2xl text-lg text-muted-foreground">{intro}</p> : null}
    </header>
  );
}
