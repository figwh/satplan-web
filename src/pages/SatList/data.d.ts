export interface NewSatParam {
  line0: string;
  line1: string;
  line2: string;
}

export interface UpdateSatParam {
  satName: string;
  hexColor: string;
}

export interface SatListItem {
  id: number;
  name: string;
  noardId: string;
  hexColor: string;
  senItems: SenItemInfo[];
}

export interface SenItemInfo {
  id: number;
  name: string;
  resolution: number;
  width: number;
  rightSideAngle: number;
  leftSideAngle: number;
  observeAngle: number;
  initAngle: number;
  hexColor: string;
}

export interface NewSenParam {
  satId: string;
  name: string;
  resolution: number;
  width: number;
  rightSideAngle: number;
  leftSideAngle: number;
  observeAngle: number;
  initAngle: number;
  hexColor: string;
}

export interface UpdateSenParam{
  name: string;
  resolution: number;
  width: number;
  rightSideAngle: number;
  leftSideAngle: number;
  observeAngle: number;
  initAngle: number;
  hexColor: string;
}
