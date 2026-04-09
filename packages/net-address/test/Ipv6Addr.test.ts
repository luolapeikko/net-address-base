import {describe, expect, it} from 'vitest';
import {Ipv6Addr} from '../src/Ipv6Addr';

describe('Ipv6Addr', () => {
	it('should correctly identify the unspecified address', () => {
		const addr = new Ipv6Addr([0, 0, 0, 0, 0, 0, 0, 0]);
		expect(addr.isUnspecified()).toBe(true);
		expect(addr.isGlobal()).toBe(false);
		expect(addr.isMulticast()).toBe(false);
		expect(addr.toString()).toBe('::');
	});

	it('should correctly identify the loopback address', () => {
		const addr = new Ipv6Addr([0, 0, 0, 0, 0, 0, 0, 1]);
		expect(addr.isLoopback()).toBe(true);
		expect(addr.isGlobal()).toBe(false);
		expect(addr.isUnicast()).toBe(true);
		expect(addr.toString()).toBe('::1');
	});

	it('should correctly identify multicast addresses', () => {
		const addr = new Ipv6Addr([0xff00, 0, 0, 0, 0, 0, 0, 0]);
		expect(addr.isMulticast()).toBe(true);
		expect(addr.isUnicast()).toBe(false);
		expect(addr.isGlobal()).toBe(false);
		expect(addr.toString()).toBe('ff00::');
	});

	it('should correctly identify link-local addresses', () => {
		const addr = new Ipv6Addr([0xfe80, 0, 0, 0, 0, 0, 0, 1]);
		expect(addr.isUnicastLinkLocal()).toBe(true);
		expect(addr.isGlobal()).toBe(false);
		expect(addr.toString()).toBe('fe80::1');
	});

	it('should correctly identify unique local addresses', () => {
		const addr = new Ipv6Addr([0xfc00, 0, 0, 0, 0, 0, 0, 1]);
		expect(addr.isUniqueLocal()).toBe(true);
		expect(addr.isGlobal()).toBe(false);
		expect(addr.toString()).toBe('fc00::1');
	});

	it('should correctly identify documentation addresses', () => {
		const addr1 = new Ipv6Addr([0x2001, 0xdb8, 0, 0, 0, 0, 0, 1]);
		expect(addr1.isDocumentation()).toBe(true);
		expect(addr1.isGlobal()).toBe(false);
		expect(addr1.toString()).toBe('2001:db8::1');

		const addr2 = new Ipv6Addr([0x3fff, 0, 0, 0, 0, 0, 0, 1]);
		expect(addr2.isDocumentation()).toBe(true);
		expect(addr2.isGlobal()).toBe(false);
		expect(addr2.toString()).toBe('3fff::1');
	});

	it('should correctly identify benchmarking addresses', () => {
		const addr = new Ipv6Addr([0x2001, 2, 0, 0, 0, 0, 0, 1]);
		expect(addr.isBenchmarking()).toBe(true);
		expect(addr.isGlobal()).toBe(false);
		expect(addr.toString()).toBe('2001:2::1');
	});

	it('should correctly identify global addresses', () => {
		const addr = new Ipv6Addr([0x2001, 0, 0x1c9, 0, 0, 0xafc8, 0x10, 0x1]);
		expect(addr.isGlobal()).toBe(true);
		expect(addr.isUnicastGlobal()).toBe(true);
		expect(addr.toString()).toBe('2001:0:1c9::afc8:10:1');
	});

	it('should correctly identify IPv4-mapped addresses', () => {
		const addr = new Ipv6Addr([0, 0, 0, 0, 0, 0xffff, 0xc000, 0x02ff]);
		expect(addr.isIpv4Mapped()).toBe(true);
		expect(addr.isGlobal()).toBe(false);
		expect(addr.toString()).toBe('::ffff:c000:2ff');
	});

	it('should handle complex zero-compression in toString()', () => {
		// Longest run of zeros in the middle
		const addr1 = new Ipv6Addr([0x2001, 0, 0, 0x1, 0, 0, 0, 1]);
		expect(addr1.toString()).toBe('2001:0:0:1::1');

		// Two runs of same length, compress the first one
		const addr2 = new Ipv6Addr([0x2001, 0, 0, 0x1, 0, 0, 1, 1]);
		expect(addr2.toString()).toBe('2001::1:0:0:1:1');
	});

	it('should throw an error for invalid segments', () => {
		expect(() => new Ipv6Addr([0x10000, 0, 0, 0, 0, 0, 0, 0])).toThrow('IPv6 segment must be between 0 and 65535');
		expect(() => new Ipv6Addr([-1, 0, 0, 0, 0, 0, 0, 0])).toThrow('IPv6 segment must be between 0 and 65535');
	});

	it('should correctly convert to IPv4', () => {
		// IPv4-mapped
		const mapped = new Ipv6Addr([0, 0, 0, 0, 0, 0xffff, 0xc0a8, 0x0001]); // ::ffff:192.168.0.1
		const ipv4_1 = mapped.toIpv4();
		expect(ipv4_1.isSome).toBe(true);
		expect(ipv4_1.unwrap().toString()).toBe('192.168.0.1');

		const ipv4_mapped_1 = mapped.toIpv4Mapped();
		expect(ipv4_mapped_1.isSome).toBe(true);
		expect(ipv4_mapped_1.unwrap().toString()).toBe('192.168.0.1');

		// IPv4-compatible
		const compatible = new Ipv6Addr([0, 0, 0, 0, 0, 0, 0xc0a8, 0x0001]); // ::192.168.0.1
		const ipv4_2 = compatible.toIpv4();
		expect(ipv4_2.isSome).toBe(true);
		expect(ipv4_2.unwrap().toString()).toBe('192.168.0.1');

		const ipv4_mapped_2 = compatible.toIpv4Mapped();
		expect(ipv4_mapped_2.isSome).toBe(false);

		// Loopback ::1 -> 0.0.0.1
		const loopback = new Ipv6Addr([0, 0, 0, 0, 0, 0, 0, 1]);
		const ipv4_3 = loopback.toIpv4();
		expect(ipv4_3.isSome).toBe(true);
		expect(ipv4_3.unwrap().toString()).toBe('0.0.0.1');

		// Regular IPv6
		const global = new Ipv6Addr([0x2001, 0xdb8, 0, 0, 0, 0, 0, 1]);
		expect(global.toIpv4().isSome).toBe(false);
		expect(global.toIpv4Mapped().isSome).toBe(false);
	});

	describe('Ipv6Addr.from', () => {
		it('should create an Ipv6Addr from a valid string', () => {
			const result = Ipv6Addr.from('2001:db8::1');
			expect(result.isOk).toBe(true);
			expect(result.unwrap().toString()).toBe('2001:db8::1');
		});

		it('should return Err for an invalid string', () => {
			expect(Ipv6Addr.from('invalid').isErr).toBe(true);
			expect(Ipv6Addr.from('2001:db8:::1').isErr).toBe(true);
		});
	});

	describe('Ipv6Addr buffer operations', () => {
		it('should create from and to buffer (Big-Endian)', () => {
			const addr = new Ipv6Addr([0x2001, 0xdb8, 0, 0, 0, 0, 0, 1]);
			const buffer = addr.toBuffer(false);
			const result = Ipv6Addr.fromBuffer(buffer, false);
			expect(result.isOk).toBe(true);
			expect(result.unwrap().toString()).toBe('2001:db8::1');

			const view = new DataView(buffer);
			expect(view.getBigUint64(0, false)).toBe(0x20010db800000000n);
			expect(view.getBigUint64(8, false)).toBe(0x1n);
		});

		it('should create from and to buffer (Little-Endian)', () => {
			const addr = new Ipv6Addr([0x2001, 0xdb8, 0, 0, 0, 0, 0, 1]);
			const buffer = addr.toBuffer(true);
			const result = Ipv6Addr.fromBuffer(buffer, true);
			expect(result.isOk).toBe(true);
			expect(result.unwrap().toString()).toBe('2001:db8::1');

			const view = new DataView(buffer);
			expect(view.getBigUint64(0, true)).toBe(0x1n);
			expect(view.getBigUint64(8, true)).toBe(0x20010db800000000n);
		});

		it('should handle bigint constructor', () => {
			const val = (0x20010db8n << 96n) | 1n;
			const addr = new Ipv6Addr(val);
			expect(addr.toString()).toBe('2001:db8::1');
		});
	});
});
