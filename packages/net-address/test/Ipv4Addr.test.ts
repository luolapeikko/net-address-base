import {describe, expect, it} from 'vitest';
import {Ipv4Addr} from '../src/';

describe('Ipv4Addr', function () {
	describe('Ipv4Addr.isBroadcast', function () {
		it('should return true for 255.255.255.255', function () {
			expect(new Ipv4Addr(255, 255, 255, 255).isBroadcast()).to.be.true;
		});
		it('should not return true for other addresses', function () {
			expect(new Ipv4Addr(192, 0, 2, 0).isBroadcast()).to.be.false;
			expect(new Ipv4Addr(0, 0, 0, 0).isBroadcast()).to.be.false;
		});
	});

	describe('Ipv4Addr.isDocumentation', function () {
		it('should return true for addresses in documentation ranges (RFC 5737)', function () {
			// 192.0.2.0/24
			expect(new Ipv4Addr(192, 0, 2, 0).isDocumentation()).to.be.true;
			expect(new Ipv4Addr(192, 0, 2, 255).isDocumentation()).to.be.true;

			// 198.51.100.0/24
			expect(new Ipv4Addr(198, 51, 100, 0).isDocumentation()).to.be.true;
			expect(new Ipv4Addr(198, 51, 100, 255).isDocumentation()).to.be.true;

			// 203.0.113.0/24
			expect(new Ipv4Addr(203, 0, 113, 0).isDocumentation()).to.be.true;
			expect(new Ipv4Addr(203, 0, 113, 255).isDocumentation()).to.be.true;
		});
		it('should return false for addresses outside documentation ranges', function () {
			expect(new Ipv4Addr(192, 0, 1, 255).isDocumentation()).to.be.false;
			expect(new Ipv4Addr(192, 0, 3, 0).isDocumentation()).to.be.false;
			expect(new Ipv4Addr(127, 0, 0, 1).isDocumentation()).to.be.false;
			expect(new Ipv4Addr(8, 8, 8, 8).isDocumentation()).to.be.false;
		});
	});

	describe('Ipv4Addr.isLinkLocal', function () {
		it('should return true for addresses in 169.254.0.0/16 range (RFC 3927)', function () {
			expect(new Ipv4Addr(169, 254, 0, 0).isLinkLocal()).to.be.true;
			expect(new Ipv4Addr(169, 254, 255, 255).isLinkLocal()).to.be.true;
			expect(new Ipv4Addr(169, 254, 128, 1).isLinkLocal()).to.be.true;
		});

		it('should return false for addresses outside 169.254.0.0/16 range', function () {
			expect(new Ipv4Addr(169, 253, 255, 255).isLinkLocal()).to.be.false;
			expect(new Ipv4Addr(169, 255, 0, 0).isLinkLocal()).to.be.false;
			expect(new Ipv4Addr(127, 0, 0, 1).isLinkLocal()).to.be.false;
		});
	});

	describe('Ipv4Addr.isLoopback', function () {
		it('should return true for addresses in 127.0.0.0/8 range (RFC 1122)', function () {
			expect(new Ipv4Addr(127, 0, 0, 1).isLoopback()).to.be.true;
			expect(new Ipv4Addr(127, 255, 255, 255).isLoopback()).to.be.true;
			expect(new Ipv4Addr(127, 10, 20, 30).isLoopback()).to.be.true;
		});

		it('should return false for addresses outside 127.0.0.0/8 range', function () {
			expect(new Ipv4Addr(126, 255, 255, 255).isLoopback()).to.be.false;
			expect(new Ipv4Addr(128, 0, 0, 0).isLoopback()).to.be.false;
			expect(new Ipv4Addr(169, 254, 0, 1).isLoopback()).to.be.false;
		});
	});

	describe('Ipv4Addr.isPrivate', function () {
		it('should return true for addresses in private ranges (RFC 1918)', function () {
			// 10.0.0.0/8
			expect(new Ipv4Addr(10, 0, 0, 0).isPrivate()).to.be.true;
			expect(new Ipv4Addr(10, 255, 255, 255).isPrivate()).to.be.true;

			// 172.16.0.0/12
			expect(new Ipv4Addr(172, 16, 0, 0).isPrivate()).to.be.true;
			expect(new Ipv4Addr(172, 31, 255, 255).isPrivate()).to.be.true;

			// 192.168.0.0/16
			expect(new Ipv4Addr(192, 168, 0, 0).isPrivate()).to.be.true;
			expect(new Ipv4Addr(192, 168, 255, 255).isPrivate()).to.be.true;
		});

		it('should return false for addresses outside private ranges', function () {
			expect(new Ipv4Addr(9, 255, 255, 255).isPrivate()).to.be.false;
			expect(new Ipv4Addr(11, 0, 0, 0).isPrivate()).to.be.false;
			expect(new Ipv4Addr(172, 15, 255, 255).isPrivate()).to.be.false;
			expect(new Ipv4Addr(172, 32, 0, 0).isPrivate()).to.be.false;
			expect(new Ipv4Addr(192, 167, 255, 255).isPrivate()).to.be.false;
			expect(new Ipv4Addr(192, 169, 0, 0).isPrivate()).to.be.false;
			expect(new Ipv4Addr(8, 8, 8, 8).isPrivate()).to.be.false;
		});
	});

	describe('Ipv4Addr.isMulticast', function () {
		it('should return true for addresses in multicast range (224.0.0.0/4)', function () {
			expect(new Ipv4Addr(224, 0, 0, 0).isMulticast()).to.be.true;
			expect(new Ipv4Addr(239, 255, 255, 255).isMulticast()).to.be.true;
			expect(new Ipv4Addr(224, 1, 2, 3).isMulticast()).to.be.true;
		});

		it('should return false for addresses outside multicast range', function () {
			expect(new Ipv4Addr(223, 255, 255, 255).isMulticast()).to.be.false;
			expect(new Ipv4Addr(240, 0, 0, 0).isMulticast()).to.be.false;
			expect(new Ipv4Addr(192, 168, 1, 1).isMulticast()).to.be.false;
		});
	});

	describe('Ipv4Addr.isReserved', function () {
		it('should return true for addresses in reserved range (240.0.0.0/4) excluding broadcast', function () {
			expect(new Ipv4Addr(240, 0, 0, 0).isReserved()).to.be.true;
			expect(new Ipv4Addr(255, 255, 255, 254).isReserved()).to.be.true;
			expect(new Ipv4Addr(250, 1, 2, 3).isReserved()).to.be.true;
		});

		it('should return false for addresses outside reserved range', function () {
			expect(new Ipv4Addr(239, 255, 255, 255).isReserved()).to.be.false;
			expect(new Ipv4Addr(192, 168, 1, 1).isReserved()).to.be.false;
		});

		it('should return false for broadcast address (255.255.255.255)', function () {
			expect(new Ipv4Addr(255, 255, 255, 255).isReserved()).to.be.false;
		});
	});

	describe('Ipv4Addr.isBenchmarking', function () {
		it('should return true for addresses in benchmarking range (198.18.0.0/15)', function () {
			expect(new Ipv4Addr(198, 18, 0, 0).isBenchmarking()).to.be.true;
			expect(new Ipv4Addr(198, 19, 255, 255).isBenchmarking()).to.be.true;
		});

		it('should return false for addresses outside benchmarking range', function () {
			expect(new Ipv4Addr(198, 17, 255, 255).isBenchmarking()).to.be.false;
			expect(new Ipv4Addr(199, 20, 0, 0).isBenchmarking()).to.be.false;
		});
	});

	describe('Ipv4Addr.isGlobal', function () {
		it('should return true for globally reachable addresses', function () {
			expect(new Ipv4Addr(8, 8, 8, 8).isGlobal()).to.be.true;
			expect(new Ipv4Addr(1, 1, 1, 1).isGlobal()).to.be.true;
		});

		it('should return false for special-purpose addresses', function () {
			expect(new Ipv4Addr(10, 0, 0, 1).isGlobal()).to.be.false; // private
			expect(new Ipv4Addr(127, 0, 0, 1).isGlobal()).to.be.false; // loopback
			expect(new Ipv4Addr(169, 254, 0, 1).isGlobal()).to.be.false; // link-local
			expect(new Ipv4Addr(192, 168, 1, 1).isGlobal()).to.be.false; // private
			expect(new Ipv4Addr(224, 0, 0, 1).isGlobal()).to.be.false; // multicast
			expect(new Ipv4Addr(240, 0, 0, 1).isGlobal()).to.be.false; // reserved
			expect(new Ipv4Addr(192, 0, 2, 1).isGlobal()).to.be.false; // documentation
			expect(new Ipv4Addr(100, 64, 0, 1).isGlobal()).to.be.false; // shared
			expect(new Ipv4Addr(198, 18, 0, 1).isGlobal()).to.be.false; // benchmarking
			expect(new Ipv4Addr(0, 0, 0, 0).isGlobal()).to.be.false; // unspecified
			expect(new Ipv4Addr(255, 255, 255, 255).isGlobal()).to.be.false; // broadcast
		});
	});

	describe('Ipv4Addr.from', function () {
		it('should create an Ipv4Addr from a valid string', function () {
			const result = Ipv4Addr.from('192.168.1.1');
			expect(result.isOk).to.be.true;
			expect(result.unwrap().toString()).to.equal('192.168.1.1');
		});

		it('should return Err for an invalid string', function () {
			expect(Ipv4Addr.from('256.1.1.1').isErr).to.be.true;
			expect(Ipv4Addr.from('255.255.255.256').isErr).to.be.true;
			expect(Ipv4Addr.from('1.1.1').isErr).to.be.true;
			expect(Ipv4Addr.from('a.b.c.d').isErr).to.be.true;
		});
	});

	describe('Ipv4Addr conversions', function () {
		it('should convert to IPv4-compatible IPv6', function () {
			const ipv4 = new Ipv4Addr(192, 168, 1, 1);
			expect(ipv4.toIpv6().toString()).to.equal('::c0a8:101');
		});

		it('should convert to IPv4-mapped IPv6', function () {
			const ipv4 = new Ipv4Addr(192, 168, 1, 1);
			expect(ipv4.toIpv6Mapped().toString()).to.equal('::ffff:c0a8:101');
		});
	});

	describe('Ipv4Addr buffer operations', function () {
		it('should create from and to buffer (Big-Endian)', function () {
			const addr = new Ipv4Addr(192, 168, 1, 1);
			const buffer = addr.toBuffer(false);
			const view = new DataView(buffer);
			expect(view.getUint32(0, false)).to.equal(0xc0a80101);

			const result = Ipv4Addr.fromBuffer(buffer, false);
			expect(result.isOk).to.be.true;
			expect(result.unwrap().toString()).to.equal('192.168.1.1');
		});

		it('should create from and to buffer (Little-Endian)', function () {
			const addr = new Ipv4Addr(192, 168, 1, 1);
			const buffer = addr.toBuffer(true);
			const view = new DataView(buffer);
			expect(view.getUint32(0, true)).to.equal(0xc0a80101);

			const result = Ipv4Addr.fromBuffer(buffer, true);
			expect(result.isOk).to.be.true;
			expect(result.unwrap().toString()).to.equal('192.168.1.1');
		});

		it('should handle integer constructor', function () {
			const addr = new Ipv4Addr(0xc0a80101);
			expect(addr.toString()).to.equal('192.168.1.1');
		});
	});
});
