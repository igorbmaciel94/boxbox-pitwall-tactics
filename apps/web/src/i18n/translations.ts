import type { EventType } from '@boxbox/engine';
import cardsData from '@content-data/cards.json';
import scenariosData from '@content-data/scenarios.json';
import teamsData from '@content-data/teams.json';
import stringsData from '@content-data/strings.json';

export type Locale = 'en' | 'pt-BR';
export type RadioContext = 'stayOut' | 'boxBox' | 'generic';
export type Medal = 'gold' | 'silver' | 'bronze';
export type FilterKey = 'all' | 'drive' | 'pit' | 'tactics';

export interface UIStrings {
  language: {
    title: string;
    english: string;
    portugueseBrazil: string;
    englishFlagAria: string;
    portugueseFlagAria: string;
  };
  nav: {
    home: string;
    team: string;
    decks: string;
    garage: string;
  };
  common: {
    home: string;
    back: string;
    done: string;
    loading: string;
    empty: string;
    scorePts: string;
    objectivesWord: string;
    racesCompleted: string;
    bestRace: string;
    worstRace: string;
    noData: string;
  };
  home: {
    title: string;
    subtitle: string;
    teamLabel: string;
    teamNone: string;
    deckLabel: string;
    deckReady: string;
    deckNotBuilt: string;
    readyHint: string;
    menu: {
      quickRaceLabel: string;
      quickRaceDesc: string;
      seasonLabel: string;
      seasonDesc: string;
      deckBuilderLabel: string;
      deckBuilderDesc: string;
      selectTeamLabel: string;
      selectTeamDesc: string;
      garageLabel: string;
      garageDesc: string;
      howToPlayLabel: string;
      howToPlayDesc: string;
    };
  };
  race: {
    notReady: string;
    selectTeam: string;
    buildDeck: string;
    beforeRacing: string;
    selectCircuit: string;
    chooseCircuit: string;
    loadingRace: string;
    muted: string;
    sfx: string;
    unmute: string;
    mute: string;
    playCard: string;
    pitRequired: string;
    mulligan: string;
    keepHand: string;
    lapComplete: string;
    nextLap: string;
    lightsOut: string;
    startingInfo: string;
    startRace: string;
    chequeredFlag: string;
    viewDebrief: string;
    abandon: string;
    abandonConfirm: string;
    start: string;
    laps: string;
    wear: string;
    pre: string;
    post: string;
    quickDecisionRequired: string;
    quickDecisionTitle: string;
    quickDecisionDesc: string;
    skip: string;
    teamPerkAvailable: string;
    activate: string;
    yourHand: string;
    quickDecisionSelect: string;
    radio: string;
    lapWord: string;
    noEffect: string;
    qdEligibleTitle: string;
  };
  deck: {
    title: string;
    subtitle: string;
    yourDeck: string;
    clearDeck: string;
    suggestedDecks: string;
    confirmDeck: string;
  };
  team: {
    title: string;
    subtitle: string;
    selected: string;
    auto: string;
    active: string;
  };
  garage: {
    title: string;
    runHistory: string;
    bestScores: string;
    noHistory: string;
    noRuns: string;
    scorePrefix: string;
  };
  debrief: {
    title: string;
    noData: string;
    scoreBreakdown: string;
    positionLine: string;
    objectives: string;
    styleBonus: string;
    total: string;
    lapSummary: string;
    medalSuffix: string;
    continueSeason: string;
    perkActivated: string;
    qdPrefix: string;
  };
  season: {
    title: string;
    loadingSeason: string;
    completedRaces: string;
    raceOf: string;
    startRace: string;
    cardSwapTitle: string;
    cardSwapDesc: string;
    currentDeck: string;
    allCards: string;
    raceResultsTitle: string;
  };
  seasonResults: {
    title: string;
    noData: string;
    finalScore: string;
    seasonSuffix: string;
    raceResults: string;
    newSeason: string;
  };
  howToPlay: {
    title: string;
    subtitle: string;
    backToMenu: string;
    sections: {
      overviewTitle: string;
      overviewP1: string;
      overviewP2: string;
      gettingStartedTitle: string;
      start1: string;
      start2: string;
      start3: string;
      raceFlowTitle: string;
      drawLabel: string;
      drawText: string;
      eventLabel: string;
      eventText: string;
      qdLabel: string;
      qdText: string;
      perkLabel: string;
      perkText: string;
      playLabel: string;
      playText: string;
      resultLabel: string;
      resultText: string;
      cardTypesTitle: string;
      drive: string;
      pit: string;
      tactics: string;
      hudTitle: string;
      pos: string;
      wear: string;
      eventsTitle: string;
      sc: string;
      rainEvent: string;
      others: string;
      scoringTitle: string;
      finish: string;
      main: string;
      bonus: string;
      tireStrategyTitle: string;
      tireP1: string;
      tireCompounds: string;
      tirePitStop: string;
      tireBlowout: string;
      tireSeasonBudget: string;
      mulliganTitle: string;
      mulliganText: string;
      tipsTitle: string;
      tip1: string;
      tip2: string;
      tip3: string;
      tip4: string;
      tip5: string;
      tip6: string;
    };
  };
  tireSetup: {
    title: string;
    subtitle: string;
    setsSelected: string;
    startingCompound: string;
    remaining: string;
    rainInfo: string;
    confirm: string;
    chooseCompound: string;
    noCompoundsLeft: string;
    seasonBudget: string;
  };
  stats: {
    pos: string;
    wear: string;
    lap: string;
  };
}

