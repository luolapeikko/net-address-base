# net-address

## Runtime agnostic core IpAddr classes base on Rust implementation.

## Installation

```bash
npm i net-address @luolapeikko/result-option
```

## Examples

```typescript
const addrResult = Ipv4Addr.from("192.168.0.1"); // Returns a CoreResult<Ipv4Addr, TypeError>
const addr = Ipv4Addr.fromOrThrow("192.168.0.1");
const addr = new Ipv4Addr(192, 168, 0, 1);
if (addr.isPrivate()) {
	//
}
if (addr.isGlobal()) {
	//
}
```

## Full [Documentation](https://luolapeikko.github.io/net-address-base/)
