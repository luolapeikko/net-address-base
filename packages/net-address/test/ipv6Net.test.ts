import {describe, expect, it} from 'vitest';
import {Ipv6Addr, Ipv6Net} from '../src';

describe('Ipv6Net', () => {
	it('should correctly identify the unspecified address', () => {
		const network = Ipv6Net.fromOrThrow('::/128');
		expect(network.first().isUnspecified()).toBe(true);
		expect(network.first().isGlobal()).toBe(false);
		expect(network.first().isMulticast()).toBe(false);
		expect(network.first().toString()).toBe('::');
	});
	it('should check if an address is in range', () => {
		const network = Ipv6Net.fromOrThrow('2001:db8::100/64');
		const inRangeAddress = Ipv6Net.fromAddrOrThrow(Ipv6Addr.fromOrThrow('2001:db8::1'), 128).first();
		const outOfRangeAddress = Ipv6Net.fromOrThrow('2001:db8:1::1/128').first();
		expect(network.contains(inRangeAddress)).toBe(true);
		expect(network.contains(outOfRangeAddress)).toBe(false);
		expect(network.first().toString()).toBe('2001:db8::');
		expect(network.last().toString()).toBe('2001:db8::ffff:ffff:ffff:ffff');
		expect(network.netmask().toString()).toBe('ffff:ffff:ffff:ffff::');
		expect(network.toString()).toBe('2001:db8::/64');
		expect(network.toExpandedString()).toBe('2001:0db8:0000:0000:0000:0000:0000:0000/64');
		expect(network.firstUsable().toString()).toBe('2001:db8::1');
		expect(network.lastUsable().toString()).toBe('2001:db8::ffff:ffff:ffff:fffe');
		const [first] = network.addresses();
		expect(first.toString()).toBe('2001:db8::');
		const [firstHost] = network.hosts();
		expect(firstHost.toString()).toBe('2001:db8::1');
		expect(network.equals(Ipv6Net.fromOrThrow('2001:db8::/64'))).toBe(true);
		expect(network.equals(Ipv6Net.fromOrThrow('2001:db8::/65'))).toBe(false);
		expect(network.equals(undefined)).toBe(false);

		expect(network.isSubnetOf(Ipv6Net.fromOrThrow('2001:db8::/63'))).toBe(true);
		expect(network.isSubnetOf(Ipv6Net.fromOrThrow('2001:db8::/64'))).toBe(true);
		expect(network.isSubnetOf(Ipv6Net.fromOrThrow('2001:db8::/65'))).toBe(false);

		expect(network.containsNet(Ipv6Net.fromOrThrow('2001:db8::/65'))).toBe(true);
		expect(network.containsNet(Ipv6Net.fromOrThrow('2001:db8::/64'))).toBe(true);
		expect(network.containsNet(Ipv6Net.fromOrThrow('2001:db8::/63'))).toBe(false);
	});
	it('should build network from an interface address and size', () => {
		expect(Ipv6Net.fromOrThrow('2001:db8:305:1:ea6a:64ff:fe55:fd3/64').toString()).toBe('2001:db8:305:1::/64');
	});
	it('should throw error for network size greater than 128', () => {
		expect(() => Ipv6Net.fromOrThrow('2001:db8::/129')).toThrow(RangeError);
		expect(() => Ipv6Net.fromOrThrow('2001:db8::/255')).toThrow(RangeError);
		expect(() => Ipv6Net.fromOrThrow('2001:db8::/256')).toThrow(RangeError);
		expect(() => Ipv6Net.fromAddrOrThrow(Ipv6Addr.fromOrThrow('2001:db8::1'), 129)).toThrow(RangeError);
	});
	it('should throw error for negative network size', () => {
		expect(() => Ipv6Net.fromOrThrow('2001:db8::/-1')).toThrow(RangeError);
		expect(() => Ipv6Net.fromOrThrow('2001:db8::/-64')).toThrow(RangeError);
	});
	it('should throw error for non-numeric network size', () => {
		expect(() => Ipv6Net.fromOrThrow('2001:db8::/abc')).toThrow(TypeError);
		expect(() => Ipv6Net.fromOrThrow('2001:db8::/64a')).toThrow(TypeError);
		expect(() => Ipv6Net.fromOrThrow('2001:db8::/invalid')).toThrow(TypeError);
	});
	it('should throw error for non-numeric address', () => {
		expect(() => Ipv6Net.fromOrThrow('localhost/63')).toThrow(TypeError);
		expect(() => Ipv6Net.fromAddrOrThrow(Ipv6Addr.fromOrThrow('localhost'), 129)).toThrow(TypeError);
	});
	it('should correctly assign host addresses', () => {
		const network = Ipv6Net.fromOrThrow('2001:db8::/64');
		expect(network.assignAddressOrThrow(Ipv6Addr.fromOrThrow('::100')).toString()).toBe('2001:db8::100');
		expect(network.assignAddressOrThrow('::100').toString()).toBe('2001:db8::100');
		expect(() => network.assignAddressOrThrow(Ipv6Addr.fromOrThrow('1::'))).toThrow(RangeError);
		expect(() => network.assignAddressOrThrow('localhost')).toThrow(TypeError);
		expect(Ipv6Net.fromOrThrow('::/0').assignAddressOrThrow('::100').toString()).toBe('::100');
		expect(() => Ipv6Net.fromOrThrow('2001:db8:305:1:ea6a:64ff:fe55:fd3/128').assignAddressOrThrow('::fd3')).toThrow(RangeError);
	});
});
