# net-address

## Runtime agnostic core IpAddr classes base on Rust implementation.

## Installation

```bash
npm i net-address @luolapeikko/result-option
```

## Examples

```typescript
const addrFromString = Ipv4Addr.from("192.168.0.1").unwrap();
const addr = new Ipv4Addr(192, 168, 0, 1);
if (addr.isPrivate()) {
	//
}
if (addr.isGlobal()) {
	//
}
```

## Full [Documentation](https://luolapeikko.github.io/net-address-base/)

