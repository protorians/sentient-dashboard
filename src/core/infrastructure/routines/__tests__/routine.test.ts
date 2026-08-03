import {describe, it, expect, vi, afterEach, beforeEach} from 'vitest'
import {renderHook, act} from '@testing-library/react'
import {Routine, Routines} from "@/core/infrastructure/routines/routine"
import {RoutineInstanceStatusEnum, RoutineStatusEnum} from "@/core/domain/enums/routine.enum"
import {useRoutines, useRoutinesStore} from "@/core/infrastructure/routines/routine.hook"

class CounterRoutine extends Routine<{ count: number }> {
    constructor(id: string, private counter: { value: number }) {
        super(id)
    }

    async job(): Promise<{ count: number }> {
        this.counter.value += 1;
        return {count: this.counter.value};
    }
}

afterEach(() => {
    vi.useRealTimers()
})

describe('Routines.status', () => {
    it('starts as STOP on an empty instance', () => {
        const counters = new Routines()
        expect(counters.status).toBe(RoutineInstanceStatusEnum.STOP)
    })

    it('derives status from the enqueued routines', () => {
        const counters = new Routines()
        const routine = new CounterRoutine('counter', {value: 0})

        counters.enqueue(routine)
        expect(counters.status).toBe(RoutineInstanceStatusEnum.PLAY)

        counters.pause()
        expect(counters.status).toBe(RoutineInstanceStatusEnum.PAUSE)

        counters.resume()
        expect(counters.status).toBe(RoutineInstanceStatusEnum.PLAY)

        counters.stop()
        expect(counters.status).toBe(RoutineInstanceStatusEnum.STOP)
    })

    it('start() / pause() / stop() keep status in sync', () => {
        const counters = new Routines()
        const routine = new CounterRoutine('counter', {value: 0})
        counters.enqueue(routine)

        counters.stop()
        expect(counters.status).toBe(RoutineInstanceStatusEnum.STOP)

        counters.start()
        expect(counters.status).toBe(RoutineInstanceStatusEnum.PLAY)

        counters.pause()
        expect(counters.status).toBe(RoutineInstanceStatusEnum.PAUSE)

        counters.start()
        expect(counters.status).toBe(RoutineInstanceStatusEnum.PLAY)
    })

    it('turns STOP when all routines are removed', () => {
        const counters = new Routines()
        const routine = new CounterRoutine('counter', {value: 0})
        counters.enqueue(routine)
        expect(counters.status).toBe(RoutineInstanceStatusEnum.PLAY)

        counters.remove(routine.id)
        expect(counters.status).toBe(RoutineInstanceStatusEnum.STOP)
    })

    it('clear(false) keeps status of remaining persistent routines', () => {
        const counters = new Routines()
        const persist = new CounterRoutine('persist', {value: 0})
        persist.setOption('persist', true)
        const temp = new CounterRoutine('temp', {value: 0})

        counters.enqueue(persist).enqueue(temp)
        counters.clear(false)

        expect(counters.entries.has(persist)).toBe(true)
        expect(counters.entries.has(temp)).toBe(false)
        expect(counters.status).toBe(RoutineInstanceStatusEnum.PLAY)
    })

    it('stays PLAY while any routine still runs, PAUSE only when all are paused', () => {
        const counters = new Routines()
        const a = new CounterRoutine('a', {value: 0})
        const b = new CounterRoutine('b', {value: 0})

        counters.enqueue(a).enqueue(b)

        counters.pause(a.id)
        expect(counters.status).toBe(RoutineInstanceStatusEnum.PLAY)

        counters.pause(b.id)
        expect(counters.status).toBe(RoutineInstanceStatusEnum.PAUSE)

        counters.resume(a.id)
        expect(counters.status).toBe(RoutineInstanceStatusEnum.PLAY)
    })
})

