import type {CoreResult} from 'core-result';
import {Ipv4Addr} from 'net-address';

/**
 * Represents an IPv4 socket address, consisting of an IPv4 address and a port number.
 * @example
 * const socketAddr = new SocketAddrV4({port: 6372}); // 0.0.0.0:6372
 * tcpServer.listen(socketAddr.asNodeListener(), () => {});
 * udpSocket.bind(socketAddr.asNodeBind(), () => {});
 * tcpServer.listen({...socketAddr.asNodeListener(), ipv6Only: true}, () => {});
 * @since v0.0.1
 */
export class SocketAddrV4 {
	/**
	 * Port number of the socket address.
	 * @since v0.0.1
	 */
	public readonly port: number;
	/**
	 * IPv4 address of the socket address.
	 * @since v0.0.1
	 */
	public readonly address: Ipv4Addr;
	/**
	 * Address family of the socket address.
	 * @since v0.0.1
	 */
	public readonly family = 'ipv4';

	/**
	 * Creates a new {@link SocketAddrV4} instance from a string representation.
	 * @param value - The string representation of the socket address in the format "address:port".
	 * @returns An {@link CoreResult} containing the {@link SocketAddrV4} instance or a {@link TypeError} if the input is invalid.
	 * @since v0.1.1
	 */
	public static from(value: string): CoreResult<SocketAddrV4, TypeError> {
		const match = value.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3}):(\d+)$/);
		if (!match) {
			return {success: false, error: new TypeError(`${value} is invalid ipv4 value`)};
		}
		const octets = match.slice(1, 5).map(Number);
		const port = Number(match[5]);
		if (octets.some((o) => o > 255)) {
			return {success: false, error: new TypeError(`${value} is invalid ipv4 value`)};
		}
		const address = new Ipv4Addr(octets[0], octets[1], octets[2], octets[3]);
		return {success: true, value: new SocketAddrV4({address, port})};
	}

	/**
	 * Creates a new {@link SocketAddrV4} instance from a string representation or throws an error if the input is invalid.
	 * @param value - The string representation of the socket address in the format "address:port".
	 * @returns The {@link SocketAddrV4} instance.
	 * @since v0.2.0
	 */
	public static fromOrThrow(value: string): SocketAddrV4 {
		const result = SocketAddrV4.from(value);
		if (!result.success) {
			throw result.error;
		}
		return result.value;
	}

	/**
	 * Creates a new {@link SocketAddrV4} instance.
	 * @param options - The options for creating the socket address or a port number.
	 * @param options.address - The IPv4 address. Defaults to {@link Ipv4Addr.UNSPECIFIED}.
	 * @param options.port - The port number.
	 */
	public constructor(options: {address?: Ipv4Addr; port: number} | number) {
		if (typeof options === 'object') {
			this.address = options.address ?? Ipv4Addr.UNSPECIFIED;
			this.port = options.port;
		} else {
			this.address = Ipv4Addr.UNSPECIFIED;
			this.port = options;
		}
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

	/**
	 * Compares this socket address with another for equality.
	 * @param other - The other socket address to compare with.
	 * @returns `true` if the socket addresses are equal, `false` otherwise.
	 * @since v0.2.0
	 */
	public equals(other?: unknown): boolean {
		if (!(other instanceof SocketAddrV4)) {
			return false;
		}
		return this.address.equals(other.address) && this.port === other.port;
	}
}
