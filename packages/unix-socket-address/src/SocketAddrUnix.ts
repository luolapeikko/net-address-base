/**
 * Represents a Unix domain socket address, consisting of a file system path.
 * @example
 * const socketAddress = new SocketAddrUnix('/tmp/app.sock');
 * const windowsNamedPipeAddress = new SocketAddrUnix('\\\\.\\pipe\\app');
 */
export class SocketAddrUnix {
	#path: string;
	public constructor(path: string) {
		this.#path = path;
	}

	public get path(): string {
		return this.#path;
	}

	public get family(): 'unix' {
		return 'unix';
	}

	public toObject(): {path: string; family: string} {
		return {
			path: this.#path,
			family: 'unix',
		};
	}

	public asNodeListenerOptions(): {path: string} {
		return {
			path: this.#path,
		};
	}

	public toString(): string {
		return this.#path;
	}
}
