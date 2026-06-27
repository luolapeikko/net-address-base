import {Ipv4Addr} from 'net-address';

/**
 * Represents an IPv4 socket address, consisting of an IPv4 address and a port number.
 * @example
 * const socketAddr = new SocketAddrV4({port: 6372}); // new SocketAddrV4({addr: Ipv4Addr.UNSPECIFIED, port: 6372});
 * tcpServer.listen(socketAddr.asNodeListenerOptions(), () => {});
 * udpSocket.bind(socketAddr.asNodeBindOptions(), () => {});
 * tcpServer.listen({...socketAddr.asNodeListenerOptions(), ipv6Only: true}, () => {});
 * @since v0.0.1
 */
export class SocketAddrV4 {
	public readonly port: number;
	public readonly address: Ipv4Addr;
	public readonly family = 'ipv4';
	/**
	 * Creates a new `SocketAddrV4` instance.
	 * @param options - The options for creating the socket address.
	 * @param options.addr - The IPv4 address. Defaults to {@link Ipv4Addr.UNSPECIFIED}.
	 * @param options.port - The port number.
	 */
	public constructor({addr, port}: {addr?: Ipv4Addr; port: number}) {
		this.address = addr ?? Ipv4Addr.UNSPECIFIED;
		this.port = port;
	}

	/**
	 * Returns an object suitable for use as options in Node.js `net.Server.listen()` method.
	 * @returns An object containing the `port` and `host` properties.
	 * @since v0.0.1
	 */
	public asNodeListener(): {port: number; host: string} {
		return {
			port: this.port,
			host: this.address.toString(),
		};
	}

	/**
	 * Returns an object suitable for use as options in Node.js `dgram.Socket.bind()` method.
	 * @returns An object containing the `port` and `address` properties.
	 * @since v0.1.0
	 */
	public asNodeBind(): {port: number; address: string} {
		return {
			port: this.port,
			address: this.address.toString(),
		};
	}

	/**
	 * Returns a string representation of this socket address.
	 * @returns The string representation in the format "address:port".
	 * @since v0.0.1
	 */
	public toString(): string {
		return `${this.address.toString()}:${this.port}`;
	}
}
