import type {CoreResult} from 'core-result';
import {uw} from './common';
import {Ipv6Addr} from './Ipv6Addr';

/**
 * Represents an IPv4 address.
 * @example
 * const addr1Res = Ipv4Addr.from('192.168.0.1');
 * const addr1 = Ipv4Addr.fromOrThrow('192.168.0.1');
 * const addr2 = new Ipv4Addr(192, 168, 0, 1);
 * const addr3 = new Ipv4Addr(0xc0a80001);
 * @since v0.0.1
 */
export class Ipv4Addr {
	/**
	 * Creates an IPv4 address from dotted-decimal text.
	 * @returns A successful {@link CoreResult} with an {@link Ipv4Addr}, or an {@link TypeError} when the input is invalid.
	 * @example
	 * const addr: CoreResult<Ipv4Addr, TypeError> = Ipv4Addr.from('192.168.0.1');
	 * @since v0.0.1
	 */
	public static from(value: string): CoreResult<Ipv4Addr, TypeError> {
		const match = value.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
		if (!match) {
			return {
				success: false,
				error: new TypeError(`${value} is invalid ipv4 value`),
			};
		}
		const octets = match.slice(1).map(Number);
		if (octets.some((o) => o > 255)) {
			return {
				success: false,
				error: new TypeError(`${value} is invalid ipv4 value`),
			};
		}
		return {
			success: true,
			value: new Ipv4Addr(octets[0], octets[1], octets[2], octets[3]),
		};
	}

	/**
	 * Creates an IPv4 address from text and throws an error if the input is invalid.
	 * @param value The IPv4 address in string format.
	 * @returns The {@link Ipv4Addr} instance.
	 * @throws {TypeError} If the input is not a valid IPv4 address.
	 * @example
	 * const addr: Ipv4Addr = Ipv4Addr.fromOrThrow('192.168.0.1');
	 * @since v0.2.0
	 */
	public static fromOrThrow(value: string): Ipv4Addr {
		return uw(Ipv4Addr.from(value));
	}

	/**
	 * Creates an IPv4 address from a 4-byte buffer.
	 * @returns A successful {@link CoreResult} with an {@link Ipv4Addr}, or an {@link Error} when the buffer cannot be read.
	 * @example
	 * const result: CoreResult<Ipv4Addr, Error> = Ipv4Addr.fromBuffer(buffer);
	 * @since v0.0.1
	 */
	public static fromBuffer(buffer: ArrayBuffer, littleEndian?: boolean): CoreResult<Ipv4Addr, Error> {
		try {
			const view = new DataView(buffer);
			return {
				success: true,
				value: new Ipv4Addr(view.getUint32(0, littleEndian)),
			};
		} catch (err) {
			return {
				success: false,
				error: err as Error,
			};
		}
	}

	/**
	 * Creates an IPv4 address from a 4-byte buffer and throws an error if the buffer cannot be read.
	 * @param buffer The 4-byte buffer containing the IPv4 address.
	 * @param littleEndian Whether the buffer is in little-endian format. Defaults to false (big-endian).
	 * @returns The {@link Ipv4Addr} instance.
	 * @throws {Error} If the buffer cannot be read.
	 * @example
	 * const addr: Ipv4Addr = Ipv4Addr.fromBufferOrThrow(buffer);
	 * @since v0.2.0
	 */
	public static fromBufferOrThrow(buffer: ArrayBuffer, littleEndian?: boolean): Ipv4Addr {
		return uw(Ipv4Addr.fromBuffer(buffer, littleEndian));
	}

	/**
	 * The number of bits in an IPv4 address.
	 * @since v0.0.1
	 * @see https://doc.rust-lang.org/stable/std/net/struct.Ipv4Addr.html#associatedconstant.BITS
	 */
	public static readonly BITS = 32;

	/**
	 * The broadcast address `255.255.255.255`.
	 * @since v0.0.1
	 * @see https://doc.rust-lang.org/stable/std/net/struct.Ipv4Addr.html#associatedconstant.BROADCAST
	 */
	public static readonly BROADCAST: Ipv4Addr = new Ipv4Addr(0xffffffff);

	/**
	 * The localhost address `127.0.0.1`.
	 * @since v0.0.1
	 * @see https://doc.rust-lang.org/stable/std/net/struct.Ipv4Addr.html#associatedconstant.LOCALHOST
	 */
	public static readonly LOCALHOST: Ipv4Addr = new Ipv4Addr(0x7f000001);

	/**
	 * The unspecified address `0.0.0.0`.
	 * @since v0.0.1
	 * @see https://doc.rust-lang.org/stable/std/net/struct.Ipv4Addr.html#associatedconstant.UNSPECIFIED
	 */
	public static readonly UNSPECIFIED: Ipv4Addr = new Ipv4Addr(0x00000000);

	/**
	 * The address family identifier for IPv4 addresses.
	 * @since v0.0.1
	 */
	public readonly family = 'ipv4';

