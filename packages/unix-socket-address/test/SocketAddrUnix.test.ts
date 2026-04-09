import {describe, expect, it} from 'vitest';
import {SocketAddrUnix} from '../src/';

describe('SocketAddrUnix', function () {
	it('stores and returns unix socket path', function () {
		const socketPath = '/tmp/app.sock';
		const socketAddress = new SocketAddrUnix(socketPath);

		expect(socketAddress.path).toBe(socketPath);
		expect(socketAddress.family).toBe('unix');
		expect(socketAddress.toString()).toBe(socketPath);
		expect(socketAddress.toObject()).toEqual({
			path: socketPath,
			family: 'unix',
		});
	});
});
