
import { Server } from 'socket.io';
import * as http from 'http';
import * as socketio from 'socket.io';
import {
  Box,
  BoardUser,
  ServerMessages,
  ClientMessages,
  ClientBoxLockedPayload,
  ClientLoginPayload,
  ClientBoxMovedPayload,
  ClientMouseMovedPayload,
  ServerLoginResponsePayload, 
  ServerBoxMovedPayload,
  ServerMouseMovedPayload,
  ServerUserRemovedPayload,
} from './../../client/src/messages';

function handler (req, res) {
  res.writeHead(200);
  res.end('Hello!');
}

const app = http.createServer(handler);
app.listen(4000);

const io = socketio(app);

const boxes: Box[] = [
  { id: 'box0', x: 100, y: 100, color: '#2869b3', isDragged: false },
  { id: 'box1', x: 100, y: 300, color: '#3ebd59', isDragged: false },
  { id: 'box2', x: 100, y: 500, color: '#c73131', isDragged: false },
];

const users: BoardUser[] = [];

io.on('connection', (socket) => {
  const userId = ('' + Math.random()).replace(/^0./, '');

  socket.on(ClientMessages.LOGIN, (loginData: ClientLoginPayload, loginResponseFn: { (response: ServerLoginResponsePayload): void }) => {
    const user: BoardUser = {
      id: userId,
      username: loginData.username,
      x: 0,
      y: 0,
      color: '#333',
      state: 'normal'
    };

    users.push(user);

    socket.broadcast.emit(ServerMessages.USER_ADDED, user);

    loginResponseFn({
      userId,
      boxes,
      users: users.filter(u => u.id !== userId),
    });
  });

  socket.on('disconnect', () => {
    const user = users.filter(u => u.id === userId)[0];
    const userIndex = users.indexOf(user);
    users.splice(userIndex, 1);

    const payload: ServerUserRemovedPayload = { userId };
    socket.broadcast.emit(ServerMessages.USER_REMOVED, payload);
  });

  socket.on(ClientMessages.MOUSE_MOVED, (clientData: ClientMouseMovedPayload) => {
    const user = users.filter(u => u.id === userId)[0];
    user.x = clientData.x;
    user.y = clientData.y;

    const payload: ServerMouseMovedPayload = { userId, ...clientData };
    socket.broadcast.emit(ServerMessages.MOUSE_MOVED, payload);
  });

  socket.on(ClientMessages.BOX_LOCKED, (data: ClientBoxLockedPayload) => {
    socket.broadcast.emit(ServerMessages.BOX_LOCKED, {
      userId,
      boxId: data.boxId
    });
  })

  socket.on(ClientMessages.BOX_MOVED, (data: ClientBoxMovedPayload) => {
    const box = boxes.filter(b => b.id === data.boxId)[0];
    box.x = data.x;
    box.y = data.y;

    const payload: ServerBoxMovedPayload = {
      userId,
      boxId: data.boxId,
      x: data.x,
      y: data.y
    };

    socket.broadcast.emit(ServerMessages.BOX_MOVED, payload);
  })
});
