import {describe, expect, it} from 'vitest';
import {Ipv4Addr} from '../src/';

describe('Ipv4Addr', function () {
	describe('Ipv4Addr.isBroadcast', function () {
		it('should check broadcast addresses', function () {
			expect(Ipv4Addr.fromOrThrow('255.255.255.255').isBroadcast()).toBe(true);
			expect(Ipv4Addr.fromOrThrow('192.0.2.0').isBroadcast()).toBe(false);
			expect(Ipv4Addr.fromOrThrow('0.0.0.0').isBroadcast()).toBe(false);
		});
	});

	describe('Ipv4Addr.isDocumentation', function () {
		it('should check documentation ranges (RFC 5737)', function () {
			// 192.0.2.0/24
			expect(Ipv4Addr.fromOrThrow('192.0.2.0').isDocumentation()).toBe(true);
			expect(Ipv4Addr.fromOrThrow('192.0.2.255').isDocumentation()).toBe(true);
			// 198.51.100.0/24
			expect(Ipv4Addr.fromOrThrow('198.51.100.0').isDocumentation()).toBe(true);
			expect(Ipv4Addr.fromOrThrow('198.51.100.255').isDocumentation()).toBe(true);
			// 203.0.113.0/24
			expect(Ipv4Addr.fromOrThrow('203.0.113.0').isDocumentation()).toBe(true);
			expect(Ipv4Addr.fromOrThrow('203.0.113.255').isDocumentation()).toBe(true);
			// not valid
			expect(Ipv4Addr.fromOrThrow('192.0.1.255').isDocumentation()).toBe(false);
			expect(Ipv4Addr.fromOrThrow('192.0.3.0').isDocumentation()).toBe(false);
			expect(Ipv4Addr.fromOrThrow('127.0.0.1').isDocumentation()).toBe(false);
			expect(Ipv4Addr.fromOrThrow('8.8.8.8').isDocumentation()).toBe(false);
		});
	});

	describe('Ipv4Addr.isLinkLocal', function () {
		it('should return true for addresses in 169.254.0.0/16 range (RFC 3927)', function () {
			expect(new Ipv4Addr(169, 254, 0, 0).isLinkLocal()).toBe(true);
			expect(new Ipv4Addr(169, 254, 255, 255).isLinkLocal()).toBe(true);
			expect(new Ipv4Addr(169, 254, 128, 1).isLinkLocal()).toBe(true);
		});

		it('should return false for addresses outside 169.254.0.0/16 range', function () {
			expect(new Ipv4Addr(169, 253, 255, 255).isLinkLocal()).toBe(false);
			expect(new Ipv4Addr(169, 255, 0, 0).isLinkLocal()).toBe(false);
			expect(new Ipv4Addr(127, 0, 0, 1).isLinkLocal()).toBe(false);
		});
	});

	describe('Ipv4Addr.isLoopback', function () {
		it('should return true for addresses in 127.0.0.0/8 range (RFC 1122)', function () {
			expect(new Ipv4Addr(127, 0, 0, 1).isLoopback()).toBe(true);
			expect(new Ipv4Addr(127, 255, 255, 255).isLoopback()).toBe(true);
			expect(new Ipv4Addr(127, 10, 20, 30).isLoopback()).toBe(true);
		});

		it('should return false for addresses outside 127.0.0.0/8 range', function () {
			expect(new Ipv4Addr(126, 255, 255, 255).isLoopback()).toBe(false);
			expect(new Ipv4Addr(128, 0, 0, 0).isLoopback()).toBe(false);
			expect(new Ipv4Addr(169, 254, 0, 1).isLoopback()).toBe(false);
		});
	});

	describe('Ipv4Addr.isPrivate', function () {
		it('should return true for addresses in private ranges (RFC 1918)', function () {
			// 10.0.0.0/8
			expect(new Ipv4Addr(10, 0, 0, 0).isPrivate()).toBe(true);
			expect(new Ipv4Addr(10, 255, 255, 255).isPrivate()).toBe(true);

			// 172.16.0.0/12
			expect(new Ipv4Addr(172, 16, 0, 0).isPrivate()).toBe(true);
			expect(new Ipv4Addr(172, 31, 255, 255).isPrivate()).toBe(true);

			// 192.168.0.0/16
			expect(new Ipv4Addr(192, 168, 0, 0).isPrivate()).toBe(true);
			expect(new Ipv4Addr(192, 168, 255, 255).isPrivate()).toBe(true);
		});

		it('should return false for addresses outside private ranges', function () {
			expect(new Ipv4Addr(9, 255, 255, 255).isPrivate()).toBe(false);
			expect(new Ipv4Addr(11, 0, 0, 0).isPrivate()).toBe(false);
			expect(new Ipv4Addr(172, 15, 255, 255).isPrivate()).toBe(false);
			expect(new Ipv4Addr(172, 32, 0, 0).isPrivate()).toBe(false);
			expect(new Ipv4Addr(192, 167, 255, 255).isPrivate()).toBe(false);
			expect(new Ipv4Addr(192, 169, 0, 0).isPrivate()).toBe(false);
			expect(new Ipv4Addr(8, 8, 8, 8).isPrivate()).toBe(false);
		});
	});

	describe('Ipv4Addr.isMulticast', function () {
		it('should return true for addresses in multicast range (224.0.0.0/4)', function () {
			expect(new Ipv4Addr(224, 0, 0, 0).isMulticast()).toBe(true);
			expect(new Ipv4Addr(239, 255, 255, 255).isMulticast()).toBe(true);
			expect(new Ipv4Addr(224, 1, 2, 3).isMulticast()).toBe(true);
		});

		it('should return false for addresses outside multicast range', function () {
			expect(new Ipv4Addr(223, 255, 255, 255).isMulticast()).toBe(false);
			expect(new Ipv4Addr(240, 0, 0, 0).isMulticast()).toBe(false);
			expect(new Ipv4Addr(192, 168, 1, 1).isMulticast()).toBe(false);
		});
	});

	describe('Ipv4Addr.isReserved', function () {
		it('should return true for addresses in reserved range (240.0.0.0/4) excluding broadcast', function () {
			expect(new Ipv4Addr(240, 0, 0, 0).isReserved()).toBe(true);
			expect(new Ipv4Addr(255, 255, 255, 254).isReserved()).toBe(true);
			expect(new Ipv4Addr(250, 1, 2, 3).isReserved()).toBe(true);
		});

		it('should return false for addresses outside reserved range', function () {
			expect(new Ipv4Addr(239, 255, 255, 255).isReserved()).toBe(false);
			expect(new Ipv4Addr(192, 168, 1, 1).isReserved()).toBe(false);
		});

		it('should return false for broadcast address (255.255.255.255)', function () {
			expect(new Ipv4Addr(255, 255, 255, 255).isReserved()).toBe(false);
		});
	});

	describe('Ipv4Addr.isBenchmarking', function () {
		it('should return true for addresses in benchmarking range (198.18.0.0/15)', function () {
			expect(new Ipv4Addr(198, 18, 0, 0).isBenchmarking()).toBe(true);
			expect(new Ipv4Addr(198, 19, 255, 255).isBenchmarking()).toBe(true);
		});

		it('should return false for addresses outside benchmarking range', function () {
			expect(new Ipv4Addr(198, 17, 255, 255).isBenchmarking()).toBe(false);
			expect(new Ipv4Addr(199, 20, 0, 0).isBenchmarking()).toBe(false);
		});
	});

	describe('Ipv4Addr.isGlobal', function () {
		it('should return true for globally reachable addresses', function () {
			expect(new Ipv4Addr(8, 8, 8, 8).isGlobal()).toBe(true);
			expect(new Ipv4Addr(1, 1, 1, 1).isGlobal()).toBe(true);
		});

		it('should return false for special-purpose addresses', function () {
			expect(new Ipv4Addr(10, 0, 0, 1).isGlobal()).toBe(false); // private
			expect(new Ipv4Addr(127, 0, 0, 1).isGlobal()).toBe(false); // loopback
			expect(new Ipv4Addr(169, 254, 0, 1).isGlobal()).toBe(false); // link-local
			expect(new Ipv4Addr(192, 168, 1, 1).isGlobal()).toBe(false); // private
			expect(new Ipv4Addr(224, 0, 0, 1).isGlobal()).toBe(false); // multicast
			expect(new Ipv4Addr(240, 0, 0, 1).isGlobal()).toBe(false); // reserved
			expect(new Ipv4Addr(192, 0, 2, 1).isGlobal()).toBe(false); // documentation
			expect(new Ipv4Addr(100, 64, 0, 1).isGlobal()).toBe(false); // shared
			expect(new Ipv4Addr(198, 18, 0, 1).isGlobal()).toBe(false); // benchmarking
			expect(new Ipv4Addr(0, 0, 0, 0).isGlobal()).toBe(false); // unspecified
			expect(new Ipv4Addr(255, 255, 255, 255).isGlobal()).toBe(false); // broadcast
		});
	});

	describe('Ipv4Addr.from', function () {
		it('should create an Ipv4Addr from a valid string', function () {
			const result = Ipv4Addr.from('192.168.1.1');
			expect(result.success).toBe(true);
			expect(result.value?.toString()).to.equal('192.168.1.1');
		});

		it('should return Err for an invalid string', function () {
			expect(Ipv4Addr.from('256.1.1.1').success).toBe(false);
			expect(Ipv4Addr.from('255.255.255.256').success).toBe(false);
			expect(Ipv4Addr.from('1.1.1').success).toBe(false);
			expect(Ipv4Addr.from('a.b.c.d').success).toBe(false);
		});
	});

	describe('Ipv4Addr.fromOrThrow', function () {
		it('should create an Ipv4Addr from a valid string', function () {
			const addr = Ipv4Addr.fromOrThrow('192.168.1.1');
			expect(addr.toString()).to.equal('192.168.1.1');
		});

		it('should throw an error for an invalid string', function () {
			expect(() => Ipv4Addr.fromOrThrow('256.1.1.1')).to.throw();
			expect(() => Ipv4Addr.fromOrThrow('255.255.255.256')).to.throw();
			expect(() => Ipv4Addr.fromOrThrow('1.1.1')).to.throw();
			expect(() => Ipv4Addr.fromOrThrow('a.b.c.d')).to.throw();
		});
	});

	describe('Ipv4Addr conversions', function () {
		it('should convert to IPv4-compatible IPv6', function () {
			const addr = Ipv4Addr.fromOrThrow('192.168.1.1');
			expect(addr.toIpv6().toString()).to.equal('::c0a8:101');
		});

		it('should convert to IPv4-mapped IPv6', function () {
			const addr = Ipv4Addr.fromOrThrow('192.168.1.1');
			expect(addr.toIpv6Mapped().toString()).to.equal('::ffff:c0a8:101');
		});
	});

	describe('Ipv4Addr buffer operations', function () {
		it('should create from and to buffer (Big-Endian)', function () {
			const addr = Ipv4Addr.fromOrThrow('192.168.1.1');
			const buffer = addr.toBuffer(false);
			const view = new DataView(buffer);
			expect(view.getUint32(0, false)).to.equal(0xc0a80101);

			const result = Ipv4Addr.fromBuffer(buffer, false);
			expect(result.success).toBe(true);
			expect(result.value?.toString()).to.equal('192.168.1.1');
		});

		it('should create from and to buffer (Little-Endian)', function () {
			const addr = Ipv4Addr.fromOrThrow('192.168.1.1');
			const buffer = addr.toBuffer(true);
			const view = new DataView(buffer);
			expect(view.getUint32(0, true)).to.equal(0xc0a80101);
			expect(Ipv4Addr.fromBufferOrThrow(buffer, true).toString()).to.equal('192.168.1.1');
		});

		it('should handle integer constructor', function () {
			const addr = new Ipv4Addr(0xc0a80101);
			expect(addr.toString()).to.equal('192.168.1.1');
		});
		it('should throw on invalid buffer value', function () {
			const buffer = new ArrayBuffer(2); // too short
			expect(() => Ipv4Addr.fromBufferOrThrow(buffer, false)).toThrow();
			expect(() => Ipv4Addr.fromBufferOrThrow(buffer, true)).toThrow();
		});
	});
	describe('Ipv4Addr.constructor', function () {
		it('should throw an error for wrong argument', function () {
			expect(() => new Ipv4Addr('test' as unknown as number)).toThrow();
			expect(() => new Ipv4Addr(-1)).toThrow();
		});
	});
});
