# unix-socket-address

## Runtime agnostic core Unix Socket IpAddr class base on Rust implementation.

## Installation
```bash
npm i unix-socket-address
```

## Examples
```typescript
 const socketAddress = new SocketAddrUnix('/tmp/app.sock');
 const windowsNamedPipeAddress = new SocketAddrUnix('\\\\.\\pipe\\app');

server.listen(socketAddress.asNodeListenerOptions())
 ```