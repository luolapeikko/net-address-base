import type {CoreResult} from 'core-result';
import {uw} from './common';
import {Ipv4Addr} from './Ipv4Addr';

/**
 * Represents an IPv4 network.
 * @example
 * const addrRes = Ipv4Addr.from('192.168.0.1');
 * const addr = Ipv4Addr.fromOrThrow('192.168.0.1');
 * const network = Ipv4Net.fromAddr(addr, 24);
 * @since v0.1.2
 */
export class Ipv4Net {
	#lowAddress: number;
	#highAddress: number;
	#first: Ipv4Addr;
	#firstUsable: number;
	#lastUsable: number;
	/**
	 * Size of the network (subnet mask length).
	 * @since v0.1.2
	 */
	public readonly size: number;
	/**
	 * Address family of the network.
	 * @since v0.1.2
	 */
	public readonly family = 'ipv4' as const;
	private constructor(address: Ipv4Addr, size: number) {
		const currentValue = address.value;
		// Use >>> 0 to ensure unsigned 32-bit arithmetic
		const mask = ((1 << (32 - size)) - 1) >>> 0;
		this.size = size;
		this.#lowAddress = (currentValue & (~mask >>> 0)) >>> 0;
		this.#highAddress = (currentValue | mask) >>> 0;
		this.#firstUsable = size === 32 ? this.#lowAddress : this.#lowAddress + 1;
		this.#lastUsable = size === 32 ? this.#highAddress : this.#highAddress - 1;
		this.#first = new Ipv4Addr(this.#lowAddress);
	}

	/**
	 * Creates an IPv4 network from address and a subnet mask length.
	 * @param address The starting {@link Ipv4Addr} of the network.
	 * @param size The size of the network (subnet mask length).
	 * @returns A {@link CoreResult} containing the parsed {@link Ipv4Net} instance or a {@link RangeError} if the network size is invalid.
	 * @example
	 * const networkRes: CoreResult<Ipv4Net, RangeError> = Ipv4Net.fromAddr(addr, 24);
	 * @since v0.2.0
	 */
	public static fromAddr(address: Ipv4Addr, size: number): CoreResult<Ipv4Net, RangeError> {
		if (!Ipv4Net.#validSize(size)) {
			return {success: false, error: new RangeError('Invalid IPv4 network size: must be between 0 and 32')};
		}
		return {success: true, value: new Ipv4Net(address, size)};
	}

	/**
	 * Creates an IPv4 network from address and a subnet mask length, throwing an error if creation fails.
	 * @param address The starting {@link Ipv4Addr} of the network.
	 * @param size The size of the network (subnet mask length).
	 * @returns The parsed {@link Ipv4Net} instance.
	 * @throws {RangeError} If the network size is invalid.
	 * @example
	 * const network: Ipv4Net = Ipv4Net.fromAddrOrThrow(addr, 24);
	 * @since v0.2.0
	 */
	public static fromAddrOrThrow(address: Ipv4Addr, size: number): Ipv4Net {
		return uw(Ipv4Net.fromAddr(address, size));
	}

	/**
	 * Creates an IPv4 network from its string representation.
	 * @param value The string representation of the IPv4 network, e.g., `192.168.0.1/24`.
	 * @returns A {@link CoreResult} containing the parsed {@link Ipv4Net} instance or a {@link TypeError} if parsing fails.
	 * @example
	 * const networkRes: CoreResult<Ipv4Net, TypeError> = Ipv4Net.from('192.168.0.1/24');
	 * @since v0.2.0
	 */
	public static from(value: string): CoreResult<Ipv4Net, TypeError> {
		const [addrStr, sizeStr] = value.split('/');
		const addrRes = Ipv4Addr.from(addrStr);
		if (!addrRes.success) {
			return addrRes;
		}
		if (!/^-?\d+$/.test(sizeStr)) {
			return {success: false, error: new TypeError('Invalid IPv4 network size: must be numeric')};
		}
		const size = parseInt(sizeStr, 10);
		if (!Ipv4Net.#validSize(size)) {
			return {success: false, error: new TypeError('Invalid IPv4 network size: must be between 0 and 32')};
		}
		return {success: true, value: new Ipv4Net(addrRes.value, size)};
	}

