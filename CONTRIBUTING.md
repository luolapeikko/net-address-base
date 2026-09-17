# How to Contribute

We welcome contributions to this project! To contribute, please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Make your changes and commit them with clear messages.
4. Push your changes to your forked repository.
5. Open a pull request against the main repository.

Please ensure your code follows the project's coding standards and includes appropriate tests.

## Code Style and Testing

- This tried to mimic rust ipv4addr and ipv6addr instance behavior in JavaScript:ish way.
- If method can throw an error, then we expect two possible methods, primary one with `CoreResult` and secondary one with `OrThrow` name suffix (`uw()` for unwrap the result) like `Ipv6Addr.from('::1')` and `Ipv6Addr.fromOrThrow('::1')`.
- If new methods are added, ensure they are properly documented and include corresponding tests.
- Use `@since` to indicate the version when a method or feature was added.
- New dependencies should not be added without a good reason and should be approved through the pull request discussion.
- If bigger change, please run `validate`, `lint` and `test` to ensure code quality and correctness.
- Using biomejs extension is not required, but will help auto-format your code according to the project's style guidelines.
- Using AI tools for code generation or assistance is allowed, but please do strict review/cleanup and test the generated code thoroughly.