describe('Routines execution', () => {
    it('executes enqueued jobs and populates the dataset', async () => {
        vi.useFakeTimers()
        const counters = new Routines()
        counters.timeout = 50
        const counter = {value: 0}
        const routine = new CounterRoutine('counter', counter)

        counters.enqueue(routine).start().work()

        await vi.advanceTimersByTimeAsync(50)
        expect(counter.value).toBe(1)
        expect(routine.dataset.getState().getter('count')).toBe(1)

        await vi.advanceTimersByTimeAsync(50)
        expect(counter.value).toBe(2)

        counters.stop()
    })

    it('does not run jobs before the first tick', async () => {
        vi.useFakeTimers()
        const counters = new Routines()
        counters.timeout = 50
        const counter = {value: 0}
        const routine = new CounterRoutine('counter', counter)

        counters.enqueue(routine).start().work()

        await vi.advanceTimersByTimeAsync(10)
        expect(counter.value).toBe(0)

        counters.stop()
    })

    it('stop() halts the work loop', async () => {
        vi.useFakeTimers()
        const counters = new Routines()
        counters.timeout = 50
        const counter = {value: 0}
        const routine = new CounterRoutine('counter', counter)

        counters.enqueue(routine).start().work()

        await vi.advanceTimersByTimeAsync(50)
        expect(counter.value).toBe(1)

        counters.stop()
        await vi.advanceTimersByTimeAsync(300)
        expect(counter.value).toBe(1)
    })

    it('re-calling work() does not duplicate the loop', async () => {
        vi.useFakeTimers()
        const counters = new Routines()
        counters.timeout = 50
        const counter = {value: 0}
        const routine = new CounterRoutine('counter', counter)

        counters.enqueue(routine).start().work()
        counters.work()

        await vi.advanceTimersByTimeAsync(50)
        expect(counter.value).toBe(1)

        await vi.advanceTimersByTimeAsync(50)
        expect(counter.value).toBe(2)

        counters.stop()
    })

    it('clear(false) removes non-persistent routines', () => {
        const counters = new Routines()
        const routine = new CounterRoutine('counter', {value: 0})

        counters.enqueue(routine)
        expect(counters.entries.size).toBe(1)

        counters.clear(false)
        expect(counters.entries.size).toBe(0)
    })

    it('clear(false) keeps persistent routines', () => {
        const counters = new Routines()
        const routine = new CounterRoutine('persist', {value: 0})
        routine.setOption('persist', true)

        counters.enqueue(routine)
        counters.clear(false)

        expect(counters.entries.size).toBe(1)
    })

    it('failed jobs retry on the next tick', async () => {
        vi.useFakeTimers()
        const counters = new Routines()
        counters.timeout = 50
        let attempts = 0

        class FlakyRoutine extends Routine<{ ok: boolean }> {
            async job(): Promise<{ ok: boolean }> {
                attempts++;
                if (attempts === 1) throw new Error('boom')
                return {ok: true};
            }
        }

        const routine = new FlakyRoutine('flaky')
        counters.enqueue(routine).start().work()

        await vi.advanceTimersByTimeAsync(50)
        expect(attempts).toBe(1)
        expect(routine.status).toBe(RoutineStatusEnum.FAIL)
        expect(counters.status).toBe(RoutineInstanceStatusEnum.PLAY)

        await vi.advanceTimersByTimeAsync(50)
        expect(attempts).toBe(2)
        expect(routine.status).toBe(RoutineStatusEnum.PLAY)

        counters.stop()
    })
})

