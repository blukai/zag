import { isFunction, isObject, isString } from "@zag-js/utils"
import { Dict, StateMachine as S } from "./types"

function or<TContext, TEvent extends S.EventObject>(
  ...conditions: Array<string | S.GuardHelper<TContext, TEvent> | S.GuardExpression<TContext, TEvent>>
): S.GuardHelper<TContext, TEvent> {
  return {
    predicate: (guards: Dict) => (ctx: TContext, event: TEvent) =>
      conditions
        .map((condition) => {
          if (isString(condition)) {
            return !!guards[condition]?.(ctx, event)
          }
          if (isFunction(condition)) {
            return condition(ctx, event)
          }
          return condition.predicate(guards)(ctx, event)
        })
        .some(Boolean),
  }
}

function and<TContext, TEvent extends S.EventObject>(
  ...conditions: Array<string | S.GuardHelper<TContext, TEvent> | S.GuardExpression<TContext, TEvent>>
): S.GuardHelper<TContext, TEvent> {
  return {
    predicate: (guards: Dict) => (ctx: TContext, event: TEvent) =>
      conditions
        .map((condition) => {
          if (isString(condition)) {
            return !!guards[condition]?.(ctx, event)
          }
          if (isFunction(condition)) {
            return condition(ctx, event)
          }
          return condition.predicate(guards)(ctx, event)
        })
        .every(Boolean),
  }
}

function not<TContext, TEvent extends S.EventObject>(
  condition: string | S.GuardHelper<TContext, TEvent> | S.GuardExpression<TContext, TEvent>,
): S.GuardHelper<TContext, TEvent> {
  return {
    predicate: (guardMap: Dict) => (ctx: TContext, event: TEvent) => {
      if (isString(condition)) {
        return !guardMap[condition]?.(ctx, event)
      }
      if (isFunction(condition)) {
        return !condition(ctx, event)
      }
      return !condition.predicate(guardMap)(ctx, event)
    },
  }
}

export const guards = { or, and, not }

export function isGuardHelper(value: unknown): value is { predicate: Function } {
  return isObject(value) && value.predicate != null
}

export const TruthyGuard = () => true

/**
 * Guards or conditions can be specified as:
 * - a string (reference to `options.guards`)
 * - a function that returns a number (in ms)
 */
export function determineGuardFn<TContext, TEvent extends S.EventObject>(
  guard: S.Guard<TContext, TEvent> | undefined,
  guardMap: S.GuardMap<TContext, TEvent> | undefined,
) {
  guard = guard ?? TruthyGuard
  return (context: TContext, event: TEvent) => {
    if (isString(guard)) {
      const value = guardMap?.[guard]
      return isFunction(value) ? value(context, event) : value
    }

    if (isGuardHelper(guard)) {
      return guard.predicate(guardMap ?? {})(context, event)
    }

    return guard?.(context, event)
  }
}
