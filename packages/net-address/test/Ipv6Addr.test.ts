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
		expect(Ipv6Addr.fromOrThrow('::ffff:192.168.0.1').toIpv4OrThrow().toString()).toBe('192.168.0.1');
		expect(Ipv6Addr.fromOrThrow('::ffff:192.168.0.1').toIpv4MappedOrThrow().toString()).toBe('192.168.0.1');
		// IPv4-compatible
		expect(Ipv6Addr.fromOrThrow('::192.168.0.1').toIpv4OrThrow().toString()).toBe('192.168.0.1');
		expect(() => Ipv6Addr.fromOrThrow('::192.168.0.1').toIpv4MappedOrThrow().toString()).toThrow('Address is not IPv4 mapped');
		// Loopback ::1 -> 0.0.0.1
		expect(Ipv6Addr.fromOrThrow('::1').toIpv4OrThrow().toString()).toBe('0.0.0.1');
		// Regular IPv6
		expect(() => Ipv6Addr.fromOrThrow('2001:db8::1').toIpv4OrThrow()).toThrow('Address is not IPv4 compatible');
		expect(() => Ipv6Addr.fromOrThrow('2001:db8::1').toIpv4MappedOrThrow()).toThrow('Address is not IPv4 mapped');
	});

	describe('Ipv6Addr.fromOrThrow', () => {
		it('should create an Ipv6Addr from a valid string', () => {
			expect(Ipv6Addr.fromOrThrow('2001:db8::1').toString()).toBe('2001:db8::1');
			expect(Ipv6Addr.fromOrThrow('::').toString(), 'Special case for unspecified address').toBe('::');
			expect(Ipv6Addr.fromOrThrow('::1').toString(), 'Special case for loopback address').toBe('::1');
			expect(Ipv6Addr.fromOrThrow('fe80::1').toString(), 'Special case for link-local address').toBe('fe80::1');
			expect(Ipv6Addr.fromOrThrow('fe80:0000:0000:0000:0000:0000:0000:0001').toString(), 'Full representation of link-local address').toBe('fe80::1');
			expect(Ipv6Addr.fromOrThrow('fc00::1').toString(), 'Special case for unique local address (fc00::/7)').toBe('fc00::1');
			expect(Ipv6Addr.fromOrThrow('fd00::1').toString(), 'Special case for unique local address (fd00::/8)').toBe('fd00::1');
			expect(Ipv6Addr.fromOrThrow('ff01::1').toString(), 'Special case for multicast node-local address').toBe('ff01::1');
			expect(Ipv6Addr.fromOrThrow('ff02::1').toString(), 'Special case for multicast link-local address').toBe('ff02::1');
			expect(Ipv6Addr.fromOrThrow('ff02::2').toString(), 'Special case for multicast link-local all-routers address').toBe('ff02::2');
			expect(Ipv6Addr.fromOrThrow('ff02::3').toString(), 'Special case for multicast link-local all-nodes address').toBe('ff02::3');
			expect(Ipv6Addr.fromOrThrow('ff03::1').toString(), 'Special case for multicast site-local address').toBe('ff03::1');
			expect(Ipv6Addr.fromOrThrow('ff04::1').toString(), 'Special case for multicast organization-local address').toBe('ff04::1');
			expect(Ipv6Addr.fromOrThrow('ff05::1').toString(), 'Special case for multicast site-local address').toBe('ff05::1');
			expect(Ipv6Addr.fromOrThrow('ff08::1').toString(), 'Special case for multicast organization-local address').toBe('ff08::1');
			expect(Ipv6Addr.fromOrThrow('ff0e::1').toString(), 'Special case for multicast global address').toBe('ff0e::1');
			expect(Ipv6Addr.fromOrThrow('ff0f::1').toString(), 'Special case for multicast reserved address').toBe('ff0f::1');
		});

		it('should parse well-known multicast addresses', () => {
			// All nodes on link
			expect(Ipv6Addr.fromOrThrow('ff02::1').toString()).toBe('ff02::1');
			// All routers on link
			expect(Ipv6Addr.fromOrThrow('ff02::2').toString()).toBe('ff02::2');
			// mDNS (Multicast DNS)
			expect(Ipv6Addr.fromOrThrow('ff02::fb').toString()).toBe('ff02::fb');
			// SSDP (Simple Service Discovery Protocol)
			expect(Ipv6Addr.fromOrThrow('ff02::c').toString()).toBe('ff02::c');
			// DHCPv6 servers and relay agents
			expect(Ipv6Addr.fromOrThrow('ff02::1:2').toString()).toBe('ff02::1:2');
		});

		// Documentation addresses
		it('should parse documentation addresses (2001:db8::/32)', () => {
			expect(Ipv6Addr.fromOrThrow('2001:db8::1').isDocumentation()).toBe(true);
		});

		it('should parse documentation addresses (3fff::/20)', () => {
			expect(Ipv6Addr.fromOrThrow('3fff::1').isDocumentation()).toBe(true);
		});

		// Benchmarking addresses
		it('should parse benchmarking addresses (2001:2::/48)', () => {
			expect(Ipv6Addr.fromOrThrow('2001:2::1').isBenchmarking()).toBe(true);
		});

		// IPv4-mapped addresses
		it('should parse IPv4-mapped addresses', () => {
			expect(Ipv6Addr.fromOrThrow('::ffff:192.168.1.1').isIpv4Mapped()).toBe(true);
		});

		it('should parse IPv4-compatible addresses', () => {
			expect(Ipv6Addr.fromOrThrow('::192.168.1.1').toString()).toMatch(/^::/);
		});

		// Various compression patterns
		it('should parse addresses with compression at the beginning', () => {
			expect(Ipv6Addr.fromOrThrow('::1234:5678').toString()).toContain('1234:5678');
		});

		it('should parse addresses with compression at the end', () => {
			expect(Ipv6Addr.fromOrThrow('2001:db8::').toString()).toContain('2001:db8');
		});

		it('should parse addresses with compression in the middle', () => {
			expect(Ipv6Addr.fromOrThrow('2001:db8::cafe:1').toString()).toContain('2001:db8');
		});

		// Full addresses without compression
		it('should parse full addresses without compression', () => {
			expect(Ipv6Addr.fromOrThrow('2001:0db8:0000:0000:0000:0000:0000:0001').toString()).toBe('2001:db8::1');
		});

		// Leading zeros
		it('should parse addresses with leading zeros', () => {
			expect(Ipv6Addr.fromOrThrow('2001:00db:0000:0000:0000:0000:0000:0001').toString()).toBe('2001:db::1');
		});

		// Single zero segments
		it('should parse addresses with single zero segments', () => {
			expect(Ipv6Addr.fromOrThrow('2001:db8:0:0:0:0:0:1').toString()).toBe('2001:db8::1');
		});

		// All hex digits
		it('should parse addresses with all hex digits', () => {
			expect(Ipv6Addr.fromOrThrow('abcd:ef01:2345:6789:abcd:ef01:2345:6789').toString()).toBe('abcd:ef01:2345:6789:abcd:ef01:2345:6789');
			expect(Ipv6Addr.fromOrThrow('ABCD:EF01:2345:6789:ABCD:EF01:2345:6789').toString()).toBe('abcd:ef01:2345:6789:abcd:ef01:2345:6789');
			expect(Ipv6Addr.fromOrThrow('AbCd:Ef01:2345:6789:aBcD:eF01:2345:6789').toString()).toBe('abcd:ef01:2345:6789:abcd:ef01:2345:6789');
		});

		// Edge cases
		it('should parse addresses with max values', () => {
			expect(Ipv6Addr.fromOrThrow('ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff').toString()).toBe('ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff');
		});

		it('should parse addresses with single segment', () => {
			expect(Ipv6Addr.fromOrThrow('1::').toString()).toBe('1::');
		});
		it('should reject invalid addresses', () => {
			expect(Ipv6Addr.from('1:2:3:4:5:6:7:8:9').error?.message).toBe(`"1:2:3:4:5:6:7:8:9" is invalid ipv6 value`);
			expect(Ipv6Addr.from('10000::1').error?.message).toBe(`"10000::1" is invalid ipv6 value`);
			expect(Ipv6Addr.from('gggg::1').error?.message).toBe(`"gggg::1" is invalid ipv6 value`);
			expect(Ipv6Addr.from('2001::db8::1').error?.message).toBe(`"2001::db8::1" is invalid ipv6 value`);
			expect(Ipv6Addr.from('').error?.message).toBe(`"" is invalid ipv6 value`);
			expect(Ipv6Addr.from('::256.1.1.1').error?.message).toBe(`"::256.1.1.1" is invalid ipv6 value`);
		});
		it('should throw an error for an invalid string', () => {
			expect(() => Ipv6Addr.fromOrThrow('invalid')).toThrow();
			expect(() => Ipv6Addr.fromOrThrow('2001:db8:::1')).toThrow();
		});
	});

	describe('Ipv6Addr buffer operations', () => {
		it('should create from and to buffer (Big-Endian)', () => {
			const addr = new Ipv6Addr([0x2001, 0xdb8, 0, 0, 0, 0, 0, 1]);
			const buffer = addr.toBuffer(false);
			const result = Ipv6Addr.fromBuffer(buffer, false);
			expect(result.success).toBe(true);
			expect(result.value?.toString()).toBe('2001:db8::1');

			const view = new DataView(buffer);
			expect(view.getBigUint64(0, false)).toBe(0x20010db800000000n);
			expect(view.getBigUint64(8, false)).toBe(0x1n);
		});

		it('should create from and to buffer (Little-Endian)', () => {
			const addr = new Ipv6Addr([0x2001, 0xdb8, 0, 0, 0, 0, 0, 1]);
			const buffer = addr.toBuffer(true);
			const result = Ipv6Addr.fromBuffer(buffer, true);
			expect(result.success).toBe(true);
			expect(result.value?.toString()).toBe('2001:db8::1');

			const view = new DataView(buffer);
			expect(view.getBigUint64(0, true)).toBe(0x1n);
			expect(view.getBigUint64(8, true)).toBe(0x20010db800000000n);
		});

		it('should handle bigint constructor', () => {
			const val = (0x20010db8n << 96n) | 1n;
			const addr = new Ipv6Addr(val);
			expect(addr.toString()).toBe('2001:db8::1');
		});
		it('should throw on invalid buffer value', () => {
			const buffer = new ArrayBuffer(8); // too short
			expect(() => Ipv6Addr.fromBufferOrThrow(buffer, false)).toThrow();
			expect(() => Ipv6Addr.fromBufferOrThrow(buffer, true)).toThrow();
		});
	});
	describe('Ipv6Addr multicast scopes', () => {
		it('should correctly identify multicast interface-local addresses', () => {
			expect(Ipv6Addr.fromOrThrow('ff01::1').isMulticastInterfaceLocal()).toBe(true);
			expect(Ipv6Addr.fromOrThrow('ff02::1').isMulticastInterfaceLocal()).toBe(false);
			expect(Ipv6Addr.fromOrThrow('ff03::1').isMulticastInterfaceLocal()).toBe(false);
			expect(Ipv6Addr.fromOrThrow('ff04::1').isMulticastInterfaceLocal()).toBe(false);
			expect(Ipv6Addr.fromOrThrow('ff05::1').isMulticastInterfaceLocal()).toBe(false);
			expect(Ipv6Addr.fromOrThrow('ff08::1').isMulticastInterfaceLocal()).toBe(false);
		});
		it('should correctly identify multicast link-local addresses', () => {
			expect(Ipv6Addr.fromOrThrow('ff01::1').isMulticastLinkLocal()).toBe(false);
			expect(Ipv6Addr.fromOrThrow('ff02::1').isMulticastLinkLocal()).toBe(true);
			expect(Ipv6Addr.fromOrThrow('ff03::1').isMulticastLinkLocal()).toBe(false);
			expect(Ipv6Addr.fromOrThrow('ff04::1').isMulticastLinkLocal()).toBe(false);
			expect(Ipv6Addr.fromOrThrow('ff05::1').isMulticastLinkLocal()).toBe(false);
			expect(Ipv6Addr.fromOrThrow('ff08::1').isMulticastLinkLocal()).toBe(false);
		});
		it('should correctly identify multicast realm-local addresses', () => {
			expect(Ipv6Addr.fromOrThrow('ff01::1').isMulticastRealmLocal()).toBe(false);
			expect(Ipv6Addr.fromOrThrow('ff02::1').isMulticastRealmLocal()).toBe(false);
			expect(Ipv6Addr.fromOrThrow('ff03::1').isMulticastRealmLocal()).toBe(true);
			expect(Ipv6Addr.fromOrThrow('ff04::1').isMulticastRealmLocal()).toBe(false);
			expect(Ipv6Addr.fromOrThrow('ff05::1').isMulticastRealmLocal()).toBe(false);
			expect(Ipv6Addr.fromOrThrow('ff08::1').isMulticastRealmLocal()).toBe(false);
		});
		it('should correctly identify multicast admin-local addresses', () => {
			expect(Ipv6Addr.fromOrThrow('ff01::1').isMulticastAdminLocal()).toBe(false);
			expect(Ipv6Addr.fromOrThrow('ff02::1').isMulticastAdminLocal()).toBe(false);
			expect(Ipv6Addr.fromOrThrow('ff03::1').isMulticastAdminLocal()).toBe(false);
			expect(Ipv6Addr.fromOrThrow('ff04::1').isMulticastAdminLocal()).toBe(true);
			expect(Ipv6Addr.fromOrThrow('ff05::1').isMulticastAdminLocal()).toBe(false);
			expect(Ipv6Addr.fromOrThrow('ff08::1').isMulticastAdminLocal()).toBe(false);
		});
		it('should correctly identify multicast site-local addresses', () => {
			expect(Ipv6Addr.fromOrThrow('ff01::1').isMulticastSiteLocal()).toBe(false);
			expect(Ipv6Addr.fromOrThrow('ff02::1').isMulticastSiteLocal()).toBe(false);
			expect(Ipv6Addr.fromOrThrow('ff03::1').isMulticastSiteLocal()).toBe(false);
			expect(Ipv6Addr.fromOrThrow('ff04::1').isMulticastSiteLocal()).toBe(false);
			expect(Ipv6Addr.fromOrThrow('ff05::1').isMulticastSiteLocal()).toBe(true);
			expect(Ipv6Addr.fromOrThrow('ff08::1').isMulticastSiteLocal()).toBe(false);
		});
		it('should correctly identify multicast organization-local addresses', () => {
			expect(Ipv6Addr.fromOrThrow('ff01::1').isMulticastOrganizationLocal()).toBe(false);
			expect(Ipv6Addr.fromOrThrow('ff02::1').isMulticastOrganizationLocal()).toBe(false);
			expect(Ipv6Addr.fromOrThrow('ff03::1').isMulticastOrganizationLocal()).toBe(false);
			expect(Ipv6Addr.fromOrThrow('ff04::1').isMulticastOrganizationLocal()).toBe(false);
			expect(Ipv6Addr.fromOrThrow('ff05::1').isMulticastOrganizationLocal()).toBe(false);
			expect(Ipv6Addr.fromOrThrow('ff08::1').isMulticastOrganizationLocal()).toBe(true);
		});
	});
	describe('Ipv6Addr multicast group addresses', () => {
		it('should correctly identify the all-nodes multicast group address', () => {
			expect(Ipv6Addr.fromOrThrow('ff01::1').isAllNodesMulticastGroup()).toBe(true);
			expect(Ipv6Addr.fromOrThrow('ff02::1').isAllNodesMulticastGroup()).toBe(true);
			expect(Ipv6Addr.fromOrThrow('ff03::1').isAllNodesMulticastGroup()).toBe(true);
			expect(Ipv6Addr.fromOrThrow('ff04::1').isAllNodesMulticastGroup()).toBe(true);
			expect(Ipv6Addr.fromOrThrow('ff05::1').isAllNodesMulticastGroup()).toBe(true);
			expect(Ipv6Addr.fromOrThrow('ff08::1').isAllNodesMulticastGroup()).toBe(true);
			expect(Ipv6Addr.fromOrThrow('ff02::2').isAllNodesMulticastGroup()).toBe(false);
		});
		it('should correctly identify the all-routers multicast group address', () => {
			expect(Ipv6Addr.fromOrThrow('ff01::2').isAllRoutersMulticastGroup()).toBe(true);
			expect(Ipv6Addr.fromOrThrow('ff02::2').isAllRoutersMulticastGroup()).toBe(true);
			expect(Ipv6Addr.fromOrThrow('ff03::2').isAllRoutersMulticastGroup()).toBe(true);
			expect(Ipv6Addr.fromOrThrow('ff04::2').isAllRoutersMulticastGroup()).toBe(true);
			expect(Ipv6Addr.fromOrThrow('ff05::2').isAllRoutersMulticastGroup()).toBe(true);
			expect(Ipv6Addr.fromOrThrow('ff08::2').isAllRoutersMulticastGroup()).toBe(true);
			expect(Ipv6Addr.fromOrThrow('ff02::1').isAllRoutersMulticastGroup()).toBe(false);
		});
		it('should correctly identify the mDNS multicast group address', () => {
			expect(Ipv6Addr.fromOrThrow('ff02::fb').isMdnsMulticastGroup()).toBe(true);
			expect(Ipv6Addr.fromOrThrow('ff02::fc').isMdnsMulticastGroup()).toBe(false);
		});
		it('should correctly identify the SSDP multicast group address', () => {
			expect(Ipv6Addr.fromOrThrow('ff02::c').isSsdpMulticastGroup()).toBe(true);
			expect(Ipv6Addr.fromOrThrow('ff02::d').isSsdpMulticastGroup()).toBe(false);
		});
		it('should correctly identify the DHCPv6 multicast group address', () => {
			expect(Ipv6Addr.fromOrThrow('ff02::12').isDhcpv6MulticastGroup()).toBe(true);
			expect(Ipv6Addr.fromOrThrow('ff02::13').isDhcpv6MulticastGroup()).toBe(false);
		});
	});
});
