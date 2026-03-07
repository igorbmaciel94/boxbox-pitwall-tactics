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
    next: string;
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
    abandonCancel: string;
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
    safetyCarActive: string;
    freePitStop: string;
    crashDamage: string;
    crashDNF: string;
    dnfTitle: string;
    dnfMessage: string;
    skipTurn: string;
    emergencyMulligan: string;
    noPitCardWarning: string;
    scFreePit: string;
    scOvertakeWarning: string;
    scPlayAnyway: string;
    p1NoOvertake: string;
    pLastNoLose: string;
  };
  deck: {
    title: string;
    subtitle: string;
    yourDeck: string;
    clearDeck: string;
    suggestedDecks: string;
    confirmDeck: string;
  };
  deckMenu: {
    title: string;
    createNew: string;
    noDecks: string;
    deleteConfirm: string;
    deleteConfirmMsg: string;
  };
  deckEditor: {
    createTitle: string;
    editTitle: string;
    deckName: string;
    deckNamePlaceholder: string;
    startWith: string;
    saveDeck: string;
    nameRequired: string;
    nameTaken: string;
  };
  deckPicker: {
    title: string;
    nCards: string;
    createNewDeck: string;
  };
  deckDetail: {
    edit: string;
    delete: string;
    created: string;
  };
  cardDetail: {
    pros: string;
    cons: string;
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
    trophies: string;
    noHistory: string;
    noRuns: string;
    noTrophies: string;
    scorePrefix: string;
    goalAchieved: string;
    goalFailed: string;
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
    nextRace: string;
    seasonComplete: string;
    perkActivated: string;
    qdPrefix: string;
  };
  season: {
    title: string;
    loadingSeason: string;
    completedRaces: string;
    raceOf: string;
    startRace: string;
    currentDeck: string;
    allCards: string;
    raceResultsTitle: string;
    continueOrNew: string;
    continueOrNewDesc: string;
    continueSeason: string;
    newSeason: string;
    setupTitle: string;
    yourGoal: string;
    chooseGoal: string;
    chooseGoalDesc: string;
    startRange: string;
    tireBudget: string;
    tireBudgetDesc: string;
    totalSets: string;
    startSeason: string;
    minOneTire: string;
    initialBudget: string;
  };
  seasonResults: {
    title: string;
    noData: string;
    finalScore: string;
    seasonSuffix: string;
    raceResults: string;
    newSeason: string;
    goalResult: string;
    goalAchieved: string;
    goalFailed: string;
    championshipPosition: string;
  };
  classification: {
    title: string;
  };
  standings: {
    title: string;
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
      safetyCarTitle: string;
      safetyCarText: string;
      skipTurnTitle: string;
      skipTurnText: string;
      crashTitle: string;
      crashText: string;
      tipsTitle: string;
      tip1: string;
      tip2: string;
      tip3: string;
      tip4: string;
      tip5: string;
      tip6: string;
      seasonModeTitle: string;
      seasonModeP1: string;
      seasonModeP2: string;
      rivalsTitle: string;
      rivalsP1: string;
      rivalsP2: string;
      goalsTitle: string;
      goalsP1: string;
      goalTop: string;
      goalMid: string;
      goalBottom: string;
      championshipTitle: string;
      championshipP1: string;
      championshipP2: string;
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
  traits: {
    'traffic-heavy': string;
    'no-overtaking': string;
    'sc-prone': string;
    'rain-likely': string;
    'rain-possible': string;
    'high-speed': string;
    'low-downforce': string;
    'overtake-friendly': string;
    'tire-heavy': string;
    'technical': string;
    'mechanical-risk': string;
  };
  difficulty: {
    title: string;
    easy: string;
    normal: string;
    hard: string;
    easyDesc: string;
    normalDesc: string;
    hardDesc: string;
  };
  stats: {
    pos: string;
    wear: string;
    lap: string;
  };
}

