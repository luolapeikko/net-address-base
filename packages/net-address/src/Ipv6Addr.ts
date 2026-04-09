import {Err, type IOption, type IResult, None, Ok, Some} from '@luolapeikko/result-option';
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
	public static from(value: string): IResult<Ipv6Addr> {
		if (!Ipv6Addr.regex.test(value)) {
			return Err(new TypeError(`${value} is invalid ipv6 value`));
		}
		try {
			const {leftParts, rightParts, embeddedIpv4} = Ipv6Addr.#parseComponents(value);

			const leftSegs = leftParts.map((p) => parseInt(p, 16));
			const rightSegs = rightParts.map((p) => parseInt(p, 16));

			const missingLen = 8 - (leftSegs.length + rightSegs.length + embeddedIpv4.length);
			const segments = [...leftSegs, ...Array(missingLen).fill(0), ...rightSegs, ...embeddedIpv4];

			return Ok(new Ipv6Addr(segments as [number, number, number, number, number, number, number, number]));
		} catch (err) {
			return Err(err);
		}
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

	static #parseComponents(value: string) {
		const components = value.split('::');
		const leftParts = components[0].split(':').filter((x) => x !== '');
		const rightParts = components.length > 1 ? components[1].split(':').filter((x) => x !== '') : [];
		let embeddedIpv4: number[] = [];
		const lastPart = rightParts[rightParts.length - 1] ?? leftParts[leftParts.length - 1];
		if (lastPart?.includes('.')) {
			embeddedIpv4 = Ipv6Addr.#parseEmbeddedIpv4(lastPart);
			if (rightParts.length > 0) {
				rightParts.pop();
			} else {
				leftParts.pop();
			}
		}
		return {leftParts, rightParts, embeddedIpv4};
	}

	static #parseEmbeddedIpv4(value: string): number[] {
		const ipv4Octets = value.split('.').map(Number);
		return [(ipv4Octets[0] << 8) | ipv4Octets[1], (ipv4Octets[2] << 8) | ipv4Octets[3]];
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
	public constructor(value: bigint);
	public constructor(segments: [number, number, number, number, number, number, number, number]);
	public constructor(valueOrSegments: [number, number, number, number, number, number, number, number] | bigint) {
		if (Array.isArray(valueOrSegments)) {
			this.#integerAddress = this.#toInteger(valueOrSegments);
		} else {
			this.#integerAddress = valueOrSegments;
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

	#toInteger(segments: [number, number, number, number, number, number, number, number]): bigint {
		let result = 0n;
		for (const segment of segments) {
			if (segment < 0 || segment > 0xffff) {
				throw new Error('IPv6 segment must be between 0 and 65535');
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