export interface ContentStrings {
  cards: Record<string, { name: string; rulesText: string }>;
  teams: Record<string, { name: string }>;
  perks: Record<string, { name: string; description: string }>;
  scenarios: Record<string, { name: string; circuit: string }>;
  objectives: Record<string, string>;
  events: {
    names: Record<EventType, string>;
    flavors: Record<EventType, string[]>;
  };
  radio: Record<RadioContext, string[]>;
  tags: Record<string, string>;
  filters: Record<FilterKey, string>;
  medals: Record<Medal, string>;
}

export interface Dictionary {
  ui: UIStrings;
  content: ContentStrings;
}

function buildEnglishContent(): ContentStrings {
  const cardMap = Object.fromEntries(cardsData.cards.map((card) => [card.id, { name: card.name, rulesText: card.rulesText }]));
  const teamMap = Object.fromEntries(teamsData.teams.map((team) => [team.id, { name: team.name }]));
  const perkMap = Object.fromEntries(teamsData.teams.map((team) => [team.perk.id, { name: team.perk.name, description: team.perk.description }]));
  const scenarioMap = Object.fromEntries(scenariosData.scenarios.map((scenario) => [scenario.id, { name: scenario.name, circuit: scenario.circuit }]));
  const objectiveMap = Object.fromEntries(
    scenariosData.scenarios.flatMap((scenario) => scenario.objectives.map((objective) => [objective.id, objective.description])),
  );

  return {
    cards: cardMap,
    teams: teamMap,
    perks: perkMap,
    scenarios: scenarioMap,
    objectives: objectiveMap,
    events: {
      names: {
        'safety-car': 'Safety Car',
        rain: 'Rain',
        'rival-pits': 'Rival Pits',
        'rival-overtake': 'Rival Overtake',
        traffic: 'Traffic',
        'clear-air': 'Clear Air',
        'mechanical-issue': 'Mechanical Issue',
      },
      flavors: stringsData.events,
    },
    radio: stringsData.radio,
    tags: {
      aggressive: 'Drive',
      defensive: 'Tactics',
      pit: 'Pit',
      weather: 'Weather',
    },
    filters: {
      all: 'All',
      drive: 'Drive',
      pit: 'Pit',
      tactics: 'Tactics',
    },
    medals: {
      gold: 'Gold',
      silver: 'Silver',
      bronze: 'Bronze',
    },
  };
}

