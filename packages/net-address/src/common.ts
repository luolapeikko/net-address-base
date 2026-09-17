import type {CoreResult} from 'core-result';

/** unwraps a CoreResult, throwing an error if it is not successful */
export function uw<T, E>(result: CoreResult<T, E>): T {
	if (!result.success) {
		throw result.error;
	}
	return result.value;
}
