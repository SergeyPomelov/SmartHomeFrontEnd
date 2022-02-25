export interface DomoticzData {
  status: string;
  title: string
  message?: string
  Sunrise?: string
  Sunset?: string
  result?: Device[];
}

export interface Device {

  idx: string
  Name: string
  Status: string
  Type: string
  SubType: string
  Data: string
  Description: string
  LastUpdate: string
  SwitchType?: string
  SelectorStyle?: number
  LevelNames?: string
  Level?: number
  SetPoint?: string
  Usage?: string
  CounterToday?: string
  Speed?: string
  Gust?: string
  DirectionStr?: string
  Color?: string
}

export interface SwitchLevel {
  id: number
  name: string
  level: number
}

export interface DomoticzWSRequest {
  event: string
  query: string
  requestid: number
}

export interface DomoticzWSResponse {
  event: string
  request: string
  data: string
}

