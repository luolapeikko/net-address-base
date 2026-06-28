import {Err, type IOption, type IResult, None, Ok, Result, Some} from '@luolapeikko/result-option';
import {Ipv4Addr} from './Ipv4Addr';

/**
 * Represents an IPv6 address.
 * @example
 * const addr1 = Ipv6Addr.from('2001:db8::1').unwrap();
 * const addr2 = new Ipv6Addr([0x2001, 0xdb8, 0, 0, 0, 0, 0, 1]);
 * const addr3 = new Ipv6Addr(0x20010db8000000000000000000000001n);
 * @since v0.0.1
 */
export class Ipv6Addr {
	private static regex =
		/^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;

	/**
	 * Creates an IPv6 address from text.
	 * @returns A successful result with an IPv6 address, or an error when the input is invalid.
	 * @example
	 * const addr = Ipv6Addr.from('2001:db8::1').unwrap();
	 * @since v0.0.1
	 */
	public static from(value: string): IResult<Ipv6Addr, TypeError | RangeError> {
		if (typeof value !== 'string' || !Ipv6Addr.regex.test(value)) {
			return Err(new TypeError(`${JSON.stringify(value)} is invalid ipv6 value`));
		}
		return Ipv6Addr.#parseComponents(value).andThen(({leftSegs, rightSegs, embeddedIpv4}) => {
			const segments: number[] = Array(8).fill(0);
			// Place left segments
			for (let i = 0; i < leftSegs.length; i++) {
				segments[i] = leftSegs[i];
			}
			// Place right segments
			const rightStartIdx = 8 - rightSegs.length - embeddedIpv4.length;
			for (let i = 0; i < rightSegs.length; i++) {
				segments[rightStartIdx + i] = rightSegs[i];
			}
			// Place embedded IPv4
			for (let i = 0; i < embeddedIpv4.length; i++) {
				segments[rightStartIdx + rightSegs.length + i] = embeddedIpv4[i];
			}
			try {
				return Ok(new Ipv6Addr(segments as [number, number, number, number, number, number, number, number]));
			} catch (err) {
				return Err(err as RangeError);
			}
		});
	}

	/**
	 * Creates an IPv6 address from a 16-byte buffer.
	 * @returns A successful result with an IPv6 address, or an error when the buffer cannot be read.
	 * @since v0.0.1
	 */
	public static fromBuffer(buffer: ArrayBuffer, littleEndian?: boolean): IResult<Ipv6Addr> {
		try {
			const view = new DataView(buffer);
			if (littleEndian) {
				const low = view.getBigUint64(0, true);
				const high = view.getBigUint64(8, true);
				return Ok(new Ipv6Addr((high << 64n) | low));
			} else {
				const high = view.getBigUint64(0, false);
				const low = view.getBigUint64(8, false);
				return Ok(new Ipv6Addr((high << 64n) | low));
			}
		} catch (err) {
			return Err(err as Error);
		}
	}

	static #parseInt(value: string, radix: number): IResult<number, TypeError> {
		const output = parseInt(value, radix);
		if (Number.isNaN(output)) {
			return Err(new TypeError(`${value} is not a valid number`));
		}
		return Ok(output);
	}

	static #parseComponents(value: string): IResult<{leftSegs: number[]; rightSegs: number[]; embeddedIpv4: number[]}, TypeError> {
		const components = value.split('::');
		const leftParts = components[0].split(':').filter((x) => x !== '');
		const rightParts = components.length > 1 ? components[1].split(':').filter((x) => x !== '') : [];
		let embeddedIpv4: number[] = [];
		const lastPart = rightParts[rightParts.length - 1] ?? leftParts[leftParts.length - 1];
		// check if the last part is an embedded IPv4 address (e.g., ::ffff:192.168.0.1)
		if (lastPart?.includes('.')) {
			const embeddedIpv4Result = Ipv6Addr.#parseEmbeddedIpv4(lastPart);
			if (embeddedIpv4Result.isErr) {
				return embeddedIpv4Result;
			}
			embeddedIpv4 = embeddedIpv4Result.ok();
			if (rightParts.length > 0) {
				rightParts.pop();
			} else {
				leftParts.pop();
			}
		}
		return Result.tupleFlow(
			Result.asArray(leftParts.map((p) => Ipv6Addr.#parseInt(p, 16))),
			() => Result.asArray(rightParts.map((p) => Ipv6Addr.#parseInt(p, 16))),
			(leftSegs, rightSegs) => Ok({leftSegs, rightSegs, embeddedIpv4}),
		);
	}

	static #parseEmbeddedIpv4(value: string): IResult<number[], TypeError> {
		return Result.asArray(value.split('.').map((octet) => Ipv6Addr.#parseInt(octet, 10))).andThen((octets) =>
			Ok([(octets[0] << 8) | octets[1], (octets[2] << 8) | octets[3]]),
		);
	}

	/**
	 * The number of bits in an IPv6 address.
	 * @since v0.0.1
	 */
	public static readonly BITS = 128;

	/**
	 * The loopback address (`::1`).
	 * @since v0.0.1
	 */
	public static readonly LOCALHOST: Ipv6Addr = new Ipv6Addr(0x00000000000000000000000000000001n);

	/**
	 * The unspecified address (`::`).
	 * @since v0.0.1
	 */
	public static readonly UNSPECIFIED: Ipv6Addr = new Ipv6Addr(0x00000000000000000000000000000000n);

	/**
	 * The address family identifier for IPv6 addresses.
	 * @since v0.0.1
	 */
	public readonly family = 'ipv6';

	#integerAddress: bigint;

	/**
	 * Creates a new IPv6 address instance.
	 * @param value - A bigint representing the IPv6 address or an array of 8 numbers representing the segments of the address.
	 * @throws {RangeError} If the segments array does not have exactly 8 elements or if any segment is out of range.
	 * @throws {TypeError} If the input is neither a bigint nor an array of 8 numbers.
	 */
	public constructor(value: bigint);
	public constructor(segments: [number, number, number, number, number, number, number, number]);
	public constructor(valueOrSegments: [number, number, number, number, number, number, number, number] | bigint) {
		if (Array.isArray(valueOrSegments) && valueOrSegments.every((seg) => typeof seg === 'number')) {
			this.#integerAddress = this.#toInteger(valueOrSegments);
		} else if (typeof valueOrSegments === 'bigint') {
			this.#integerAddress = valueOrSegments;
		} else {
			throw new TypeError('Invalid constructor argument. Must be a bigint or an array of 8 numbers.');
		}
	}

	/**
	 * Checks whether this address is in the benchmarking range.
	 * @see https://tools.ietf.org/html/rfc5180 and https://www.rfc-editor.org/errata_search.php?eid=1752
	 * @returns `true` when the address is in `2001:2::/48`, otherwise `false`.
	 * @since v0.0.1
	 */
	public isBenchmarking(): boolean {
		return this.#match(0x20010002000000000000000000000000n, 48);
	}

	/**
	 * Checks whether this address is in a documentation-only range.
	 * @see https://tools.ietf.org/html/rfc3849 and https://tools.ietf.org/html/rfc9637
	 * @returns `true` for `2001:db8::/32` or `3fff::/20`, otherwise `false`.
	 * @since v0.0.1
	 */
	public isDocumentation(): boolean {
		return this.#match(0x20010db8000000000000000000000000n, 32) || this.#match(0x3fff0000000000000000000000000000n, 20);
	}

	/**
	 * Checks whether this address is the loopback address.
	 * @see https://tools.ietf.org/html/rfc4291#section-2.5.3
	 * @returns `true` when the address is `::1`, otherwise `false`.
	 * @since v0.0.1
	 */
	public isLoopback(): boolean {
		return this.#integerAddress === 1n;
	}

	/**
	 * Checks whether this address is the unspecified address.
	 * @see https://tools.ietf.org/html/rfc4291
	 * @returns `true` when the address is `::`, otherwise `false`.
	 * @since v0.0.1
	 */
	public isUnspecified(): boolean {
		return this.#integerAddress === 0n;
	}

	/**
	 * Checks whether this address is a multicast address.
	 * @see https://tools.ietf.org/html/rfc4291
	 * @returns `true` when the address is in `ff00::/8`, otherwise `false`.
	 * @since v0.0.1
	 */
	public isMulticast(): boolean {
		return this.#integerAddress >> 120n === 0xffn;
	}

	/**
	 * Checks whether this address is a multicast interface-local address.
	 * @see https://datatracker.ietf.org/doc/html/rfc4291#section-2.7
	 * @returns `true` when the address is in `ff01::/16`, otherwise `false`.
	 * @since v0.0.2
	 */
	public isMulticastInterfaceLocal(): boolean {
		return this.#match(0xff010000000000000000000000000000n, 16);
	}

	/**
	 * Checks whether this address is a multicast link-local address.
	 * @see https://datatracker.ietf.org/doc/html/rfc4291#section-2.7
	 * @returns `true` when the address is in `ff02::/16`, otherwise `false`.
	 * @since v0.0.2
	 */
	public isMulticastLinkLocal(): boolean {
		return this.#match(0xff020000000000000000000000000000n, 16);
	}

	/**
	 * Checks whether this address is a multicast realm-local address.
	 * @see https://datatracker.ietf.org/doc/html/rfc4291#section-2.7
	 * @returns `true` when the address is in `ff03::/16`, otherwise `false`.
	 * @since v0.0.2
	 */
	public isMulticastRealmLocal(): boolean {
		return this.#match(0xff030000000000000000000000000000n, 16);
	}

	/**
	 * Checks whether this address is a multicast admin-local address.
	 * @see https://datatracker.ietf.org/doc/html/rfc4291#section-2.7
	 * @returns `true` when the address is in `ff04::/16`, otherwise `false`.
	 * @since v0.0.2
	 */
	public isMulticastAdminLocal(): boolean {
		return this.#match(0xff040000000000000000000000000000n, 16);
	}

	/**
	 * Checks whether this address is a multicast site-local address.
	 * @see https://datatracker.ietf.org/doc/html/rfc4291#section-2.7
	 * @returns `true` when the address is in `ff05::/16`, otherwise `false`.
	 * @since v0.0.2
	 */
	public isMulticastSiteLocal(): boolean {
		return this.#match(0xff050000000000000000000000000000n, 16);
	}

	/**
	 * Checks whether this address is a multicast organization-local address.
	 * @see https://datatracker.ietf.org/doc/html/rfc4291#section-2.7
	 * @returns `true` when the address is in `ff08::/16`, otherwise `false`.
	 * @since v0.0.2
	 */
	public isMulticastOrganizationLocal(): boolean {
		return this.#match(0xff080000000000000000000000000000n, 16);
	}

	/**
	 * Checks whether this address is a multicast global address.
	 * @see https://datatracker.ietf.org/doc/html/rfc4291#section-2.7
	 * @returns `true` when the address is in `ff0e::/16`, otherwise `false`.
	 * @since v0.0.2
	 */
	public isMulticastGlobal(): boolean {
		return this.#match(0xff0e0000000000000000000000000000n, 16);
	}

	/**
	 * Checks whether this address is an IPv4-mapped IPv6 address.
	 * @returns `true` when the address is in `::ffff:0:0/96`, otherwise `false`.
	 * @since v0.0.1
	 */
	public isIpv4Mapped(): boolean {
		return this.#match(0x00000000000000000000ffff00000000n, 96);
	}

	/**
	 * Checks whether this address is a unicast address.
	 * @see https://tools.ietf.org/html/rfc4291
	 * @returns `true` when the address is not multicast, otherwise `false`.
	 * @since v0.0.1
	 */
	public isUnicast(): boolean {
		return !this.isMulticast();
	}

	/**
	 * Checks whether this address is a link-local unicast address.
	 * @see https://tools.ietf.org/html/rfc4291
	 * @returns `true` when the address is in `fe80::/10`, otherwise `false`.
	 * @since v0.0.1
	 */
	public isUnicastLinkLocal(): boolean {
		return this.#match(0xfe800000000000000000000000000000n, 10);
	}

	/**
	 * Checks whether this address is a global unicast address.
	 * @see https://tools.ietf.org/html/rfc4291#section-2.5.7
	 * @returns `true` when the address is unicast and not loopback, link-local, private, unspecified, or documentation.
	 * @since v0.0.1
	 */
	public isUnicastGlobal(): boolean {
		return this.isUnicast() && !this.isLoopback() && !this.isUnicastLinkLocal() && !this.isUniqueLocal() && !this.isUnspecified() && !this.isDocumentation();
	}

	/**
	 * Checks whether this address appears globally reachable.
	 * @see https://www.iana.org/assignments/iana-ipv6-special-registry/iana-ipv6-special-registry.xhtml
	 * @returns `true` when the address is not in known non-global special ranges.
	 * @since v0.0.1
	 */
	public isGlobal(): boolean {
		return (
			!this.isUnspecified() &&
			!this.isLoopback() &&
			!this.isIpv4Mapped() &&
			!this.isBenchmarking() &&
			!this.isDocumentation() &&
			!this.isUniqueLocal() &&
			!this.isUnicastLinkLocal() &&
			!this.isMulticast()
		);
	}

	/**
	 * Checks whether this address is in the unique-local range.
	 * @see https://tools.ietf.org/html/rfc4193
	 * @returns `true` when the address is in `fc00::/7`, otherwise `false`.
	 * @since v0.0.1
	 */
	public isUniqueLocal(): boolean {
		return this.#match(0xfc000000000000000000000000000000n, 7);
	}

	/**
	 * Converts this address to IPv4 when compatible or mapped.
	 * @returns An IPv4 address for `::a.b.c.d` or `::ffff:a.b.c.d`; otherwise `None`.
	 * @since v0.0.1
	 */
	public toIpv4(): IOption<Ipv4Addr> {
		if (this.isIpv4Mapped() || this.#match(0n, 96)) {
			const segments = this.#fromInteger(this.#integerAddress);
			return Some(new Ipv4Addr(segments[6] >> 8, segments[6] & 0xff, segments[7] >> 8, segments[7] & 0xff));
		}
		return None();
	}

	/**
	 * Converts this address to IPv4 only when it is IPv4-mapped.
	 * @returns An IPv4 address for `::ffff:a.b.c.d`; otherwise `None`.
	 * @since v0.0.1
	 */
	public toIpv4Mapped(): IOption<Ipv4Addr> {
		if (this.isIpv4Mapped()) {
			const segments = this.#fromInteger(this.#integerAddress);
			return Some(new Ipv4Addr(segments[6] >> 8, segments[6] & 0xff, segments[7] >> 8, segments[7] & 0xff));
		}
		return None();
	}

	/**
	 * Formats this address as a compressed IPv6 string.
	 * @returns The shortest standard IPv6 text form.
	 * @since v0.0.1
	 */
	public toString(): string {
		const segments = this.#fromInteger(this.#integerAddress);
		let maxZeroStart = -1;
		let maxZeroLen = 0;
		let currentZeroStart = -1;
		let currentZeroLen = 0;

		for (let i = 0; i < segments.length; i++) {
			if (segments[i] === 0) {
				if (currentZeroStart === -1) {
					currentZeroStart = i;
					currentZeroLen = 1;
				} else {
					currentZeroLen++;
				}
				if (currentZeroLen > maxZeroLen) {
					maxZeroLen = currentZeroLen;
					maxZeroStart = currentZeroStart;
				}
			} else {
				currentZeroStart = -1;
				currentZeroLen = 0;
			}
		}

		if (maxZeroLen < 2) {
			return segments.map((s) => s.toString(16)).join(':');
		}

		const before = segments.slice(0, maxZeroStart).map((s) => s.toString(16));
		const after = segments.slice(maxZeroStart + maxZeroLen).map((s) => s.toString(16));

		return `${before.join(':')}::${after.join(':')}`;
	}

	/**
	 * Encodes this address to a 16-byte buffer.
	 * @param littleEndian Whether to use little-endian byte order. Defaults to `false`.
	 * @returns An `ArrayBuffer` containing the IPv6 integer value.
	 * @since v0.0.1
	 */
	public toBuffer(littleEndian?: boolean): ArrayBuffer {
		const buffer = new ArrayBuffer(16);
		const view = new DataView(buffer);
		if (littleEndian) {
			view.setBigUint64(0, this.#integerAddress & 0xffffffffffffffffn, true);
			view.setBigUint64(8, this.#integerAddress >> 64n, true);
		} else {
			view.setBigUint64(0, this.#integerAddress >> 64n, false);
			view.setBigUint64(8, this.#integerAddress & 0xffffffffffffffffn, false);
		}
		return buffer;
	}

	/**
	 * Compares this IPv6 address with another for equality.
	 * @param other instance of another IPv6 address to compare with.
	 * @returns `true` if both addresses are equal, otherwise `false`.
	 * @since v0.1.0
	 */
	public equals(other: Ipv6Addr | Ipv4Addr | object): boolean {
		return 'family' in other && this.family === other.family && this.#integerAddress === other.#integerAddress;
	}

	/**
	 * Converts an array of IPv6 segments to a bigint representation.
	 * @param segments An array of 8 numbers representing the IPv6 segments.
	 * @returns A bigint representing the IPv6 address.
	 * @throws {RangeError} If the segments array does not have exactly 8 elements or if any segment is out of range.
	 */
	#toInteger(segments: [number, number, number, number, number, number, number, number]): bigint {
		if (segments.length !== 8) {
			throw new RangeError('IPv6 address must have exactly 8 segments');
		}
		let result = 0n;
		for (const segment of segments) {
			if (segment < 0 || segment > 0xffff) {
				throw new RangeError('IPv6 segment must be between 0 and 65535');
			}
			result = (result << 16n) | BigInt(segment);
		}
		return result;
	}

	#fromInteger(integer: bigint): [number, number, number, number, number, number, number, number] {
		return [
			Number((integer >> 112n) & 0xffffn),
			Number((integer >> 96n) & 0xffffn),
			Number((integer >> 80n) & 0xffffn),
			Number((integer >> 64n) & 0xffffn),
			Number((integer >> 48n) & 0xffffn),
			Number((integer >> 32n) & 0xffffn),
			Number((integer >> 16n) & 0xffffn),
			Number(integer & 0xffffn),
		];
	}

	#match(network: bigint, prefix: number): boolean {
		if (prefix < 0 || prefix > 128) {
			throw new Error('Invalid prefix length');
		}
		if (prefix === 0) {
			return true;
		}
		const ALL_ONES = (1n << 128n) - 1n;
		const mask = (ALL_ONES << BigInt(128 - prefix)) & ALL_ONES;
		return (this.#integerAddress & mask) === (network & mask);
	}
}
