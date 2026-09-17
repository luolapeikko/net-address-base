/**
 * Represents a Unix domain socket address, consisting of a file system path.
 * @example
 * const socketAddress = new SocketAddrUnix('/tmp/app.sock');
 * const windowsNamedPipeAddress = new SocketAddrUnix('\\\\.\\pipe\\app');
 * @since v0.1.0
 */
export class SocketAddrUnix {
	/**
	 * Address family of the socket address.
	 * @since v0.1.0
	 */
	public readonly family = 'unix';
	/**
	 * File system path of the Unix socket.
	 * @since v0.1.0
	 */
	public readonly path: string;

	public constructor(path: string) {
		this.path = path;
	}

	/**
	 * Returns an object suitable for use as options in Node.js `net.Server.listen()` method.
	 * @returns An object containing the `path` property.
	 * @since v0.1.0
	 */
	public asNodeListener(): {path: string} {
		return {
			path: this.path,
		};
	}

	/**
	 * Returns a string representation of this Unix socket path.
	 * @returns The string representation of the path.
	 * @since v0.1.0
	 */
	public toString(): string {
		return this.path;
	}

	/**
	 * Compares this Unix socket path with another for equality.
	 * @param other instance of another Unix socket path to compare with.
	 * @returns `true` if both paths are equal, otherwise `false`.
	 * @since v0.1.0
	 */
	public equals(other: SocketAddrUnix | object): boolean {
		return other instanceof SocketAddrUnix && this.path === other.path;
	}
}
