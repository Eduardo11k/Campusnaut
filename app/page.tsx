import Link from 'next/link';

const steps = [
  {
    number: '01',
    title: 'Diz quem és',
    text: 'Escolhe os teus interesses — IA, música, desporto, carreira — e os dias/horas em que estás livre.',
  },
  {
    number: '02',
    title: 'O agente pensa',
    text: 'O CampusPulse cruza o teu perfil com a agenda da semana e explica por que razão cada evento faz sentido.',
  },
  {
    number: '03',
    title: 'Decide e guarda',
    text: 'Exporta os eventos escolhidos para o teu calendário ou refina ainda mais a pesquisa.',
  },
];

export default function Home() {
  return (
    <div className="py-12 md:py-20">
      <section className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <div className="max-w-xl">
          <span className="inline-block rounded-full border border-tomato bg-tomato/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-tomato-dark">
            Demo de hackathon
          </span>
          <h1 className="mt-5 font-display text-5xl font-bold leading-[0.95] sm:text-6xl lg:text-7xl">
            Eventos de campus <span className="text-tomato">escolhidos para ti</span>.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-ink-muted">
            CampusPulse é um agente de recomendação que encontra os melhores eventos da semana
            com base nos teus interesses e horários livres.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/agente"
              className="inline-flex min-h-11 items-center justify-center rounded-md border-2 border-ink bg-tomato px-6 py-3 text-center font-display font-bold text-white shadow-poster transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5"
            >
              Experimentar o agente
            </Link>
            <Link
              href="/agenda"
              className="inline-flex min-h-11 items-center justify-center rounded-md border-2 border-ink bg-cream-50 px-6 py-3 text-center font-display font-bold transition-colors hover:bg-cream-200"
            >
              Ver agenda
            </Link>
          </div>
          <p className="mt-4 text-xs text-ink-light">
            Dados de exemplo · Semana de 19 a 25 de outubro de 2026 · Campus de Los Angeles
          </p>
        </div>
        <div className="relative">
          <div className="poster-card rotate-1 rounded-2xl bg-cream-50 p-6 sm:p-8">
            <p className="font-display text-3xl font-bold leading-tight">
              &quot;Achei um workshop de IA grátis à noite que encaixava perfeitamente no meu
              horário.&quot;
            </p>
            <p className="mt-4 text-sm font-semibold text-ink-muted">— Estudante de Engenharia</p>
          </div>
          <div className="poster-card absolute -bottom-6 -left-4 hidden w-40 -rotate-3 rounded-xl bg-tomato p-4 text-white sm:block">
            <p className="font-display text-2xl font-bold">40</p>
            <p className="text-sm">eventos esta semana</p>
          </div>
        </div>
      </section>

      <section className="mt-24 md:mt-32">
        <h2 className="font-display text-3xl font-bold md:text-4xl">Como funciona</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((step) => (
            <article
              key={step.number}
              className="poster-card rounded-xl bg-cream-50 p-5"
            >
              <span className="font-display text-4xl font-bold text-tomato">{step.number}</span>
              <h3 className="mt-3 font-display text-xl font-bold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{step.text}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
