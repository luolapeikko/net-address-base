import type {CoreResult} from 'core-result';
import {Ipv6Addr} from 'net-address';

/**
 * Represents an IPv6 socket address, consisting of an IPv6 address, a port number, and an optional flow label.
 * @example
 * const anySocketAddress = new SocketAddrV6(6372); // [::]:6372
 * tcpServer.listen(anySocketAddress.asNodeListener(), () => {});
 * udpSocket.bind(anySocketAddress.asNodeBind(), () => {});
 * @since v0.0.1
 */
export class SocketAddrV6 {
	static #regex = /^\[(.+)\]:(\d+)$/;
	/**
	 * Port number of the socket address.
	 * @since v0.0.1
	 */
	public readonly port: number;
	/**
	 * Address family of the socket address.
	 * @since v0.0.1
	 */
	public readonly family = 'ipv6';
	/**
	 * IPv6 address of the socket address.
	 * @since v0.0.1
	 */
	public readonly address: Ipv6Addr;
	/**
	 * Optional flow label of the socket address.
	 * @since v0.0.1
	 */
	public flowlabel?: number;

	/**
	 * Creates a new {@link SocketAddrV6} instance from a string representation.
	 * @param value - The string representation of the socket address in the format "[address]:port".
	 * @returns An {@link CoreResult} containing the {@link SocketAddrV6} instance or a {@link TypeError} if the input is invalid.
	 * @since v0.1.1
	 */
	public static from(value: string): CoreResult<SocketAddrV6, TypeError> {
		const match = value.match(SocketAddrV6.#regex);
		if (!match) {
			return {success: false, error: new TypeError(`${value} have invalid ipv6 value`)};
		}
		const port = Number(match[2]);
		if (port < 0 || port > 65535) {
			return {success: false, error: new TypeError(`${value} have invalid port value`)};
		}
		const res = Ipv6Addr.from(match[1]);
		if (!res.success) {
			return {success: false, error: res.error};
		}
		return {success: true, value: new SocketAddrV6({address: res.value, port})};
	}

	/**
	 * Creates a new {@link SocketAddrV6} instance from a string representation or throws an error if the input is invalid.
	 * @param value - The string representation of the socket address in the format "[address]:port".
	 * @returns The {@link SocketAddrV6} instance.
	 * @since v0.2.0
	 */
	public static fromOrThrow(value: string): SocketAddrV6 {
		const result = SocketAddrV6.from(value);
		if (!result.success) {
			throw result.error;
		}
		return result.value;
	}

	/**
	 * Creates a new {@link SocketAddrV6} instance.
	 * @param options - The options for creating the socket address or a port number.
	 * @param options.address - Optional {@link Ipv6Addr} address. Defaults to {@link Ipv6Addr.UNSPECIFIED}.
	 * @param options.port - The port number.
	 * @param options.flowlabel - Optional flow label.
	 */
	public constructor(options: {address?: Ipv6Addr; port: number; flowlabel?: number} | number) {
		if (typeof options === 'object') {
			this.address = options.address ?? Ipv6Addr.UNSPECIFIED;
			this.port = options.port;
			this.flowlabel = options.flowlabel;
		} else {
			this.address = Ipv6Addr.UNSPECIFIED;
			this.port = options;
		}
	}

	/**
	 * Returns an object suitable for use as options in Node.js [net.Server.listen()](https://nodejs.org/api/net.html#serverlistenoptions-callback) method.
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
	 * Returns an object suitable for use as options in Node.js [dgram.Socket.bind()](https://nodejs.org/api/dgram.html#socketbindoptions-callback) method.
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
	 * @returns The string representation in the format "[address]:port".
	 * @since v0.0.1
	 */
	public toString(): string {
		return `[${this.address.toString()}]:${this.port}`;
	}

	/**
	 * Compares this socket address with another for equality.
	 * @param other - The other socket address to compare with.
	 * @returns `true` if the socket addresses are equal, `false` otherwise.
	 * @since v0.2.0
	 */
	public equals(other?: unknown): boolean {
		if (!(other instanceof SocketAddrV6)) {
			return false;
		}
		return this.address.equals(other.address) && this.port === other.port && this.flowlabel === other.flowlabel;
	}
}
