import {assertType, describe, it} from 'vitest';
import {SocketAddrV4, SocketAddrV6} from '../src';

interface NodeBindOptions {
	port?: number | undefined;
	address?: string | undefined;
	exclusive?: boolean | undefined;
	fd?: number | undefined;
}

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

interface NodeSocketAddressInitOptions {
	/**
	 * The network address as either an IPv4 or IPv6 string.
	 * @default 127.0.0.1
	 */
	address?: string | undefined;
	/**
	 * @default `'ipv4'`
	 */
	family?: 'ipv4' | 'ipv6' | undefined;
	/**
	 * An IPv6 flow-label used only if `family` is `'ipv6'`.
	 * @default 0
	 */
	flowlabel?: number | undefined;
	/**
	 * An IP port.
	 * @default 0
	 */
	port?: number | undefined;
}

describe('SocketAddr type testing', function () {
	describe('SocketAddrV4', function () {
		it('should have correct types for properties and methods', function () {
			const socketAddress = new SocketAddrV4({port: 6372});

			assertType<'ipv4'>(socketAddress.family);
			assertType<string>(socketAddress.address.toString());
			assertType<number>(socketAddress.port);
			assertType<NodeSocketAddressInitOptions>(socketAddress);
			assertType<NodeListenOptions>(socketAddress.asNodeListenerOptions());
			assertType<NodeBindOptions>(socketAddress);
			assertType<string>(socketAddress.toString());
		});
	});
	describe('SocketAddrV6', function () {
		it('should have correct types for properties and methods', function () {
			const socketAddress = new SocketAddrV6({port: 6372});

			assertType<'ipv6'>(socketAddress.family);
			assertType<string>(socketAddress.address.toString());
			assertType<number>(socketAddress.port);
			assertType<NodeSocketAddressInitOptions>(socketAddress);
			assertType<NodeListenOptions>(socketAddress.asNodeListenerOptions());
			assertType<NodeBindOptions>(socketAddress);
			assertType<string>(socketAddress.toString());
		});
	});
});
