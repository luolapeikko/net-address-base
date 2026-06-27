import {Ipv4Addr} from 'net-address';
import {describe, expect, it} from 'vitest';
import {SocketAddrV4} from '../src/';

describe('SocketAddrV4', function () {
	it('creates with port only using unspecified IPv4 address', function () {
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

	it('creates with explicit address and port', function () {
		const ipv4 = Ipv4Addr.from('192.168.1.10').unwrap();
		const socketAddress = new SocketAddrV4({addr: ipv4, port: 443});

		expect(socketAddress.family).toBe('ipv4');
		expect(socketAddress.address.equals(ipv4)).toBe(true);
		expect(socketAddress.port).toBe(443);
		expect(socketAddress.toString()).toBe('192.168.1.10:443');
		expect(socketAddress).toEqual({
			address: ipv4,
			port: 443,
			family: 'ipv4',
		});
	});
});
