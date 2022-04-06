import { mergeProps } from "@zag-js/core"
import * as NumberInput from "@zag-js/number-input"
import { normalizeProps, useMachine, useSetup, PropTypes } from "@zag-js/vue"
import { defineComponent } from "@vue/runtime-core"
import { useControls } from "../hooks/use-controls"
import { computed, h, Fragment } from "vue"
import { StateVisualizer } from "../components/state-visualizer"
import { numberInputControls } from "../../../../shared/controls"

export default defineComponent({
  name: "NumberInput",
  setup() {
    const controls = useControls(numberInputControls)

    const [state, send] = useMachine(NumberInput.machine, {
      context: controls.context,
    })

    const ref = useSetup({ send, id: "1" })

    const numberInputRef = computed(() => NumberInput.connect<PropTypes>(state.value, send, normalizeProps))

    return () => {
      const { decrementButtonProps, incrementButtonProps, inputProps, scrubberProps, labelProps } = numberInputRef.value

      return (
        <>
          <controls.ui />
          <div class="root" ref={ref}>
            <div
              data-testid="scrubber"
              {...mergeProps(scrubberProps, { style: { width: "32px", height: "32px", background: "red" } })}
            />
            <label data-testid="label" {...labelProps}>
              Enter number
            </label>
            <div>
              <button data-testid="dec-button" {...decrementButtonProps}>
                DEC
              </button>
              <input data-testid="input" {...inputProps} />
              <button data-testid="inc-button" {...incrementButtonProps}>
                INC
              </button>
            </div>
            <StateVisualizer state={state} />
          </div>
        </>
      )
    }
  },
})
