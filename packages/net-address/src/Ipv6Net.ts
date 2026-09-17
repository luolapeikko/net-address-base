import type {CoreResult} from 'core-result';
import {uw} from './common';
import {Ipv6Addr} from './Ipv6Addr';

/**
 * Represents an IPv6 network.
 * @example
 * const addrRes = Ipv6Addr.from('2001:db8::1');
 * const addr = Ipv6Addr.fromOrThrow('2001:db8::1');
 * const network = Ipv6Net.fromAddr(addr, 64);
 * @since v0.1.2
 */
export class Ipv6Net {
	#lowAddress: bigint;
	#highAddress: bigint;
	#firstUsable: bigint;
	#lastUsable: bigint;
	#first: Ipv6Addr;
	/**
	 * Size of the network (prefix length).
	 * @since v0.1.2
	 */
	public readonly size: number;
	/**
	 * Address family of the network.
	 * @since v0.1.2
	 */
	public readonly family = 'ipv6' as const;
	private constructor(address: Ipv6Addr, size: number) {
		const currentValue = address.value;
		const mask = (BigInt(1) << BigInt(128 - size)) - BigInt(1);
		this.size = size;
		this.#lowAddress = currentValue & ~mask;
		this.#highAddress = currentValue | mask;
		this.#firstUsable = size === 128 ? this.#lowAddress : this.#lowAddress + BigInt(1);
		this.#lastUsable = size === 128 ? this.#highAddress : this.#highAddress - BigInt(1);
		this.#first = new Ipv6Addr(this.#lowAddress);
	}

	/**
	 * Creates an instance of {@link Ipv6Net} from {@link Ipv6Addr} and network size.
	 * @param address The interface address as an {@link Ipv6Addr} instance.
	 * @param size The network size (prefix length) as a number.
	 * @returns A {@link CoreResult} containing the instance of {@link Ipv6Net} if successful, or a {@link RangeError} if the network size is invalid.
	 * @since v0.1.2
	 */
	public static fromAddr(address: Ipv6Addr, size: number): CoreResult<Ipv6Net, RangeError> {
		if (size < 0 || size > 128) {
			return {success: false, error: new RangeError('Invalid IPv6 network size: must be between 0 and 128')};
		}
		return {success: true, value: new Ipv6Net(address, size)};
	}

	/**
	 * Creates an instance of {@link Ipv6Net} from {@link Ipv6Addr} and network size, throwing an error if the size is invalid.
	 * @param address The interface address as an {@link Ipv6Addr} instance.
	 * @param size The network size (prefix length) as a number.
	 * @returns An instance of {@link Ipv6Net}.
	 * @throws {RangeError} If the network size is not between 0 and 128.
	 * @since v0.2.0
	 */
	public static fromAddrOrThrow(address: Ipv6Addr, size: number): Ipv6Net {
		return uw(Ipv6Net.fromAddr(address, size));
	}

	/**
	 * Creates an instance of {@link Ipv6Net} from a string representation.
	 * @param value The string representation of the IPv6 network, e.g., `2001:db8::/64` or full interface address with size.
	 * @returns A {@link CoreResult} containing the instance of {@link Ipv6Net} if successful, or a {@link TypeError} if the input is invalid.
	 * @since v0.1.2
	 */
	public static from(value: string): CoreResult<Ipv6Net, TypeError> {
		const [addrStr, sizeStr] = value.split('/');
		const addrRes = Ipv6Addr.from(addrStr);
		if (!addrRes.success) {
			return addrRes;
		}
		const addr = addrRes.value;
		if (!/^-?\d+$/.test(sizeStr)) {
			return {success: false, error: new TypeError('Invalid IPv6 network size: must be numeric')};
		}
		const size = parseInt(sizeStr, 10);
		if (size < 0 || size > 128) {
			return {success: false, error: new RangeError('Invalid IPv6 network size: must be between 0 and 128')};
		}
		return {success: true, value: new Ipv6Net(addr, size)};
	}

	/**
	 * Creates an instance of {@link Ipv6Net} from a string representation.
	 * @param value The string representation of the IPv6 network, e.g., `2001:db8::/64` or full interface address with size.
	 * @returns An instance of {@link Ipv6Net}.
	 * @throws {TypeError} If the input string is not a valid IPv6 network representation.
	 * @since v0.2.0
	 */
	public static fromOrThrow(value: string): Ipv6Net {
		return uw(Ipv6Net.from(value));
	}