const EN_UI: UIStrings = {
  language: {
    title: 'Language',
    english: 'English',
    portugueseBrazil: 'Portugues (Brasil)',
    englishFlagAria: 'Switch language to English',
    portugueseFlagAria: 'Mudar idioma para Portugues do Brasil',
  },
  nav: {
    home: 'Home',
    team: 'Team',
    decks: 'Decks',
    garage: 'Garage',
  },
  common: {
    home: 'Home',
    back: 'Back',
    done: 'Done',
    loading: 'Loading...',
    empty: 'Empty',
    scorePts: 'pts',
    objectivesWord: 'objectives',
    racesCompleted: 'races completed',
    bestRace: 'Best race',
    worstRace: 'Worst race',
    noData: 'No data available.',
  },
  home: {
    title: 'Box Box',
    subtitle: 'Pit Wall Tactics',
    teamLabel: 'Team',
    teamNone: 'None',
    deckLabel: 'Deck',
    deckReady: '9 cards',
    deckNotBuilt: 'Not built',
    readyHint: 'Select a team and build a deck to start racing',
    menu: {
      quickRaceLabel: 'Quick Race',
      quickRaceDesc: 'Jump into a single race',
      seasonLabel: 'Season',
      seasonDesc: '6-race championship',
      deckBuilderLabel: 'Deck Builder',
      deckBuilderDesc: 'Build your 9-card strategy',
      selectTeamLabel: 'Select Team',
      selectTeamDesc: 'Choose your constructor',
      garageLabel: 'Garage',
      garageDesc: 'Run history and best scores',
      howToPlayLabel: 'How to Play',
      howToPlayDesc: 'Learn the rules and strategy',
    },
  },
  race: {
    notReady: 'Not Ready',
    selectTeam: 'Select Team',
    buildDeck: 'Build Deck',
    beforeRacing: 'before racing.',
    selectCircuit: 'Select Circuit',
    chooseCircuit: 'Choose a circuit for your race.',
    loadingRace: 'Loading race...',
    muted: 'MUTED',
    sfx: 'AUDIO',
    unmute: 'Unmute',
    mute: 'Mute',
    playCard: 'Play Card',
    pitRequired: 'Mandatory pit stop needed!',
    mulligan: 'Redraw Hand',
    keepHand: 'Keep Hand',
    lapComplete: 'Lap {{lap}} Complete',
    nextLap: 'Next Lap',
    lightsOut: 'Lights Out!',
    startingInfo: 'Starting P{{position}} - {{laps}} laps',
    startRace: 'Start Race',
    chequeredFlag: 'Chequered Flag!',
    viewDebrief: 'View Debrief',
    abandon: 'Quit Race',
    abandonConfirm: 'Are you sure you want to abandon this race?',
    start: 'Start',
    laps: 'laps',
    wear: 'Wear',
    pre: 'PRE',
    post: 'POST',
    quickDecisionRequired: 'Quick Decision Required',
    quickDecisionTitle: 'Quick Decision',
    quickDecisionDesc: 'A critical moment. You may play a quick-decision card from your hand, or skip.',
    skip: 'Skip',
    teamPerkAvailable: 'Team Perk Available',
    activate: 'Activate',
    yourHand: 'Your Hand',
    quickDecisionSelect: 'Quick Decision - Select a card',
    radio: 'Radio',
    lapWord: 'LAP',
    noEffect: 'none',
    qdEligibleTitle: 'Quick Decision eligible',
  },
  deck: {
    title: 'Deck Builder',
    subtitle: 'Select 9 cards (max 2 copies each) to build your strategy deck.',
    yourDeck: 'Your Deck',
    clearDeck: 'Clear deck',
    suggestedDecks: 'Suggested Decks',
    confirmDeck: 'Confirm Deck',
  },
  team: {
    title: 'Select Team',
    subtitle: 'Choose your constructor. Each team has a unique one-time perk.',
    selected: 'Selected',
    auto: 'Auto',
    active: 'Active',
  },
  garage: {
    title: 'Garage',
    runHistory: 'Run History',
    bestScores: 'Best Scores',
    noHistory: 'No races completed yet. Start racing to see your history here.',
    noRuns: 'No runs',
    scorePrefix: 'Score',
  },
  debrief: {
    title: 'Race Debrief',
    noData: 'No race data available.',
    scoreBreakdown: 'Score Breakdown',
    positionLine: 'Position (P{{position}})',
    objectives: 'Objectives',
    styleBonus: 'Style Bonus',
    total: 'Total',
    lapSummary: 'Lap Summary',
    medalSuffix: 'medal',
    continueSeason: 'Continue Season',
    perkActivated: 'Perk!',
    qdPrefix: 'QD',
  },
  season: {
    title: 'Season',
    loadingSeason: 'Loading season...',
    completedRaces: 'Completed Races',
    raceOf: 'Race {{current}} of {{total}}',
    startRace: 'Start Race',
    cardSwapTitle: 'Mid-Season Card Swap',
    cardSwapDesc: 'After 3 races, you may modify your deck for the remaining season.',
    currentDeck: 'Current Deck',
    allCards: 'All Cards',
    raceResultsTitle: 'Race Results',
  },
  seasonResults: {
    title: 'Season Results',
    noData: 'No season data available.',
    finalScore: 'Final Score',
    seasonSuffix: 'season',
    raceResults: 'Race Results',
    newSeason: 'New Season',
  },
  howToPlay: {
    title: 'How to Play',
    subtitle: 'Your guide to pit wall strategy',
    backToMenu: 'Back to Menu',
    sections: {
      overviewTitle: 'Overview',
      overviewP1: 'You are the pit wall strategist for a Formula 1 team. Before each race, you build a 9-card deck representing your tactical options. During the race, you draw cards each lap and play them to respond to events on track.',
      overviewP2: 'Your goal is to finish in the best position possible while completing race objectives for bonus points.',
      gettingStartedTitle: 'Getting Started',
      start1: '1. Select a Team - Each constructor has a unique perk that activates once per race.',
      start2: '2. Build Your Deck - Choose 9 cards (max 2 copies of each). Balance between drive, pit, and tactics cards.',
      start3: '3. Race - Pick a circuit and manage 8 laps of strategic decisions.',
      raceFlowTitle: 'Race Flow',
      drawLabel: 'Draw',
      drawText: 'Your hand refills to 3 cards from your shuffled deck.',
      eventLabel: 'Event',
      eventText: 'A random event is revealed - it may affect your car or trigger a quick decision.',
      qdLabel: 'QD',
      qdText: 'If a Safety Car, VSC, or rain spike occurs, you may play a Quick Decision card instantly.',
      perkLabel: 'Perk',
      perkText: 'You can activate your team\'s unique perk (once per race).',
      playLabel: 'Play',
      playText: 'Choose 1 action card from your hand to play.',
      resultLabel: 'Result',
      resultText: 'Card effects and event consequences are applied. Next lap begins.',
      cardTypesTitle: 'Card Types',
      drive: 'Position-focused. Push for overtakes or defend your spot.',
      pit: 'Manage tires and pit strategy.',
      tactics: 'Versatile cards for adapting to changing conditions.',
      hudTitle: 'HUD Gauges',
      pos: 'Your race position (P1 = leading). Lower is better.',
      wear: 'Tire degradation (0-100). High wear hurts performance and worsens position.',
      eventsTitle: 'Events',
      sc: 'Safety Car - field bunches up. Max 1 per race.',
      rainEvent: 'Rain affects tire wear and track conditions.',
      others: 'Traffic, rivals pitting, clear air, and mechanical issues each affect position or wear.',
      scoringTitle: 'Scoring',
      finish: 'Points based on your final position (P1 = 25 pts, like real F1).',
      main: 'Complete the circuit\'s main objective for bonus points.',
      bonus: 'Optional secondary objectives for extra points.',
      tireStrategyTitle: 'Tire Strategy',
      tireP1: 'Before each race you choose 3 sets of dry tires from Soft (S), Medium (M), and Hard (H). Each compound has different wear characteristics.',
      tireCompounds: 'Soft = fast but high wear. Medium = balanced. Hard = slow but durable. You pick the starting compound and can switch via pit cards during the race.',
      tirePitStop: 'Playing a pit card triggers a tire change to the next available compound in your allocation. Pit stops cost positions but reset tire wear.',
      tireBlowout: 'If tire wear reaches 100, you suffer a blowout penalty (+3 positions lost). Always pit before that happens!',
      tireSeasonBudget: 'In Season mode, you have a limited tire budget across all 6 races. Plan ahead - running out of Softs early means fewer options later.',
      mulliganTitle: 'Mulligan (Redraw)',
      mulliganText: 'On the first lap only, you can redraw your entire hand once. Use this if your starting hand doesn\'t match the event or your strategy.',
      tipsTitle: 'Strategy Tips',
      tip1: 'Balance your deck - do not go all-in on one card type.',
      tip2: 'Watch your tire wear - at 100 you get a tire blowout penalty.',
      tip3: 'Use your team perk at the right moment - you only get one per race.',
      tip4: 'Save your team perk for a critical moment, not the first opportunity.',
      tip5: 'Study the circuit objectives before building your deck.',
      tip6: 'Some circuits have tougher tire wear - plan your pit stops accordingly.',
    },
  },
  tireSetup: {
    title: 'Tire Strategy',
    subtitle: 'Select 3 sets of dry tires for this race.',
    setsSelected: 'sets',
    startingCompound: 'Starting Compound',
    remaining: 'Left',
    rainInfo: 'Inter & Wet tires are available automatically if it rains.',
    confirm: 'Confirm Strategy',
    chooseCompound: 'Choose Tire Compound',
    noCompoundsLeft: 'No compounds available. Use Inter/Wet in rain.',
    seasonBudget: 'Season Budget',
  },
  stats: {
    pos: 'POS',
    wear: 'WEAR',
    lap: 'LAP',
  },
};

