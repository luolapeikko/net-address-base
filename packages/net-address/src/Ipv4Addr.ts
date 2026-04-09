import {Err, type IResult, Ok} from '@luolapeikko/result-option';
import {Ipv6Addr} from './Ipv6Addr';

/**
 * Represents an IPv4 address.
 * @example
 * const addr1 = Ipv4Addr.from('192.168.0.1').unwrap();
 * const addr2 = new Ipv4Addr(192, 168, 0, 1);
 * const addr3 = new Ipv4Addr(0xc0a80001);
 * @since v0.0.1
 */
export class Ipv4Addr {
	/**
	 * Creates an IPv4 address from dotted-decimal text.
	 * @returns A successful {@link IResult} with an IPv4 address, or an error when the input is invalid.
	 * @since v0.0.1
	 */
	public static from(value: string): IResult<Ipv4Addr, TypeError> {
		const match = value.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
		if (!match) {
			return Err(new TypeError(`${value} is invalid ipv4 value`));
		}
		const octets = match.slice(1).map(Number);
		if (octets.some((o) => o > 255)) {
			return Err(new TypeError(`${value} is invalid ipv4 value`));
		}
		return Ok(new Ipv4Addr(octets[0], octets[1], octets[2], octets[3]));
	}

	/**
	 * Creates an IPv4 address from a 4-byte buffer.
	 * @returns A successful {@link IResult} with an IPv4 address, or an error when the buffer cannot be read.
	 * @since v0.0.1
	 */
	public static fromBuffer(buffer: ArrayBuffer, littleEndian?: boolean): IResult<Ipv4Addr> {
		try {
			const view = new DataView(buffer);
			return Ok(new Ipv4Addr(view.getUint32(0, littleEndian)));
		} catch (err) {
			return Err(err);
		}
	}

	/**
	 * The number of bits in an IPv4 address.
	 * @since v0.0.1
	 */
	public static readonly BITS = 32;

	/**
	 * The broadcast address `255.255.255.255`.
	 * @since v0.0.1
	 */
	public static readonly BROADCAST: Ipv4Addr = new Ipv4Addr(0xffffffff);

	/**
	 * The localhost address `127.0.0.1`.
	 * @since v0.0.1
	 */
	public static readonly LOCALHOST: Ipv4Addr = new Ipv4Addr(0x7f000001);

	/**
	 * The unspecified address `0.0.0.0`.
	 * @since v0.0.1
	 */
	public static readonly UNSPECIFIED: Ipv4Addr = new Ipv4Addr(0x00000000);

	/**
	 * The address family identifier for IPv4 addresses.
	 * @since v0.0.1
	 */
	public readonly family = 'ipv4';

	#integerAddress: number;

	/**
	 * Creates a new IPv4 address from four octets.
	 * @param num1 The first octet.
	 * @param num2 The second octet.
	 * @param num3 The third octet.
	 * @param num4 The fourth octet.
	 * @example
	 * new Ipv4Addr(192, 168, 0, 1) // creates the address `192.168.0.1`
	 */
	public constructor(num1: number, num2: number, num3: number, num4: number);
	/**
	 * Creates a new IPv4 address from an integer value.
	 * @param integerValue The integer representation of the IPv4 address.
	 * @example
	 * new Ipv4Addr(0xc0a80001) // creates the address `192.168.0.1` from the integer value `0xc0a80001`
	 */
	public constructor(integerValue: number);
	public constructor(...args: [number] | [number, number, number, number]) {
		if (args.length === 1) {
			this.#integerAddress = args[0];
		} else {
			this.#integerAddress = this.#toInteger(args[0], args[1], args[2], args[3]);
		}
	}

	/**
	 * Checks whether this address is the broadcast address.
	 * @see https://datatracker.ietf.org/doc/html/rfc919#section-7
	 * @returns `true` when the address is `255.255.255.255`, otherwise `false`.
	 * @since v0.0.1
	 */
	public isBroadcast(): boolean {
		return this.#integerAddress === 0xffffffff;
	}

	/**
	 * Checks whether this address is in a documentation-only range.
	 * @see https://datatracker.ietf.org/doc/html/rfc5737
	 * @returns `true` for `192.0.2.0/24`, `198.51.100.0/24`, or `203.0.113.0/24`; otherwise `false`.
	 * @since v0.0.1
	 */
	public isDocumentation(): boolean {
		return (
			this.#match(0xc0000200, 24) || // 192.0.2.0/24
			this.#match(0xc6336400, 24) || // 198.51.100.0/24
			this.#match(0xcb007100, 24) // 203.0.113.0/24
		);
	}

	/**
	 * Checks whether this address is in the benchmarking range.
	 * @see https://datatracker.ietf.org/doc/html/rfc2544
	 * @returns `true` when the address is in `198.18.0.0/15`, otherwise `false`.
	 * @since v0.0.1
	 */
	public isBenchmarking(): boolean {
		return this.#match(0xc6120000, 15);
	}

	/**
	 * Checks whether this address is globally reachable.
	 * @see https://www.iana.org/assignments/iana-ipv4-special-registry/iana-ipv4-special-registry.xhtml
	 * @returns `true` when the address is not in any special non-global range.
	 * @since v0.0.1
	 */
	public isGlobal(): boolean {
		return !(
			this.isUnspecified() ||
			this.isPrivate() ||
			this.isShared() ||
			this.isLoopback() ||
			this.isLinkLocal() ||
			this.isDocumentation() ||
			this.isBenchmarking() ||
			this.isReserved() ||
			this.isMulticast() ||
			this.isBroadcast()
		);
	}

