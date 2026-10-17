import json, random, itertools, os
random.seed(42)

tags_pool = ['IA','startups','desporto','arte','música','carreira','voluntariado','jogos','saúde','programação']
days = ['2026-10-19','2026-10-20','2026-10-21','2026-10-22','2026-10-23','2026-10-24','2026-10-25']
slots = [
  ('09:00','11:00'),('10:00','12:00'),('12:00','13:30'),('13:00','15:00'),
  ('14:30','16:30'),('15:00','17:00'),('16:00','18:00'),('17:00','19:00'),
  ('18:00','20:00'),('19:00','21:00'),('20:00','22:00')
]
locations = ['Auditório Central','LABS A — Ed. Norte','Sala de Conferências Beta','Ginásio Norte','Pátio da Reitoria','Sala 204 — Ed. Sul','Centro de Inovação','Café Campus','Biblioteca','Parque Exterior','Sala de Reuniões C3','Media Lab','Auditório de Música','Campo Desportivo']
templates = [
  ('IA','Workshop de IA Generativa para Estudantes','Descobre como ferramentas de inteligência artificial podem acelerar trabalhos académicos e projetos pessoais. Vamos experimentar prompts práticos e debater ética na IA. Haverá acesso a contas educacionais durante a sessão.'),
  ('startups','Pitch Bootcamp: Da Ideia ao Primeiro Cliente','Aprende a construir um pitch de 3 minutos e validar uma ideia com clientes reais. Três empreendedores convidados partilham erros comuns a evitar. Inclui simulação de pitch frente a investidores.'),
  ('desporto','Treino de Trail Running pela Colina','Uma saída de corrida em grupo pelos caminhos da colina do campus com paragens técnicas. Adequado a iniciantes e a quem já corre regularmente. Leva água e sapatilhas confortáveis.'),
  ('arte','Oficina de Serigrafia em Tecido','Cria a tua própria tote bag campus com técnicas de estampagem manual. Exploramos composição, cor e repetição de padrões. Leva uma t-shirt ou tecido para customizar.'),
  ('música','Jam Session ao Vivo no Pátio','Uma tarde de música aberta a músicos e espectadores. Trás o teu instrumento ou vem ouvir estilos de jazz a pop. O som é fornecido, basta trazer boa energia.'),
  ('carreira','Como Construir um CV de Tecnologia','Revisão de currículos com recrutadores da indústria tech. Vamos analisar exemplos reais e apontar pontos fortes e fraquezas. Inclui tempo para revisão individual do teu CV.'),
  ('voluntariado','Campanha de Recolha de Bens Essenciais','Junta-te à equipa de voluntários para organizar doações destinadas a famílias da comunidade. Não é preciso experiência anterior, só disponibilidade. Há café e sanduíches para todos os participantes.'),
  ('jogos','Torneio de Board Games Estratégicos','Competição amigável com jogos modernos de estratégia e gestão de recursos. Explicações são dadas antes de cada partida. Vencedores recebem vouchers da livraria do campus.'),
  ('saúde','Yoga na Biblioteca ao Pôr do Sol','Sessão de yoga suave para relaxar o pescoço e as costas depois de longas horas de estudo. Trás esteira ou toalha. Adequado a todos os níveis, incluindo iniciantes absolutos.'),
  ('programação','Introdução ao Rust para Programadores','Primeiros passos na linguagem Rust com exemplos de memória segura e concorrência. Resolvemos problemas práticos em conjunto e discutimos quando Rust faz sentido num projeto.'),
  ('IA','Hackathon de Aplicações de Visão Computacional','Desafia-te a construir uma app que reconheça objetos ou expressões em 24 horas. Equipas de 3 a 5 elementos com mentores de IA. Haverá prémios para as três melhores soluções.'),
  ('startups','Encontro com Fundadores de Spin-offs','Fundadores de spin-offs universitárias contam como passaram da investigação ao mercado. O debate inclui constrangimentos legais e primeiras vendas. Sessão de networking no final.'),
  ('desporto','Aula Aberta de Escalada na Parede','Experimenta escalada desportiva com instrutores certificados. Equipamento fornecido gratuitamente durante a aula. Foco em técnica, segurança e confiança.'),
  ('arte','Roteiro de Arte Urbana no Campus','Passeio guiado pelas obras de arte urbana espalhadas pelos edifícios do campus. Conhece os artistas e os significados por trás de cada mural. Termina num lanche coletivo.'),
  ('música','Masterclass de Produção Musical','Aprende conceitos de mistura, masterização e sound design com um produtor convidado. Traz o teu portátil se quiseres seguir os exemplos ao vivo. Há atividades práticas em grupos.'),
  ('carreira','Simulação de Entrevista Técnica','Pratica entrevistas técnicas de software com perguntas reais usadas por grandes empresas. Recebes feedback imediato sobre comunicação e resolução de problemas. Podes trazer código próprio para discutir.'),
  ('voluntariado','Tutoria de Línguas para Refugiados','Apoio individual de conversação em português ou inglês para estudantes recém-chegados. Preparas pequenas atividades de 15 minutos com guias fornecidos. Faz diferença na integração de alguém.'),
  ('jogos','Noite de Jogos de Realidade Virtual','Experimenta jogos de VR cooperativos e competitivos em estações do Media Lab. Os equipamentos são higienizados entre sessões. Recomendado para quem nunca experimentou RV.'),
  ('saúde','Workshop de Alimentação durante Exames','Nutricionista explica refeições que ajudam a manter energia e concentração em período de avaliações. Inclui receitas rápidas e económicas. Há provas de snacks saudáveis.'),
  ('programação','Contribuição Open Source no GitHub','Sessão prática para fazer o primeiro pull request num projeto open source. Vamos desde forking até revisão de código. Indicado para quem domina git básico e quer começar.')
]

def price(i): return 0 if i % 4 == 0 else [5,5,10,10,15,20][i % 6]

events = []
id = 1
for d, date in enumerate(days):
    count = 6 if d < 5 else 5
    for i in range(count):
        tag, title, desc = templates[(d + i) % len(templates)]
        start, end = slots[(d * 2 + i) % len(slots)]
        tags = [tag]
        if (i + d) % 3 != 0:
            extra = tags_pool[(i * 7 + d * 3) % len(tags_pool)]
            if extra != tag:
                tags.append(extra)
        events.append({
            'id': f'evt-{id:03d}',
            'title': title,
            'description': desc,
            'date': date,
            'start': start,
            'end': end,
            'location': locations[id % len(locations)],
            'tags': tags,
            'price': price(id),
            'link': '#'
        })
        id += 1

os.makedirs('data', exist_ok=True)
with open('data/events.json','w',encoding='utf-8') as f:
    json.dump(events, f, ensure_ascii=False, indent=2)
print('Generated', len(events), 'events')
