import {describe, expect, it} from 'vitest';
import {Ipv4Addr, Ipv4Net} from '../src';

describe('Ipv4Net', () => {
	it('should correctly identify the unspecified address', () => {
		const network = Ipv4Net.from('0.0.0.0/32');
		expect(network.address.isUnspecified()).toBe(true);
		expect(network.address.isGlobal()).toBe(false);
		expect(network.address.isMulticast()).toBe(false);
		expect(network.address.toString()).toBe('0.0.0.0');
	});
	it('should check if an address is in range', () => {
		const network = Ipv4Net.from('192.168.0.0/24');
		const inRangeAddress = Ipv4Net.fromAddr(Ipv4Addr.from('192.168.0.1').unwrap(), 32).address;
		const outOfRangeAddress = Ipv4Net.from('192.168.1.1/32').address;
		expect(network.isInRange(inRangeAddress)).toBe(true);
		expect(network.isInRange(outOfRangeAddress)).toBe(false);
	});
	it('should throw error for network size greater than 32', () => {
		expect(() => Ipv4Net.from('192.168.0.0/33')).toThrow();
		expect(() => Ipv4Net.from('192.168.0.0/64')).toThrow();
		expect(() => Ipv4Net.from('192.168.0.0/128')).toThrow();
	});
	it('should throw error for negative network size', () => {
		expect(() => Ipv4Net.from('192.168.0.0/-1')).toThrow();
		expect(() => Ipv4Net.from('192.168.0.0/-24')).toThrow();
	});
	it('should throw error for non-numeric network size', () => {
		expect(() => Ipv4Net.from('192.168.0.0/abc')).toThrow();
		expect(() => Ipv4Net.from('192.168.0.0/24a')).toThrow();
		expect(() => Ipv4Net.from('192.168.0.0/invalid')).toThrow();
	});
});
