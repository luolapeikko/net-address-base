import {Ipv4Addr} from 'net-address';
import {describe, expect, it} from 'vitest';
import {SocketAddrV4} from '../src/';

describe('SocketAddrV4', function () {
	it('creates with port only using unspecified IPv4 address', function () {
		const socketAddress = new SocketAddrV4({port: 6372});

		expect(socketAddress.family).toBe('ipv4');
		expect(socketAddress.address.toString()).toBe('0.0.0.0');
		expect(socketAddress.port).toBe(6372);
		expect(socketAddress.toString()).toBe('0.0.0.0:6372');
		expect(socketAddress).toEqual({
			address: '0.0.0.0',
			port: 6372,
			family: 'ipv4',
		});
	});

	it('creates with explicit address and port', function () {
		const ipv4 = Ipv4Addr.from('192.168.1.10').unwrap();
		const socketAddress = new SocketAddrV4({addr: ipv4, port: 443});

		expect(socketAddress.family).toBe('ipv4');
		expect(socketAddress.address).toBe(ipv4.toString());
		expect(socketAddress.port).toBe(443);
		expect(socketAddress.toString()).toBe('192.168.1.10:443');
		expect(socketAddress).toEqual({
			address: '192.168.1.10',
			port: 443,
			family: 'ipv4',
		});
	});
});
