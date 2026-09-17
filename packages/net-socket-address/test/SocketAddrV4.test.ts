import {Ipv4Addr} from 'net-address';
import {describe, expect, it} from 'vitest';
import {SocketAddrV4} from '../src/';

describe('SocketAddrV4', function () {
	it('should create socket address with only port number', function () {
		const socketAddress = new SocketAddrV4(6372);

		expect(socketAddress.family).toBe('ipv4');
		expect(socketAddress.address.equals(Ipv4Addr.UNSPECIFIED)).toBe(true);
		expect(socketAddress.port).toBe(6372);
		expect(socketAddress.toString()).toBe('0.0.0.0:6372');
		expect(socketAddress).toEqual({
			address: Ipv4Addr.UNSPECIFIED,
			port: 6372,
			family: 'ipv4',
		});
	});
	it('should create socket address with only port number using object syntax', function () {
		const socketAddress = new SocketAddrV4({port: 6372});

		expect(socketAddress.family).toBe('ipv4');
		expect(socketAddress.address.equals(Ipv4Addr.UNSPECIFIED)).toBe(true);
		expect(socketAddress.port).toBe(6372);
		expect(socketAddress.toString()).toBe('0.0.0.0:6372');
		expect(socketAddress).toEqual({
			address: Ipv4Addr.UNSPECIFIED,
			port: 6372,
			family: 'ipv4',
		});
	});

	it('should create socket address with explicit address and port', function () {
		const address = Ipv4Addr.fromOrThrow('192.168.1.10');
		const socketAddress = new SocketAddrV4({address, port: 443});
		expect(socketAddress.family).toBe('ipv4');
		expect(socketAddress.address.equals(address)).toBe(true);
		expect(socketAddress.port).toBe(443);
		expect(socketAddress.toString()).toBe('192.168.1.10:443');
		expect(socketAddress).toEqual({
			address,
			port: 443,
			family: 'ipv4',
		});
	});

	it('should create clone from toString', function () {
		const socketAddress = new SocketAddrV4({address: Ipv4Addr.fromOrThrow('192.168.1.10'), port: 443});
		const cloned = SocketAddrV4.fromOrThrow(socketAddress.toString());
		expect(socketAddress.family).toBe('ipv4');
		expect(socketAddress.port).toBe(443);
		expect(socketAddress.toString()).toBe('192.168.1.10:443');
		expect(socketAddress).toEqual(cloned);
	});
});
