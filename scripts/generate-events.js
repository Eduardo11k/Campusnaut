const fs = require('fs');
const path = require('path');

const tagsPool = ['IA', 'startups', 'desporto', 'arte', 'música', 'carreira', 'voluntariado', 'jogos', 'saúde', 'programação'];
const days = ['2026-10-19','2026-10-20','2026-10-21','2026-10-22','2026-10-23','2026-10-24','2026-10-25'];
const timeSlots = [
  {start:'09:00',end:'11:00'},{start:'10:00',end:'12:00'},{start:'12:00',end:'13:30'},
  {start:'13:00',end:'15:00'},{start:'14:30',end:'16:30'},{start:'15:00',end:'17:00'},
  {start:'16:00',end:'18:00'},{start:'17:00',end:'19:00'},{start:'18:00',end:'20:00'},
  {start:'19:00',end:'21:00'},{start:'20:00',end:'22:00'}
];
const locations = ['Auditório Central','LABS A — Ed. Norte','Sala de Conferências Beta','Ginásio Norte','Pátio da Reitoria','Sala 204 — Ed. Sul','Centro de Inovação','Café Campus','Biblioteca','Parque Exterior','Sala de Reuniões C3','Media Lab','Auditório de Música','Campo Desportivo'];
const templates = [
  {tag:'IA',title:'Workshop de IA Generativa para Estudantes',desc:'Descobre como ferramentas de inteligência artificial podem acelerar trabalhos académicos e projetos pessoais. Vamos experimentar prompts práticos e debater ética na IA. Haverá acesso a contas educacionais durante a sessão.'},
  {tag:'startups',title:'Pitch Bootcamp: Da Ideia ao Primeiro Cliente',desc:'Aprende a construir um pitch de 3 minutos e validar uma ideia com clientes reais. Três empreendedores convidados partilham erros comuns a evitar. Inclui simulação de pitch frente a investidores.'},
  {tag:'desporto',title:'Treino de Trail Running pela Colina',desc:'Uma saída de corrida em grupo pelos caminhos da colina do campus com paragens técnicas. Adequado a iniciantes e a quem já corre regularmente. Leva água e sapatilhas confortáveis.'},
  {tag:'arte',title:'Oficina de Serigrafia em Tecido',desc:'Cria a tua própria tote bag campus com técnicas de estampagem manual. Exploramos composição, cor e repetição de padrões. Leva uma t-shirt ou tecido para customizar.'},
  {tag:'música',title:'Jam Session ao Vivo no Pátio',desc:'Uma tarde de música aberta a músicos e espectadores. Trás o teu instrumento ou vem ouvir estilos de jazz a pop. O som é fornecido, basta trazer boa energia.'},
  {tag:'carreira',title:'Como Construir um CV de Tecnologia',desc:'Revisão de currículos com recrutadores da indústria tech. Vamos analisar exemplos reais e apontar pontos fortes e fraquezas. Inclui tempo para revisão individual do teu CV.'},
  {tag:'voluntariado',title:'Campanha de Recolha de Bens Essenciais',desc:'Junta-te à equipa de voluntários para organizar doações destinadas a famílias da comunidade. Não é preciso experiência anterior, só disponibilidade. Há café e sanduíches para todos os participantes.'},
  {tag:'jogos',title:'Torneio de Board Games Estratégicos',desc:'Competição amigável com jogos modernos de estratégia e gestão de recursos. Explicações são dadas antes de cada partida. Vencedores recebem vouchers da livraria do campus.'},
  {tag:'saúde',title:'Yoga na Biblioteca ao Pôr do Sol',desc:'Sessão de yoga suave para relaxar o pescoço e as costas depois de longas horas de estudo. Trás esteira ou toalha. Adequado a todos os níveis, incluindo iniciantes absolutos.'},
  {tag:'programação',title:'Introdução ao Rust para Programadores',desc:'Primeiros passos na linguagem Rust com exemplos de memória segura e concorrência. Resolvemos problemas práticos em conjunto e discutimos quando Rust faz sentido num projeto.'},
  {tag:'IA',title:'Hackathon de Aplicações de Visão Computacional',desc:'Desafia-te a construir uma app que reconheça objetos ou expressões em 24 horas. Equipas de 3 a 5 elementos com mentores de IA. Haverá prémios para as três melhores soluções.'},
  {tag:'startups',title:'Encontro com Fundadores de Spin-offs',desc:'Fundadores de spin-offs universitárias contam como passaram da investigação ao mercado. O debate inclui constrangimentos legais e primeiras vendas. Sessão de networking no final.'},
  {tag:'desporto',title:'Aula Aberta de Escalada na Parede',desc:'Experimenta escalada desportiva com instrutores certificados. Equipamento fornecido gratuitamente durante a aula. Foco em técnica, segurança e confiança.'},
  {tag:'arte',title:'Roteiro de Arte Urbana no Campus',desc:'Passeio guiado pelas obras de arte urbana espalhadas pelos edifícios do campus. Conhece os artistas e os significados por trás de cada mural. Termina num lanche coletivo.'},
  {tag:'música',title:'Masterclass de Produção Musical',desc:'Aprende conceitos de mistura, masterização e sound design com um produtor convidado. Traz o teu portátil se quiseres seguir os exemplos ao vivo. Há atividades práticas em grupos.'},
  {tag:'carreira',title:'Simulação de Entrevista Técnica',desc:'Pratica entrevistas técnicas de software com perguntas reais usadas por grandes empresas. Recebes feedback imediato sobre comunicação e resolução de problemas. Podes trazer código próprio para discutir.'},
  {tag:'voluntariado',title:'Tutoria de Línguas para Refugiados',desc:'Apoio individual de conversação em português ou inglês para estudantes recém-chegados. Preparas pequenas atividades de 15 minutos com guias fornecidos. Faz diferença na integração de alguém.'},
  {tag:'jogos',title:'Noite de Jogos de Realidade Virtual',desc:'Experimenta jogos de VR cooperativos e competitivos em estações do Media Lab. Os equipamentos são higienizados entre sessões. Recomendado para quem nunca experimentou RV.'},
  {tag:'saúde',title:'Workshop de Alimentação durante Exames',desc:'Nutricionista explica refeições que ajudam a manter energia e concentração em período de avaliações. Inclui receitas rápidas e económicas. Há provas de snacks saudáveis.'},
  {tag:'programação',title:'Contribuição Open Source no GitHub',desc:'Sessão prática para fazer o primeiro pull request num projeto open source. Vamos desde forking até revisão de código. Indicado para quem domina git básico e quer começar.'}
];

function pickPrice(i) { return (i % 4 === 0) ? 0 : [5,5,10,10,15,20][i % 6]; }

const events = [];
let id = 1;
for (let d = 0; d < days.length; d++) {
  const count = d < 5 ? 6 : 5;
  for (let i = 0; i < count; i++) {
    const tpl = templates[(d + i) % templates.length];
    const slot = timeSlots[(d * 2 + i) % timeSlots.length];
    const tags = [tpl.tag];
    if ((i + d) % 3 !== 0) {
      const extra = tagsPool[(i * 7 + d * 3) % tagsPool.length];
      if (extra !== tpl.tag) tags.push(extra);
    }
    events.push({
      id: ,
      title: tpl.title,
      description: tpl.desc,
      date: days[d],
      start: slot.start,
      end: slot.end,
      location: locations[id % locations.length],
      tags,
      price: pickPrice(id),
      link: '#'
    });
    id++;
  }
}

const out = path.join(__dirname, '..', 'data', 'events.json');
fs.writeFileSync(out, JSON.stringify(events, null, 2));
console.log('Generated', events.length, 'events');