const PT_BR_UI: UIStrings = {
  language: {
    title: 'Idioma',
    english: 'English',
    portugueseBrazil: 'Portugues (Brasil)',
    englishFlagAria: 'Switch language to English',
    portugueseFlagAria: 'Mudar idioma para Portugues do Brasil',
  },
  nav: {
    home: 'Inicio',
    team: 'Equipe',
    decks: 'Decks',
    garage: 'Garagem',
  },
  common: {
    home: 'Inicio',
    back: 'Voltar',
    done: 'Concluir',
    loading: 'Carregando...',
    empty: 'Vazio',
    scorePts: 'pts',
    objectivesWord: 'objetivos',
    racesCompleted: 'corridas concluidas',
    bestRace: 'Melhor corrida',
    worstRace: 'Pior corrida',
    noData: 'Sem dados disponiveis.',
  },
  home: {
    title: 'Box Box',
    subtitle: 'Pit Wall Tactics',
    teamLabel: 'Equipe',
    teamNone: 'Nenhuma',
    deckLabel: 'Deck',
    deckReady: '9 cartas',
    deckNotBuilt: 'Nao montado',
    readyHint: 'Selecione uma equipe e monte um deck para comecar a correr',
    menu: {
      quickRaceLabel: 'Corrida Rapida',
      quickRaceDesc: 'Entre direto em uma corrida',
      seasonLabel: 'Temporada',
      seasonDesc: 'Campeonato com 6 corridas',
      deckBuilderLabel: 'Construtor de Deck',
      deckBuilderDesc: 'Monte sua estrategia de 9 cartas',
      selectTeamLabel: 'Selecionar Equipe',
      selectTeamDesc: 'Escolha sua construtora',
      garageLabel: 'Garagem',
      garageDesc: 'Historico e melhores pontuacoes',
      howToPlayLabel: 'Como Jogar',
      howToPlayDesc: 'Aprenda regras e estrategia',
    },
  },
  race: {
    notReady: 'Nao pronto',
    selectTeam: 'Selecionar Equipe',
    buildDeck: 'Montar Deck',
    beforeRacing: 'antes de correr.',
    selectCircuit: 'Selecionar Circuito',
    chooseCircuit: 'Escolha um circuito para a corrida.',
    loadingRace: 'Carregando corrida...',
    muted: 'MUDO',
    sfx: 'AUDIO',
    unmute: 'Ativar som',
    mute: 'Silenciar',
    playCard: 'Jogar Carta',
    pitRequired: 'Pit stop obrigatorio!',
    mulligan: 'Trocar Mao',
    keepHand: 'Manter Mao',
    lapComplete: 'Volta {{lap}} Completa',
    nextLap: 'Proxima Volta',
    lightsOut: 'Largada!',
    startingInfo: 'Largando em P{{position}} - {{laps}} voltas',
    startRace: 'Iniciar Corrida',
    chequeredFlag: 'Bandeira Quadriculada!',
    viewDebrief: 'Ver Debrief',
    abandon: 'Abandonar Corrida',
    abandonConfirm: 'Tem certeza que deseja abandonar esta corrida?',
    start: 'Largada',
    laps: 'voltas',
    wear: 'Desgaste',
    pre: 'PRE',
    post: 'POS',
    quickDecisionRequired: 'Decisao Rapida Obrigatoria',
    quickDecisionTitle: 'Decisao Rapida',
    quickDecisionDesc: 'Momento critico. Voce pode jogar uma carta de decisao rapida da mao ou passar.',
    skip: 'Passar',
    teamPerkAvailable: 'Perk da Equipe Disponivel',
    activate: 'Ativar',
    yourHand: 'Sua Mao',
    quickDecisionSelect: 'Decisao Rapida - Selecione uma carta',
    radio: 'Radio',
    lapWord: 'VOLTA',
    noEffect: 'sem efeito',
    qdEligibleTitle: 'Elegivel para Decisao Rapida',
  },
  deck: {
    title: 'Construtor de Deck',
    subtitle: 'Selecione 9 cartas (maximo 2 copias de cada) para montar seu deck estrategico.',
    yourDeck: 'Seu Deck',
    clearDeck: 'Limpar deck',
    suggestedDecks: 'Decks Sugeridos',
    confirmDeck: 'Confirmar Deck',
  },
  team: {
    title: 'Selecionar Equipe',
    subtitle: 'Escolha sua construtora. Cada equipe tem um perk unico de uso unico.',
    selected: 'Selecionada',
    auto: 'Auto',
    active: 'Ativo',
  },
  garage: {
    title: 'Garagem',
    runHistory: 'Historico',
    bestScores: 'Melhores Pontos',
    noHistory: 'Nenhuma corrida concluida ainda. Corra para ver seu historico aqui.',
    noRuns: 'Sem corridas',
    scorePrefix: 'Pontuacao',
  },
  debrief: {
    title: 'Debrief da Corrida',
    noData: 'Sem dados de corrida disponiveis.',
    scoreBreakdown: 'Resumo de Pontos',
    positionLine: 'Posicao (P{{position}})',
    objectives: 'Objetivos',
    styleBonus: 'Bonus de Estilo',
    total: 'Total',
    lapSummary: 'Resumo por Volta',
    medalSuffix: 'medalha',
    continueSeason: 'Continuar Temporada',
    perkActivated: 'Perk!',
    qdPrefix: 'DR',
  },
  season: {
    title: 'Temporada',
    loadingSeason: 'Carregando temporada...',
    completedRaces: 'Corridas Concluidas',
    raceOf: 'Corrida {{current}} de {{total}}',
    startRace: 'Iniciar Corrida',
    cardSwapTitle: 'Troca de Cartas no Meio da Temporada',
    cardSwapDesc: 'Depois de 3 corridas, voce pode ajustar seu deck para o restante da temporada.',
    currentDeck: 'Deck Atual',
    allCards: 'Todas as Cartas',
    raceResultsTitle: 'Resultados das Corridas',
  },
  seasonResults: {
    title: 'Resultados da Temporada',
    noData: 'Sem dados de temporada disponiveis.',
    finalScore: 'Pontuacao Final',
    seasonSuffix: 'temporada',
    raceResults: 'Resultados das Corridas',
    newSeason: 'Nova Temporada',
  },
  howToPlay: {
    title: 'Como Jogar',
    subtitle: 'Seu guia de estrategia no pit wall',
    backToMenu: 'Voltar ao Menu',
    sections: {
      overviewTitle: 'Visao Geral',
      overviewP1: 'Voce e o estrategista de pit wall de uma equipe de Formula 1. Antes de cada corrida, monta um deck de 9 cartas com suas opcoes taticas. Durante a corrida, compra cartas por volta e joga para responder aos eventos da pista.',
      overviewP2: 'Seu objetivo e terminar na melhor posicao possivel enquanto completa objetivos da corrida para pontos extras.',
      gettingStartedTitle: 'Primeiros Passos',
      start1: '1. Selecione uma Equipe - Cada construtora tem um perk unico que ativa uma vez por corrida.',
      start2: '2. Monte seu Deck - Escolha 9 cartas (maximo 2 copias de cada). Equilibre entre drive, pit e taticas.',
      start3: '3. Corra - Escolha um circuito e gerencie 8 voltas de decisoes estrategicas.',
      raceFlowTitle: 'Fluxo da Corrida',
      drawLabel: 'Compra',
      drawText: 'Sua mao volta para 3 cartas com base no deck embaralhado.',
      eventLabel: 'Evento',
      eventText: 'Um evento aleatorio e revelado e pode afetar seu carro ou acionar decisao rapida.',
      qdLabel: 'DR',
      qdText: 'Se ocorrer Safety Car, VSC ou pico de chuva, voce pode jogar uma carta de decisao rapida imediatamente.',
      perkLabel: 'Perk',
      perkText: 'Voce pode ativar o perk unico da sua equipe (uma vez por corrida).',
      playLabel: 'Jogar',
      playText: 'Escolha 1 carta de acao da sua mao para jogar.',
      resultLabel: 'Resultado',
      resultText: 'Efeitos de cartas e consequencias do evento sao aplicados. A proxima volta comeca.',
      cardTypesTitle: 'Tipos de Carta',
      drive: 'Foco em posicao. Ataque para ultrapassar ou defender sua colocacao.',
      pit: 'Gerencie pneus e estrategia de pit.',
      tactics: 'Cartas versateis para adaptar a corrida as mudancas.',
      hudTitle: 'Indicadores do HUD',
      pos: 'Sua posicao na corrida (P1 = lider). Quanto menor, melhor.',
      wear: 'Desgaste de pneus (0-100). Desgaste alto piora desempenho e posicao.',
      eventsTitle: 'Eventos',
      sc: 'Safety Car - pelotao junta. Maximo 1 por corrida.',
      rainEvent: 'Chuva afeta desgaste de pneus e condicoes da pista.',
      others: 'Trafego, rivais parando, ar limpo e problemas mecanicos afetam posicao ou desgaste.',
      scoringTitle: 'Pontuacao',
      finish: 'Pontos por posicao final (P1 = 25 pts, como na F1 real).',
      main: 'Complete o objetivo principal do circuito para ganhar pontos extras.',
      bonus: 'Objetivos secundarios opcionais valem pontos adicionais.',
      tireStrategyTitle: 'Estrategia de Pneus',
      tireP1: 'Antes de cada corrida voce escolhe 3 jogos de pneus secos entre Soft (S), Medium (M) e Hard (H). Cada composto tem caracteristicas diferentes de desgaste.',
      tireCompounds: 'Soft = rapido mas alto desgaste. Medium = equilibrado. Hard = lento mas duravel. Voce escolhe o composto inicial e pode trocar via cartas de pit durante a corrida.',
      tirePitStop: 'Jogar uma carta de pit aciona a troca de pneus para o proximo composto disponivel na sua alocacao. Pit stops custam posicoes mas zeram o desgaste.',
      tireBlowout: 'Se o desgaste chegar a 100, voce sofre penalidade de estouro (+3 posicoes perdidas). Sempre pare antes que isso aconteca!',
      tireSeasonBudget: 'No modo Temporada, voce tem um orcamento limitado de pneus para todas as 6 corridas. Planeje - usar todos os Softs cedo significa menos opcoes depois.',
      mulliganTitle: 'Mulligan (Trocar Mao)',
      mulliganText: 'Apenas na primeira volta, voce pode trocar toda a mao uma vez. Use se a mao inicial nao combina com o evento ou sua estrategia.',
      tipsTitle: 'Dicas de Estrategia',
      tip1: 'Equilibre o deck - nao aposte tudo em um unico tipo de carta.',
      tip2: 'Fique de olho no desgaste - ao chegar a 100 voce sofre penalidade por estouro de pneu.',
      tip3: 'Use o perk da equipe no momento certo - voce so tem um por corrida.',
      tip4: 'Guarde o perk da equipe para um momento critico, nao na primeira chance.',
      tip5: 'Estude os objetivos do circuito antes de montar o deck.',
      tip6: 'Circuitos com muita chuva (Spa, Interlagos) favorecem cartas de clima.',
    },
  },
  tireSetup: {
    title: 'Estrategia de Pneus',
    subtitle: 'Selecione 3 jogos de pneus secos para esta corrida.',
    setsSelected: 'jogos',
    startingCompound: 'Composto Inicial',
    remaining: 'Restam',
    rainInfo: 'Pneus Inter e Wet ficam disponiveis automaticamente em caso de chuva.',
    confirm: 'Confirmar Estrategia',
    chooseCompound: 'Escolher Composto de Pneu',
    noCompoundsLeft: 'Sem compostos disponiveis. Use Inter/Wet na chuva.',
    seasonBudget: 'Budget da Temporada',
  },
  stats: {
    pos: 'POS',
    wear: 'DESG',
    lap: 'VOLTA',
  },
};

