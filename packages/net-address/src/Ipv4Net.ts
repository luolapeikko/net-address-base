import {Ipv4Addr} from './Ipv4Addr';

/**
 * Represents an IPv4 network.
 * @example
 * const addr = Ipv4Addr.from('192.168.0.1').unwrap();
 * const network = Ipv4Net.fromAddr(addr, 24);
 * @since v0.1.2
 */
export class Ipv4Net {
	#lowAddress: number;
	#highAddress: number;
	public readonly address: Ipv4Addr;
	public readonly size: number;
	private constructor(address: Ipv4Addr, size: number) {
		this.address = address;
		const currentValue = address.value;
		// Use >>> 0 to ensure unsigned 32-bit arithmetic
		const mask = ((1 << (32 - size)) - 1) >>> 0;
		this.#lowAddress = (currentValue & (~mask >>> 0)) >>> 0;
		this.#highAddress = (currentValue | mask) >>> 0;
		this.size = size;
	}

	public static fromAddr(address: Ipv4Addr, size: number): Ipv4Net {
		return new Ipv4Net(address, size);
	}

	public static from(value: string): Ipv4Net {
		const [addrStr, sizeStr] = value.split('/');
		const addr = Ipv4Addr.from(addrStr).unwrap();
		if (!/^-?\d+$/.test(sizeStr)) {
			throw new Error('Invalid IPv4 network size: must be numeric');
		}
		const size = parseInt(sizeStr, 10);
		if (size < 0 || size > 32) {
			throw new Error('Invalid IPv4 network size: must be between 0 and 32');
		}
		return new Ipv4Net(addr, size);
	}

	public isInRange(address: Ipv4Addr): boolean {
		const value = address.value;
		return value >= this.#lowAddress && value <= this.#highAddress;
	}
}