	/**
	 * Checks if the given IPv6 address is contained within the network.
	 * @param addr The {@link Ipv6Addr} to check.
	 * @returns `true` if the given address is contained within the network, otherwise `false`.
	 * @since v0.2.0
	 */
	public contains(addr: Ipv6Addr): boolean {
		const value = addr.value;
		return value >= this.#lowAddress && value <= this.#highAddress;
	}
	/**
	 * Gets the network mask of the IPv6 network.
	 * @returns The network mask as an {@link Ipv6Addr} instance.
	 * @since v0.2.0
	 */
	public netmask(): Ipv6Addr {
		const mask = (BigInt(1) << BigInt(this.size)) - BigInt(1);
		const shiftedMask = mask << BigInt(128 - this.size);
		return Ipv6Addr.fromRaw(shiftedMask);
	}
	/**
	 * Gets the string representation of the IPv6 network.
	 * @returns The IPv6 network as a string, e.g., `2001:db8::1/64`.
	 * @since v0.2.0
	 */
	public toString(): string {
		return `${this.#first.toString()}/${this.size}`;
	}
	/**
	 * Returns the expanded string representation of the IPv6 network.
	 * @returns The IPv6 network in expanded notation, e.g., `2001:0db8:0000:0000:0000:0000:0000:0001/64`.
	 * @since v0.2.0
	 */
	public toExpandedString(): string {
		return `${this.#first.toExpandedString()}/${this.size}`;
	}
	/**
	 * Gets the first address within the network.
	 * @returns The first address as an {@link Ipv6Addr} instance.
	 * @since v0.2.0
	 */
	public first(): Ipv6Addr {
		return this.#first;
	}
	/**
	 * Gets the last address within the network.
	 * @returns The last address as an {@link Ipv6Addr} instance.
	 * @since v0.2.0
	 */
	public last(): Ipv6Addr {
		return Ipv6Addr.fromRaw(this.#highAddress);
	}
	/**
	 * Gets the first usable address within the network.
	 * @returns The first usable address as an {@link Ipv6Addr} instance.
	 * @since v0.2.0
	 */
	public firstUsable(): Ipv6Addr {
		return Ipv6Addr.fromRaw(this.#firstUsable);
	}
	/**
	 * Gets the last usable address within the network.
	 * @returns The last usable address as an {@link Ipv6Addr} instance.
	 * @since v0.2.0
	 */
	public lastUsable(): Ipv6Addr {
		return Ipv6Addr.fromRaw(this.#lastUsable);
	}
	/**
	 * Checks if the current network is equal to another network.
	 * @param other The other network to compare with.
	 * @returns `true` if the networks are equal, otherwise `false`.
	 * @since v0.2.0
	 */
	public equals(other?: unknown): boolean {
		if (!other) {
			return false;
		}
		return other instanceof Ipv6Net && this.#first.value === other.#first.value && this.size === other.size;
	}

	/**
	 * Assigns an address to the current network, effectively combining the network with the given address.
	 * @param value The other IPv6 address to combine with (e.g., `::100`)
	 * @returns The combined IPv6 address as a {@link CoreResult} containing either the resulting {@link Ipv6Addr} or a {@link RangeError} if the address does not fit within the host portion of the network.
	 * @since v0.2.0
	 */
	public assignAddress(value: Ipv6Addr | string): CoreResult<Ipv6Addr, RangeError> {
		const res = typeof value === 'string' ? Ipv6Addr.from(value) : ({success: true, value} as const);
		if (!res.success) {
			return res;
		}
		const addr = res.value;
		const hostMask = this.size === 0 ? (1n << 128n) - 1n : this.size === 128 ? 0n : (1n << BigInt(128 - this.size)) - 1n;
		const netmask = ~hostMask & ((1n << 128n) - 1n);
		if ((addr.value & netmask) !== 0n) {
			return {success: false, error: new RangeError(`Address ${addr.toString()} exceeds network host capacity for /${this.size}`)};
		}
		return {success: true, value: new Ipv6Addr(this.#lowAddress | addr.value)};
	}

	/**
	 * Assigns an address to the current network, effectively combining the network with the given address.
	 * @param other The other IPv6 address to combine with (e.g., `::100`)
	 * @returns The combined IPv6 address as an {@link Ipv6Addr} instance. (e.g., combining `2001:db8::/64` with `::100` would result in `2001:db8::100`)
	 * @throws {RangeError} If the given address does not fit within the host portion of the network.
	 * @since v0.2.0
	 */
	public assignAddressOrThrow(other: Ipv6Addr | string): Ipv6Addr {
		return uw(this.assignAddress(other));
	}

	/**
	 * Checks if the current network is a subnet of the given parent network.
	 * @param parent The parent network to check against.
	 * @returns `true` if the current network is a subnet of the parent network, `false` otherwise.
	 * @since v0.2.0
	 */
	public isSubnetOf(parent: Ipv6Net): boolean {
		return this.#lowAddress >= parent.first().value && this.#highAddress <= parent.last().value;
	}
	/**
	 * Checks if the current network contains the given child network.
	 * @param child The child network to check for containment.
	 * @returns `true` if the current network contains the child network, `false` otherwise.
	 * @since v0.2.0
	 */
	public containsNet(child: Ipv6Net): boolean {
		return this.#lowAddress <= child.first().value && this.#highAddress >= child.last().value;
	}
	/**
	 * Gets an iterable of all addresses within the network.
	 * @returns An {@link Ipv6Addr} {@link Iterable} of all addresses within the network.
	 * @since v0.2.0
	 */
	public *addresses(): Iterable<Ipv6Addr> {
		for (let addr = this.#lowAddress; addr <= this.#highAddress; addr++) {
			yield Ipv6Addr.fromRaw(addr);
		}
	}
	/**
	 * Gets an iterable of all usable host addresses within the network.
	 * @returns An {@link Ipv6Addr} {@link Iterable} of all usable host addresses within the network.
	 * @since v0.2.0
	 */
	public *hosts(): Iterable<Ipv6Addr> {
		for (let addr = this.#firstUsable; addr <= this.#lastUsable; addr++) {
			yield Ipv6Addr.fromRaw(addr);
		}
	}
}
