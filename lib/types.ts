export interface Player {
  id: number
  name: string
  age: number
  position: string
  team: string
  contractType: string // "UFA" or "RFA"
  projectedAav: number
  projectedTerm: number
  valueTier: string
  valueAssessment: string
  recentProduction?: number
  recentGar?: number
  pointsPerGame?: number
  savePercentage?: number
  goalsAgainstAverage?: number
}

export interface GarData {
  playerId: number
  season: string
  gar: number
}

export interface PlayerStat {
  playerId: number
  season: string
  team: string
  position: string
  gamesPlayed: number

  // Skater stats
  goals?: number
  assists?: number
  points?: number
  plusMinus?: number
  penaltyMinutes?: number
  powerPlayGoals?: number
  shortHandedGoals?: number
  gameWinningGoals?: number
  timeOnIce?: number
  giveaways?: number
  takeaways?: number

  // Goalie stats
  wins?: number
  losses?: number
  otLosses?: number
  savePercentage?: number
  goalsAgainstAverage?: number
  shutouts?: number

  // Advanced stats
  corsiForePercentage?: number
  expectedGoals?: number
  expectedGoalsDifferential?: number
  individualCorsiFor?: number
  individualExpectedGoals?: number
  goalsAboveReplacement?: number
  winsAboveReplacement?: number

  // Advanced goalie stats
  goalsSavedAboveAverage?: number
  highDangerSavePercentage?: number
  mediumDangerSavePercentage?: number
  lowDangerSavePercentage?: number
  qualityStartPercentage?: number
}
