import {Ipv6Addr} from 'net-address';
import {describe, expect, it} from 'vitest';
import {SocketAddrV6} from '../src/';

describe('SocketAddrV6', function () {
	it('should create socket address with only port number', function () {
		const socketAddress = new SocketAddrV6(6372);

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
	it('should create socket address with only port number using object syntax', function () {
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

	it('should create socket address with explicit address, port, and flow label', function () {
		const ipv6Addr = Ipv6Addr.fromOrThrow('2001:db8::1');
		const socketAddress = new SocketAddrV6({address: ipv6Addr, port: 443, flowlabel: 99});

		expect(socketAddress.family).toBe('ipv6');
		expect(socketAddress.address.equals(ipv6Addr)).toBe(true);
		expect(socketAddress.port).toBe(443);
		expect(socketAddress.flowlabel).toBe(99);
		expect(socketAddress.toString()).toBe('[2001:db8::1]:443');
		expect(socketAddress).toEqual({
			address: ipv6Addr,
			port: 443,
			family: 'ipv6',
			flowlabel: 99,
		});
	});

	it('should update flow label via setter', function () {
		const socketAddress = new SocketAddrV6({port: 8080});

		socketAddress.flowlabel = 77;

		expect(socketAddress.flowlabel).toBe(77);
	});

	it('should create clone from toString', function () {
		const socketAddress = new SocketAddrV6({address: Ipv6Addr.fromOrThrow('2001:db8::1'), port: 443, flowlabel: 99});
		const clonedAddress = SocketAddrV6.from(socketAddress.toString());
		if (!clonedAddress.success) {
			throw new Error('Failed to parse cloned socket address');
		}
		clonedAddress.value.flowlabel = 99; // Ensure flowlabel is set for comparison
		expect(socketAddress.family).toBe('ipv6');
		expect(socketAddress.port).toBe(443);
		expect(socketAddress.toString()).toBe('[2001:db8::1]:443');
		expect(socketAddress).toEqual(clonedAddress.value);
	});
});
