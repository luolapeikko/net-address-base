/**
 * Represents a Unix domain socket address, consisting of a file system path.
 * @example
 * const socketAddress = new SocketAddrUnix('/tmp/app.sock');
 * const windowsNamedPipeAddress = new SocketAddrUnix('\\\\.\\pipe\\app');
 */
export class SocketAddrUnix {
	public readonly family = 'unix';
	public readonly path: string;

	public constructor(path: string) {
		this.path = path;
	}

	public asNodeListener(): {path: string} {
		return {
			path: this.path,
		};
	}

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
		return 'family' in other && this.family === other.family && this.path === other.path;
	}
}