export interface ContentStrings {
  cards: Record<string, { name: string; rulesText: string; pros?: string[]; cons?: string[] }>;
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

const EN_CARD_STRATEGY: Record<string, { pros: string[]; cons: string[] }> = {
  'push-hard': {
    pros: ['Gains 2 positions — solid overtaking', 'Good balance of risk and reward'],
    cons: ['+15 tire wear', 'Crash risk if tires are already worn'],
  },
  'box-box': {
    pros: ['Fresh tires with extra life (starts below 0 wear)', 'Essential for tire management', 'Free pit stop under Safety Car'],
    cons: ['Lose 4 positions — big position cost', 'Timing the pit stop is critical'],
  },
  'conserve-tires': {
    pros: ['Reduces tire wear by 15 — extends stint', 'Safe play with low risk'],
    cons: ['Lose 1 position', 'No offensive value'],
  },
  'overtake': {
    pros: ['Gains 3 positions — strongest overtaking card', 'Can change the race in one move'],
    cons: ['Very high tire wear (+25)', 'High crash risk on worn tires', 'Penalized under Safety Car'],
  },
  'defend-position': {
    pros: ['Holds position with minimal tire cost (+5)', 'Very safe — almost no risk', '+2 bonus positions under Safety Car'],
    cons: ['No position gain', 'Purely reactive — does not improve standing'],
  },
  'drs-attack': {
    pros: ['Gains 2 positions with moderate wear (+10)', 'Good in clear air situations'],
    cons: ['Adds tire wear (+10)', 'Penalized under Safety Car'],
  },
  'slipstream': {
    pros: ['Gains 1 position with zero tire cost', 'Safest aggressive card — no wear penalty'],
    cons: ['Only gains 1 position — modest gain', 'Penalized under Safety Car'],
  },
  'late-brake': {
    pros: ['Gains 3 positions — tied for strongest', 'High-risk high-reward play'],
    cons: ['High tire wear (+20)', 'Significant crash risk on worn tires'],
  },
  'gap-management': {
    pros: ['Reduces tire wear by 10 while holding position', 'Great for extending a stint', '+2 bonus positions under Safety Car'],
    cons: ['No position gain', 'Purely defensive — no overtaking power'],
  },
  'undercut': {
    pros: ['Gains 1 position AND triggers pit stop', 'Standard fresh tires (reset to 0)', 'Combines attack + tire management'],
    cons: ['Aggressive tag increases crash risk on worn tires', 'Must have compound available for pit'],
  },
  'engine-mode': {
    pros: ['Gains 1 position with moderate wear (+10)', 'Reliable one-position gain'],
    cons: ['Adds tire wear (+10)', 'Penalized under Safety Car'],
  },
  'alternate-strategy': {
    pros: ['Triggers pit with fresh tires with extra life', 'Defensive tag: safe play, +2 under SC', 'Lose only 2 positions vs 4 for Box Box'],
    cons: ['Still loses 2 positions', 'Must have compound available for pit'],
  },
};

function buildEnglishContent(): ContentStrings {
  const cardMap = Object.fromEntries(cardsData.cards.map((card) => [card.id, {
    name: card.name,
    rulesText: card.rulesText,
    ...EN_CARD_STRATEGY[card.id],
  }]));
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
    next: 'Next',
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
    subtitle: 'Racing Card Game',
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
      deckBuilderLabel: 'My Decks',
      deckBuilderDesc: 'Manage your strategy decks',
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
    abandonConfirm: 'All progress in this race will be lost. Are you sure?',
    abandonCancel: 'Keep Racing',
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
    safetyCarActive: 'Safety Car - No overtaking',
    freePitStop: 'Free pit stop under SC!',
    crashDamage: 'Incident! Heavy damage to the car.',
    crashDNF: 'Crash! Car retired from the race.',
    dnfTitle: 'Did Not Finish',
    dnfMessage: 'Your car has retired from the race after a crash.',
    skipTurn: 'Skip Turn',
    emergencyMulligan: 'Emergency Redraw',
    noPitCardWarning: 'No pit card! Redraw or skip turn.',
    scFreePit: 'Free pit under SC',
    scOvertakeWarning: 'Overtaking under SC! +3 position penalty if you play this card.',
    scPlayAnyway: 'Play Anyway (+3 penalty)',
    p1NoOvertake: 'You\'re P1! Overtake cards won\'t gain positions. Consider pit stop or skip.',
    pLastNoLose: 'You\'re last — this card won\'t lose positions.',
  },
  deck: {
    title: 'Deck Builder',
    subtitle: 'Select 9 cards (max 2 copies each) to build your strategy deck.',
    yourDeck: 'Your Deck',
    clearDeck: 'Clear deck',
    suggestedDecks: 'Suggested Decks',
    confirmDeck: 'Confirm Deck',
  },
  deckMenu: {
    title: 'My Decks',
    createNew: 'Create New Deck',
    noDecks: 'No decks yet. Create your first deck!',
    deleteConfirm: 'Delete this deck?',
    deleteConfirmMsg: 'This action cannot be undone.',
  },
  deckEditor: {
    createTitle: 'Create Deck',
    editTitle: 'Edit Deck',
    deckName: 'Deck Name',
    deckNamePlaceholder: 'Enter deck name...',
    startWith: 'Start With',
    saveDeck: 'Save Deck',
    nameRequired: 'Deck name is required',
    nameTaken: 'A deck with this name already exists',
  },
  deckPicker: {
    title: 'Select Deck',
    nCards: '{{count}} cards',
    createNewDeck: 'Create New Deck',
  },
  deckDetail: {
    edit: 'Edit Deck',
    delete: 'Delete',
    created: 'Created',
  },
  cardDetail: {
    pros: 'Pros',
    cons: 'Cons',
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
    runHistory: 'History',
    bestScores: 'Records',
    trophies: 'Trophies',
    noHistory: 'No races completed yet. Start racing to see your history here.',
    noRuns: 'No runs',
    noTrophies: 'No trophies yet. Complete a season to earn trophies.',
    scorePrefix: 'Score',
    goalAchieved: 'Achieved',
    goalFailed: 'Failed',
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
    nextRace: 'Next Race',
    seasonComplete: 'Season Results',
    perkActivated: 'Perk!',
    qdPrefix: 'QD',
  },
  season: {
    title: 'Season',
    loadingSeason: 'Loading season...',
    completedRaces: 'Completed Races',
    raceOf: 'Race {{current}} of {{total}}',
    startRace: 'Start Race',
    currentDeck: 'Current Deck',
    allCards: 'All Cards',
    raceResultsTitle: 'Race Results',
    continueOrNew: 'Season in Progress',
    continueOrNewDesc: 'You have an active season. Continue or start fresh?',
    continueSeason: 'Continue Season',
    newSeason: 'New Season',
    setupTitle: 'Season Setup',
    yourGoal: 'Your Goal',
    chooseGoal: 'Choose Your Goal',
    chooseGoalDesc: 'Select a season objective. Your goal determines starting position range.',
    startRange: 'Start Range',
    tireBudget: 'Tire Budget',
    tireBudgetDesc: 'Distribute {{total}} tire sets across compounds.',
    totalSets: '{{current}} / {{total}} sets',
    startSeason: 'Start Season',
    minOneTire: 'At least 1 set of each compound required',
    initialBudget: 'Initial Budget',
  },
  seasonResults: {
    title: 'Season Results',
    noData: 'No season data available.',
    finalScore: 'Final Score',
    seasonSuffix: 'season',
    raceResults: 'Race Results',
    newSeason: 'New Season',
    goalResult: 'Season Goal',
    goalAchieved: 'Goal Achieved!',
    goalFailed: 'Goal Not Achieved',
    championshipPosition: 'Championship P{{position}}',
  },
  classification: {
    title: 'Race Classification',
  },
  standings: {
    title: 'Championship Standings',
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
      tirePitStop: 'Playing a pit card triggers a tire change to the next available compound in your allocation. Pit stops cost positions but give fresh tires — some pit cards start tires below 0 wear, giving extra life before degradation kicks in.',
      tireBlowout: 'If tire wear reaches 100, you suffer a blowout penalty (+3 to +7 positions lost depending on difficulty). Always pit before that happens!',
      tireSeasonBudget: 'In Season mode, you have a limited tire budget across all 6 races. Plan ahead - running out of Softs early means fewer options later.',
      mulliganTitle: 'Mulligan (Redraw)',
      mulliganText: 'On the first lap only, you can redraw your entire hand once. Use this if your starting hand doesn\'t match the event or your strategy.',
      safetyCarTitle: 'Safety Car Rules',
      safetyCarText: 'Under Safety Car: pit stops are free (no position loss), defensive/overcut cards get +2 bonus positions, overtaking cards are nullified with a +3 penalty (you can still choose to play them). Team perk is blocked under SC. Use it to pit for fresh tires!',
      skipTurnTitle: 'Skip Turn & Emergency Redraw',
      skipTurnText: 'If you have no pit card when mandatory pit is needed, you get an emergency redraw. If still no pit card, you can skip your turn (no card played). Skipping avoids crash risk but you still take tire degradation penalties.',
      crashTitle: 'Crash / DNF Risk',
      crashText: 'Aggressive cards on worn tires, rain on dry tires, and mechanical issues increase crash risk. A crash can cause heavy damage (+6 positions, +25 wear) or a DNF (race over). Under Safety Car there is no crash risk.',
      tipsTitle: 'Strategy Tips',
      tip1: 'Balance your deck - do not go all-in on one card type.',
      tip2: 'Watch your tire wear - at 100 you get a tire blowout penalty.',
      tip3: 'Use your team perk at the right moment - you only get one per race.',
      tip4: 'Save your team perk for a critical moment, not the first opportunity.',
      tip5: 'Study the circuit objectives before building your deck.',
      tip6: 'Some circuits have tougher tire wear - plan your pit stops accordingly.',
      seasonModeTitle: 'Season Mode',
      seasonModeP1: 'Race all 6 circuits in order. Your tire budget is shared across the entire season, so plan carefully. After each race you can swap up to 3 cards in your deck.',
      seasonModeP2: 'At the start you choose difficulty (Easy/Normal/Hard) which sets your total tire budget. Your starting position each race is determined by your goal card tier.',
      rivalsTitle: 'Rivals & Classification',
      rivalsP1: '18 drivers from 6 teams compete alongside you. After each race, a full classification is shown with positions and championship points for all drivers.',
      rivalsP2: 'On the mini-map, nearby rivals show 3-letter abbreviations and team colors. Higher-strength drivers tend to finish higher but results vary each race.',
      goalsTitle: 'Season Goals',
      goalsP1: 'Each team tier has a season goal that is automatically assigned based on your team:',
      goalTop: 'Top teams (Onyx, Azure): Championship Contender - finish P1-P3 in the championship.',
      goalMid: 'Mid teams (Crimson, Amber): Points Machine - finish top 5 AND score points every race.',
      goalBottom: 'Lower teams (Emerald, Violet): Rising Star - beat your teammates AND score 20+ points.',
      championshipTitle: 'Championship Points',
      championshipP1: 'Points are awarded using the real F1 system: P1=25, P2=18, P3=15, P4=12, P5=10, P6=8, P7=6, P8=4, P9=2, P10=1. Positions 11-18 score 0 points.',
      championshipP2: 'Championship standings accumulate across all 6 races. View standings from the season hub at any time. At season end, your goal is evaluated and a trophy is awarded.',
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
  traits: {
    'traffic-heavy': 'Heavy Traffic',
    'no-overtaking': 'Hard to Overtake',
    'sc-prone': 'SC Prone',
    'rain-likely': 'Rain Likely',
    'rain-possible': 'Rain Possible',
    'high-speed': 'High Speed',
    'low-downforce': 'Low Downforce',
    'overtake-friendly': 'Overtake Friendly',
    'tire-heavy': 'High Tire Wear',
    'technical': 'Technical',
    'mechanical-risk': 'Mech. Risk',
  },
  difficulty: {
    title: 'Difficulty',
    easy: 'Easy',
    normal: 'Normal',
    hard: 'Hard',
    easyDesc: 'Relaxed experience. Less tire wear, fewer crashes. Great for learning the game.',
    normalDesc: 'Balanced challenge. Standard tire wear and crash risk. The intended experience.',
    hardDesc: 'Punishing conditions. Tires degrade fast, crashes are frequent. For experienced strategists.',
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
    next: 'Proximo',
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
    subtitle: 'Racing Card Game',
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
      deckBuilderLabel: 'Meus Decks',
      deckBuilderDesc: 'Gerencie seus decks estrategicos',
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
    abandonConfirm: 'Todo o progresso desta corrida sera perdido. Tem certeza?',
    abandonCancel: 'Continuar',
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
    safetyCarActive: 'Safety Car - Sem ultrapassagens',
    freePitStop: 'Pit stop gratis sob SC!',
    crashDamage: 'Incidente! Dano pesado no carro.',
    crashDNF: 'Batida! Carro abandonou a corrida.',
    dnfTitle: 'Nao Terminou',
    dnfMessage: 'Seu carro abandonou a corrida apos uma batida.',
    skipTurn: 'Passar Vez',
    emergencyMulligan: 'Trocar Mao Extra',
    noPitCardWarning: 'Sem carta de pit! Troque a mao ou passe a vez.',
    scFreePit: 'Pit gratis sob SC',
    scOvertakeWarning: 'Ultrapassagem sob SC! +3 penalidade de posicao se jogar esta carta.',
    scPlayAnyway: 'Jogar Mesmo Assim (+3 penalidade)',
    p1NoOvertake: 'Voce esta em P1! Cartas de ultrapassagem nao ganham posicoes. Considere pit stop ou pular turno.',
    pLastNoLose: 'Voce esta em ultimo — esta carta nao vai perder posicoes.',
  },
  deck: {
    title: 'Construtor de Deck',
    subtitle: 'Selecione 9 cartas (maximo 2 copias de cada) para montar seu deck estrategico.',
    yourDeck: 'Seu Deck',
    clearDeck: 'Limpar deck',
    suggestedDecks: 'Decks Sugeridos',
    confirmDeck: 'Confirmar Deck',
  },
  deckMenu: {
    title: 'Meus Decks',
    createNew: 'Criar Novo Deck',
    noDecks: 'Nenhum deck ainda. Crie seu primeiro deck!',
    deleteConfirm: 'Excluir este deck?',
    deleteConfirmMsg: 'Esta acao nao pode ser desfeita.',
  },
  deckEditor: {
    createTitle: 'Criar Deck',
    editTitle: 'Editar Deck',
    deckName: 'Nome do Deck',
    deckNamePlaceholder: 'Digite o nome do deck...',
    startWith: 'Comecar Com',
    saveDeck: 'Salvar Deck',
    nameRequired: 'Nome do deck e obrigatorio',
    nameTaken: 'Ja existe um deck com este nome',
  },
  deckPicker: {
    title: 'Selecionar Deck',
    nCards: '{{count}} cartas',
    createNewDeck: 'Criar Novo Deck',
  },
  deckDetail: {
    edit: 'Editar Deck',
    delete: 'Excluir',
    created: 'Criado em',
  },
  cardDetail: {
    pros: 'Vantagens',
    cons: 'Desvantagens',
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
    bestScores: 'Recordes',
    trophies: 'Trofeus',
    noHistory: 'Nenhuma corrida concluida ainda. Corra para ver seu historico aqui.',
    noRuns: 'Sem corridas',
    noTrophies: 'Nenhum trofeu ainda. Complete uma temporada para ganhar trofeus.',
    scorePrefix: 'Pontuacao',
    goalAchieved: 'Alcancado',
    goalFailed: 'Nao Alcancado',
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
    nextRace: 'Proxima Etapa',
    seasonComplete: 'Resultados da Temporada',
    perkActivated: 'Perk!',
    qdPrefix: 'DR',
  },
  season: {
    title: 'Temporada',
    loadingSeason: 'Carregando temporada...',
    completedRaces: 'Corridas Concluidas',
    raceOf: 'Corrida {{current}} de {{total}}',
    startRace: 'Iniciar Corrida',
    currentDeck: 'Deck Atual',
    allCards: 'Todas as Cartas',
    raceResultsTitle: 'Resultados das Corridas',
    continueOrNew: 'Temporada em Andamento',
    continueOrNewDesc: 'Voce tem uma temporada ativa. Continuar ou comecar nova?',
    continueSeason: 'Continuar Temporada',
    newSeason: 'Nova Temporada',
    setupTitle: 'Configuracao da Temporada',
    yourGoal: 'Seu Objetivo',
    chooseGoal: 'Escolha Seu Objetivo',
    chooseGoalDesc: 'Selecione um objetivo de temporada. O objetivo determina sua faixa de largada.',
    startRange: 'Faixa de Largada',
    tireBudget: 'Orcamento de Pneus',
    tireBudgetDesc: 'Distribua {{total}} jogos de pneus entre os compostos.',
    totalSets: '{{current}} / {{total}} jogos',
    startSeason: 'Iniciar Temporada',
    minOneTire: 'Minimo de 1 jogo de cada composto',
    initialBudget: 'Orcamento Inicial',
  },
  seasonResults: {
    title: 'Resultados da Temporada',
    noData: 'Sem dados de temporada disponiveis.',
    finalScore: 'Pontuacao Final',
    seasonSuffix: 'temporada',
    raceResults: 'Resultados das Corridas',
    newSeason: 'Nova Temporada',
    goalResult: 'Objetivo da Temporada',
    goalAchieved: 'Objetivo Alcancado!',
    goalFailed: 'Objetivo Nao Alcancado',
    championshipPosition: 'Campeonato P{{position}}',
  },
  classification: {
    title: 'Classificacao da Corrida',
  },
  standings: {
    title: 'Classificacao do Campeonato',
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
      tirePitStop: 'Jogar uma carta de pit aciona a troca de pneus para o proximo composto disponivel na sua alocacao. Pit stops custam posicoes mas dao pneus novos — algumas cartas de pit comecam os pneus abaixo de 0 desgaste, dando vida extra antes da degradacao.',
      tireBlowout: 'Se o desgaste chegar a 100, voce sofre penalidade de estouro (+3 a +7 posicoes perdidas dependendo da dificuldade). Sempre pare antes que isso aconteca!',
      tireSeasonBudget: 'No modo Temporada, voce tem um orcamento limitado de pneus para todas as 6 corridas. Planeje - usar todos os Softs cedo significa menos opcoes depois.',
      mulliganTitle: 'Mulligan (Trocar Mao)',
      mulliganText: 'Apenas na primeira volta, voce pode trocar toda a mao uma vez. Use se a mao inicial nao combina com o evento ou sua estrategia.',
      safetyCarTitle: 'Regras do Safety Car',
      safetyCarText: 'Sob Safety Car: pit stops sao gratis (sem perda de posicao), cartas defensivas/overcut ganham +2 bonus de posicao, cartas de ultrapassagem sao anuladas com penalidade +3 (voce ainda pode jogar). Perk da equipe bloqueado sob SC. Aproveite para trocar os pneus!',
      skipTurnTitle: 'Passar Vez e Troca Extra',
      skipTurnText: 'Se voce nao tiver carta de pit quando o pit e obrigatorio, ganha uma troca extra de mao. Se ainda nao tiver, pode passar a vez (sem jogar carta). Passar evita risco de batida mas voce ainda sofre penalidades de desgaste.',
      crashTitle: 'Risco de Batida / DNF',
      crashText: 'Cartas agressivas com pneus gastos, chuva em pneus secos e problemas mecanicos aumentam o risco de batida. Uma batida causa dano pesado (+6 posicoes, +25 desgaste) ou DNF (corrida encerrada). Sob Safety Car nao ha risco de batida.',
      tipsTitle: 'Dicas de Estrategia',
      tip1: 'Equilibre o deck - nao aposte tudo em um unico tipo de carta.',
      tip2: 'Fique de olho no desgaste - ao chegar a 100 voce sofre penalidade por estouro de pneu.',
      tip3: 'Use o perk da equipe no momento certo - voce so tem um por corrida.',
      tip4: 'Guarde o perk da equipe para um momento critico, nao na primeira chance.',
      tip5: 'Estude os objetivos do circuito antes de montar o deck.',
      tip6: 'Alguns circuitos tem desgaste de pneu mais severo — planeje seus pit stops de acordo.',
      seasonModeTitle: 'Modo Temporada',
      seasonModeP1: 'Corra nos 6 circuitos em ordem. Seu orcamento de pneus e compartilhado em toda a temporada, entao planeje com cuidado. Apos cada corrida voce pode trocar ate 3 cartas do deck.',
      seasonModeP2: 'No inicio voce escolhe a dificuldade (Facil/Normal/Dificil) que define o orcamento total de pneus. Sua posicao de largada em cada corrida e determinada pelo tier do seu objetivo.',
      rivalsTitle: 'Rivais e Classificacao',
      rivalsP1: '18 pilotos de 6 equipes competem ao seu lado. Apos cada corrida, a classificacao completa e exibida com posicoes e pontos do campeonato para todos os pilotos.',
      rivalsP2: 'No mini-mapa, rivais proximos mostram abreviacoes de 3 letras e cores da equipe. Pilotos mais fortes tendem a terminar mais a frente, mas os resultados variam.',
      goalsTitle: 'Objetivos da Temporada',
      goalsP1: 'Cada tier de equipe tem um objetivo que e atribuido automaticamente:',
      goalTop: 'Times top (Onyx, Azure): Candidato ao Titulo - terminar P1-P3 no campeonato.',
      goalMid: 'Times medios (Crimson, Amber): Maquina de Pontos - terminar no top 5 E pontuar em toda corrida.',
      goalBottom: 'Times menores (Emerald, Violet): Estrela em Ascensao - superar companheiros E marcar 20+ pontos.',
      championshipTitle: 'Pontos do Campeonato',
      championshipP1: 'Pontos sao dados usando o sistema real da F1: P1=25, P2=18, P3=15, P4=12, P5=10, P6=8, P7=6, P8=4, P9=2, P10=1. Posicoes 11-18 nao pontuam.',
      championshipP2: 'A classificacao do campeonato acumula ao longo das 6 corridas. Veja a classificacao no hub da temporada a qualquer momento. No final, seu objetivo e avaliado e um trofeu e concedido.',
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
  traits: {
    'traffic-heavy': 'Trafego Pesado',
    'no-overtaking': 'Dificil Ultrapassar',
    'sc-prone': 'SC Frequente',
    'rain-likely': 'Chuva Provavel',
    'rain-possible': 'Chuva Possivel',
    'high-speed': 'Alta Velocidade',
    'low-downforce': 'Baixo Downforce',
    'overtake-friendly': 'Facil Ultrapassar',
    'tire-heavy': 'Alto Desgaste',
    'technical': 'Tecnico',
    'mechanical-risk': 'Risco Mecanico',
  },
  difficulty: {
    title: 'Dificuldade',
    easy: 'Facil',
    normal: 'Normal',
    hard: 'Dificil',
    easyDesc: 'Experiencia relaxada. Menos desgaste de pneu, menos batidas. Otimo para aprender o jogo.',
    normalDesc: 'Desafio equilibrado. Desgaste e risco de batida padrao. A experiencia planejada.',
    hardDesc: 'Condicoes punitivas. Pneus se desgastam rapido, batidas sao frequentes. Para estrategistas experientes.',
  },
  stats: {
    pos: 'POS',
    wear: 'DESG',
    lap: 'VOLTA',
  },
};

const PT_BR_CONTENT: ContentStrings = {
  cards: {
    'push-hard': {
      name: 'Push Hard', rulesText: 'Leve o carro ao limite: ganhe 2 posicoes, +15 desgaste.',
      pros: ['Ganha 2 posicoes — boa ultrapassagem', 'Bom equilibrio risco/recompensa'],
      cons: ['+15 desgaste de pneu', 'Risco de batida com pneus gastos'],
    },
    'box-box': {
      name: 'Box Box', rulesText: 'Pit stop! Perde 4 posicoes mas pneus novos com vida extra.',
      pros: ['Pneus novos com vida extra (comeca abaixo de 0)', 'Essencial para gestao de pneus', 'Pit gratis sob Safety Car'],
      cons: ['Perde 4 posicoes — custo alto', 'Timing do pit e crucial'],
    },
    'conserve-tires': {
      name: 'Conservar Pneus', rulesText: 'Cuide da borracha: perca 1 posicao, -15 desgaste.',
      pros: ['Reduz desgaste em 15 — prolonga stint', 'Jogada segura com baixo risco'],
      cons: ['Perde 1 posicao', 'Sem valor ofensivo'],
    },
    overtake: {
      name: 'Ultrapassar', rulesText: 'Manda por dentro! Ganhe 3 posicoes, +25 desgaste.',
      pros: ['Ganha 3 posicoes — carta mais forte de ataque', 'Pode mudar a corrida em um lance'],
      cons: ['Desgaste muito alto (+25)', 'Alto risco de batida com pneus gastos', 'Penalizada sob Safety Car'],
    },
    'defend-position': {
      name: 'Defender Posicao', rulesText: 'Segure a linha: mantenha posicao, +5 desgaste por pilotagem defensiva.',
      pros: ['Mantem posicao com custo minimo (+5)', 'Muito segura — quase sem risco', '+2 bonus de posicao sob Safety Car'],
      cons: ['Sem ganho de posicao', 'Puramente reativa — nao melhora colocacao'],
    },
    'drs-attack': {
      name: 'Ataque de DRS', rulesText: 'DRS aberto! Ganhe 2 posicoes, +10 desgaste.',
      pros: ['Ganha 2 posicoes com desgaste moderado (+10)', 'Boa em situacoes de ar limpo'],
      cons: ['Adiciona desgaste (+10)', 'Penalizada sob Safety Car'],
    },
    slipstream: {
      name: 'Vacuo', rulesText: 'Pegue vacuo do rival: ganhe 1 posicao, sem custo de pneu.',
      pros: ['Ganha 1 posicao com zero desgaste', 'Carta agressiva mais segura — sem custo de pneu'],
      cons: ['Ganha apenas 1 posicao — ganho modesto', 'Penalizada sob Safety Car'],
    },
    'late-brake': {
      name: 'Frenagem Tardia', rulesText: 'Frenagem tardia arriscada! Ganhe 3 posicoes, +20 desgaste.',
      pros: ['Ganha 3 posicoes — empatada como mais forte', 'Jogada arriscada e empolgante'],
      cons: ['Desgaste alto (+20)', 'Risco significativo de batida com pneus gastos'],
    },
    'gap-management': {
      name: 'Gestao de Gap', rulesText: 'Controle o ritmo: mantenha posicao, -10 desgaste.',
      pros: ['Reduz desgaste em 10 mantendo posicao', 'Otima para prolongar stint', '+2 bonus de posicao sob Safety Car'],
      cons: ['Sem ganho de posicao', 'Puramente defensiva — sem poder de ultrapassagem'],
    },
    undercut: {
      name: 'Undercut', rulesText: 'Estrategia de pit antecipada: ganhe 1 posicao, pneus novos padrao.',
      pros: ['Ganha 1 posicao E aciona pit stop', 'Pneus novos padrao (reset para 0)', 'Combina ataque + gestao de pneus'],
      cons: ['Tag agressiva aumenta risco com pneus gastos', 'Precisa ter composto disponivel para pit'],
    },
    'engine-mode': {
      name: 'Modo Motor', rulesText: 'Aumente o motor: ganhe 1 posicao, +10 desgaste.',
      pros: ['Ganha 1 posicao com desgaste moderado (+10)', 'Ganho confiavel de uma posicao'],
      cons: ['Adiciona desgaste (+10)', 'Penalizada sob Safety Car'],
    },
    'alternate-strategy': {
      name: 'Estrategia Alternativa', rulesText: 'Estrategia oposta aos rivais: perca 2 posicoes, pneus com vida extra.',
      pros: ['Aciona pit com pneus novos com vida extra', 'Tag defensiva: jogada segura, +2 sob SC', 'Perde so 2 posicoes vs 4 do Box Box'],
      cons: ['Ainda perde 2 posicoes', 'Precisa ter composto disponivel para pit'],
    },
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
