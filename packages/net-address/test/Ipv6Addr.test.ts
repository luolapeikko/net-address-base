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
			expect(Ipv6Addr.from('2001:db8::1').isOk).toBe(true);
		});

		it('should return Err for an invalid string', () => {
			expect(Ipv6Addr.from('invalid').isErr).toBe(true);
			expect(Ipv6Addr.from('2001:db8:::1').isErr).toBe(true);
		});

		// Special addresses
		it('should parse the unspecified address', () => {
			const result = Ipv6Addr.from('::');
			expect(result.isOk).toBe(true);
			expect(result.unwrap().isUnspecified()).toBe(true);
			expect(result.unwrap().toString()).toBe('::');
		});

		it('should parse the loopback address', () => {
			const result = Ipv6Addr.from('::1');
			expect(result.isOk).toBe(true);
			expect(result.unwrap().isLoopback()).toBe(true);
			expect(result.unwrap().toString()).toBe('::1');
		});

		// Link-local addresses
		it('should parse link-local addresses', () => {
			const result = Ipv6Addr.from('fe80::1');
			expect(result.isOk).toBe(true);
			expect(result.unwrap().isUnicastLinkLocal()).toBe(true);
			expect(result.unwrap().toString()).toBe('fe80::1');
		});

		it('should parse link-local with full format', () => {
			const result = Ipv6Addr.from('fe80:0000:0000:0000:0000:0000:0000:0001');
			expect(result.isOk).toBe(true);
			expect(result.unwrap().isUnicastLinkLocal()).toBe(true);
		});

		// Unique local addresses (Fc00::/7)
		it('should parse unique local addresses', () => {
			const result1 = Ipv6Addr.from('fc00::1');
			expect(result1.isOk).toBe(true);
			expect(result1.unwrap().isUniqueLocal()).toBe(true);

			const result2 = Ipv6Addr.from('fd00::1');
			expect(result2.isOk).toBe(true);
			expect(result2.unwrap().isUniqueLocal()).toBe(true);
		});

		// Multicast addresses (ff00::/8)
		it('should parse multicast interface-local (ff01::/16)', () => {
			const result = Ipv6Addr.from('ff01::1');
			expect(result.isOk).toBe(true);
			expect(result.unwrap().isMulticast()).toBe(true);
			expect(result.unwrap().isMulticastInterfaceLocal()).toBe(true);
		});

		it('should parse multicast link-local (ff02::/16)', () => {
			const result = Ipv6Addr.from('ff02::1');
			expect(result.isOk).toBe(true);
			expect(result.unwrap().isMulticast()).toBe(true);
			expect(result.unwrap().isMulticastLinkLocal()).toBe(true);
		});

		it('should parse multicast realm-local (ff03::/16)', () => {
			const result = Ipv6Addr.from('ff03::1');
			expect(result.isOk).toBe(true);
			expect(result.unwrap().isMulticast()).toBe(true);
			expect(result.unwrap().isMulticastRealmLocal()).toBe(true);
		});

		it('should parse multicast admin-local (ff04::/16)', () => {
			const result = Ipv6Addr.from('ff04::1');
			expect(result.isOk).toBe(true);
			expect(result.unwrap().isMulticast()).toBe(true);
			expect(result.unwrap().isMulticastAdminLocal()).toBe(true);
		});

		it('should parse multicast site-local (ff05::/16)', () => {
			const result = Ipv6Addr.from('ff05::1');
			expect(result.isOk).toBe(true);
			expect(result.unwrap().isMulticast()).toBe(true);
			expect(result.unwrap().isMulticastSiteLocal()).toBe(true);
		});

		it('should parse multicast organization-local (ff08::/16)', () => {
			const result = Ipv6Addr.from('ff08::1');
			expect(result.isOk).toBe(true);
			expect(result.unwrap().isMulticast()).toBe(true);
			expect(result.unwrap().isMulticastOrganizationLocal()).toBe(true);
		});

		it('should parse multicast global (ff0e::/16)', () => {
			const result = Ipv6Addr.from('ff0e::1');
			expect(result.isOk).toBe(true);
			expect(result.unwrap().isMulticast()).toBe(true);
		});

		it('should parse well-known multicast addresses', () => {
			// All nodes on link
			const allNodes = Ipv6Addr.from('ff02::1');
			expect(allNodes.isOk).toBe(true);

			// All routers on link
			const allRouters = Ipv6Addr.from('ff02::2');
			expect(allRouters.isOk).toBe(true);

			// mDNS (Multicast DNS)
			const mdns = Ipv6Addr.from('ff02::fb');
			expect(mdns.isOk).toBe(true);

			// SSDP (Simple Service Discovery Protocol)
			const ssdp = Ipv6Addr.from('ff02::c');
			expect(ssdp.isOk).toBe(true);

			// DHCPv6 servers and relay agents
			const dhcpv6 = Ipv6Addr.from('ff02::1:2');
			expect(dhcpv6.isOk).toBe(true);
		});

		// Documentation addresses
		it('should parse documentation addresses (2001:db8::/32)', () => {
			const result = Ipv6Addr.from('2001:db8::1');
			expect(result.isOk).toBe(true);
			expect(result.unwrap().isDocumentation()).toBe(true);
		});

		it('should parse documentation addresses (3fff::/20)', () => {
			const result = Ipv6Addr.from('3fff::1');
			expect(result.isOk).toBe(true);
			expect(result.unwrap().isDocumentation()).toBe(true);
		});

		// Benchmarking addresses
		it('should parse benchmarking addresses (2001:2::/48)', () => {
			const result = Ipv6Addr.from('2001:2::1');
			expect(result.isOk).toBe(true);
			expect(result.unwrap().isBenchmarking()).toBe(true);
		});

		// IPv4-mapped addresses
		it('should parse IPv4-mapped addresses', () => {
			const result = Ipv6Addr.from('::ffff:192.168.1.1');
			expect(result.isOk).toBe(true);
			expect(result.unwrap().isIpv4Mapped()).toBe(true);
			expect(result.unwrap().toString()).toMatch(/::ffff:/);
		});

		it('should parse IPv4-compatible addresses', () => {
			const result = Ipv6Addr.from('::192.168.1.1');
			expect(result.isOk).toBe(true);
			// IPv4-compatible addresses are parsed as regular IPv6 segments
			expect(result.unwrap().toString()).toMatch(/^::/);
		});

		// Various compression patterns
		it('should parse addresses with compression at the beginning', () => {
			const result = Ipv6Addr.from('::1234:5678');
			expect(result.isOk).toBe(true);
			expect(result.unwrap().toString()).toContain('1234:5678');
		});

		it('should parse addresses with compression at the end', () => {
			const result = Ipv6Addr.from('2001:db8::');
			expect(result.isOk).toBe(true);
			expect(result.unwrap().toString()).toContain('2001:db8');
		});

		it('should parse addresses with compression in the middle', () => {
			const result = Ipv6Addr.from('2001:db8::cafe:1');
			expect(result.isOk).toBe(true);
		});

		// Full addresses without compression
		it('should parse full addresses without compression', () => {
			const result = Ipv6Addr.from('2001:0db8:0000:0000:0000:0000:0000:0001');
			expect(result.isOk).toBe(true);
			expect(result.unwrap().toString()).toBe('2001:db8::1');
		});

		// Leading zeros
		it('should parse addresses with leading zeros', () => {
			const result = Ipv6Addr.from('2001:00db:0000:0000:0000:0000:0000:0001');
			expect(result.isOk).toBe(true);
		});

		// Single zero segments
		it('should parse addresses with single zero segments', () => {
			const result = Ipv6Addr.from('2001:db8:0:0:0:0:0:1');
			expect(result.isOk).toBe(true);
		});

		// All hex digits
		it('should parse addresses with all hex digits', () => {
			const result = Ipv6Addr.from('abcd:ef01:2345:6789:abcd:ef01:2345:6789');
			expect(result.isOk).toBe(true);
		});

		it('should parse addresses with uppercase hex digits', () => {
			const result = Ipv6Addr.from('ABCD:EF01:2345:6789:ABCD:EF01:2345:6789');
			expect(result.isOk).toBe(true);
		});

		it('should parse addresses with mixed case hex digits', () => {
			const result = Ipv6Addr.from('AbCd:Ef01:2345:6789:aBcD:eF01:2345:6789');
			expect(result.isOk).toBe(true);
		});

		// Edge cases
		it('should parse addresses with max values', () => {
			const result = Ipv6Addr.from('ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff');
			expect(result.isOk).toBe(true);
		});

		it('should parse addresses with single segment', () => {
			const result = Ipv6Addr.from('1::');
			expect(result.isOk).toBe(true);
		});
		it('should reject invalid addresses', () => {
			expect(Ipv6Addr.from('1:2:3:4:5:6:7:8:9').err()?.message).toBe(`"1:2:3:4:5:6:7:8:9" is invalid ipv6 value`);
			expect(Ipv6Addr.from('10000::1').err()?.message).toBe(`"10000::1" is invalid ipv6 value`);
			expect(Ipv6Addr.from('gggg::1').err()?.message).toBe(`"gggg::1" is invalid ipv6 value`);
			expect(Ipv6Addr.from('2001::db8::1').err()?.message).toBe(`"2001::db8::1" is invalid ipv6 value`);
			expect(Ipv6Addr.from('').err()?.message).toBe(`"" is invalid ipv6 value`);
			expect(Ipv6Addr.from('::256.1.1.1').err()?.message).toBe(`"::256.1.1.1" is invalid ipv6 value`);
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
	describe('Ipv6Addr multicast scopes', () => {
		it('should correctly identify multicast interface-local addresses', () => {
			expect(new Ipv6Addr([0xff01, 0, 0, 0, 0, 0, 0, 1]).isMulticastInterfaceLocal()).toBe(true);
			expect(new Ipv6Addr([0xff02, 0, 0, 0, 0, 0, 0, 1]).isMulticastInterfaceLocal()).toBe(false);
			expect(new Ipv6Addr([0xff03, 0, 0, 0, 0, 0, 0, 1]).isMulticastInterfaceLocal()).toBe(false);
			expect(new Ipv6Addr([0xff04, 0, 0, 0, 0, 0, 0, 1]).isMulticastInterfaceLocal()).toBe(false);
			expect(new Ipv6Addr([0xff05, 0, 0, 0, 0, 0, 0, 1]).isMulticastInterfaceLocal()).toBe(false);
			expect(new Ipv6Addr([0xff08, 0, 0, 0, 0, 0, 0, 1]).isMulticastInterfaceLocal()).toBe(false);
		});
		it('should correctly identify multicast link-local addresses', () => {
			expect(new Ipv6Addr([0xff01, 0, 0, 0, 0, 0, 0, 1]).isMulticastLinkLocal()).toBe(false);
			expect(new Ipv6Addr([0xff02, 0, 0, 0, 0, 0, 0, 1]).isMulticastLinkLocal()).toBe(true);
			expect(new Ipv6Addr([0xff03, 0, 0, 0, 0, 0, 0, 1]).isMulticastLinkLocal()).toBe(false);
			expect(new Ipv6Addr([0xff04, 0, 0, 0, 0, 0, 0, 1]).isMulticastLinkLocal()).toBe(false);
			expect(new Ipv6Addr([0xff05, 0, 0, 0, 0, 0, 0, 1]).isMulticastLinkLocal()).toBe(false);
			expect(new Ipv6Addr([0xff08, 0, 0, 0, 0, 0, 0, 1]).isMulticastLinkLocal()).toBe(false);
		});
		it('should correctly identify multicast realm-local addresses', () => {
			expect(new Ipv6Addr([0xff01, 0, 0, 0, 0, 0, 0, 1]).isMulticastRealmLocal()).toBe(false);
			expect(new Ipv6Addr([0xff02, 0, 0, 0, 0, 0, 0, 1]).isMulticastRealmLocal()).toBe(false);
			expect(new Ipv6Addr([0xff03, 0, 0, 0, 0, 0, 0, 1]).isMulticastRealmLocal()).toBe(true);
			expect(new Ipv6Addr([0xff04, 0, 0, 0, 0, 0, 0, 1]).isMulticastRealmLocal()).toBe(false);
			expect(new Ipv6Addr([0xff05, 0, 0, 0, 0, 0, 0, 1]).isMulticastRealmLocal()).toBe(false);
			expect(new Ipv6Addr([0xff08, 0, 0, 0, 0, 0, 0, 1]).isMulticastRealmLocal()).toBe(false);
		});
		it('should correctly identify multicast admin-local addresses', () => {
			expect(new Ipv6Addr([0xff01, 0, 0, 0, 0, 0, 0, 1]).isMulticastAdminLocal()).toBe(false);
			expect(new Ipv6Addr([0xff02, 0, 0, 0, 0, 0, 0, 1]).isMulticastAdminLocal()).toBe(false);
			expect(new Ipv6Addr([0xff03, 0, 0, 0, 0, 0, 0, 1]).isMulticastAdminLocal()).toBe(false);
			expect(new Ipv6Addr([0xff04, 0, 0, 0, 0, 0, 0, 1]).isMulticastAdminLocal()).toBe(true);
			expect(new Ipv6Addr([0xff05, 0, 0, 0, 0, 0, 0, 1]).isMulticastAdminLocal()).toBe(false);
			expect(new Ipv6Addr([0xff08, 0, 0, 0, 0, 0, 0, 1]).isMulticastAdminLocal()).toBe(false);
		});
		it('should correctly identify multicast site-local addresses', () => {
			expect(new Ipv6Addr([0xff01, 0, 0, 0, 0, 0, 0, 1]).isMulticastSiteLocal()).toBe(false);
			expect(new Ipv6Addr([0xff02, 0, 0, 0, 0, 0, 0, 1]).isMulticastSiteLocal()).toBe(false);
			expect(new Ipv6Addr([0xff03, 0, 0, 0, 0, 0, 0, 1]).isMulticastSiteLocal()).toBe(false);
			expect(new Ipv6Addr([0xff04, 0, 0, 0, 0, 0, 0, 1]).isMulticastSiteLocal()).toBe(false);
			expect(new Ipv6Addr([0xff05, 0, 0, 0, 0, 0, 0, 1]).isMulticastSiteLocal()).toBe(true);
			expect(new Ipv6Addr([0xff08, 0, 0, 0, 0, 0, 0, 1]).isMulticastSiteLocal()).toBe(false);
		});
		it('should correctly identify multicast organization-local addresses', () => {
			expect(new Ipv6Addr([0xff01, 0, 0, 0, 0, 0, 0, 1]).isMulticastOrganizationLocal()).toBe(false);
			expect(new Ipv6Addr([0xff02, 0, 0, 0, 0, 0, 0, 1]).isMulticastOrganizationLocal()).toBe(false);
			expect(new Ipv6Addr([0xff03, 0, 0, 0, 0, 0, 0, 1]).isMulticastOrganizationLocal()).toBe(false);
			expect(new Ipv6Addr([0xff04, 0, 0, 0, 0, 0, 0, 1]).isMulticastOrganizationLocal()).toBe(false);
			expect(new Ipv6Addr([0xff05, 0, 0, 0, 0, 0, 0, 1]).isMulticastOrganizationLocal()).toBe(false);
			expect(new Ipv6Addr([0xff08, 0, 0, 0, 0, 0, 0, 1]).isMulticastOrganizationLocal()).toBe(true);
		});
	});
});
