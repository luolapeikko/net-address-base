import {Err, type IResult, Ok} from '@luolapeikko/result-option';
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
	private static regex = /^\[(.+)\]:(\d+)$/;

	public readonly port: number;
	public readonly family = 'ipv6';
	public readonly address: Ipv6Addr;
	public flowlabel?: number;

	/**
	 * Creates a new `SocketAddrV6` instance from a string representation.
	 * @param value - The string representation of the socket address in the format "[address]:port".
	 * @returns An `IResult` containing the `SocketAddrV6` instance or unknown/Error if the input is invalid.
	 * @since v0.1.1
	 */
	public static from(value: string): IResult<SocketAddrV6> {
		const match = value.match(SocketAddrV6.regex);
		if (!match) {
			return Err(new TypeError(`${value} have invalid ipv6 value`));
		}
		const port = Number(match[2]);
		if (port < 0 || port > 65535) {
			return Err(new TypeError(`${value} have invalid port value`));
		}
		return Ipv6Addr.from(match[1]).andThen((address) => Ok(new SocketAddrV6({address, port})));
	}

	/**
	 * Creates a new `SocketAddrV6` instance.
	 * @param options - The options for creating the socket address.
	 * @param options.address - The IPv6 address. Defaults to {@link Ipv6Addr.UNSPECIFIED}.
	 * @param options.port - The port number.
	 * @param options.flowlabel - The flow label.
	 */
	public constructor({address, port, flowlabel}: {address?: Ipv6Addr; port: number; flowlabel?: number}) {
		this.address = address ?? Ipv6Addr.UNSPECIFIED;
		this.port = port;
		this.flowlabel = flowlabel;
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
	 * @returns The string representation in the format "[address]:port".
	 * @since v0.0.1
	 */
	public toString(): string {
		return `[${this.address.toString()}]:${this.port}`;
	}
}