	/**
	 * Creates an IPv4 network from its string representation, throwing an error if parsing fails.
	 * @param value The string representation of the IPv4 network, e.g., `192.168.0.1/24`.
	 * @returns The parsed {@link Ipv4Net} instance.
	 * @throws {TypeError} If the string representation is invalid.
	 * @example
	 * const network: Ipv4Net = Ipv4Net.fromOrThrow('192.168.0.1/24');
	 * @since v0.2.0
	 */
	public static fromOrThrow(value: string): Ipv4Net {
		return uw(Ipv4Net.from(value));
	}

	static #validSize(size: number): boolean {
		return size >= 0 && size <= 32;
	}

	/**
	 * Checks if the given IPv4 address is contained within the network.
	 * @param addr The {@link Ipv4Addr} to check.
	 * @returns `true` if the given address is contained within the network, otherwise `false`.
	 * @since v0.2.0
	 */
	public contains(addr: Ipv4Addr): boolean {
		const value = addr.value;
		return value >= this.#lowAddress && value <= this.#highAddress;
	}

	/**
	 * Gets the broadcast address of the network.
	 * @returns The broadcast address as an {@link Ipv4Addr} instance.
	 * @since v0.2.0
	 */
	public broadcast(): Ipv4Addr {
		return this.last();
	}
	/**
	 * Gets the network mask of the IPv4 network.
	 * @returns The network mask as an {@link Ipv4Addr} instance.
	 * @since v0.2.0
	 */
	public netmask(): Ipv4Addr {
		const mask = ((1 << this.size) - 1) << (32 - this.size);
		return new Ipv4Addr(mask >>> 0);
	}
	/**
	 * Gets the string representation of the IPv4 network.
	 * @returns The IPv4 network as a string, e.g., `192.168.0.1/24`.
	 * @since v0.2.0
	 */
	public toString(): string {
		return `${this.#first.toString()}/${this.size}`;
	}
	/**
	 * Gets the first address within the network.
	 * @returns The first address as an {@link Ipv4Addr} instance.
	 * @since v0.2.0
	 */
	public first(): Ipv4Addr {
		return this.#first;
	}
	/**
	 * Gets the last address within the network.
	 * @returns The last address as an {@link Ipv4Addr} instance.
	 * @since v0.2.0
	 */
	public last(): Ipv4Addr {
		return new Ipv4Addr(this.#highAddress);
	}
	/**
	 * Gets the first usable address within the network.
	 * @returns The first usable address as an {@link Ipv4Addr} instance.
	 * @since v0.2.0
	 */
	public firstUsable(): Ipv4Addr {
		return new Ipv4Addr(this.#firstUsable);
	}
	/**
	 * Gets the last usable address within the network.
	 * @returns The last usable address as an {@link Ipv4Addr} instance.
	 * @since v0.2.0
	 */
	public lastUsable(): Ipv4Addr {
		return new Ipv4Addr(this.#lastUsable);
	}

	/**
	 * Checks if the current network is equal to another network.
	 * @param other The other network to compare with.
	 * @returns `true` if the networks are equal, otherwise `false`.
	 * @example
	 * const isEqual = Ipv4Net.fromOrThrow('192.168.0.0/24').equals(Ipv4Net.fromOrThrow('192.168.0.0/24'));
	 * @since v0.2.0
	 */
	public equals(other?: unknown): boolean {
		if (!other) {
			return false;
		}
		return other instanceof Ipv4Net && this.#first.value === other.#first.value && this.size === other.size;
	}
	/**
	 * Assigns an address to the current network, effectively combining the network with the given address.
	 * @param value The other IPv4 address to combine with (e.g., `0.0.0.100`)
	 * @returns The combined IPv4 address as a {@link CoreResult} containing either the resulting {@link Ipv4Addr} or a {@link RangeError} if the address does not fit within the host portion of the network.
	 * @example
	 * const network = Ipv4Net.fromOrThrow('192.168.0.0/24');
	 * const result: CoreResult<Ipv4Addr, RangeError | TypeError> = network.assignAddress('0.0.0.100');
	 * const result: CoreResult<Ipv4Addr, RangeError | TypeError> = network.assignAddress(Ipv4Addr.fromOrThrow('0.0.0.100'))
	 * @since v0.2.0
	 */
	public assignAddress(value: Ipv4Addr | string): CoreResult<Ipv4Addr, RangeError | TypeError> {
		const res = typeof value === 'string' ? Ipv4Addr.from(value) : ({success: true, value} as const);
		if (!res.success) {
			return res;
		}
		const addr = res.value;
		const hostMask = this.size === 0 ? 0xffffffff : this.size === 32 ? 0 : ((1 << (32 - this.size)) - 1) >>> 0;
		if ((addr.value & ~hostMask) !== 0) {
			return {success: false, error: new RangeError(`Address ${value.toString()} exceeds network host capacity for /${this.size}`)};
		}
		return {success: true, value: new Ipv4Addr((this.#lowAddress | addr.value) >>> 0)};
	}

	/**
	 * Assigns an address to the current network, effectively combining the network with the given address.
	 * @param other The other IPv4 address to combine with (e.g., `0.0.0.100`)
	 * @returns The combined IPv4 address as an {@link Ipv4Addr} instance. (e.g., combining `192.168.0.0/24` with `0.0.0.100` would result in `192.168.0.100`)
	 * @throws {RangeError} If the given address does not fit within the host portion of the network.
	 * @example
	 * const network = Ipv4Net.fromOrThrow('192.168.0.0/24');
	 * const combined = network.assignAddressOrThrow('0.0.0.100'); // Ipv4Addr(192.168.0.100)
	 * const combined = network.assignAddressOrThrow(Ipv4Addr.fromOrThrow('0.0.0.100')); // Ipv4Addr(192.168.0.100)
	 * @since v0.2.0
	 */
	public assignAddressOrThrow(other: Ipv4Addr | string): Ipv4Addr {
		return uw(this.assignAddress(other));
	}

	/**
	 * Checks if the current network is a subnet of the given parent network.
	 * @param parent The parent network to check against.
	 * @returns `true` if the current network is a subnet of the parent network, `false` otherwise.
	 * @since v0.2.0
	 */
	public isSubnetOf(parent: Ipv4Net): boolean {
		return this.#lowAddress >= parent.first().value && this.#highAddress <= parent.last().value;
	}

	/**
	 * Checks if the current network contains the given child network.
	 * @param child The child network to check for containment.
	 * @returns `true` if the current network contains the child network, `false` otherwise.
	 * @since v0.2.0
	 */
	public containsNet(child: Ipv4Net): boolean {
		return this.#lowAddress <= child.first().value && this.#highAddress >= child.last().value;
	}

	/**
	 * Returns an iterable of all addresses within the network.
	 * @returns An {@link Ipv4Addr} {@link Iterable} of all addresses within the network.
	 * @since v0.2.0
	 */
	public *addresses(): Iterable<Ipv4Addr> {
		for (let addr = this.#lowAddress; addr <= this.#highAddress; addr++) {
			yield new Ipv4Addr(addr >>> 0);
		}
	}

	/**
	 * Returns an iterable of all usable host addresses within the network.
	 * @returns An {@link Ipv4Addr} {@link Iterable} of all usable host addresses within the network.
	 * @since v0.2.0
	 */
	public *hosts(): Iterable<Ipv4Addr> {
		for (let addr = this.#firstUsable; addr <= this.#lastUsable; addr++) {
			yield new Ipv4Addr(addr >>> 0);
		}
	}
}
