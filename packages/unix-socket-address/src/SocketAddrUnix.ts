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

	public asNodeListenerOptions(): {path: string} {
		return {
			path: this.path,
		};
	}

	public toString(): string {
		return this.path;
	}
}
