import {Ipv6Addr} from 'net-address';
import {describe, expect, it} from 'vitest';
import {SocketAddrV6} from '../src/';

describe('SocketAddrV6', function () {
	it('creates with port only using unspecified IPv6 address', function () {
		const socketAddress = new SocketAddrV6({port: 6372});

		expect(socketAddress.family).toBe('ipv6');
		expect(socketAddress.address.equals(Ipv6Addr.UNSPECIFIED)).toBe(true);
		expect(socketAddress.port).toBe(6372);
		expect(socketAddress.flowlabel).toBe(undefined);
		expect(socketAddress.toString()).toBe('[::]:6372');
		expect(socketAddress).toEqual({
			address: Ipv6Addr.UNSPECIFIED,
			port: 6372,
			family: 'ipv6',
			flowlabel: undefined,
		});
	});

	it('creates with explicit address, port, and flow label', function () {
		const ipv6 = Ipv6Addr.from('2001:db8::1').unwrap();
		const socketAddress = new SocketAddrV6({address: ipv6, port: 443, flowlabel: 99});

		expect(socketAddress.family).toBe('ipv6');
		expect(socketAddress.address.equals(ipv6)).toBe(true);
		expect(socketAddress.port).toBe(443);
		expect(socketAddress.flowlabel).toBe(99);
		expect(socketAddress.toString()).toBe('[2001:db8::1]:443');
		expect(socketAddress).toEqual({
			address: ipv6,
			port: 443,
			family: 'ipv6',
			flowlabel: 99,
		});
	});

	it('updates flow label via setter', function () {
		const socketAddress = new SocketAddrV6({port: 8080});

		socketAddress.flowlabel = 77;

		expect(socketAddress.flowlabel).toBe(77);
	});
});
