import {describe, expect, it} from 'vitest';
import {Ipv6Addr, Ipv6Net} from '../src';

describe('Ipv6Net', () => {
	it('should correctly identify the unspecified address', () => {
		const network = Ipv6Net.from('::/128');
		expect(network.address.isUnspecified()).toBe(true);
		expect(network.address.isGlobal()).toBe(false);
		expect(network.address.isMulticast()).toBe(false);
		expect(network.address.toString()).toBe('::');
	});
	it('should check if an address is in range', () => {
		const network = Ipv6Net.from('2001:db8::/64');
		const inRangeAddress = Ipv6Net.fromAddr(Ipv6Addr.from('2001:db8::1').unwrap(), 128).address;
		const outOfRangeAddress = Ipv6Net.from('2001:db8:1::1/128').address;
		expect(network.isInRange(inRangeAddress)).toBe(true);
		expect(network.isInRange(outOfRangeAddress)).toBe(false);
	});
	it('should throw error for network size greater than 128', () => {
		expect(() => Ipv6Net.from('2001:db8::/129')).toThrow();
		expect(() => Ipv6Net.from('2001:db8::/255')).toThrow();
		expect(() => Ipv6Net.from('2001:db8::/256')).toThrow();
	});
	it('should throw error for negative network size', () => {
		expect(() => Ipv6Net.from('2001:db8::/-1')).toThrow();
		expect(() => Ipv6Net.from('2001:db8::/-64')).toThrow();
	});
	it('should throw error for non-numeric network size', () => {
		expect(() => Ipv6Net.from('2001:db8::/abc')).toThrow();
		expect(() => Ipv6Net.from('2001:db8::/64a')).toThrow();
		expect(() => Ipv6Net.from('2001:db8::/invalid')).toThrow();
	});
});
