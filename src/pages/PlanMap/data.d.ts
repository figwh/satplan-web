export interface SatItem {
  id: number;
  name: string;
  noardId: string;
  oleColor: number;
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
  oleColor: number;
}

export interface DataNode {
  title: string;
  key: string;
  isLeaf?: boolean;
  children?: DataNode[];
}