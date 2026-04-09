import {assertType, describe, it} from 'vitest';
import {SocketAddrUnix} from '../src';

interface NodeListenOptions {
	backlog?: number | undefined;
	exclusive?: boolean | undefined;
	host?: string | undefined;
	/**
	 * @default false
	 */
	ipv6Only?: boolean | undefined;
	reusePort?: boolean | undefined;
	path?: string | undefined;
	port?: number | undefined;
	readableAll?: boolean | undefined;
	writableAll?: boolean | undefined;
}

describe('SocketAddr type testing', function () {
	describe('SocketAddrUnix', function () {
		it('should have correct types for properties and methods', function () {
			const socketAddress = new SocketAddrUnix('/tmp/app.sock');

			assertType<string>(socketAddress.path);
			assertType<'unix'>(socketAddress.family);
			assertType<{path: string; family: string}>(socketAddress.toObject());
			assertType<NodeListenOptions>(socketAddress.asNodeListenerOptions());
			assertType<string>(socketAddress.toString());
		});
	});
});
