import {Ipv6Addr} from 'net-address';

/**
 * Represents an IPv6 socket address, consisting of an IPv6 address, a port number, and an optional flow label.
 * @example
 * const anySocketAddress = new SocketAddrV6(6372); // new SocketAddrV6(Ipv6Addr.UNSPECIFIED, 6372);
 * tcpServer.listen(anySocketAddress.asNodeListenerOptions(), () => {});
 * udpSocket.bind(anySocketAddress, () => {});
 * @since v0.0.1
 */
export class SocketAddrV6 {
	#addr: Ipv6Addr;
	public readonly port: number;
	public readonly family = 'ipv6';
	public readonly address: string;
	public flowlabel?: number;

	/**
	 * Creates a new `SocketAddrV6` instance.
	 * @param options - The options for creating the socket address.
	 * @param options.address - The IPv6 address. Defaults to {@link Ipv6Addr.UNSPECIFIED}.
	 * @param options.port - The port number.
	 * @param options.flowlabel - The flow label.
	 */
	public constructor({address, port, flowlabel}: {address?: Ipv6Addr; port: number; flowlabel?: number}) {
		this.#addr = address ?? Ipv6Addr.UNSPECIFIED;
		this.port = port;
		this.flowlabel = flowlabel;
		this.address = this.#addr.toString();
	}

	/**
	 * Returns an object suitable for use as options in Node.js `net.Server.listen()` method.
	 * @returns An object containing the `port` and `host` properties.
	 * @since v0.0.1
	 */
	public asNodeListenerOptions(): {port: number; host: string} {
		return {
			port: this.port,
			host: this.address,
		};
	}

	/**
	 * Gets the raw `Ipv6Addr` instance representing the IP address of this socket address.
	 * @returns Ipv6Addr instance of the socket address's IP address.
	 * @since v0.0.1
	 */
	public getRawAddress(): Ipv6Addr {
		return this.#addr;
	}

	/**
	 * Returns a string representation of this socket address.
	 * @returns The string representation in the format "address:port".
	 * @since v0.0.1
	 */
	public toString(): string {
		return `${this.address}:${this.port}`;
	}
}