	/**
	 * Checks whether this address is link-local.
	 * @see https://datatracker.ietf.org/doc/html/rfc3927
	 * @returns `true` when the address is in `169.254.0.0/16`, otherwise `false`.
	 * @since v0.0.1
	 */
	public isLinkLocal(): boolean {
		return this.#match(0xa9fe0000, 16);
	}

	/**
	 * Checks whether this address is a loopback address.
	 * @see https://datatracker.ietf.org/doc/html/rfc1122
	 * @returns `true` when the address is in `127.0.0.0/8`, otherwise `false`.
	 * @since v0.0.1
	 */
	public isLoopback(): boolean {
		return this.#match(0x7f000000, 8);
	}

	/**
	 * Checks whether this address is a multicast address.
	 * @see https://datatracker.ietf.org/doc/html/rfc5771
	 * @returns `true` when the address is in `224.0.0.0/4`, otherwise `false`.
	 * @since v0.0.1
	 */
	public isMulticast(): boolean {
		return this.#match(0xe0000000, 4);
	}

	/**
	 * Checks whether this address is in a private-use range.
	 * @see https://datatracker.ietf.org/doc/html/rfc1918
	 * @returns `true` for `10.0.0.0/8`, `172.16.0.0/12`, or `192.168.0.0/16`; otherwise `false`.
	 * @since v0.0.1
	 */
	public isPrivate(): boolean {
		return (
			this.#match(0x0a000000, 8) || // 10.0.0.0/8
			this.#match(0xac100000, 12) || // 172.16.0.0/12
			this.#match(0xc0a80000, 16) // 192.168.0.0/16
		);
	}

	/**
	 * Checks whether this address is in the reserved range.
	 * @see https://datatracker.ietf.org/doc/html/rfc1112
	 * @returns `true` when the address is in `240.0.0.0/4` except the broadcast address.
	 * @since v0.0.1
	 */
	public isReserved(): boolean {
		return this.#match(0xf0000000, 4) && !this.isBroadcast();
	}

	/**
	 * Checks whether this address is in the shared Carrier-Grade NAT range.
	 * @see https://datatracker.ietf.org/doc/html/rfc6598
	 * @returns `true` when the address is in `100.64.0.0/10`, otherwise `false`.
	 * @since v0.0.1
	 */
	public isShared(): boolean {
		return this.#match(0x64400000, 10);
	}
	
	/**
	 * Checks whether this address is the unspecified address.
	 * @returns `true` when the address is `0.0.0.0`, otherwise `false`.
	 * @since v0.0.1
	 */
	public isUnspecified(): boolean {
		return this.#integerAddress === 0;
	}

	/**
	 * Converts this address to an IPv4-compatible IPv6 address.
	 * @returns An IPv6 address in the form `::a.b.c.d`.
	 * @since v0.0.1
	 */
	public toIpv6(): Ipv6Addr {
		return Ipv6Addr.from(`::${this.toString()}`).unwrap();
	}

	/**
	 * Converts this address to an IPv4-mapped IPv6 address.
	 * @returns An IPv6 address in the form `::ffff:a.b.c.d`.
	 * @since v0.0.1
	 */
	public toIpv6Mapped(): Ipv6Addr {
		return Ipv6Addr.from(`::ffff:${this.toString()}`).unwrap();
	}

	/**
	 * Formats this address as dotted-decimal text.
	 * @returns The IPv4 string representation, such as `192.168.0.1`.
	 * @since v0.0.1
	 */
	public toString(): string {
		const [num1, num2, num3, num4] = this.#fromInteger(this.#integerAddress);
		return `${num1}.${num2}.${num3}.${num4}`;
	}

	/**
	 * Encodes this address to a 4-byte buffer.
	 * @returns An `ArrayBuffer` containing the IPv4 integer value.
	 * @since v0.0.1
	 */
	public toBuffer(littleEndian?: boolean): ArrayBuffer {
		const buffer = new ArrayBuffer(4);
		const view = new DataView(buffer);
		view.setUint32(0, this.#integerAddress, littleEndian);
		return buffer;
	}

	#toInteger(num1: number, num2: number, num3: number, num4: number): number {
		for (const octet of [num1, num2, num3, num4]) {
			if (octet < 0 || octet > 255) {
				throw new Error('IPv4 octet must be between 0 and 255');
			}
		}
		return ((num1 << 24) | (num2 << 16) | (num3 << 8) | num4) >>> 0;
	}

	#fromInteger(integer: number): [number, number, number, number] {
		const num1 = (integer >> 24) & 0xff;
		const num2 = (integer >> 16) & 0xff;
		const num3 = (integer >> 8) & 0xff;
		const num4 = integer & 0xff;
		return [num1, num2, num3, num4];
	}

	#match(network: number, prefix: number): boolean {
		if (prefix < 0 || prefix > 32) {
			throw new Error('Invalid prefix length');
		}
		const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
		return (this.#integerAddress & mask) === (network & mask);
	}
}
