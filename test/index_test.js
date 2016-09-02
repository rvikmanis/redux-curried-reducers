import { pipeUpdaters, combineUpdaters } from '../tmp/with-coverage';
import { strictEqual, deepEqual } from 'assert';

describe('pipeUpdaters', () => {
  it('composes curried reducers left to right', () => {
    const result = pipeUpdaters(
      a => s => a + s,
      a => s => a * s
    )(5)(20)
    strictEqual(result, 5 * (5 + 20))
  });
});

describe('combineUpdaters', () => {
  it('combines curried reducers', () => {
    const every = action => (state = []) => {
      return state.concat(action)
    }

    const latestByType = action => (state = {}) => {
      return Object.assign({}, state, { [action.type]: action.payload })
    }

    const combinedUpdater = combineUpdaters({
      every,
      latestByType
    })

    let state = combinedUpdater({ type: 'A' })()
    deepEqual(state, {
      every: [{ type: 'A' }],
      latestByType: { A: undefined }
    })

    state = combinedUpdater({type: 'B', payload: 1 })(state)
    deepEqual(state, {
      every: [{ type: 'A' }, { type: 'B', payload: 1 }],
      latestByType: { A: undefined, B: 1 }
    })

    state = combinedUpdater({type: 'A', payload: 2 })(state)
    deepEqual(state, {
      every: [{ type: 'A' }, { type: 'B', payload: 1 }, { type: 'A', payload: 2 }],
      latestByType: { A: 2, B: 1 }
    })
  });
});
