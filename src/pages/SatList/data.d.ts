export interface NewSatParam {
  line0: string;
  line1: string;
  line2: string;
}

export interface UpdateSatParam {
  satName: string;
  oleColor: number;
}

export interface SatListItem {
  id: number;
  name: string;
  noardId: string;
  oleColor: number;
  senItems: SenItemInfo[];
}

export interface SenitemInfo {
  name: string;
  resolution: number;
  width: number;
  rightSideAngle: number;
  leftSideAngle: number;
  observeAngle: number;
  initAngle: number;
  oleColor: number;
}


