import React from 'react';
import io from 'socket.io-client';
import loadingIcon from './restart.svg';
import mousePointerIcon from './mouse-pointer.svg';
import {
  Box,
  BoardUser,
  ClientMessages,
  ServerMessages,
  ClientLoginPayload,
  ClientBoxLockedPayload,
  ClientMouseMovedPayload,
  ServerLoginResponsePayload,
  ServerBoxMovedPayload,
  ServerMouseMovedPayload,
  ServerUserRemovedPayload
} from './messages';
import './Board.scss';

interface BoardProps {
}

interface BoardState {
  isConnecting: boolean;
  boxes: Box[];
  users: BoardUser[];
  draggingBox: string | undefined;
}

export class Board extends React.Component<BoardProps, BoardState> {
  username: string = '';
  userId: string = '';
  socket: SocketIOClient.Socket | undefined;
  boardRef: React.RefObject<HTMLDivElement> = React.createRef();

  constructor(props: any, ...rest: any[]) {
    super(props, ...rest);

    this.username = localStorage.getItem('username') as string;

    this.state = {
      isConnecting: true,
      boxes: [],
      users: [],
      draggingBox: undefined
    };
  }

  componentDidMount() {
    this.socket = io('http://localhost:4000');
    const loginPayload: ClientLoginPayload = { username: this.username };

    this.socket.on('connect', () => {
      this.socket!.emit(ClientMessages.LOGIN, loginPayload, (loginResponse: ServerLoginResponsePayload) => {
        this.userId = loginResponse.userId;
        this.setState({ isConnecting: false, boxes: loginResponse.boxes, users: loginResponse.users });
      });
    })

    this.socket.on('disconnect', () => {
      this.setState({ isConnecting: true });
    });

    this.socket.on(ServerMessages.USER_ADDED, (user: BoardUser) => {
      this.state.users.push(user);
      this.setState({ users: this.state.users });
    });

    this.socket.on(ServerMessages.USER_REMOVED, (data: ServerUserRemovedPayload) => {
      const user = this.state.users.filter(u => u.id === data.userId)[0];
      const userIndex = this.state.users.indexOf(user);
      this.state.users.splice(userIndex, 1);
      this.setState({ users: this.state.users });
    });

    this.socket.on(ServerMessages.MOUSE_MOVED, (data: ServerMouseMovedPayload) => {
      const user = this.state.users.filter(u => u.id === data.userId)[0];
      user.x = data.x;
      user.y = data.y;
      this.setState({ users: this.state.users });
    });

    this.socket.on(ServerMessages.BOX_MOVED, (data: ServerBoxMovedPayload) => {
      if (this.state.draggingBox === data.boxId) {
        this.setState({ draggingBox: undefined });
      }

      const box = this.state.boxes.filter(b => b.id === data.boxId)[0];
      box.x = data.x;
      box.y = data.y;
      this.setState({ boxes: this.state.boxes });
    });
  }

  componentWillUnmount() {
    if (this.socket && this.socket.connected) {
      this.socket.disconnect();
    }
  }

  handleBoxMouseDown(box: Box, e: React.MouseEvent) {
    this.setState({ draggingBox: box.id });
    this.socket!.emit(ClientMessages.BOX_LOCKED, { boxId: box.id });
  }

  handleBoardMouseMove(e: React.MouseEvent) {
    const boardBB = this.boardRef.current!.getBoundingClientRect() as DOMRect;
    const boardX = e.pageX - boardBB.x;
    const boardY = e.pageY - boardBB.y;
    this.socket!.emit(ClientMessages.MOUSE_MOVED, { x: boardX, y: boardY });

    if (this.state.draggingBox) {
      const box = this.state.boxes.filter(b => b.id === this.state.draggingBox)[0];
      box.x += e.movementX;
      box.y += e.movementY;
      this.setState({ boxes: this.state.boxes });
      this.socket!.emit(ClientMessages.BOX_MOVED, { boxId: box.id, x: box.x, y: box.y });
    }
  }

  handleBoxMouseUp(box: Box, e: React.MouseEvent) {
    this.setState({ draggingBox: undefined });
  }

  render() {
    return (
      <div className="board-component">
        <div className="board" ref={this.boardRef} onMouseMove={e => this.handleBoardMouseMove(e)} onMouseDown={e => console.log('mousedown!')}>
          {this.state.boxes.map(box => (
            <div
              key={box.id}
              className={`box ${box.color} ${box.id === this.state.draggingBox ? 'dragged' : ''}`}
              onMouseDownCapture={(e) => this.handleBoxMouseDown(box, e)}
              onMouseUpCapture={(e) => this.handleBoxMouseUp(box, e)}
              style={{
                backgroundColor: box.color,
                left: box.x,
                top: box.y,
              }} />
          ))}
          {this.state.users.map(mousePointer => (
            <div
              key={mousePointer.id}
              className="mouse-pointer-container"
              style={{
                left: mousePointer.x,
                top: mousePointer.y,
              }}
            >
              <svg className="mouse-icon" width="9px" height="12px" viewBox="0 0 9 12">
                <path id="Line" d="M4.74,7.87 L5.94,10.27 L6.17,10.72 L5.27,11.17 L5.05,10.72 L3.85,8.32 L0.27,10.11 L0.27,0.052 L8.32,6.09 L4.74,7.87 Z" fill={mousePointer.color} fillRule="nonzero"></path>
              </svg>
              <div className="username-container" style={{ color: mousePointer.color }}>
                <div className="username">{mousePointer.username}</div>
              </div>
            </div>
          ))}
          {this.state.isConnecting && (
            <div className="connecting-overlay">
              <img className="connecting-icon" src={loadingIcon} />
              Connecting...
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default Board;
