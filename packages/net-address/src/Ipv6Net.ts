import {Ipv6Addr} from './Ipv6Addr';

/**
 * Represents an IPv6 network.
 * @example
 * const addr = Ipv6Addr.from('2001:db8::1').unwrap();
 * const network = Ipv6Net.fromAddr(addr, 64);
 * @since v0.1.2
 */
export class Ipv6Net {
	#lowAddress: bigint;
	#highAddress: bigint;
	public readonly address: Ipv6Addr;
	public readonly size: number;
	private constructor(address: Ipv6Addr, size: number) {
		this.address = address;
		const currentValue = address.value;
		const mask = (BigInt(1) << BigInt(128 - size)) - BigInt(1);
		this.#lowAddress = currentValue & ~mask;
		this.#highAddress = currentValue | mask;
		this.size = size;
	}

	public static fromAddr(address: Ipv6Addr, size: number): Ipv6Net {
		return new Ipv6Net(address, size);
	}

	public static from(value: string): Ipv6Net {
		const [addrStr, sizeStr] = value.split('/');
		const addr = Ipv6Addr.from(addrStr).unwrap();
		if (!/^-?\d+$/.test(sizeStr)) {
			throw new Error('Invalid IPv6 network size: must be numeric');
		}
		const size = parseInt(sizeStr, 10);
		if (size < 0 || size > 128) {
			throw new Error('Invalid IPv6 network size: must be between 0 and 128');
		}
		return new Ipv6Net(addr, size);
	}

	public isInRange(address: Ipv6Addr): boolean {
		const value = address.value;
		return value >= this.#lowAddress && value <= this.#highAddress;
	}
}