const PT_BR_CONTENT: ContentStrings = {
  cards: {
    'push-hard': { name: 'Push Hard', rulesText: 'Leve o carro ao limite: ganhe 2 posicoes, +15 desgaste.' },
    'box-box': { name: 'Box Box', rulesText: 'Pit stop! Pneus novos mas perde posicao: +4 posicoes perdidas, -80 desgaste.' },
    'conserve-tires': { name: 'Conservar Pneus', rulesText: 'Cuide da borracha: perca 1 posicao, -15 desgaste.' },
    overtake: { name: 'Ultrapassar', rulesText: 'Manda por dentro! Ganhe 3 posicoes, +25 desgaste.' },
    'defend-position': { name: 'Defender Posicao', rulesText: 'Segure a linha: mantenha posicao, +5 desgaste por pilotagem defensiva.' },
    'drs-attack': { name: 'Ataque de DRS', rulesText: 'DRS aberto! Ganhe 2 posicoes, +10 desgaste.' },
    slipstream: { name: 'Vacuo', rulesText: 'Pegue vacuo do rival: ganhe 1 posicao, sem custo de pneu.' },
    'late-brake': { name: 'Frenagem Tardia', rulesText: 'Frenagem tardia arriscada! Ganhe 3 posicoes, +20 desgaste.' },
    'gap-management': { name: 'Gestao de Gap', rulesText: 'Controle o ritmo: mantenha posicao, -10 desgaste.' },
    undercut: { name: 'Undercut', rulesText: 'Estrategia de pit antecipada: ganhe 1 posicao, -40 desgaste.' },
    'engine-mode': { name: 'Modo Motor', rulesText: 'Aumente o motor: ganhe 1 posicao, +10 desgaste.' },
    'alternate-strategy': { name: 'Estrategia Alternativa', rulesText: 'Estrategia oposta aos rivais: perca 2 posicoes, -30 desgaste.' },
  },
  teams: {
    crimson: { name: 'Crimson Racing' },
    azure: { name: 'Azure Motorsport' },
    emerald: { name: 'Emerald Grand Prix' },
    amber: { name: 'Amber Autosport' },
    violet: { name: 'Violet Velocity' },
    onyx: { name: 'Onyx Engineering' },
  },
  perks: {
    'crimson-turbo-boost': { name: 'Turbo Boost', description: 'Explosao de potencia: ganhe 2 posicoes, +10 desgaste.' },
    'azure-cool-head': { name: 'Cabeca Fria', description: 'Gestao de pneus: reduza desgaste em 20.' },
    'emerald-balanced-drive': { name: 'Pilotagem Equilibrada', description: 'Equilibrio perfeito: ganhe 1 posicao, -10 desgaste.' },
    'amber-adaptability': { name: 'Adaptabilidade', description: 'Adaptacao rapida: ganhe 1 posicao, -5 desgaste.' },
    'violet-power-surge': { name: 'Surto de Potencia', description: 'Ataque total: ganhe 3 posicoes, +15 desgaste.' },
    'onyx-fortify': { name: 'Fortificar', description: 'Excelencia de engenharia: reduza desgaste em 15.' },
  },
  scenarios: {
    monaco: { name: 'Grande Premio de Monaco', circuit: 'Circuit de Monaco' },
    spa: { name: 'Grande Premio da Belgica', circuit: 'Circuit de Spa-Francorchamps' },
    monza: { name: 'Grande Premio da Italia', circuit: 'Autodromo Nazionale Monza' },
    silverstone: { name: 'Grande Premio da Gra-Bretanha', circuit: 'Silverstone Circuit' },
    suzuka: { name: 'Grande Premio do Japao', circuit: 'Suzuka International Racing Course' },
    interlagos: { name: 'Grande Premio do Brasil', circuit: 'Autodromo Jose Carlos Pace' },
  },
  objectives: {
    'monaco-main': 'Termine no top 5',
    'monaco-bonus': 'Termine com desgaste abaixo de 50',
    'spa-main': 'Termine no top 3',
    'spa-bonus': 'Use o perk da equipe durante a corrida',
    'monza-main': 'Termine no top 6',
    'monza-bonus': 'Jogue pelo menos 2 cartas agressivas',
    'silverstone-main': 'Termine no top 4',
    'silverstone-bonus': 'Nunca ultrapasse 80 de desgaste',
    'suzuka-main': 'Termine no top 5',
    'suzuka-bonus': 'Nunca passe de 80 de desgaste',
    'interlagos-main': 'Termine no top 3',
    'interlagos-bonus': 'Jogue ao menos 1 carta de clima',
  },
  events: {
    names: {
      'safety-car': 'Safety Car',
      rain: 'Chuva',
      'rival-pits': 'Pit dos Rivais',
      'rival-overtake': 'Ultrapassagem Rival',
      traffic: 'Trafego',
      'clear-air': 'Ar Limpo',
      'mechanical-issue': 'Problema Mecanico',
    },
    flavors: {
      'safety-car': [
        'Safety car na pista! O pelotao se aproxima.',
        'Bandeira amarela! Safety car em acao.',
        'Incidente a frente! Safety car ativado.',
      ],
      rain: [
        'Primeiras gotas no visor... condicoes mudando.',
        'A chuva comecou! A pista fica escorregadia.',
        'Pontos molhados aparecendo. Chuva aumentando.',
      ],
      'rival-pits': [
        'Seus rivais vao para o pit! Pressao total.',
        'Varios carros a frente estao parando. Voce responde?',
        'Pit stops dos rivais em andamento. Gap mudando.',
      ],
      'rival-overtake': [
        'Um rival te ultrapassou! Reagir e crucial.',
        'O carro de tras fez a manobra! Voce foi ultrapassado.',
        'Perdeu uma posicao! O carro de tras achou uma brecha.',
      ],
      traffic: [
        'Trafego a frente! Retardatarios atrapalham a linha.',
        'Bandeiras azuis! Mas os retardatarios demoram a sair.',
        'Preso no trafego. Perdendo tempo atras dos mais lentos.',
      ],
      'clear-air': [
        'Ar limpo a frente. Condicao ideal para atacar.',
        'Pista aberta! Sem trafego no horizonte.',
        'Ar limpo. A pista e sua.',
      ],
      'mechanical-issue': [
        'Luz de alerta no painel! Algo nao parece certo.',
        'Vibracoes reportadas. Pode ser problema mecanico.',
        'Engenheiro reporta: problema leve detectado. Monitorando.',
      ],
    },
  },
  radio: {
    stayOut: [
      'Fique na pista, estamos bem.',
      'Negativo para box. Continue empurrando.',
      'Fique fora, o gap esta bom.',
      'Sem parada nesta volta. Posicao de pista e chave.',
    ],
    boxBox: [
      'Box box box! Pit nesta volta!',
      'Ok, box nesta volta. Box box.',
      'Entra, entra! Vai para o pit lane.',
      'Box agora. Pneus novos te esperam.',
    ],
    generic: [
      'Copiado, entendido.',
      'Roger, estamos verificando.',
      'Entendido. Foco na pilotagem.',
      'Copiado. Mantenha a concentracao.',
      'Estamos vendo isso. Aguarde atualizacao.',
    ],
  },
  tags: {
    aggressive: 'Drive',
    defensive: 'Taticas',
    pit: 'Pit',
    weather: 'Clima',
  },
  filters: {
    all: 'Todas',
    drive: 'Drive',
    pit: 'Pit',
    tactics: 'Taticas',
  },
  medals: {
    gold: 'Ouro',
    silver: 'Prata',
    bronze: 'Bronze',
  },
};

export const DEFAULT_LOCALE: Locale = 'en';

export const DICTIONARIES: Record<Locale, Dictionary> = {
  en: {
    ui: EN_UI,
    content: buildEnglishContent(),
  },
  'pt-BR': {
    ui: PT_BR_UI,
    content: PT_BR_CONTENT,
  },
};
