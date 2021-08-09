export interface SatItem {
  id: number;
  name: string;
  noardId: string;
  hexColor: string;
  senItems: SenItem[];
}

export interface SenItem {
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

export interface DataNode {
  title: string;
  key: string;
  isLeaf?: boolean;
  children?: DataNode[];
}

export interface SatSen {
  satId: string;
  senNames: string[];
}

export interface PlanPara {
  checkedSenIds: number[];
  start: number;
  stop: number;
  xmin: number;
  xmax: number;
  ymin: number;
  ymax: number;
}

export interface SenPath {
  id: number;
  timeOffset: number;
  lon1: number;
  lat1: number;
  lon2: number;
  lat2: number;
}

export interface PathUnit {
  satId: string;
  satName: string;
  senName: string;
  hexColor: string;
  start: number;
  stop: number;
  pathGeo: SenPath[];
}