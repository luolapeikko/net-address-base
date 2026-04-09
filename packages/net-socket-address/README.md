# net-socket-address

## Runtime agnostic core Socket IpAddr classes base on Rust implementation.

## Installation

```bash
npm i net-socket-address
```

### Examples

```typescript
const socketAddr = new SocketAddrV4({port: 6372});
// or new SocketAddrV4({addr: Ipv4Addr.UNSPECIFIED, port: 6372});
tcpServer.listen(socketAddr..asNodeListenerOptions(), () => {});
udpSocket.bind(socketAddr, () => {});
tcpServer.listen({...socketAddr.asNodeListenerOptions(), ipv6Only: true}, () => {});
```