describe('Routines work loop respects status', () => {
    it('pauses job execution while status is PAUSE and resumes on PLAY', async () => {
        vi.useFakeTimers()
        const counters = new Routines()
        counters.timeout = 50
        const counter = {value: 0}
        const routine = new CounterRoutine('counter', counter)

        counters.enqueue(routine).start().work()

        await vi.advanceTimersByTimeAsync(50)
        expect(counter.value).toBe(1)

        counters.pause()
        expect(counters.status).toBe(RoutineInstanceStatusEnum.PAUSE)

        await vi.advanceTimersByTimeAsync(200)
        expect(counter.value).toBe(1)

        counters.resume()
        expect(counters.status).toBe(RoutineInstanceStatusEnum.PLAY)

        await vi.advanceTimersByTimeAsync(50)
        expect(counter.value).toBe(2)

        counters.stop()
    })

    it('halts the loop when status turns STOP and does not restart by itself', async () => {
        vi.useFakeTimers()
        const counters = new Routines()
        counters.timeout = 50
        const counter = {value: 0}
        const routine = new CounterRoutine('counter', counter)

        counters.enqueue(routine).start().work()

        await vi.advanceTimersByTimeAsync(50)
        expect(counter.value).toBe(1)

        counters.stop()
        expect(counters.status).toBe(RoutineInstanceStatusEnum.STOP)

        await vi.advanceTimersByTimeAsync(300)
        expect(counter.value).toBe(1)
    })

    it('keeps ticking idly during PAUSE and stays stoppable', async () => {
        vi.useFakeTimers()
        const counters = new Routines()
        counters.timeout = 50
        const counter = {value: 0}
        const routine = new CounterRoutine('counter', counter)

        counters.enqueue(routine).start().work()
        counters.pause()

        await vi.advanceTimersByTimeAsync(150)
        expect(counter.value).toBe(0)

        counters.stop()
        expect(counters.status).toBe(RoutineInstanceStatusEnum.STOP)

        await vi.advanceTimersByTimeAsync(200)
        expect(counter.value).toBe(0)
    })
})

describe('useRoutines reactivity (zustand)', () => {
    beforeEach(() => {
        useRoutinesStore.getState().clear(true)
    })

    it('re-renders when entries change', () => {
        const {result} = renderHook(() => useRoutines())
        expect(result.current.entries).toHaveLength(0)

        act(() => {
            useRoutinesStore.getState().enqueue(new CounterRoutine('react-a', {value: 0}))
        })

        expect(result.current.entries).toHaveLength(1)
        expect(result.current.entries[0].id).toBe('react-a')
    })

    it('re-renders when status changes', () => {
        const {result} = renderHook(() => useRoutines())
        expect(result.current.status).toBe(RoutineInstanceStatusEnum.STOP)

        act(() => {
            useRoutinesStore.getState().enqueue(new CounterRoutine('react-b', {value: 0}))
        })
        expect(result.current.status).toBe(RoutineInstanceStatusEnum.PLAY)

        act(() => {
            useRoutinesStore.getState().pause()
        })
        expect(result.current.status).toBe(RoutineInstanceStatusEnum.PAUSE)

        act(() => {
            useRoutinesStore.getState().stop()
        })
        expect(result.current.status).toBe(RoutineInstanceStatusEnum.STOP)
    })

    it('getEntries returns the reactive snapshot', () => {
        const {result} = renderHook(() => useRoutines())

        act(() => {
            useRoutinesStore.getState().enqueue(new CounterRoutine('react-c', {value: 0}))
        })

        expect(result.current.getEntries()).toHaveLength(1)
    })

    it('re-renders on routine status change during execution', async () => {
        vi.useFakeTimers()
        const {result} = renderHook(() => useRoutines())
        let attempts = 0

        class FailingRoutine extends Routine<{ ok: boolean }> {
            async job(): Promise<{ ok: boolean }> {
                attempts++;
                throw new Error('boom')
            }
        }

        act(() => {
            useRoutinesStore.getState().enqueue(new FailingRoutine('react-fail'))
                .start()
                .work()
        })

        await vi.advanceTimersByTimeAsync(5000)

        expect(attempts).toBeGreaterThanOrEqual(1)
        const failing = result.current.entries.find((r) => r.id === 'react-fail')
        expect(failing?.status).toBe(RoutineStatusEnum.FAIL)
        expect(result.current.status).toBe(RoutineInstanceStatusEnum.PLAY)
    })
})
