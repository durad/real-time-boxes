
export interface Box {
  id: string;
  x: number;
  y: number;
  color: string;
  isDragged: boolean;
}

export interface BoardUser {
  id: string;
  username: string;
  x: number;
  y: number;
  color: string;
  state: 'normal' | 'moving';
}


export enum ClientMessages {
  LOGIN = 'LOGIN',
  BOX_LOCKED = 'BOX_LOCKED',
  BOX_MOVED = 'BOX_MOVED',
  MOUSE_MOVED = 'MOUSE_MOVED'
}

export interface ClientLoginPayload {
  username: string;
}

export interface ClientBoxLockedPayload {
  boxId: string;
}

export interface ClientBoxMovedPayload {
  boxId: string;
  x: number;
  y: number;
}

export interface ClientMouseMovedPayload {
  x: number;
  y: number;
}

export enum ServerMessages {
  LOGIN_RESPONSE = 'LOGIN_RESPONSE',
  USER_ADDED = 'USER_ADDED',
  USER_REMOVED = 'USER_REMOVED',
  BOX_MOVED = 'BOX_MOVED',
  MOUSE_MOVED = 'MOUSE_MOVED',
  BOX_LOCKED = 'BOX_LOCKED'
}

export interface ServerLoginResponsePayload {
  userId: string;
  boxes: Box[];
  users: BoardUser[];
}

export interface ServerUserRemovedPayload {
  userId: string;
}

export interface ServerMouseMovedPayload {
  userId: string;
  x: number;
  y: number;
}

export interface ServerBoxMovedPayload {
  userId: string;
  boxId: string;
  x: number;
  y: number;
}
