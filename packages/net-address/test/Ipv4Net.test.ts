import {describe, expect, it} from 'vitest';
import {Ipv4Addr, Ipv4Net} from '../src';

describe('Ipv4Net', () => {
	it('should correctly identify the unspecified address', () => {
		const network = Ipv4Net.fromOrThrow('0.0.0.0/32');
		expect(network.first().isUnspecified()).toBe(true);
		expect(network.first().isGlobal()).toBe(false);
		expect(network.first().isMulticast()).toBe(false);
		expect(network.first().toString()).toBe('0.0.0.0');
	});
	it('should check if an address is in range', () => {
		const network = Ipv4Net.fromOrThrow('192.168.0.10/24');
		const inRangeAddress = Ipv4Net.fromAddrOrThrow(Ipv4Addr.fromOrThrow('192.168.0.1'), 32).first();
		const outOfRangeAddress = Ipv4Net.fromOrThrow('192.168.1.1/32').first();
		expect(network.contains(inRangeAddress)).toBe(true);
		expect(network.contains(outOfRangeAddress)).toBe(false);
		expect(network.first().toString()).toBe('192.168.0.0');
		expect(network.broadcast().toString()).toBe('192.168.0.255');
		expect(network.netmask().toString()).toBe('255.255.255.0');
		expect(network.toString()).toBe('192.168.0.0/24');
		expect(network.firstUsable().toString()).toBe('192.168.0.1');
		expect(network.lastUsable().toString()).toBe('192.168.0.254');
		const [first] = network.addresses();
		expect(first.toString()).toBe('192.168.0.0');
		const [firstHost] = network.hosts();
		expect(firstHost.toString()).toBe('192.168.0.1');
		expect(network.equals(Ipv4Net.fromOrThrow('192.168.0.0/24'))).toBe(true);
		expect(network.equals(Ipv4Net.fromOrThrow('192.168.0.0/25'))).toBe(false);
		expect(network.equals(undefined)).toBe(false);

		expect(network.isSubnetOf(Ipv4Net.fromOrThrow('192.168.0.0/23'))).toBe(true);
		expect(network.isSubnetOf(Ipv4Net.fromOrThrow('192.168.0.0/24'))).toBe(true);
		expect(network.isSubnetOf(Ipv4Net.fromOrThrow('192.168.0.0/25'))).toBe(false);

		expect(network.containsNet(Ipv4Net.fromOrThrow('192.168.0.0/25'))).toBe(true);
		expect(network.containsNet(Ipv4Net.fromOrThrow('192.168.0.0/24'))).toBe(true);
		expect(network.containsNet(Ipv4Net.fromOrThrow('192.168.0.0/23'))).toBe(false);
	});
	it('should throw error for network size greater than 32', () => {
		expect(() => Ipv4Net.fromOrThrow('192.168.0.0/33')).toThrow();
		expect(() => Ipv4Net.fromOrThrow('192.168.0.0/64')).toThrow();
		expect(() => Ipv4Net.fromOrThrow('192.168.0.0/128')).toThrow();
	});
	it('should throw error for negative network size', () => {
		expect(() => Ipv4Net.fromOrThrow('192.168.0.0/-1')).toThrow();
		expect(() => Ipv4Net.fromOrThrow('192.168.0.0/-24')).toThrow();
	});
	it('should throw error for non-numeric network size', () => {
		expect(() => Ipv4Net.fromOrThrow('192.168.0.0/abc')).toThrow();
		expect(() => Ipv4Net.fromOrThrow('192.168.0.0/24a')).toThrow();
		expect(() => Ipv4Net.fromOrThrow('192.168.0.0/invalid')).toThrow();
	});
	it('should throw error for non-numeric address', () => {
		expect(() => Ipv4Net.fromOrThrow('localhost/25')).toThrow();
	});
	it('should correctly assign host addresses', () => {
		const network = Ipv4Net.fromOrThrow('192.168.0.0/24');
		expect(network.assignAddressOrThrow(Ipv4Addr.fromOrThrow('0.0.0.100')).toString()).toBe('192.168.0.100');
		expect(network.assignAddressOrThrow('0.0.0.100').toString()).toBe('192.168.0.100');
		expect(() => network.assignAddressOrThrow(Ipv4Addr.fromOrThrow('0.0.1.0'))).toThrow(RangeError);
		expect(() => network.assignAddressOrThrow('localhost')).toThrow(TypeError);
		expect(Ipv4Net.fromOrThrow('0.0.0.0/0').assignAddressOrThrow('0.0.0.100').toString()).toBe('0.0.0.100');
		expect(() => Ipv4Net.fromOrThrow('192.168.6.2/32').assignAddressOrThrow('0.0.0.2')).toThrow(RangeError);
	});
});