	#integerAddress: number;

	/**
	 * Gets the raw integer representation of the IPv4 address.
	 */
	public get value(): number {
		return this.#integerAddress;
	}

	/**
	 * Creates a new IPv4 address from four octets.
	 * @param num1 The first octet.
	 * @param num2 The second octet.
	 * @param num3 The third octet.
	 * @param num4 The fourth octet.
	 * @throws {RangeError} If the integer values are not in the range of 0 to 255 for each octet.
	 * @throws {TypeError} If the input is not a number.
	 * @example
	 * new Ipv4Addr(192, 168, 0, 1) // creates the address `192.168.0.1`
	 */
	public constructor(num1: number, num2: number, num3: number, num4: number);
	/**
	 * Creates a new IPv4 address from an integer value.
	 * @param integerValue The integer representation of the IPv4 address.
	 * @throws {RangeError} If the integer value is not in the range of 0 to 0xffffffff.
	 * @throws {TypeError} If the input is not a number.
	 * @example
	 * new Ipv4Addr(0xc0a80001) // creates the address `192.168.0.1` from the integer value `0xc0a80001`
	 */
	public constructor(integerValue: number);
	public constructor(...args: [number] | [number, number, number, number]) {
		if ((args.length !== 1 && args.length !== 4) || args.some((arg) => typeof arg !== 'number')) {
			throw new TypeError('Invalid Ipv4Addr arguments. Expected either 1 number (integer value) or 4 numbers (octets).');
		}
		if (args.length === 1) {
			if (args[0] < 0 || args[0] > 0xffffffff) {
				throw new RangeError('IPv4 integer value must be between 0 and 0xffffffff');
			}
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
	 * @see https://doc.rust-lang.org/stable/std/net/struct.Ipv4Addr.html#method.is_shared
	 */
	public isShared(): boolean {
		return this.#match(0x64400000, 10);
	}

	/**
	 * Checks whether this address is the unspecified address.
	 * @returns `true` when the address is `0.0.0.0`, otherwise `false`.
	 * @since v0.0.1
	 * @see https://doc.rust-lang.org/stable/std/net/struct.Ipv4Addr.html#method.is_unspecified
	 */
	public isUnspecified(): boolean {
		return this.#integerAddress === 0;
	}

	/**
	 * Gets the four octets of this IPv4 address.
	 * @returns An array containing the four octets `[num1, num2, num3, num4]`.
	 * @see https://doc.rust-lang.org/stable/std/net/struct.Ipv4Addr.html#method.octets
	 * @since v0.2.0
	 */
	public toOctets(): [number, number, number, number] {
		return this.#fromInteger(this.#integerAddress);
	}

	/**
	 * Converts this address to an IPv4-compatible {@link Ipv6Addr}.
	 * @returns An {@link Ipv6Addr} in the form `::a.b.c.d`.
	 * @since v0.0.1
	 */
	public toIpv6(): Ipv6Addr {
		return new Ipv6Addr(BigInt(this.value));
	}

	/**
	 * Converts this address to an IPv4-mapped {@link Ipv6Addr}.
	 * @returns An {@link Ipv6Addr} in the form `::ffff:a.b.c.d`.
	 * @since v0.0.1
	 */
	public toIpv6Mapped(): Ipv6Addr {
		return new Ipv6Addr(0xffff00000000n | BigInt(this.value));
	}

	/**
	 * Formats this address as dotted-decimal text.
	 * @returns The IPv4 string representation, such as `192.168.0.1`.
	 * @since v0.0.1
	 */
	public toString(): string {
		return this.toOctets().join('.');
	}

	/**
	 * Encodes this address to a 4-byte buffer.
	 * @returns An {@link ArrayBuffer} containing the IPv4 integer value.
	 * @since v0.0.1
	 * @example
	 * const buffer: ArrayBuffer = addr.toBuffer();
	 */
	public toBuffer(littleEndian?: boolean): ArrayBuffer {
		const view = new DataView(new ArrayBuffer(4));
		view.setUint32(0, this.#integerAddress, littleEndian);
		return view.buffer;
	}

	/**
	 * Compares this IPv4 address with another for equality.
	 * @param other instance of another address like to compare with.
	 * @returns `true` if both addresses are equal, otherwise `false`.
	 * @since v0.1.0
	 */
	public equals(other?: unknown): boolean {
		return other instanceof Ipv4Addr && this.#integerAddress === other.#integerAddress;
	}

	#toInteger(num1: number, num2: number, num3: number, num4: number): number {
		for (const octet of [num1, num2, num3, num4]) {
			if (octet < 0 || octet > 255) {
				throw new RangeError('IPv4 octet must be between 0 and 255');
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
			throw new RangeError('Invalid prefix length');
		}
		const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
		return (this.#integerAddress & mask) === (network & mask);
	}
}
