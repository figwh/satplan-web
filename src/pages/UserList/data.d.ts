export interface NewUserParam {
  email: string;
  userName: string;
  password: string;
  isAdmin: boolean;
}

export interface UpdateUserParam {
  userName: string;
  //adminId: number;
  isAdmin: boolean;
}

export interface ResetPasswordParam{
  id:number;
  newPassword: string;
}

export interface UserListItem {
  id: number;
  email: string;
  name: string;
  //adminId: number;
  isAdmin: boolean;
}


